import { recupererEtatJeu } from './etatJeu'
import { donneesMinerais } from './donneesMinerais'
import { donneesSecteurs } from './donneesSecteurs'
import { calculerPrixLigneBrut, calculerTauxTaxePourSecurite } from './systemeCommerce'

function obtenirHorodatageTick() {
  const etat = recupererEtatJeu()
  const tick = etat.technique?.compteurTicks ?? 0

  return `[T${String(tick).padStart(4, '0')}]`
}

export function ajouterAuJournal(message, categorie = 'evenements') {
  const etat = recupererEtatJeu()

  etat.journal.unshift({
    horodatage: obtenirHorodatageTick(),
    message,
    categorie,
  })

  if (etat.journal.length > 50) {
    etat.journal.pop()
  }
}

function recupererSecteurCourantDepuisEtat() {
  const etat = recupererEtatJeu()

  return donneesSecteurs.find((secteur) => secteur.id === etat.secteurCourant.id) || null
}

function tirerMineraiAleatoire() {
  const secteur = recupererSecteurCourantDepuisEtat()

  if (!secteur || !secteur.repartitionMinerais || secteur.repartitionMinerais.length === 0) {
    return null
  }

  const totalPoids = secteur.repartitionMinerais.reduce((total, entree) => total + entree.poids, 0)

  let tirage = Math.random() * totalPoids

  for (const entree of secteur.repartitionMinerais) {
    tirage -= entree.poids

    if (tirage <= 0) {
      return donneesMinerais.find((minerai) => minerai.id === entree.idMinerai) || null
    }
  }

  const derniereEntree = secteur.repartitionMinerais[secteur.repartitionMinerais.length - 1]

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

export function minerMineraiManuellement() {
  const etat = recupererEtatJeu()

  if (etat.navigation?.enVoyage) {
    ajouterAuJournal('Impossible de miner pendant un trajet.', 'evenements')
    return
  }

  if (etat.vaisseau.soute >= etat.vaisseau.souteMax) {
    ajouterAuJournal('Soute pleine. Impossible de miner.', 'evenements')
    return
  }

  const mineraiTire = tirerMineraiAleatoire()

  if (!mineraiTire) {
    ajouterAuJournal('Aucune ressource exploitable dans ce secteur.', 'evenements')
    return
  }

  ajouterMineraiDansSoute(mineraiTire.id, 1)
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

  if (etat.industrie.drones.length >= etat.vaisseau.dronesMiniersMax) {
    ajouterAuJournal('Capacité maximale de drones atteinte.', 'commerce')
    return
  }

  if (etat.ressources.credits < cout) {
    ajouterAuJournal('Crédits insuffisants pour acheter un drone minier.', 'commerce')
    return
  }

  const nouveauDrone = {
    id: etat.industrie.prochainDroneId,
    cyclesActifs: 0,
    cyclesMaintenanceRestants: 0,
    ticksDepuisExtraction: 0,
  }

  etat.ressources.credits -= cout
  etat.industrie.drones.push(nouveauDrone)
  etat.industrie.prochainDroneId += 1

  ajouterAuJournal(`Drone minier #${nouveauDrone.id} acheté et embarqué.`, 'commerce')
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
    if (etat.vaisseau.soute >= etat.vaisseau.souteMax) {
      return
    }

    if (drone.cyclesMaintenanceRestants > 0) {
      drone.cyclesMaintenanceRestants -= 1

      if (drone.cyclesMaintenanceRestants === 0) {
        ajouterAuJournal(
          `Drone #${drone.id} maintenance terminée. Reprise des opérations.`,
          'evenements',
        )
      }

      continue
    }

    drone.ticksDepuisExtraction += 1

    if (drone.ticksDepuisExtraction < 4) {
      continue
    }

    drone.ticksDepuisExtraction = 0

    const mineraiTire = tirerMineraiAleatoire()

    if (!mineraiTire) {
      continue
    }

    ajouterMineraiDansSoute(mineraiTire.id, 1)
    drone.cyclesActifs += 1

    ajouterAuJournal(`Drone #${drone.id} : +1 ${mineraiTire.nom}.`, 'evenements')

    if (drone.cyclesActifs >= 20) {
      drone.cyclesActifs = 0
      drone.cyclesMaintenanceRestants = 5
      ajouterAuJournal(
        `Drone #${drone.id} retour au vaisseau pour recharge des batteries (5 cycles).`,
        'evenements',
      )
    }
  }
}
