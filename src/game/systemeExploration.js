import { recupererEtatJeu } from './etatJeu'
import { donneesSecteurs } from './dataSecteurs'
import { donneesMinerais } from './dataMinerais'
import { ajouterAuJournal, faireTournerDrones } from './systemeMinage'
import { avancerTemps } from './systemeTemps'
import { verifierPanneSecheEtDeclencher } from './systemeAssistance'

function tirerResultatScan(typeScanner = 'base') {
  const tirage = Math.random()

  if (typeScanner === 'base') {
    if (tirage < 0.15) return 'echec'
    if (tirage < 0.5) return 'faible'
    if (tirage < 0.85) return 'moyenne'
    return 'bonne'
  }

  if (typeScanner === 'standard') {
    if (tirage < 0.08) return 'echec'
    if (tirage < 0.33) return 'faible'
    if (tirage < 0.78) return 'moyenne'
    return 'bonne'
  }

  if (tirage < 0.1) return 'echec'
  if (tirage < 0.45) return 'faible'
  if (tirage < 0.8) return 'moyenne'
  return 'bonne'
}

function tirerReserveDepuisQualite(qualite) {
  if (qualite === 'faible') {
    return 5 + Math.floor(Math.random() * 5) // 5-9
  }

  if (qualite === 'moyenne') {
    return 10 + Math.floor(Math.random() * 8) // 10-17
  }

  return 18 + Math.floor(Math.random() * 11) // 18-28
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

function obtenirAjustementsComposition(qualite) {
  if (qualite === 'faible') {
    return [5, 0, -15]
  }

  if (qualite === 'bonne') {
    return [15, 5, -5]
  }

  return [10, 0, -10]
}

function genererCompositionLocale(secteur, qualite) {
  const repartition = [...(secteur?.repartitionMinerais || [])]
    .sort((a, b) => b.poids - a.poids)
    .slice(0, 3)

  if (repartition.length === 0) {
    return []
  }

  const ajustements = obtenirAjustementsComposition(qualite)

  return repartition.map((entree, index) => ({
    idMinerai: entree.idMinerai,
    poids: Math.max(5, entree.poids + (ajustements[index] ?? 0)),
  }))
}

function obtenirTypeScanner(etat) {
  return etat?.vaisseau?.scanner?.type || 'base'
}

function formaterComposition(composition) {
  return composition
    .map((c) => donneesMinerais.find((m) => m.id === c.idMinerai)?.abreviation || c.idMinerai)
    .join(', ')
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

  const ancienSite = etat.exploration?.siteActif || null
  const typeScanner = obtenirTypeScanner(etat)

  avancerTemps(1)

  const secteur = donneesSecteurs.find((s) => s.id === etat.secteurCourant.id)
  const resultatScan = tirerResultatScan(typeScanner)

  if (resultatScan === 'echec') {
    etat.exploration.siteActif = null

    faireTournerDrones()
    verifierPanneSecheEtDeclencher()

    if (ancienSite) {
      ajouterAuJournal(
        `Scan terminé : aucun amas exploitable détecté. Le relevé précédent (${ancienSite.nom}) est abandonné.`,
        'evenements',
      )
      return
    }

    ajouterAuJournal('Scan terminé : aucun amas exploitable détecté dans la zone.', 'evenements')
    return
  }

  const reserve = tirerReserveDepuisQualite(resultatScan)
  const composition = genererCompositionLocale(secteur, resultatScan)

  etat.exploration.siteActif = {
    id: etat.exploration.prochainSiteId,
    nom: tirerNomAmas(resultatScan),
    type: 'amas_minier',
    qualiteScan: resultatScan,
    reserveTotale: reserve,
    reserveRestante: reserve,
    composition,
  }

  etat.exploration.prochainSiteId += 1

  faireTournerDrones()
  verifierPanneSecheEtDeclencher()

  const nomsMinerais = formaterComposition(composition)

  if (ancienSite) {
    ajouterAuJournal(
      `Scan terminé : ${etat.exploration.siteActif.nom} détecté (${resultatScan}). Réserve estimée ${reserve}. Composition : ${nomsMinerais}. L’ancien relevé (${ancienSite.nom}) est remplacé.`,
      'evenements',
    )
    return
  }

  ajouterAuJournal(
    `Scan terminé : ${etat.exploration.siteActif.nom} détecté (${resultatScan}). Réserve estimée ${reserve}. Composition : ${nomsMinerais}.`,
    'evenements',
  )
}
