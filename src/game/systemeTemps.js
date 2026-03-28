import { recupererEtatJeu } from './etatJeu'

/**
 * New Horizon — règle officielle du temps
 * 1 tick = 1 heure de simulation.
 *
 * Un tick n'est consommé que par une action qui fait réellement avancer
 * le monde du jeu. Les clics d'interface et la consultation des panneaux
 * n'en consomment pas.
 */
export function avancerTemps(nombreTicks = 1) {
  const etat = recupererEtatJeu()

  if (!etat.technique) {
    etat.technique = {
      compteurTicks: 0,
    }
  }

  etat.technique.compteurTicks += nombreTicks
}

export function recupererTickCourant() {
  const etat = recupererEtatJeu()
  return etat.technique?.compteurTicks ?? 0
}
