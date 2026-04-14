import { recupererEtatJeu } from './etatJeu'
import { donneesMinerais } from './dataMinerais'
import { donneesSecteurs } from './dataSecteurs'
import { calculerPrixLigneBrut, calculerTauxTaxePourSecurite } from './systemeCommerce'
import { avancerTemps, recupererTickCourant } from './systemeTemps'
import { verifierPanneSecheEtDeclencher } from './systemeAssistance'
import {
  appliquerDegatsCoqueSurVaisseau,
  construireJournalTransitionEtatCoque,
} from './systemeCoque'
import {
  recupererInformationsCoqueVaisseau,
  recupererInformationsCoqueVaisseauActif,
  recupererVaisseauActif,
  synchroniserVaisseauActifDansEtat,
} from './systemeVaisseaux'

function obtenirHorodatageTick() {
  const tick = recupererTickCourant()
  return `[T${String(tick).padStart(4, '0')}]`
}

export function ajouterAuJournal(message, categorie = 'evenements', niveau = 'standard') {
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

function recupererEtatCoqueActif() {
  const etat = recupererEtatJeu()
  return recupererInformationsCoqueVaisseauActif(etat)
}

function coqueCritiqueOuHS() {
  const infos = recupererEtatCoqueActif()
  return infos.code === 'critique' || infos.code === 'hors_service'
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
    ajouterAuJournal(
        'Aucun amas minier actif. Lancez un nouveau scan pour reprendre l’extraction.',
        'evenements',
        'alerte',
    )
    return false
  }

  if (site.reserveRestante <= 0) {
    ajouterAuJournal(
        'L’amas minier actif est épuisé. Un nouveau scan est requis.',
        'evenements',
        'alerte',
    )
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
    ajouterAuJournal(
        `${site.nom} est épuisé. Nouveau scan requis pour détecter un autre amas.`,
        'evenements',
        'alerte',
    )
    etat.exploration.siteActif = null
  }
}

function obtenirRendementExtractionManuelle(puissanceMiniere = 1) {
  if (puissanceMiniere >= 3) return 2
  if (puissanceMiniere >= 2) return 1.5
  if (puissanceMiniere <= 0) return 0
  return 1
}

function determinerQuantiteExtractionManuelle(puissanceMiniere, reserveRestante, espaceDisponible) {
  const rendement = obtenirRendementExtractionManuelle(puissanceMiniere)

  if (rendement <= 0 || reserveRestante <= 0 || espaceDisponible <= 0) {
    return 0
  }

  const baseGarantie = Math.floor(rendement)
  const partieVariable = rendement - baseGarantie
  const bonus = Math.random() < partieVariable ? 1 : 0

  return Math.min(baseGarantie + bonus, reserveRestante, espaceDisponible)
}

function extraireDepuisSiteActif(quantiteDemandee) {
  const etat = recupererEtatJeu()
  const site = etat.exploration?.siteActif

  if (!site || quantiteDemandee <= 0) {
    return {}
  }

  const detailsExtraction = {}

  for (let index = 0; index < quantiteDemandee; index += 1) {
    if (!etat.exploration?.siteActif || etat.exploration.siteActif.reserveRestante <= 0) {
      break
    }

    const mineraiTire = tirerMineraiDepuisComposition(etat.exploration.siteActif.composition)

    if (!mineraiTire) {
      break
    }

    ajouterMineraiDansSoute(mineraiTire.id, 1)
    consommerReserveSite(1)

    if (!Object.prototype.hasOwnProperty.call(detailsExtraction, mineraiTire.id)) {
      detailsExtraction[mineraiTire.id] = {
        nom: mineraiTire.nom,
        quantite: 0,
      }
    }

    detailsExtraction[mineraiTire.id].quantite += 1
  }

  return detailsExtraction
}

function formaterDetailsExtraction(detailsExtraction) {
  const lignes = Object.values(detailsExtraction)

  if (lignes.length === 0) {
    return ''
  }

  return lignes.map((ligne) => `+${ligne.quantite} ${ligne.nom}`).join(', ')
}

function determinerIncidentDegatsDepuisRisque(niveauRisque) {
  if (niveauRisque <= 0) {
    return { degats: 0 }
  }

  if (niveauRisque === 1) {
    return { degats: Math.random() < 0.12 ? 1 : 0 }
  }

  if (niveauRisque === 2) {
    return { degats: Math.random() < 0.22 ? 1 : 0 }
  }

  if (Math.random() < 0.35) {
    return { degats: Math.random() < 0.35 ? 2 : 1 }
  }

  return { degats: 0 }
}

function resoudreNiveauJournalCoque(codeEtat) {
  if (codeEtat === 'hors_service') return 'critique'
  if (codeEtat === 'critique') return 'critique'
  return 'alerte'
}

