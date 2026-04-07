import { recupererEtatJeu, remplacerEtatJeu } from './etatJeu'
import { creerEtatInitialJeu } from './donneesInitiales'
import {
  hydraterEtatVaisseauxApresChargement,
  synchroniserFlotteDepuisVaisseauActif,
} from './systemeVaisseaux'

const CLE_SAUVEGARDE = 'new-horizon-save'

function fusionnerObjets(base, sauvegarde) {
  if (typeof base !== 'object' || base === null || Array.isArray(base)) {
    return sauvegarde !== undefined ? sauvegarde : base
  }

  const resultat = { ...base }

  if (typeof sauvegarde !== 'object' || sauvegarde === null || Array.isArray(sauvegarde)) {
    return resultat
  }

  for (const cle of Object.keys(sauvegarde)) {
    resultat[cle] = fusionnerObjets(base[cle], sauvegarde[cle])
  }

  return resultat
}

export function sauvegarderJeu() {
  synchroniserFlotteDepuisVaisseauActif(recupererEtatJeu())
  localStorage.setItem(CLE_SAUVEGARDE, JSON.stringify(recupererEtatJeu()))
}

export function chargerJeu() {
  const sauvegardeBrute = localStorage.getItem(CLE_SAUVEGARDE)

  if (!sauvegardeBrute) {
    const etatInitial = creerEtatInitialJeu()
    hydraterEtatVaisseauxApresChargement(etatInitial)
    remplacerEtatJeu(etatInitial)
    return
  }

  try {
    const sauvegardeParsee = JSON.parse(sauvegardeBrute)
    const etatFusionne = fusionnerObjets(creerEtatInitialJeu(), sauvegardeParsee)

    hydraterEtatVaisseauxApresChargement(etatFusionne)
    remplacerEtatJeu(etatFusionne)
  } catch (erreur) {
    console.error('Erreur de chargement de sauvegarde :', erreur)

    const etatInitial = creerEtatInitialJeu()
    hydraterEtatVaisseauxApresChargement(etatInitial)
    remplacerEtatJeu(etatInitial)
  }
}
