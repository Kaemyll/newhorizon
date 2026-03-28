import { recupererEtatJeu } from './etatJeu'
import { avancerTemps } from './systemeTemps'
import { faireAvancerVoyage } from './systemeNavigation'
import { faireTournerDrones } from './systemeMinage'
import { faireAvancerRemorquage, verifierPanneSecheEtDeclencher } from './systemeAssistance'

let intervalleJeu = null

function mondeDoitAvancer() {
  const etat = recupererEtatJeu()

  const dronesDeployes =
    etat.positionLocale === 'operations' &&
    (etat.industrie?.drones || []).some((drone) => drone.etat === 'deploie')

  return etat.navigation?.enVoyage || etat.assistance?.remorquageEnCours || dronesDeployes
}

function progresserMonde() {
  const etat = recupererEtatJeu()

  if (etat.navigation?.enVoyage || etat.assistance?.remorquageEnCours) {
    avancerTemps(1)
  }

  if (etat.navigation?.enVoyage) {
    faireAvancerVoyage()
  }

  if (etat.assistance?.remorquageEnCours) {
    faireAvancerRemorquage()
  }

  if (etat.positionLocale === 'operations') {
    faireTournerDrones()
    verifierPanneSecheEtDeclencher()
  }
}

export function demarrerBoucleJeu(callbackMiseAJour) {
  if (intervalleJeu) {
    clearInterval(intervalleJeu)
  }

  intervalleJeu = setInterval(() => {
    if (!mondeDoitAvancer()) {
      return
    }

    progresserMonde()

    if (typeof callbackMiseAJour === 'function') {
      callbackMiseAJour()
    }
  }, 1000)
}

export function arreterBoucleJeu() {
  if (intervalleJeu) {
    clearInterval(intervalleJeu)
    intervalleJeu = null
  }
}
