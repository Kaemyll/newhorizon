import { recupererEtatJeu } from './etatJeu'
import { donneesMinerais } from './donneesMinerais'
import { donneesSecteurs } from './donneesSecteurs'
import { calculerPrixLigneBrut, calculerTauxTaxePourSecurite } from './systemeCommerce'
import { avancerTemps, recupererTickCourant } from './systemeTemps'
import { verifierPanneSecheEtDeclencher } from './systemeAssistance'

function obtenirHorodatageTick() {
  const tick = recupererTickCourant()
  return `[T${String(tick).padStart(4, '0')}]`
}

export function ajouterAuJournal(message, categorie = 'evenements', niveau = 'normal') {
  const etat = recupererEtatJeu()

  etat.journal.unshift({
    horodatage: obtenirHorodatageTick(),
    message,
    categorie,
    niveau,
  })

  if (etat.journal.length > 50) {
    etat.journal.pop()
  }
}

function recupererSecteurCourantDepuisEtat() {
  const etat = recupererEtatJeu()

  return donneesSecteurs.find((secteur) => secteur.id === etat.secteurCourant.id) || null
}

function tirerMineraiDepuisComposition(composition) {
  if (!composition || composition.length === 0) {
    return null
  }

  const totalPoids = composition.reduce((total, entree) => total + entree.poids, 0)
  let tirage = Math.random() * totalPoids

  for (const entree of composition) {
    tirage -= entree.poids

    if (tirage <= 0) {
      return donneesMinerais.find((minerai) => minerai.id === entree.idMinerai) || null
    }
  }

  const derniereEntree = composition[composition.length - 1]
  return donneesMinerais.find((minerai) => minerai.id === derniereEntree.idMinerai) || null
}

function ajouterMineraiDansSoute(mineraiId, quantite) {
  const etat = recupererEtatJeu()

  if (!Object.prototype.hasOwnProperty.call(etat.ressources.minerais, mineraiId)) {
    etat.ressources.minerais[mineraiId] = 0
  }

  etat.ressources.minerais[mineraiId] += quantite
  etat.vaisseau.soute += quantite
  etat.statistiques.totalMineraiExtrait += quantite
}

function verifierSiteActifExploitable() {
  const etat = recupererEtatJeu()
  const site = etat.exploration?.siteActif

  if (!site) {
    ajouterAuJournal('Aucun amas minier actif. Un scan est requis.', 'evenements')
    return false
  }

  if (site.reserveRestante <= 0) {
    ajouterAuJournal('L’amas minier actif est épuisé. Un nouveau scan est requis.', 'evenements')
    etat.exploration.siteActif = null
    return false
  }

  return true
}

function consommerReserveSite(quantite = 1) {
  const etat = recupererEtatJeu()
  const site = etat.exploration?.siteActif

  if (!site) {
    return
  }

  site.reserveRestante = Math.max(0, site.reserveRestante - quantite)

  if (site.reserveRestante === 0) {
    ajouterAuJournal(`L’amas minier actif ${site.nom} est désormais épuisé.`, 'evenements')
    etat.exploration.siteActif = null
  }
}

export function minerMineraiManuellement() {
  const etat = recupererEtatJeu()

  if (etat.navigation?.enVoyage) {
    ajouterAuJournal('Impossible de miner pendant un trajet.', 'evenements')
    return
  }

  if (etat.assistance?.remorquageEnCours) {
    ajouterAuJournal('Impossible de miner pendant un remorquage.', 'evenements')
    return
  }

  if (etat.positionLocale !== 'operations') {
    ajouterAuJournal('Le minage manuel n’est possible qu’en zone d’opérations.', 'evenements')
    return
  }

  if (!verifierSiteActifExploitable()) {
    return
  }

  if (etat.vaisseau.soute >= etat.vaisseau.souteMax) {
    ajouterAuJournal('Soute pleine. Impossible de miner.', 'evenements')
    return
  }

  avancerTemps(1)

  const mineraiTire = tirerMineraiDepuisComposition(etat.exploration.siteActif.composition)

  if (!mineraiTire) {
    ajouterAuJournal('Aucune ressource exploitable détectée dans cet amas.', 'evenements')
    return
  }

  ajouterMineraiDansSoute(mineraiTire.id, 1)
  consommerReserveSite(1)
  faireTournerDrones()
  verifierPanneSecheEtDeclencher()

  ajouterAuJournal(`Extraction manuelle : +1 ${mineraiTire.nom}.`, 'evenements')
}

