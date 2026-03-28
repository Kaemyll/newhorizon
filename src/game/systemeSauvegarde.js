import { recupererEtatJeu, remplacerEtatJeu } from './etatJeu'
import { creerEtatInitialJeu } from './donneesInitiales'

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
  localStorage.setItem(CLE_SAUVEGARDE, JSON.stringify(recupererEtatJeu()))
}

export function chargerJeu() {
  const sauvegardeBrute = localStorage.getItem(CLE_SAUVEGARDE)

  if (!sauvegardeBrute) {
    remplacerEtatJeu(creerEtatInitialJeu())
    return
  }

  try {
    const sauvegardeParsee = JSON.parse(sauvegardeBrute)
    const etatFusionne = fusionnerObjets(creerEtatInitialJeu(), sauvegardeParsee)
    remplacerEtatJeu(etatFusionne)
  } catch (erreur) {
    console.error('Erreur de chargement de sauvegarde :', erreur)
    remplacerEtatJeu(creerEtatInitialJeu())
  }
}
