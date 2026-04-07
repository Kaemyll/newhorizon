import { recupererEtatJeu } from './etatJeu'
import { donneesSecteurs } from './dataSecteurs'
import { donneesVaisseaux } from './dataVaisseaux'
import { ajouterAuJournal } from './systemeMinage'

function recupererSecteurCourant() {
  const etat = recupererEtatJeu()

  return donneesSecteurs.find((secteur) => secteur.id === etat.secteurCourant.id) || null
}

function recupererModeleVaisseau() {
  const etat = recupererEtatJeu()
  const identifiantModele = etat.vaisseau?.modeleId || etat.vaisseau?.id

  return donneesVaisseaux.find((vaisseau) => vaisseau.id === identifiantModele) || null
}

export function recupererListeAmeliorationsDisponibles() {
  const modele = recupererModeleVaisseau()

  if (!modele?.ameliorations) {
    return []
  }

  return modele.ameliorations
}

export function ameliorerVaisseau(idAmelioration) {
  const etat = recupererEtatJeu()
  const secteurCourant = recupererSecteurCourant()
  const station = secteurCourant?.stationPrincipale
  const modele = recupererModeleVaisseau()

  if (etat.navigation?.enVoyage) {
    ajouterAuJournal('Impossible de modifier le vaisseau pendant un trajet.', 'commerce', 'alerte')
    return
  }

  if (etat.positionLocale !== 'station') {
    ajouterAuJournal('Les améliorations ne sont disponibles qu’à la station.', 'commerce', 'alerte')
    return
  }

  if (!station?.services?.atelier) {
    ajouterAuJournal('Aucun atelier disponible dans cette station.', 'commerce', 'alerte')
    return
  }

  const amelioration = modele?.ameliorations?.find((entree) => entree.id === idAmelioration)

  if (!amelioration) {
    ajouterAuJournal('Amélioration inconnue.', 'commerce', 'alerte')
    return
  }

  if (etat.ressources.credits < amelioration.cout) {
    ajouterAuJournal(
      `Crédits insuffisants pour ${amelioration.nom.toLowerCase()}.`,
      'commerce',
      'alerte',
    )
    return
  }

  if (idAmelioration === 'soute') {
    if (etat.vaisseau.souteMax >= amelioration.valeurMax) {
      ajouterAuJournal('Capacité maximale de soute déjà atteinte.', 'commerce', 'alerte')
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
      'succes',
    )
    return
  }

  if (idAmelioration === 'drones') {
    if (etat.vaisseau.dronesMiniersMax >= amelioration.valeurMax) {
      ajouterAuJournal('Capacité maximale de drones déjà atteinte.', 'commerce', 'alerte')
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
      'succes',
    )
    return
  }

  if (idAmelioration === 'carburant') {
    if (etat.vaisseau.carburantMax >= amelioration.valeurMax) {
      ajouterAuJournal('Capacité maximale de carburant déjà atteinte.', 'commerce', 'alerte')
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
      'succes',
    )
    return
  }

  if (idAmelioration === 'extraction') {
    if (etat.vaisseau.puissanceMiniere >= amelioration.valeurMax) {
      ajouterAuJournal('Puissance minière maximale déjà atteinte.', 'commerce', 'alerte')
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
      'succes',
    )
  }
}
