import { donneesVaisseaux } from './dataVaisseaux'
import { recupererEtatJeu } from './etatJeu'
import { recupererTickCourant } from './systemeTemps'
import { recupererEtatCoque } from './systemeCoque'

export const DUREE_CONTRAT_ASSURANCE_TICKS = 720

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

function bornerValeur(valeur, minimum, maximum) {
  return Math.min(Math.max(valeur, minimum), maximum)
}

function recupererLibelleAssurance(niveau) {
  switch (niveau) {
    case 'tiers':
      return 'au tiers'
    case 'standard':
      return 'standard'
    case 'premium':
      return 'premium'
    case 'elite':
      return 'élite'
    default:
      return 'aucune'
  }
}

function estContratAssuranceActif(vaisseau, tickCourant = recupererTickCourant()) {
  const niveau = vaisseau?.assuranceNiveau || 'aucune'
  const expiration = Number(vaisseau?.assuranceExpirationTick || 0)

  if (niveau === 'aucune') {
    return false
  }

  return expiration > tickCourant
}

function calculerCoutAssurance(modeleId, niveau) {
  const modele = donneesVaisseaux.find((entree) => entree.id === modeleId)
  const valeurMarchande = Number(modele?.prix || 0)

  const multiplicateurs = {
    aucune: 0,
    tiers: 0.04,
    standard: 0.07,
    premium: 0.11,
    elite: 0.16,
  }

  return Math.max(0, Math.round(valeurMarchande * (multiplicateurs[niveau] || 0)))
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
    assuranceNiveau: 'aucune',
    assuranceSouscriptionTick: 0,
    assuranceExpirationTick: 0,
    scanner: structuredClone(modele.scanner || {}),
    ameliorations: structuredClone(modele.ameliorations || []),
    ameliorationsMax: structuredClone(modele.ameliorationsMax || {}),
  }
}

export function normaliserVaisseauPossede(vaisseau) {
  if (!vaisseau) {
    return null
  }

  const modele = donneesVaisseaux.find(
      (modeleVaisseau) =>
          modeleVaisseau.id === vaisseau.modeleId || modeleVaisseau.id === vaisseau.id,
  )

  if (!modele) {
    return structuredClone(vaisseau)
  }

  const coqueMax = Number(vaisseau.coqueMax ?? modele.coqueMax ?? 0)
  const souteMax = Number(vaisseau.souteMax ?? modele.souteMax ?? 0)
  const carburantMax = Number(vaisseau.carburantMax ?? modele.carburantMax ?? 0)

  return {
    id: vaisseau.id || `${modele.id}_001`,
    modeleId: vaisseau.modeleId || modele.id,
    nom: vaisseau.nom || modele.nom,
    constructeur: vaisseau.constructeur || modele.constructeur,
    role: vaisseau.role || modele.role,
    coque: bornerValeur(Number(vaisseau.coque ?? coqueMax), 0, coqueMax),
    coqueMax,
    soute: bornerValeur(Number(vaisseau.soute ?? 0), 0, souteMax),
    souteMax,
    puissanceMiniere: Number(vaisseau.puissanceMiniere ?? modele.puissanceMiniere ?? 0),
    dronesMiniersMax: Number(vaisseau.dronesMiniersMax ?? modele.dronesMiniersMax ?? 0),
    carburant: bornerValeur(Number(vaisseau.carburant ?? carburantMax), 0, carburantMax),
    carburantMax,
    assuranceNiveau: vaisseau.assuranceNiveau || 'aucune',
    assuranceSouscriptionTick: Number(vaisseau.assuranceSouscriptionTick || 0),
    assuranceExpirationTick: Number(vaisseau.assuranceExpirationTick || 0),
    scanner: structuredClone(vaisseau.scanner || modele.scanner || {}),
    ameliorations: structuredClone(vaisseau.ameliorations || modele.ameliorations || []),
    ameliorationsMax: structuredClone(vaisseau.ameliorationsMax || modele.ameliorationsMax || {}),
  }
}

export function recupererVaisseauActif(etat = recupererEtatJeu()) {
  if (!etat.vaisseauxPossedes || !etat.vaisseauActifId) {
    return null
  }

  return etat.vaisseauxPossedes.find((vaisseau) => vaisseau.id === etat.vaisseauActifId) || null
}

