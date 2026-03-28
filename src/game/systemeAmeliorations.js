import { recupererEtatJeu } from './etatJeu'
import { donneesSecteurs } from './donneesSecteurs'
import { donneesVaisseaux } from './donneesVaisseaux'
import { ajouterAuJournal } from './systemeMinage'

function recupererSecteurCourant() {
  const etat = recupererEtatJeu()

  return donneesSecteurs.find((secteur) => secteur.id === etat.secteurCourant.id) || null
}

function recupererModeleVaisseau() {
  const etat = recupererEtatJeu()

  return donneesVaisseaux.find((vaisseau) => vaisseau.id === etat.vaisseau.id) || null
}

export function recupererListeAmeliorationsDisponibles() {
  const modele = recupererModeleVaisseau()

  if (!modele?.ameliorations) {
    return []
  }

  return Object.values(modele.ameliorations)
}

export function ameliorerVaisseau(idAmelioration) {
  const etat = recupererEtatJeu()
  const secteurCourant = recupererSecteurCourant()
  const station = secteurCourant?.stationPrincipale
  const modele = recupererModeleVaisseau()

  if (etat.navigation?.enVoyage) {
    ajouterAuJournal('Impossible de modifier le vaisseau pendant un trajet.', 'commerce')
    return
  }

  if (!station?.services?.atelier) {
    ajouterAuJournal('Aucun atelier disponible dans cette station.', 'commerce')
    return
  }

  const amelioration = modele?.ameliorations?.[idAmelioration]

  if (!amelioration) {
    ajouterAuJournal('Amélioration inconnue.', 'commerce')
    return
  }

  if (etat.ressources.credits < amelioration.cout) {
    ajouterAuJournal(`Crédits insuffisants pour ${amelioration.nom.toLowerCase()}.`, 'commerce')
    return
  }

  if (idAmelioration === 'soute') {
    if (etat.vaisseau.souteMax >= amelioration.valeurMax) {
      ajouterAuJournal('Capacité maximale de soute déjà atteinte.', 'commerce')
      return
    }

    etat.ressources.credits -= amelioration.cout
    etat.vaisseau.souteMax = Math.min(
      etat.vaisseau.souteMax + amelioration.increment,
      amelioration.valeurMax,
    )

    ajouterAuJournal(
      `Amélioration installée : ${amelioration.nom} (${etat.vaisseau.souteMax} max).`,
      'commerce',
    )
    return
  }

  if (idAmelioration === 'drones') {
    if (etat.vaisseau.dronesMiniersMax >= amelioration.valeurMax) {
      ajouterAuJournal('Capacité maximale de drones déjà atteinte.', 'commerce')
      return
    }

    etat.ressources.credits -= amelioration.cout
    etat.vaisseau.dronesMiniersMax = Math.min(
      etat.vaisseau.dronesMiniersMax + amelioration.increment,
      amelioration.valeurMax,
    )

    ajouterAuJournal(
      `Amélioration installée : ${amelioration.nom} (${etat.vaisseau.dronesMiniersMax} max).`,
      'commerce',
    )
    return
  }

  if (idAmelioration === 'carburant') {
    if (etat.vaisseau.carburantMax >= amelioration.valeurMax) {
      ajouterAuJournal('Capacité maximale de carburant déjà atteinte.', 'commerce')
      return
    }

    etat.ressources.credits -= amelioration.cout

    const ancienneValeur = etat.vaisseau.carburantMax
    etat.vaisseau.carburantMax = Math.min(
      etat.vaisseau.carburantMax + amelioration.increment,
      amelioration.valeurMax,
    )

    const gainEffectif = etat.vaisseau.carburantMax - ancienneValeur
    etat.ressources.carburant += gainEffectif

    ajouterAuJournal(
      `Amélioration installée : ${amelioration.nom} (${etat.vaisseau.carburantMax} max).`,
      'commerce',
    )
    return
  }

  if (idAmelioration === 'extraction') {
    if (etat.vaisseau.puissanceMiniere >= amelioration.valeurMax) {
      ajouterAuJournal('Puissance minière maximale déjà atteinte.', 'commerce')
      return
    }

    etat.ressources.credits -= amelioration.cout
    etat.vaisseau.puissanceMiniere = Math.min(
      etat.vaisseau.puissanceMiniere + amelioration.increment,
      amelioration.valeurMax,
    )

    ajouterAuJournal(
      `Amélioration installée : ${amelioration.nom} (${etat.vaisseau.puissanceMiniere} puissance).`,
      'commerce',
    )
  }
}