function appliquerRisqueCoquePendantExploitation(source = 'manuelle') {
  const etat = recupererEtatJeu()
  const siteActif = etat.exploration?.siteActif

  if (!siteActif) {
    return
  }

  if (etat.navigation?.enVoyage || etat.positionLocale !== 'operations') {
    return
  }

  const niveauRisque = Number(siteActif.niveauRisque || 0)

  if (niveauRisque <= 0) {
    return
  }

  const vaisseauActif = recupererVaisseauActif(etat)

  if (!vaisseauActif) {
    return
  }

  const incident = determinerIncidentDegatsDepuisRisque(niveauRisque)

  if (incident.degats <= 0) {
    return
  }

  const resultat = appliquerDegatsCoqueSurVaisseau(vaisseauActif, incident.degats)

  if (resultat.degatsAppliques <= 0) {
    return
  }

  synchroniserVaisseauActifDansEtat(etat)

  const informationsCoque = recupererInformationsCoqueVaisseau(vaisseauActif)
  const niveauJournal = resoudreNiveauJournalCoque(informationsCoque.code)
  const prefixe =
      source === 'drones'
          ? `Exploitation drone risquée : la coque du ${vaisseauActif.nom}`
          : `Exploitation risquée : la coque du ${vaisseauActif.nom}`

  let message = `${prefixe} subit ${resultat.degatsAppliques} point(s) de dégâts sur ${siteActif.nom}.`

  if (resultat.etatAvant.code !== resultat.etatApres.code) {
    message += ` État coque : ${resultat.etatApres.label.toLowerCase()} (${informationsCoque.pourcentage}%).`
  }

  ajouterAuJournal(message, 'combat', niveauJournal)

  const transition = construireJournalTransitionEtatCoque(
      vaisseauActif.nom,
      resultat.etatAvant,
      resultat.etatApres,
      'degats',
  )

  if (transition) {
    ajouterAuJournal(transition.message, 'combat', transition.niveau)
  }
}

export function minerMineraiManuellement() {
  const etat = recupererEtatJeu()

  if (coqueCritiqueOuHS()) {
    const infosCoque = recupererEtatCoqueActif()
    ajouterAuJournal(
        `Coque ${infosCoque.label.toLowerCase()} : extraction manuelle verrouillée jusqu’à réparation.`,
        'evenements',
        infosCoque.code === 'hors_service' ? 'critique' : 'alerte',
    )
    return
  }

  if (etat.navigation?.enVoyage) {
    ajouterAuJournal('Impossible de miner pendant un trajet.', 'evenements', 'alerte')
    return
  }

  if (etat.assistance?.remorquageEnCours) {
    ajouterAuJournal('Impossible de miner pendant un remorquage.', 'evenements', 'alerte')
    return
  }

  if (etat.positionLocale !== 'operations') {
    ajouterAuJournal(
        'Le minage manuel n’est possible qu’en zone d’opérations.',
        'evenements',
        'alerte',
    )
    return
  }

  if (!verifierSiteActifExploitable()) {
    return
  }

  if (etat.vaisseau.soute >= etat.vaisseau.souteMax) {
    ajouterAuJournal(
        'Soute pleine : extraction impossible. Retour à la station ou vente requis.',
        'evenements',
        'alerte',
    )
    return
  }

  const puissanceMiniere = etat.vaisseau?.puissanceMiniere || 0

  if (puissanceMiniere <= 0) {
    ajouterAuJournal(
        'Ce vaisseau ne dispose pas de canon de minage opérationnel.',
        'evenements',
        'alerte',
    )
    return
  }

  avancerTemps(1)

  const reserveRestante = etat.exploration?.siteActif?.reserveRestante || 0
  const espaceDisponible = etat.vaisseau.souteMax - etat.vaisseau.soute

  const quantiteExtraite = determinerQuantiteExtractionManuelle(
      puissanceMiniere,
      reserveRestante,
      espaceDisponible,
  )

  if (quantiteExtraite <= 0) {
    faireTournerDrones()
    verifierPanneSecheEtDeclencher()

    ajouterAuJournal(
        'Extraction manuelle impossible dans les conditions actuelles.',
        'evenements',
        'alerte',
    )
    return
  }

  const detailsExtraction = extraireDepuisSiteActif(quantiteExtraite)
  const resumeExtraction = formaterDetailsExtraction(detailsExtraction)

  faireTournerDrones()
  verifierPanneSecheEtDeclencher()
  appliquerRisqueCoquePendantExploitation('manuelle')

  ajouterAuJournal(`Extraction manuelle : ${resumeExtraction}.`, 'evenements', 'succes')
}

