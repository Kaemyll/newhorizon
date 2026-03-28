import { recupererEtatJeu } from './etatJeu'
import { donneesSecteurs } from './donneesSecteurs'
import { donneesTrajets } from './donneesTrajets'
import { ajouterAuJournal } from './systemeMinage'

export function recupererSecteurParId(idSecteur) {
  return donneesSecteurs.find((secteur) => secteur.id === idSecteur) || null
}

export function recupererSecteurCourant() {
  const etat = recupererEtatJeu()
  return recupererSecteurParId(etat.secteurCourant.id)
}

export function recupererTrajet(idOrigine, idDestination) {
  return (
    donneesTrajets.find(
      (trajet) => trajet.origine === idOrigine && trajet.destination === idDestination,
    ) || null
  )
}

export function selectionnerDestination(idDestination) {
  const etat = recupererEtatJeu()
  etat.navigation.destinationSelectionneeId = idDestination
}

export function lancerVoyageVersDestinationSelectionnee() {
  const etat = recupererEtatJeu()

  if (etat.navigation.enVoyage) {
    ajouterAuJournal('Navigation déjà en cours.', 'evenements')
    return
  }

  if (etat.positionLocale !== 'station') {
    ajouterAuJournal(
      'Le voyage inter-sectoriel ne peut être lancé que depuis la station.',
      'evenements',
    )
    return
  }

  const idOrigine = etat.secteurCourant.id
  const idDestination = etat.navigation.destinationSelectionneeId

  if (!idDestination) {
    ajouterAuJournal('Aucune destination sélectionnée.', 'evenements')
    return
  }

  if (idOrigine === idDestination) {
    ajouterAuJournal('Vous êtes déjà dans ce secteur.', 'evenements')
    return
  }

  const secteurDestination = recupererSecteurParId(idDestination)
  const trajet = recupererTrajet(idOrigine, idDestination)

  if (!secteurDestination || !trajet) {
    ajouterAuJournal('Aucun trajet disponible vers cette destination.', 'evenements')
    return
  }

  if (etat.ressources.carburant < trajet.coutCarburant) {
    ajouterAuJournal('Carburant insuffisant pour effectuer ce trajet.', 'evenements')
    return
  }

  etat.ressources.carburant -= trajet.coutCarburant
  etat.navigation.enVoyage = true
  etat.navigation.secteurDestinationId = idDestination
  etat.navigation.ticksRestants = trajet.tempsTrajet

  ajouterAuJournal(
    `Départ vers ${secteurDestination.nom} — coût ${trajet.coutCarburant} carburant, durée ${trajet.tempsTrajet} ticks.`,
    'evenements',
  )
}

export function faireAvancerVoyage() {
  const etat = recupererEtatJeu()

  if (!etat.navigation.enVoyage) {
    return
  }

  etat.navigation.ticksRestants -= 1

  if (etat.navigation.ticksRestants > 0) {
    return
  }

  const secteurDestination = recupererSecteurParId(etat.navigation.secteurDestinationId)

  etat.secteurCourant.id = etat.navigation.secteurDestinationId
  etat.navigation.enVoyage = false
  etat.navigation.secteurDestinationId = null
  etat.navigation.ticksRestants = 0

  /**
   * À l’arrivée d’un trajet inter-sectoriel, on considère que le joueur
   * arrive au voisinage immédiat de la station principale du secteur.
   */
  etat.positionLocale = 'station'

  if (secteurDestination) {
    ajouterAuJournal(
      `Arrivée dans le secteur ${secteurDestination.nom}. Amarrage local disponible.`,
      'evenements',
    )
  } else {
    ajouterAuJournal('Arrivée dans le secteur de destination.', 'evenements')
  }
}