export function vendreTousLesMinerais() {
  const etat = recupererEtatJeu()
  const secteurCourant = recupererSecteurCourantDepuisEtat()
  const station = secteurCourant?.stationPrincipale

  if (etat.navigation?.enVoyage) {
    ajouterAuJournal('Impossible de vendre la cargaison pendant un trajet.', 'commerce')
    return
  }

  if (etat.positionLocale !== 'station') {
    ajouterAuJournal('La vente n’est possible qu’à la station.', 'commerce')
    return
  }

  if (!station?.services?.commerce) {
    ajouterAuJournal('Aucun service commercial disponible dans cette station.', 'commerce')
    return
  }

  let valeurBrute = 0
  let quantiteTotaleVendue = 0
  const details = []

  for (const minerai of donneesMinerais) {
    const quantite = etat.ressources.minerais[minerai.id] || 0

    if (quantite > 0) {
      const valeurLocaleBrute = calculerPrixLigneBrut(station, minerai, quantite)

      valeurBrute += valeurLocaleBrute
      quantiteTotaleVendue += quantite
      etat.ressources.minerais[minerai.id] = 0

      details.push(`[${quantite}x ${minerai.abreviation} (${valeurLocaleBrute} cr)]`)
    }
  }

  if (quantiteTotaleVendue <= 0) {
    ajouterAuJournal('Aucun minerai à vendre.', 'commerce')
    return
  }

  const tauxTaxe = calculerTauxTaxePourSecurite(secteurCourant.securite)
  const montantTaxe = Math.floor(valeurBrute * tauxTaxe)
  const valeurNette = valeurBrute - montantTaxe

  etat.ressources.credits += valeurNette
  etat.statistiques.totalCreditsGagnes += valeurNette
  etat.vaisseau.soute = 0

  ajouterAuJournal(
    `${details.join(' + ')} : transaction brute ${valeurBrute} cr, taxe ${montantTaxe} cr, montant net ${valeurNette} cr.`,
    'commerce',
  )
}

export function acheterDroneMinier() {
  const etat = recupererEtatJeu()
  const cout = etat.economie.coutDroneMinier

  if (etat.navigation?.enVoyage) {
    ajouterAuJournal('Impossible d’acheter un drone pendant un trajet.', 'commerce')
    return
  }

  if (etat.positionLocale !== 'station') {
    ajouterAuJournal('L’achat d’un drone n’est possible qu’à la station.', 'commerce')
    return
  }

  if (etat.industrie.drones.length >= etat.vaisseau.dronesMiniersMax) {
    ajouterAuJournal('Capacité maximale de drones atteinte.', 'commerce')
    return
  }

  if (etat.ressources.credits < cout) {
    ajouterAuJournal('Crédits insuffisants pour acheter un drone minier.', 'commerce')
    return
  }

  etat.ressources.credits -= cout

  const nouveauDrone = {
    id: etat.industrie.prochainDroneId,
    etat: 'embarque',
    autonomieRestante: 8,
    ticksRechargeRestants: 0,
  }

  etat.industrie.drones.push(nouveauDrone)
  etat.industrie.prochainDroneId += 1

  ajouterAuJournal(`Drone minier #${nouveauDrone.id} acheté et embarqué.`, 'commerce')
}

