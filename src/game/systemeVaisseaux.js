import { donneesVaisseaux } from './dataVaisseaux'
import { recupererEtatJeu } from './etatJeu'
import { recupererTickCourant } from './systemeTemps'

function obtenirHorodatageTick() {
  const tick = recupererTickCourant()
  return `[T${String(tick).padStart(4, '0')}]`
}

function ajouterAuJournal(message, categorie = 'evenements') {
  const etat = recupererEtatJeu()

  etat.journal.unshift({
    horodatage: obtenirHorodatageTick(),
    message,
    categorie,
  })

  if (etat.journal.length > 50) {
    etat.journal.pop()
  }
}

export function creerInstanceVaisseauDepuisModele(modeleId, suffixe = '001') {
  const modele = donneesVaisseaux.find((vaisseau) => vaisseau.id === modeleId)

  if (!modele) {
    throw new Error(`Modèle de vaisseau introuvable : ${modeleId}`)
  }

  return {
    id: `${modele.id}_${suffixe}`,
    modeleId: modele.id,
    nom: modele.nom,
    constructeur: modele.constructeur,
    role: modele.role,
    coque: modele.coqueMax,
    coqueMax: modele.coqueMax,
    soute: 0,
    souteMax: modele.souteMax,
    puissanceMiniere: modele.puissanceMiniere,
    dronesMiniersMax: modele.dronesMiniersMax,
    carburant: modele.carburantMax,
    carburantMax: modele.carburantMax,
    scanner: structuredClone(modele.scanner),
    ameliorations: structuredClone(modele.ameliorations || []),
  }
}

export function recupererVaisseauActif(etat = recupererEtatJeu()) {
  if (!etat.vaisseauxPossedes || !etat.vaisseauActifId) {
    return null
  }

  return etat.vaisseauxPossedes.find((vaisseau) => vaisseau.id === etat.vaisseauActifId) || null
}

export function synchroniserFlotteDepuisVaisseauActif(etat = recupererEtatJeu()) {
  const vaisseauActif = recupererVaisseauActif(etat)

  if (!vaisseauActif || !etat.vaisseau) {
    return
  }

  vaisseauActif.coque = etat.vaisseau.coque
  vaisseauActif.coqueMax = etat.vaisseau.coqueMax
  vaisseauActif.soute = etat.vaisseau.soute
  vaisseauActif.souteMax = etat.vaisseau.souteMax
  vaisseauActif.puissanceMiniere = etat.vaisseau.puissanceMiniere
  vaisseauActif.dronesMiniersMax = etat.vaisseau.dronesMiniersMax
  vaisseauActif.carburantMax = etat.vaisseau.carburantMax
  vaisseauActif.carburant = etat.ressources.carburant
  vaisseauActif.scanner = structuredClone(etat.vaisseau.scanner || vaisseauActif.scanner || {})
  vaisseauActif.ameliorations = structuredClone(
    etat.vaisseau.ameliorations || vaisseauActif.ameliorations || [],
  )
}

export function synchroniserVaisseauActifDansEtat(etat = recupererEtatJeu()) {
  const vaisseauActif = recupererVaisseauActif(etat)

  if (!vaisseauActif) {
    return
  }

  etat.vaisseau = {
    id: vaisseauActif.id,
    modeleId: vaisseauActif.modeleId,
    nom: vaisseauActif.nom,
    constructeur: vaisseauActif.constructeur,
    role: vaisseauActif.role,
    coque: vaisseauActif.coque,
    coqueMax: vaisseauActif.coqueMax,
    soute: vaisseauActif.soute,
    souteMax: vaisseauActif.souteMax,
    puissanceMiniere: vaisseauActif.puissanceMiniere,
    dronesMiniersMax: vaisseauActif.dronesMiniersMax,
    carburantMax: vaisseauActif.carburantMax,
    scanner: structuredClone(vaisseauActif.scanner || {}),
    ameliorations: structuredClone(vaisseauActif.ameliorations || []),
  }

  etat.ressources.carburant = vaisseauActif.carburant
}

export function hydraterEtatVaisseauxApresChargement(etat = recupererEtatJeu()) {
  if (!Array.isArray(etat.vaisseauxPossedes) || etat.vaisseauxPossedes.length === 0) {
    const modeleId = etat.vaisseau?.modeleId || etat.vaisseau?.id || 'hw_mule'
    const vaisseauHydrate = creerInstanceVaisseauDepuisModele(modeleId)

    vaisseauHydrate.coque = etat.vaisseau?.coque ?? vaisseauHydrate.coque
    vaisseauHydrate.soute = etat.vaisseau?.soute ?? vaisseauHydrate.soute
    vaisseauHydrate.souteMax = etat.vaisseau?.souteMax ?? vaisseauHydrate.souteMax
    vaisseauHydrate.puissanceMiniere =
      etat.vaisseau?.puissanceMiniere ?? vaisseauHydrate.puissanceMiniere
    vaisseauHydrate.dronesMiniersMax =
      etat.vaisseau?.dronesMiniersMax ?? vaisseauHydrate.dronesMiniersMax
    vaisseauHydrate.carburant = etat.ressources?.carburant ?? vaisseauHydrate.carburant
    vaisseauHydrate.carburantMax = etat.vaisseau?.carburantMax ?? vaisseauHydrate.carburantMax
    vaisseauHydrate.scanner = structuredClone(etat.vaisseau?.scanner || vaisseauHydrate.scanner)
    vaisseauHydrate.ameliorations = structuredClone(
      etat.vaisseau?.ameliorations || vaisseauHydrate.ameliorations,
    )

    etat.vaisseauxPossedes = [vaisseauHydrate]
    etat.vaisseauActifId = vaisseauHydrate.id
  }

  if (!etat.vaisseauActifId && etat.vaisseauxPossedes.length > 0) {
    etat.vaisseauActifId = etat.vaisseauxPossedes[0].id
  }

  if (!etat.ressources.cargaisonMarchande) {
    etat.ressources.cargaisonMarchande = {}
  }

  synchroniserVaisseauActifDansEtat(etat)
}

