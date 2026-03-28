import { recupererEtatJeu } from './etatJeu'
import { donneesSecteurs } from './donneesSecteurs'
import { donneesMinerais } from './donneesMinerais'
import { ajouterAuJournal, faireTournerDrones } from './systemeMinage'
import { avancerTemps } from './systemeTemps'
import { verifierPanneSecheEtDeclencher } from './systemeAssistance'

function tirerQualiteScan() {
  const tirage = Math.random()

  if (tirage < 0.3) return 'faible'
  if (tirage < 0.75) return 'moyenne'
  return 'bonne'
}

function tirerReserveDepuisQualite(qualite) {
  if (qualite === 'faible') {
    return 8 + Math.floor(Math.random() * 8) // 8-15
  }

  if (qualite === 'moyenne') {
    return 16 + Math.floor(Math.random() * 13) // 16-28
  }

  return 29 + Math.floor(Math.random() * 17) // 29-45
}

function tirerNomAmas(qualite) {
  const prefixes = ['Amas minier', 'Amas fragmenté', 'Amas dense', 'Amas dérivant']
  const suffixes = ['I', 'II', 'III', 'IV', 'V', 'VI']
  const prefixe = prefixes[Math.floor(Math.random() * prefixes.length)]
  const suffixe = suffixes[Math.floor(Math.random() * suffixes.length)]

  if (qualite === 'bonne') {
    return `${prefixe} remarquable ${suffixe}`
  }

  if (qualite === 'faible') {
    return `${prefixe} diffus ${suffixe}`
  }

  return `${prefixe} ${suffixe}`
}

function genererCompositionLocale(secteur) {
  const repartition = [...(secteur?.repartitionMinerais || [])]
    .sort((a, b) => b.poids - a.poids)
    .slice(0, 3)

  if (repartition.length === 0) {
    return []
  }

  return repartition.map((entree, index) => {
    const bonus = index === 0 ? 10 : index === 1 ? 0 : -10
    return {
      idMinerai: entree.idMinerai,
      poids: Math.max(5, entree.poids + bonus),
    }
  })
}

export function scannerAmasMinier() {
  const etat = recupererEtatJeu()

  if (etat.navigation?.enVoyage) {
    ajouterAuJournal(
      'Impossible d’utiliser le scanner pendant un trajet inter-sectoriel.',
      'evenements',
    )
    return
  }

  if (etat.assistance?.remorquageEnCours) {
    ajouterAuJournal('Scanner indisponible pendant un remorquage.', 'evenements')
    return
  }

  if (etat.positionLocale !== 'operations') {
    ajouterAuJournal('Le scanner ne peut être utilisé qu’en zone d’opérations.', 'evenements')
    return
  }

  avancerTemps(1)

  const secteur = donneesSecteurs.find((s) => s.id === etat.secteurCourant.id)
  const qualiteScan = tirerQualiteScan()
  const reserve = tirerReserveDepuisQualite(qualiteScan)
  const composition = genererCompositionLocale(secteur)

  etat.exploration.siteActif = {
    id: etat.exploration.prochainSiteId,
    nom: tirerNomAmas(qualiteScan),
    type: 'amas_minier',
    qualiteScan,
    reserveTotale: reserve,
    reserveRestante: reserve,
    composition,
  }

  etat.exploration.prochainSiteId += 1

  faireTournerDrones()
  verifierPanneSecheEtDeclencher()

  const nomsMinerais = composition
    .map((c) => donneesMinerais.find((m) => m.id === c.idMinerai)?.abreviation || c.idMinerai)
    .join(', ')

  ajouterAuJournal(
    `Scan terminé : ${etat.exploration.siteActif.nom} détecté. Réserve estimée ${reserve}. Composition : ${nomsMinerais}.`,
    'evenements',
  )
}
