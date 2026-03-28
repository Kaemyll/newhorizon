import { creerEtatInitialJeu } from './donneesInitiales'

let etatJeu = creerEtatInitialJeu()

export function recupererEtatJeu() {
  return etatJeu
}

export function remplacerEtatJeu(nouvelEtat) {
  etatJeu = nouvelEtat
}

export function reinitialiserEtatJeu() {
  /**
   * Réinitialisation complète :
   * on recrée un état neuf depuis la source initiale,
   * y compris améliorations, drones, cargo, carburant,
   * statistiques, journal et ticks.
   */
  etatJeu = creerEtatInitialJeu()
}