export function recupererInformationsCoqueVaisseau(vaisseau) {
  if (!vaisseau) {
    return {
      code: 'hors_service',
      label: 'Hors service',
      seuilMin: 0,
      seuilMax: 0,
      pourcentage: 0,
    }
  }

  return recupererEtatCoque(vaisseau.coque, vaisseau.coqueMax)
}

export function recupererInformationsCoqueVaisseauActif(etat = recupererEtatJeu()) {
  const vaisseauActif = recupererVaisseauActif(etat)
  return recupererInformationsCoqueVaisseau(vaisseauActif)
}

export function synchroniserFlotteDepuisVaisseauActif(etat = recupererEtatJeu()) {
  const vaisseauActif = recupererVaisseauActif(etat)

  if (!vaisseauActif || !etat.vaisseau) {
    return
  }

  vaisseauActif.coqueMax = Number(etat.vaisseau.coqueMax ?? vaisseauActif.coqueMax)
  vaisseauActif.coque = bornerValeur(
      Number(etat.vaisseau.coque ?? vaisseauActif.coque),
      0,
      vaisseauActif.coqueMax,
  )

  vaisseauActif.souteMax = Number(etat.vaisseau.souteMax ?? vaisseauActif.souteMax)
  vaisseauActif.soute = bornerValeur(
      Number(etat.vaisseau.soute ?? vaisseauActif.soute),
      0,
      vaisseauActif.souteMax,
  )

  vaisseauActif.puissanceMiniere = Number(
      etat.vaisseau.puissanceMiniere ?? vaisseauActif.puissanceMiniere,
  )
  vaisseauActif.dronesMiniersMax = Number(
      etat.vaisseau.dronesMiniersMax ?? vaisseauActif.dronesMiniersMax,
  )

  vaisseauActif.carburantMax = Number(etat.vaisseau.carburantMax ?? vaisseauActif.carburantMax)
  vaisseauActif.carburant = bornerValeur(
      Number(etat.ressources.carburant ?? vaisseauActif.carburant),
      0,
      vaisseauActif.carburantMax,
  )

  vaisseauActif.assuranceNiveau = etat.vaisseau.assuranceNiveau || vaisseauActif.assuranceNiveau || 'aucune'
  vaisseauActif.assuranceSouscriptionTick = Number(
      etat.vaisseau.assuranceSouscriptionTick ?? vaisseauActif.assuranceSouscriptionTick ?? 0,
  )
  vaisseauActif.assuranceExpirationTick = Number(
      etat.vaisseau.assuranceExpirationTick ?? vaisseauActif.assuranceExpirationTick ?? 0,
  )

  vaisseauActif.scanner = structuredClone(etat.vaisseau.scanner || vaisseauActif.scanner || {})
  vaisseauActif.ameliorations = structuredClone(
      etat.vaisseau.ameliorations || vaisseauActif.ameliorations || [],
  )
  vaisseauActif.ameliorationsMax = structuredClone(
      etat.vaisseau.ameliorationsMax || vaisseauActif.ameliorationsMax || {},
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
    assuranceNiveau: vaisseauActif.assuranceNiveau || 'aucune',
    assuranceSouscriptionTick: Number(vaisseauActif.assuranceSouscriptionTick || 0),
    assuranceExpirationTick: Number(vaisseauActif.assuranceExpirationTick || 0),
    scanner: structuredClone(vaisseauActif.scanner || {}),
    ameliorations: structuredClone(vaisseauActif.ameliorations || []),
    ameliorationsMax: structuredClone(vaisseauActif.ameliorationsMax || {}),
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
    vaisseauHydrate.assuranceNiveau =
        etat.vaisseau?.assuranceNiveau ?? vaisseauHydrate.assuranceNiveau
    vaisseauHydrate.assuranceSouscriptionTick =
        etat.vaisseau?.assuranceSouscriptionTick ?? vaisseauHydrate.assuranceSouscriptionTick
    vaisseauHydrate.assuranceExpirationTick =
        etat.vaisseau?.assuranceExpirationTick ?? vaisseauHydrate.assuranceExpirationTick
    vaisseauHydrate.scanner = structuredClone(etat.vaisseau?.scanner || vaisseauHydrate.scanner)
    vaisseauHydrate.ameliorations = structuredClone(
        etat.vaisseau?.ameliorations || vaisseauHydrate.ameliorations,
    )
    vaisseauHydrate.ameliorationsMax = structuredClone(
        etat.vaisseau?.ameliorationsMax || vaisseauHydrate.ameliorationsMax || {},
    )

    etat.vaisseauxPossedes = [normaliserVaisseauPossede(vaisseauHydrate)]
    etat.vaisseauActifId = etat.vaisseauxPossedes[0].id
  } else {
    etat.vaisseauxPossedes = etat.vaisseauxPossedes
        .map((vaisseau) => normaliserVaisseauPossede(vaisseau))
        .filter(Boolean)
  }

  if (!etat.vaisseauActifId && etat.vaisseauxPossedes.length > 0) {
    etat.vaisseauActifId = etat.vaisseauxPossedes[0].id
  }

  const vaisseauActif = recupererVaisseauActif(etat)

  if (!vaisseauActif && etat.vaisseauxPossedes.length > 0) {
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
  etat.vaisseauxPossedes.push(normaliserVaisseauPossede(nouveauVaisseau))

  ajouterAuJournal(
      `Acquisition confirmée : ${modele.nom} ajouté au hangar pour ${modele.prix} cr.`,
      'commerce',
  )

  return true
}

export function peutSouscrireAssuranceVaisseauActif(niveau, etat = recupererEtatJeu()) {
  const vaisseauActif = recupererVaisseauActif(etat)

  if (!vaisseauActif) {
    return { ok: false, raison: 'Aucun vaisseau actif disponible.' }
  }

  if (etat.positionLocale !== 'station') {
    return { ok: false, raison: 'La souscription d’assurance est possible uniquement en station.' }
  }

  if (etat.navigation?.enVoyage) {
    return { ok: false, raison: 'Impossible de modifier une assurance pendant un trajet.' }
  }

  const niveauxAutorises = ['aucune', 'tiers', 'standard', 'premium', 'elite']

  if (!niveauxAutorises.includes(niveau)) {
    return { ok: false, raison: 'Niveau d’assurance invalide.' }
  }

  const contratActif = estContratAssuranceActif(vaisseauActif)

  if (niveau === 'aucune' && vaisseauActif.assuranceNiveau === 'aucune') {
    return { ok: false, raison: 'Aucun contrat actif à résilier.' }
  }

  if (niveau !== 'aucune' && vaisseauActif.assuranceNiveau === niveau && contratActif) {
    return { ok: false, raison: 'Ce contrat est déjà actif sur le vaisseau.' }
  }

  const cout = calculerCoutAssurance(vaisseauActif.modeleId, niveau)

  if ((etat.ressources?.credits || 0) < cout) {
    return { ok: false, raison: 'Crédits insuffisants pour cette formule d’assurance.' }
  }

  return { ok: true, raison: null, cout }
}

export function souscrireAssuranceVaisseauActif(niveau) {
  const etat = recupererEtatJeu()
  const validation = peutSouscrireAssuranceVaisseauActif(niveau, etat)

  if (!validation.ok) {
    ajouterAuJournal(validation.raison, 'commerce')
    return false
  }

  synchroniserFlotteDepuisVaisseauActif(etat)

  const tickCourant = recupererTickCourant()
  const vaisseauActif = recupererVaisseauActif(etat)

  if (niveau === 'aucune') {
    vaisseauActif.assuranceNiveau = 'aucune'
    vaisseauActif.assuranceSouscriptionTick = 0
    vaisseauActif.assuranceExpirationTick = 0

    synchroniserVaisseauActifDansEtat(etat)

    ajouterAuJournal(
        `Résiliation du contrat d’assurance pour ${vaisseauActif.nom}.`,
        'commerce',
    )

    return true
  }

  vaisseauActif.assuranceNiveau = niveau
  vaisseauActif.assuranceSouscriptionTick = tickCourant
  vaisseauActif.assuranceExpirationTick = tickCourant + DUREE_CONTRAT_ASSURANCE_TICKS
  etat.ressources.credits -= validation.cout

  synchroniserVaisseauActifDansEtat(etat)

  ajouterAuJournal(
      `Contrat d’assurance ${recupererLibelleAssurance(niveau)} souscrit pour ${vaisseauActif.nom} (${validation.cout} cr, validité 720 ticks).`,
      'commerce',
  )

  return true
}