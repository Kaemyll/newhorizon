import { creerEtatInitialJeu } from './donneesInitiales'

let etat = creerEtatInitialJeu()

export function recupererEtatJeu() {
  return etat
}

export function remplacerEtatJeu(nouvelEtat) {
  etat = nouvelEtat
}

export function reinitialiserEtatJeu() {
  etat = creerEtatInitialJeu()
}