export function possedeDejaModele(modeleId, etat = recupererEtatJeu()) {
  return (etat.vaisseauxPossedes || []).some((vaisseau) => vaisseau.modeleId === modeleId)
}

export function peutChangerDeVaisseau(idVaisseau, etat = recupererEtatJeu()) {
  if (etat.positionLocale !== 'station') {
    return { ok: false, raison: 'Le changement de vaisseau n’est possible qu’en station.' }
  }

  if (etat.navigation?.enVoyage) {
    return { ok: false, raison: 'Impossible de changer de vaisseau pendant un trajet.' }
  }

  const vaisseauCible =
    (etat.vaisseauxPossedes || []).find((vaisseau) => vaisseau.id === idVaisseau) || null

  if (!vaisseauCible) {
    return { ok: false, raison: 'Vaisseau cible introuvable dans le hangar.' }
  }

  if (etat.vaisseauActifId === idVaisseau) {
    return { ok: false, raison: 'Ce vaisseau est déjà actif.' }
  }

  if ((etat.vaisseau?.soute || 0) > vaisseauCible.souteMax) {
    return {
      ok: false,
      raison: 'La soute actuelle dépasse la capacité maximale du vaisseau cible.',
    }
  }

  return { ok: true, raison: null }
}

export function changerVaisseauActif(idVaisseau) {
  const etat = recupererEtatJeu()
  const validation = peutChangerDeVaisseau(idVaisseau, etat)

  if (!validation.ok) {
    ajouterAuJournal(validation.raison, 'evenements')
    return false
  }

  synchroniserFlotteDepuisVaisseauActif(etat)

  const ancienVaisseau = recupererVaisseauActif(etat)
  const vaisseauCible = etat.vaisseauxPossedes.find((vaisseau) => vaisseau.id === idVaisseau)
  const cargaisonActuelle = etat.vaisseau?.soute || 0

  if (ancienVaisseau) {
    ancienVaisseau.soute = 0
  }

  vaisseauCible.soute = cargaisonActuelle
  etat.vaisseauActifId = vaisseauCible.id

  synchroniserVaisseauActifDansEtat(etat)

  ajouterAuJournal(
    `Changement de châssis effectué : ${vaisseauCible.nom} désormais actif.`,
    'evenements',
  )

  return true
}

export function recupererCatalogueVaisseauxStation(secteurId, etat = recupererEtatJeu()) {
  if (secteurId !== 'ceinture_khepri') {
    return []
  }

  return donneesVaisseaux
    .filter((vaisseau) => vaisseau.id === 'hw_caravel')
    .map((modele) => ({
      ...modele,
      dejaPossede: possedeDejaModele(modele.id, etat),
    }))
}

export function peutAcheterVaisseau(modeleId, etat = recupererEtatJeu()) {
  if (etat.positionLocale !== 'station') {
    return { ok: false, raison: 'Achat de vaisseau possible uniquement en station.' }
  }

  if (etat.navigation?.enVoyage) {
    return { ok: false, raison: 'Impossible d’acheter un vaisseau pendant un trajet.' }
  }

  if (etat.secteurCourant?.id !== 'ceinture_khepri') {
    return { ok: false, raison: 'Aucun marchand de vaisseaux disponible dans ce secteur.' }
  }

  const modele = donneesVaisseaux.find((vaisseau) => vaisseau.id === modeleId)

  if (!modele) {
    return { ok: false, raison: 'Modèle de vaisseau introuvable.' }
  }

  if (possedeDejaModele(modeleId, etat)) {
    return { ok: false, raison: 'Ce vaisseau est déjà présent dans votre hangar.' }
  }

  if ((etat.ressources?.credits || 0) < (modele.prix || 0)) {
    return { ok: false, raison: 'Crédits insuffisants pour cet achat.' }
  }

  return { ok: true, raison: null }
}

export function acheterVaisseau(modeleId) {
  const etat = recupererEtatJeu()
  const validation = peutAcheterVaisseau(modeleId, etat)

  if (!validation.ok) {
    ajouterAuJournal(validation.raison, 'commerce')
    return false
  }

  const modele = donneesVaisseaux.find((vaisseau) => vaisseau.id === modeleId)
  const exemplairesExistants = etat.vaisseauxPossedes.filter(
    (vaisseau) => vaisseau.modeleId === modeleId,
  ).length
  const suffixe = String(exemplairesExistants + 1).padStart(3, '0')
  const nouveauVaisseau = creerInstanceVaisseauDepuisModele(modeleId, suffixe)

  etat.ressources.credits -= modele.prix
  etat.vaisseauxPossedes.push(nouveauVaisseau)

  ajouterAuJournal(
    `Acquisition confirmée : ${modele.nom} ajouté au hangar pour ${modele.prix} cr.`,
    'commerce',
  )

  return true
}
