import { recupererEtatJeu } from './etatJeu'
import { ajouterAuJournal } from './systemeMinage'
import { avancerTemps } from './systemeTemps'

const COUT_CARBURANT_LOCAL = 1
const COUT_TICKS_LOCAL = 1

export function allerEnZoneOperations() {
  const etat = recupererEtatJeu()

  if (etat.navigation?.enVoyage) {
    ajouterAuJournal(
      'Impossible de quitter la station pendant un trajet inter-sectoriel.',
      'evenements',
    )
    return
  }

  if (etat.positionLocale === 'operations') {
    ajouterAuJournal('Le vaisseau est déjà en zone d’opérations.', 'evenements')
    return
  }

  if (etat.ressources.carburant < COUT_CARBURANT_LOCAL) {
    ajouterAuJournal('Carburant insuffisant pour rejoindre la zone d’opérations.', 'evenements')
    return
  }

  etat.ressources.carburant -= COUT_CARBURANT_LOCAL
  avancerTemps(COUT_TICKS_LOCAL)
  etat.positionLocale = 'operations'

  ajouterAuJournal('Décollage de la station vers la zone d’opérations locale.', 'evenements')
}

export function retourALaStation() {
  const etat = recupererEtatJeu()

  if (etat.navigation?.enVoyage) {
    ajouterAuJournal(
      'Impossible de retourner à la station pendant un trajet inter-sectoriel.',
      'evenements',
    )
    return
  }

  if (etat.positionLocale === 'station') {
    ajouterAuJournal('Le vaisseau est déjà amarré à la station.', 'evenements')
    return
  }

  if (etat.ressources.carburant < COUT_CARBURANT_LOCAL) {
    ajouterAuJournal('Carburant insuffisant pour revenir à la station.', 'evenements')
    return
  }

  let nombreRappeles = 0

  for (const drone of etat.industrie?.drones || []) {
    if (drone.etat === 'deploie') {
      drone.etat = 'embarque'
      nombreRappeles += 1
      ajouterAuJournal(
        `Drone #${drone.id} rappelé automatiquement avant retour station.`,
        'evenements',
      )
    }
  }

  etat.ressources.carburant -= COUT_CARBURANT_LOCAL
  avancerTemps(COUT_TICKS_LOCAL)
  etat.positionLocale = 'station'

  if (nombreRappeles > 0) {
    ajouterAuJournal('Retour à la station locale et procédure d’amarrage terminée.', 'evenements')
    return
  }

  ajouterAuJournal('Retour à la station locale et procédure d’amarrage terminée.', 'evenements')
}