export function deployerDrones() {
  const etat = recupererEtatJeu()

  if (etat.navigation?.enVoyage) {
    ajouterAuJournal('Impossible de déployer les drones pendant un trajet.', 'evenements')
    return
  }

  if (etat.assistance?.remorquageEnCours) {
    ajouterAuJournal('Impossible de déployer les drones pendant un remorquage.', 'evenements')
    return
  }

  if (etat.positionLocale !== 'operations') {
    ajouterAuJournal('Les drones ne peuvent être déployés qu’en zone d’opérations.', 'evenements')
    return
  }

  if (!verifierSiteActifExploitable()) {
    return
  }

  if (!etat.industrie?.drones?.length) {
    ajouterAuJournal('Aucun drone embarqué à déployer.', 'evenements')
    return
  }

  let nombreDeployes = 0

  for (const drone of etat.industrie.drones) {
    if (drone.etat === 'embarque' && drone.ticksRechargeRestants === 0) {
      drone.etat = 'deploie'
      nombreDeployes += 1
      ajouterAuJournal(`Drone #${drone.id} déployé en zone d’opérations.`, 'evenements')
    }
  }

  if (nombreDeployes === 0) {
    ajouterAuJournal('Aucun drone prêt à être déployé.', 'evenements')
  }
}

export function rappelerDrones(estAutomatique = false) {
  const etat = recupererEtatJeu()

  if (!etat.industrie?.drones?.length) {
    if (!estAutomatique) {
      ajouterAuJournal('Aucun drone à rappeler.', 'evenements')
    }
    return
  }

  let nombreRappeles = 0

  for (const drone of etat.industrie.drones) {
    if (drone.etat === 'deploie') {
      drone.etat = 'embarque'
      nombreRappeles += 1
      ajouterAuJournal(
        estAutomatique
          ? `Drone #${drone.id} rappelé automatiquement.`
          : `Drone #${drone.id} rappelé au vaisseau.`,
        'evenements',
      )
    }
  }

  if (nombreRappeles === 0 && !estAutomatique) {
    ajouterAuJournal('Aucun drone déployé à rappeler.', 'evenements')
  }
}

export function faireTournerDrones() {
  const etat = recupererEtatJeu()

  if (etat.navigation?.enVoyage) {
    return
  }

  if (!etat.industrie || !etat.industrie.drones) {
    return
  }

  for (const drone of etat.industrie.drones) {
    if (drone.etat === 'embarque' && drone.ticksRechargeRestants > 0) {
      drone.ticksRechargeRestants -= 1

      if (drone.ticksRechargeRestants === 0) {
        drone.autonomieRestante = 8
        ajouterAuJournal(`Drone #${drone.id} recharge terminée. Drone prêt.`, 'evenements')
      }

      continue
    }

    if (etat.positionLocale !== 'operations') {
      continue
    }

    if (!etat.exploration?.siteActif) {
      continue
    }

    if (drone.etat !== 'deploie') {
      continue
    }

    if (etat.vaisseau.soute >= etat.vaisseau.souteMax) {
      continue
    }

    if (drone.autonomieRestante <= 0) {
      drone.etat = 'embarque'
      drone.ticksRechargeRestants = 2

      ajouterAuJournal(
        `Drone #${drone.id} autonomie épuisée. Retour automatique au vaisseau pour recharge.`,
        'evenements',
      )

      continue
    }

    if (etat.exploration.siteActif.reserveRestante <= 0) {
      etat.exploration.siteActif = null
      ajouterAuJournal(
        'L’amas minier actif est épuisé. Les drones cessent leur extraction.',
        'evenements',
      )
      return
    }

    const mineraiTire = tirerMineraiDepuisComposition(etat.exploration.siteActif.composition)

    drone.autonomieRestante -= 1

    if (mineraiTire) {
      ajouterMineraiDansSoute(mineraiTire.id, 1)
      consommerReserveSite(1)
      ajouterAuJournal(`Drone #${drone.id} : +1 ${mineraiTire.nom}.`, 'evenements')
    }

    if (drone.autonomieRestante <= 0) {
      drone.etat = 'embarque'
      drone.ticksRechargeRestants = 2

      ajouterAuJournal(
        `Drone #${drone.id} autonomie épuisée. Retour automatique au vaisseau pour recharge.`,
        'evenements',
      )
    }
  }
}
