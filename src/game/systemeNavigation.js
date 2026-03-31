import { recupererEtatJeu } from './etatJeu'
import { donneesSecteurs } from './dataSecteurs'
import { donneesTrajets } from './dataTrajets'
import { ajouterAuJournal, rappelerDrones } from './systemeMinage'

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

  if (etat.assistance?.remorquageEnCours) {
    ajouterAuJournal('Voyage impossible pendant un remorquage.', 'evenements', 'alerte')
    return
  }

  if (etat.navigation.enVoyage) {
    ajouterAuJournal('Navigation déjà en cours.', 'evenements', 'alerte')
    return
  }

  if (etat.positionLocale !== 'station') {
    ajouterAuJournal(
      'Le voyage inter-sectoriel ne peut être lancé que depuis la station.',
      'evenements',
      'alerte',
    )
    return
  }

  const idOrigine = etat.secteurCourant.id
  const idDestination = etat.navigation.destinationSelectionneeId

  if (!idDestination) {
    ajouterAuJournal('Aucune destination sélectionnée.', 'evenements', 'alerte')
    return
  }

  if (idOrigine === idDestination) {
    ajouterAuJournal('Vous êtes déjà dans ce secteur.', 'evenements', 'alerte')
    return
  }

  const secteurDestination = recupererSecteurParId(idDestination)
  const trajet = recupererTrajet(idOrigine, idDestination)

  if (!secteurDestination || !trajet) {
    ajouterAuJournal('Aucun trajet disponible vers cette destination.', 'evenements', 'alerte')
    return
  }

  if (etat.ressources.carburant < trajet.coutCarburant) {
    ajouterAuJournal('Carburant insuffisant pour effectuer ce trajet.', 'evenements', 'alerte')
    return
  }

  rappelerDrones(true)

  etat.ressources.carburant -= trajet.coutCarburant
  etat.navigation.enVoyage = true
  etat.navigation.secteurDestinationId = idDestination
  etat.navigation.ticksRestants = trajet.tempsTrajet
  etat.exploration.siteActif = null

  ajouterAuJournal(
    `Départ vers ${secteurDestination.nom} — coût ${trajet.coutCarburant} carburant, durée ${trajet.tempsTrajet} ticks.`,
    'evenements',
    'info',
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
  etat.positionLocale = 'station'
  etat.exploration.siteActif = null

  if (secteurDestination) {
    ajouterAuJournal(
      `Arrivée dans le secteur ${secteurDestination.nom}. Amarrage local disponible.`,
      'evenements',
      'info',
    )
  } else {
    ajouterAuJournal('Arrivée dans le secteur de destination.', 'evenements', 'info')
  }
}