export function vendreTousLesMinerais() {
  const etat = recupererEtatJeu()
  const secteurCourant = recupererSecteurCourantDepuisEtat()
  const station = secteurCourant?.stationPrincipale

  if (etat.navigation?.enVoyage) {
    ajouterAuJournal('Impossible de vendre la cargaison pendant un trajet.', 'commerce', 'alerte')
    return
  }

  if (etat.positionLocale !== 'station') {
    ajouterAuJournal('La vente n’est possible qu’à la station.', 'commerce', 'alerte')
    return
  }

  if (!station?.services?.commerce) {
    ajouterAuJournal(
        'Aucun service commercial disponible dans cette station.',
        'commerce',
        'alerte',
    )
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
    ajouterAuJournal('Aucun minerai à vendre.', 'commerce', 'info')
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
      'succes',
  )
}

export function acheterDroneMinier() {
  const etat = recupererEtatJeu()
  const cout = etat.economie.coutDroneMinier

  if (etat.navigation?.enVoyage) {
    ajouterAuJournal('Impossible d’acheter un drone pendant un trajet.', 'commerce', 'alerte')
    return
  }

  if (etat.positionLocale !== 'station') {
    ajouterAuJournal('L’achat d’un drone n’est possible qu’à la station.', 'commerce', 'alerte')
    return
  }

  if (etat.industrie.drones.length >= etat.vaisseau.dronesMiniersMax) {
    ajouterAuJournal('Capacité maximale de drones atteinte.', 'commerce', 'alerte')
    return
  }

  if (etat.ressources.credits < cout) {
    ajouterAuJournal('Crédits insuffisants pour acheter un drone minier.', 'commerce', 'alerte')
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

  ajouterAuJournal(`Drone minier #${nouveauDrone.id} acheté et embarqué.`, 'commerce', 'succes')
}

export function deployerDrones() {
  const etat = recupererEtatJeu()

  if (coqueCritiqueOuHS()) {
    const infosCoque = recupererEtatCoqueActif()
    ajouterAuJournal(
        `Coque ${infosCoque.label.toLowerCase()} : déploiement des drones interdit jusqu’à réparation.`,
        'evenements',
        infosCoque.code === 'hors_service' ? 'critique' : 'alerte',
    )
    return
  }

  if (etat.navigation?.enVoyage) {
    ajouterAuJournal('Impossible de déployer les drones pendant un trajet.', 'evenements', 'alerte')
    return
  }

  if (etat.assistance?.remorquageEnCours) {
    ajouterAuJournal(
        'Impossible de déployer les drones pendant un remorquage.',
        'evenements',
        'alerte',
    )
    return
  }

  if (etat.positionLocale !== 'operations') {
    ajouterAuJournal(
        'Les drones ne peuvent être déployés qu’en zone d’opérations.',
        'evenements',
        'alerte',
    )
    return
  }

  if (!verifierSiteActifExploitable()) {
    return
  }

  if (!etat.industrie?.drones?.length) {
    ajouterAuJournal('Aucun drone embarqué à déployer.', 'evenements', 'alerte')
    return
  }

  const dronesPrets = etat.industrie.drones.filter(
      (drone) => drone.etat === 'embarque' && drone.ticksRechargeRestants === 0,
  )

  if (dronesPrets.length === 0) {
    const dronesEnRecharge = etat.industrie.drones.filter(
        (drone) => drone.etat === 'embarque' && drone.ticksRechargeRestants > 0,
    ).length

    if (dronesEnRecharge > 0) {
      ajouterAuJournal(
          `Aucun drone prêt à être déployé. ${dronesEnRecharge} drone(s) encore en recharge.`,
          'evenements',
          'info',
      )
      return
    }

    ajouterAuJournal('Aucun drone prêt à être déployé.', 'evenements', 'alerte')
    return
  }

  for (const drone of dronesPrets) {
    drone.etat = 'deploie'
  }

  ajouterAuJournal(
      `${dronesPrets.length} drone(s) déployé(s) en zone d’opérations.`,
      'evenements',
      'succes',
  )
}

export function rappelerDrones(estAutomatique = false) {
  const etat = recupererEtatJeu()

  if (!etat.industrie?.drones?.length) {
    if (!estAutomatique) {
      ajouterAuJournal('Aucun drone à rappeler.', 'evenements', 'info')
    }
    return
  }

  const dronesDeployes = etat.industrie.drones.filter((drone) => drone.etat === 'deploie')

  if (dronesDeployes.length === 0) {
    if (!estAutomatique) {
      ajouterAuJournal('Aucun drone déployé à rappeler.', 'evenements', 'info')
    }
    return
  }

  for (const drone of dronesDeployes) {
    drone.etat = 'embarque'
  }

  ajouterAuJournal(
      estAutomatique
          ? `${dronesDeployes.length} drone(s) rappelé(s) automatiquement.`
          : `${dronesDeployes.length} drone(s) rappelé(s) au vaisseau.`,
      'evenements',
      'info',
  )
}

export function faireTournerDrones() {
  const etat = recupererEtatJeu()

  if (etat.navigation?.enVoyage) {
    return
  }

  if (!etat.industrie || !etat.industrie.drones) {
    return
  }

  if (coqueCritiqueOuHS()) {
    const dronesDeployes = etat.industrie.drones.filter((drone) => drone.etat === 'deploie')

    if (dronesDeployes.length > 0) {
      for (const drone of dronesDeployes) {
        drone.etat = 'embarque'
      }

      const infosCoque = recupererEtatCoqueActif()
      ajouterAuJournal(
          `Coque ${infosCoque.label.toLowerCase()} : ${dronesDeployes.length} drone(s) rappelé(s), exploitation suspendue.`,
          'evenements',
          infosCoque.code === 'hors_service' ? 'critique' : 'alerte',
      )
    }

    return
  }

  const dronesDeployes = etat.industrie.drones.filter((drone) => drone.etat === 'deploie')

  if (dronesDeployes.length > 0 && !etat.exploration?.siteActif) {
    for (const drone of dronesDeployes) {
      drone.etat = 'embarque'
    }

    ajouterAuJournal(
        `Aucun amas actif. ${dronesDeployes.length} drone(s) rappelé(s) automatiquement.`,
        'evenements',
        'alerte',
    )
    return
  }

  let dronesRecharges = 0
  let dronesRetourRecharge = 0
  let extractionInterrompueSoute = false
  let extractionDroneEffectuee = false

  for (const drone of etat.industrie.drones) {
    if (drone.etat === 'embarque' && drone.ticksRechargeRestants > 0) {
      drone.ticksRechargeRestants -= 1

      if (drone.ticksRechargeRestants === 0) {
        drone.autonomieRestante = 8
        dronesRecharges += 1
      }

      continue
    }

    if (etat.positionLocale !== 'operations') {
      continue
    }

    if (drone.etat !== 'deploie') {
      continue
    }

    if (etat.vaisseau.soute >= etat.vaisseau.souteMax) {
      extractionInterrompueSoute = true
      continue
    }

    if (drone.autonomieRestante <= 0) {
      drone.etat = 'embarque'
      drone.ticksRechargeRestants = 2
      dronesRetourRecharge += 1
      continue
    }

    if (!etat.exploration?.siteActif) {
      drone.etat = 'embarque'
      continue
    }

    if (etat.exploration.siteActif.reserveRestante <= 0) {
      const nbRappeles = etat.industrie.drones.filter((d) => d.etat === 'deploie').length

      etat.exploration.siteActif = null

      for (const d of etat.industrie.drones) {
        if (d.etat === 'deploie') {
          d.etat = 'embarque'
        }
      }

      ajouterAuJournal(
          `L’amas minier actif est épuisé. ${nbRappeles} drone(s) rappelé(s) automatiquement. Nouveau scan requis.`,
          'evenements',
          'alerte',
      )
      return
    }

    const mineraiTire = tirerMineraiDepuisComposition(etat.exploration.siteActif.composition)

    drone.autonomieRestante -= 1

    if (mineraiTire) {
      ajouterMineraiDansSoute(mineraiTire.id, 1)
      consommerReserveSite(1)
      extractionDroneEffectuee = true
      ajouterAuJournal(`Drone #${drone.id} : +1 ${mineraiTire.nom}.`, 'evenements', 'info')
    }

    if (!etat.exploration?.siteActif) {
      const nbRappeles = etat.industrie.drones.filter((d) => d.etat === 'deploie').length

      for (const d of etat.industrie.drones) {
        if (d.etat === 'deploie') {
          d.etat = 'embarque'
        }
      }

      ajouterAuJournal(
          `Amas épuisé. ${nbRappeles} drone(s) rappelé(s) automatiquement. Nouveau scan requis.`,
          'evenements',
          'alerte',
      )
      return
    }

    if (drone.autonomieRestante <= 0) {
      drone.etat = 'embarque'
      drone.ticksRechargeRestants = 2
      dronesRetourRecharge += 1
    }
  }

  if (extractionDroneEffectuee) {
    appliquerRisqueCoquePendantExploitation('drones')
  }

  if (dronesRecharges > 0) {
    ajouterAuJournal(
        `${dronesRecharges} drone(s) rechargé(s) et prêts à être redéployés.`,
        'evenements',
        'info',
    )
  }

  if (dronesRetourRecharge > 0) {
    ajouterAuJournal(
        `${dronesRetourRecharge} drone(s) reviennent en recharge automatique (2 ticks).`,
        'evenements',
        'info',
    )
  }

  if (extractionInterrompueSoute) {
    ajouterAuJournal('Extraction des drones interrompue : soute pleine.', 'evenements', 'alerte')
  }
}