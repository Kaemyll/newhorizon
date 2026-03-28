import { recupererEtatJeu } from './etatJeu'
import { faireTournerDrones } from './systemeMinage'
import { faireAvancerVoyage } from './systemeNavigation'
import { sauvegarderJeu } from './systemeSauvegarde'

let intervalleTick = null

export function demarrerBoucleJeu(apresTick) {
  if (intervalleTick) return

  intervalleTick = setInterval(() => {
    const etat = recupererEtatJeu()

    if (!etat.technique) {
      etat.technique = { compteurTicks: 0 }
    }

    etat.technique.compteurTicks += 1

    faireAvancerVoyage()

    if (!etat.navigation?.enVoyage) {
      faireTournerDrones()
    }

    sauvegarderJeu()

    if (apresTick) {
      apresTick()
    }
  }, 1000)
}

export function arreterBoucleJeu() {
  if (!intervalleTick) return

  clearInterval(intervalleTick)
  intervalleTick = null
}
