import { donneesMinerais } from './dataMinerais'
import { donneesSecteurs } from './dataSecteurs'
import { recupererEtatJeu } from './etatJeu'
import { avancerTemps, recupererTickCourant } from './systemeTemps'

function obtenirHorodatageTick() {
  const tick = recupererTickCourant()
  return `[T${String(tick).padStart(4, '0')}]`
}

function ajouterAuJournalCommerce(message, niveau = 'standard') {
  const etat = recupererEtatJeu()

  etat.journal.unshift({
    horodatage: obtenirHorodatageTick(),
    message,
    categorie: 'commerce',
    niveau,
  })

  if (etat.journal.length > 50) {
    etat.journal.pop()
  }
}

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

  if (variation === 'hausse') return '↑'
  if (variation === 'baisse') return '↓'
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

export function calculerCoursLocauxPourStation(station, ressourcesMinerais = {}) {
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
      quantiteEnSoute: ressourcesMinerais[minerai.id] || 0,
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
  return {
    haussiers: recupererTopCoursHaussiers(station, 2),
    baissiers: recupererTopCoursBaissiers(station, 2),
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

export function acheterMineraiEnStation(idMinerai, quantite = 1) {
  const etat = recupererEtatJeu()

  if (etat.navigation?.enVoyage) {
    ajouterAuJournalCommerce('Impossible d’acheter un chargement pendant un trajet.', 'alerte')
    return
  }

  if (etat.positionLocale !== 'station') {
    ajouterAuJournalCommerce('Les achats ne sont possibles qu’à la station.', 'alerte')
    return
  }

  const secteurCourant = recupererSecteurParId(etat.secteurCourant?.id)
  const station = secteurCourant?.stationPrincipale

  if (!station?.services?.commerce) {
    ajouterAuJournalCommerce('Aucun service commercial disponible dans cette station.', 'alerte')
    return
  }

  const minerai = donneesMinerais.find((entree) => entree.id === idMinerai)

  if (!minerai) {
    ajouterAuJournalCommerce('Bien commercial introuvable.', 'alerte')
    return
  }

  const quantiteAchetee = Math.max(1, Math.floor(quantite))

  if (etat.vaisseau.soute + quantiteAchetee > etat.vaisseau.souteMax) {
    ajouterAuJournalCommerce('Soute insuffisante pour embarquer ce chargement.', 'alerte')
    return
  }

  const prixUnitaire = calculerPrixUnitaireLocalBrut(station, minerai)
  const coutTotal = prixUnitaire * quantiteAchetee

  if (etat.ressources.credits < coutTotal) {
    ajouterAuJournalCommerce('Crédits insuffisants pour cet achat.', 'alerte')
    return
  }

  etat.ressources.credits -= coutTotal
  etat.ressources.minerais[idMinerai] = (etat.ressources.minerais[idMinerai] || 0) + quantiteAchetee
  etat.vaisseau.soute += quantiteAchetee

  avancerTemps(1)

  ajouterAuJournalCommerce(
    `Achat embarqué en soute : +${quantiteAchetee} ${minerai.nom} pour ${coutTotal} cr.`,
    'succes',
  )
}
