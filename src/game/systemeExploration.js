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

function tirerNomAmas(qualite, typeAmas = 'mono') {
  const prefixes = ['Amas minier', 'Amas fragmenté', 'Amas dense', 'Amas dérivant']
  const suffixes = ['I', 'II', 'III', 'IV', 'V', 'VI']
  const prefixe = prefixes[Math.floor(Math.random() * prefixes.length)]
  const suffixe = suffixes[Math.floor(Math.random() * suffixes.length)]

  if (typeAmas === 'sterile') {
    return `${prefixe} pauvre ${suffixe}`
  }

  if (qualite === 'bonne' && typeAmas === 'triple') {
    return `${prefixe} remarquable ${suffixe}`
  }

  if (qualite === 'bonne') {
    return `${prefixe} riche ${suffixe}`
  }

  if (qualite === 'faible') {
    return `${prefixe} diffus ${suffixe}`
  }

  return `${prefixe} ${suffixe}`
}

function obtenirTypeScanner(etat) {
  return etat?.vaisseau?.scanner?.type || 'base'
}

function formaterComposition(composition) {
  if (!composition || composition.length === 0) {
    return 'aucune signature exploitable'
  }

  return composition
    .map((c) => donneesMinerais.find((m) => m.id === c.idMinerai)?.abreviation || c.idMinerai)
    .join(', ')
}

function obtenirProfilMinier(secteur) {
  return (
    secteur?.profilMinier || {
      amasSterile: 15,
      amas1: 45,
      amas2: 30,
      amas3: 10,
    }
  )
}

function tirerAuPoids(elements) {
  const elementsValides = elements.filter((element) => element.poids > 0)

  if (elementsValides.length === 0) {
    return null
  }

  const total = elementsValides.reduce((somme, element) => somme + element.poids, 0)
  let tirage = Math.random() * total

  for (const element of elementsValides) {
    tirage -= element.poids
    if (tirage <= 0) {
      return element
    }
  }

  return elementsValides[elementsValides.length - 1]
}

function tirerTypeAmas(profilMinier) {
  const resultat = tirerAuPoids([
    { type: 'sterile', poids: profilMinier.amasSterile },
    { type: 'mono', poids: profilMinier.amas1 },
    { type: 'double', poids: profilMinier.amas2 },
    { type: 'triple', poids: profilMinier.amas3 },
  ])

  return resultat?.type || 'mono'
}

function tirerMineraisDistincts(repartitionMinerais, quantite) {
  const disponibles = [...(repartitionMinerais || [])]
  const resultat = []

  while (disponibles.length > 0 && resultat.length < quantite) {
    const selection = tirerAuPoids(disponibles)

    if (!selection) {
      break
    }

    resultat.push(selection)

    const index = disponibles.findIndex((minerai) => minerai.idMinerai === selection.idMinerai)
    if (index !== -1) {
      disponibles.splice(index, 1)
    }
  }

  return resultat
}

function determinerQuantiteMinerais(typeAmas, repartitionMinerais) {
  if (typeAmas === 'sterile') return 0
  if (typeAmas === 'mono') return 1
  if (typeAmas === 'double') return Math.min(2, repartitionMinerais.length)
  if (typeAmas === 'triple') return Math.min(3, repartitionMinerais.length)
  return 1
}

function obtenirAjustementReserveSelonTypeAmas(typeAmas) {
  if (typeAmas === 'sterile') return 0
  if (typeAmas === 'mono') return 1
  if (typeAmas === 'double') return 0.92
  if (typeAmas === 'triple') return 0.85
  return 1
}

function repartirReserveEntreMinerais(mineraisSelectionnes, reserveTotale) {
  if (!mineraisSelectionnes.length || reserveTotale <= 0) {
    return []
  }

  const totalPoids = mineraisSelectionnes.reduce((somme, minerai) => somme + minerai.poids, 0)

  if (totalPoids <= 0) {
    return mineraisSelectionnes.map((minerai, index) => ({
      idMinerai: minerai.idMinerai,
      poids: minerai.poids,
      reserve: index === 0 ? reserveTotale : 0,
    }))
  }

  let reserveDistribuee = 0

  return mineraisSelectionnes.map((minerai, index) => {
    if (index === mineraisSelectionnes.length - 1) {
      return {
        idMinerai: minerai.idMinerai,
        poids: minerai.poids,
        reserve: Math.max(1, reserveTotale - reserveDistribuee),
      }
    }

    const reserve = Math.max(1, Math.round((reserveTotale * minerai.poids) / totalPoids))
    reserveDistribuee += reserve

    return {
      idMinerai: minerai.idMinerai,
      poids: minerai.poids,
      reserve,
    }
  })
}

function genererCompositionLocale(secteur, qualite) {
  const repartitionMinerais = [...(secteur?.repartitionMinerais || [])]
  const profilMinier = obtenirProfilMinier(secteur)

  if (repartitionMinerais.length === 0) {
    return {
      typeAmas: 'sterile',
      reserveTotale: 0,
      composition: [],
    }
  }

  const typeAmas = tirerTypeAmas(profilMinier)

  if (typeAmas === 'sterile') {
    return {
      typeAmas,
      reserveTotale: 0,
      composition: [],
    }
  }

  const reserveBase = tirerReserveDepuisQualite(qualite)
  const ajustementReserve = obtenirAjustementReserveSelonTypeAmas(typeAmas)
  const reserveTotale = Math.max(1, Math.round(reserveBase * ajustementReserve))
  const quantiteMinerais = determinerQuantiteMinerais(typeAmas, repartitionMinerais)

  const mineraisSelectionnes = tirerMineraisDistincts(repartitionMinerais, quantiteMinerais)
  const composition = repartirReserveEntreMinerais(mineraisSelectionnes, reserveTotale)

  return {
    typeAmas,
    reserveTotale,
    composition,
  }
}

function obtenirLibelleTypeAmas(typeAmas) {
  if (typeAmas === 'sterile') return 'amas pauvre'
  if (typeAmas === 'mono') return 'amas simple'
  if (typeAmas === 'double') return 'amas mixte'
  if (typeAmas === 'triple') return 'amas dense'
  return 'amas'
}

function construireMessageScan(siteActif, ancienSite) {
  const { nom, qualiteScan, reserveTotale, composition, typeAmas } = siteActif
  const compositionTexte = formaterComposition(composition)
  const libelleType = obtenirLibelleTypeAmas(typeAmas)

  let message = `Scan terminé : ${nom} détecté (${qualiteScan}). Type : ${libelleType}.`

  if (typeAmas === 'sterile') {
    message += ' Aucune signature minérale exploitable confirmée.'
  } else {
    message += ` Réserve estimée ${reserveTotale}. Composition : ${compositionTexte}.`
  }

  if (ancienSite) {
    message += ` L’ancien relevé (${ancienSite.nom}) est remplacé.`
  }

  return message
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

  const { typeAmas, reserveTotale, composition } = genererCompositionLocale(secteur, resultatScan)

  etat.exploration.siteActif = {
    id: etat.exploration.prochainSiteId,
    nom: tirerNomAmas(resultatScan, typeAmas),
    type: 'amas_minier',
    typeAmas,
    qualiteScan: resultatScan,
    reserveTotale,
    reserveRestante: reserveTotale,
    composition,
  }

  etat.exploration.prochainSiteId += 1

  faireTournerDrones()
  verifierPanneSecheEtDeclencher()

  ajouterAuJournal(construireMessageScan(etat.exploration.siteActif, ancienSite), 'evenements')
}
