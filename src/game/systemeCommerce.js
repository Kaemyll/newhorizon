import { donneesMinerais } from './dataMinerais'
import { donneesSecteurs } from './dataSecteurs'

export function calculerTauxTaxePourSecurite(securite) {
  const taxe = 0.18 + securite * 0.22
  return Math.max(0.15, Math.min(0.4, taxe))
}

export function formaterPourcentageTaxe(taux) {
  return `${Math.round(taux * 100)} %`
}

export function recupererSecteurParId(idSecteur) {
  return donneesSecteurs.find((secteur) => secteur.id === idSecteur) || null
}

export function recupererStationParSecteurId(idSecteur) {
  const secteur = recupererSecteurParId(idSecteur)
  return secteur?.stationPrincipale ?? null
}

export function recupererModificateurMinerai(station, idMinerai) {
  const entree = station?.economie?.modificateursMinerais?.find(
    (ligne) => ligne.idMinerai === idMinerai,
  )

  return entree?.modificateur ?? 1
}

export function calculerPrixUnitaireLocalBrut(station, minerai) {
  const modificateur = recupererModificateurMinerai(station, minerai.id)
  return Math.max(1, Math.round(minerai.prixUnitaire * modificateur))
}

export function calculerPrixLigneBrut(station, minerai, quantite) {
  const prixUnitaireLocal = calculerPrixUnitaireLocalBrut(station, minerai)
  return prixUnitaireLocal * quantite
}

export function recupererVariationCours(station, minerai) {
  const prixLocal = calculerPrixUnitaireLocalBrut(station, minerai)
  const prixMoyen = minerai.prixUnitaire

  if (prixLocal > prixMoyen) {
    return 'hausse'
  }

  if (prixLocal < prixMoyen) {
    return 'baisse'
  }

  return 'stable'
}

export function recupererSymboleVariation(station, minerai) {
  const variation = recupererVariationCours(station, minerai)

  if (variation === 'hausse') {
    return '↑'
  }

  if (variation === 'baisse') {
    return '↓'
  }

  return '='
}

export function calculerVariationPrixPourcentage(station, minerai) {
  const prixMoyen = minerai.prixUnitaire || 1
  const prixLocal = calculerPrixUnitaireLocalBrut(station, minerai)
  return Math.round(((prixLocal - prixMoyen) / prixMoyen) * 100)
}

export function formaterVariationPrixPourcentage(valeur) {
  if (valeur > 0) return `+${valeur} %`
  if (valeur < 0) return `${valeur} %`
  return '0 %'
}

export function calculerCoursLocauxPourStation(station) {
  return donneesMinerais.map((minerai) => {
    const prixBrut = calculerPrixUnitaireLocalBrut(station, minerai)
    const variationPourcentage = calculerVariationPrixPourcentage(station, minerai)

    return {
      ...minerai,
      prixBrut,
      prixMoyen: minerai.prixUnitaire,
      variation: recupererVariationCours(station, minerai),
      variationSymbole: recupererSymboleVariation(station, minerai),
      modificateur: recupererModificateurMinerai(station, minerai.id),
      variationPourcentage,
      variationPourcentageLabel: formaterVariationPrixPourcentage(variationPourcentage),
    }
  })
}

export function recupererTopCoursHaussiers(station, limite = 3) {
  return calculerCoursLocauxPourStation(station)
    .filter((ligne) => ligne.variationPourcentage > 0)
    .sort((a, b) => b.variationPourcentage - a.variationPourcentage)
    .slice(0, limite)
}

export function recupererTopCoursBaissiers(station, limite = 3) {
  return calculerCoursLocauxPourStation(station)
    .filter((ligne) => ligne.variationPourcentage < 0)
    .sort((a, b) => a.variationPourcentage - b.variationPourcentage)
    .slice(0, limite)
}

export function construireResumeMarcheStation(station) {
  const haussiers = recupererTopCoursHaussiers(station, 2)
  const baissiers = recupererTopCoursBaissiers(station, 2)

  return {
    haussiers,
    baissiers,
  }
}

export function calculerValeurCargaisonPourStation(ressourcesMinerais, station, securite) {
  let valeurBrute = 0

  for (const minerai of donneesMinerais) {
    const quantite = ressourcesMinerais[minerai.id] || 0

    if (quantite > 0) {
      valeurBrute += calculerPrixLigneBrut(station, minerai, quantite)
    }
  }

  const tauxTaxe = calculerTauxTaxePourSecurite(securite)
  const montantTaxe = Math.floor(valeurBrute * tauxTaxe)
  const valeurNette = valeurBrute - montantTaxe

  return {
    valeurBrute,
    montantTaxe,
    valeurNette,
    tauxTaxe,
  }
}
