import { donneesVaisseaux } from './dataVaisseaux'
import { donneesMinerais } from './dataMinerais'

function creerStockMineraisInitial() {
  return Object.fromEntries(donneesMinerais.map((minerai) => [minerai.id, 0]))
}

export function creerEtatInitialJeu() {
  const vaisseauDepart = donneesVaisseaux.find((vaisseau) => vaisseau.id === 'hw_mule')

  return {
    meta: {
      version: '0.3.12',
      auteur: 'Kaemyll',
      annee: 2026,
    },

    ressources: {
      credits: 0,
      carburant: vaisseauDepart.carburantMax,
      minerais: creerStockMineraisInitial(),
    },

    vaisseau: {
      id: vaisseauDepart.id,
      nom: vaisseauDepart.nom,
      constructeur: vaisseauDepart.constructeur,
      coque: vaisseauDepart.coqueMax,
      coqueMax: vaisseauDepart.coqueMax,
      soute: 0,
      souteMax: vaisseauDepart.souteMax,
      puissanceMiniere: vaisseauDepart.puissanceMiniere,
      dronesMiniersMax: vaisseauDepart.dronesMiniersMax,
      carburantMax: vaisseauDepart.carburantMax,
    },

    industrie: {
      drones: [],
      prochainDroneId: 1,
    },

    secteurCourant: {
      id: 'ceinture_khepri',
    },

    positionLocale: 'station',

    navigation: {
      enVoyage: false,
      destinationSelectionneeId: 'anneau_demeter',
      secteurDestinationId: null,
      ticksRestants: 0,
    },

    economie: {
      coutDroneMinier: 400,
    },

    exploration: {
      siteActif: null,
      prochainSiteId: 1,
    },

    assistance: {
      remorquageEnCours: false,
      ticksRestants: 0,
      coutBase: 5,
      stationCibleNom: null,
    },

    journal: [
      {
        horodatage: '[T0000]',
        message: 'Système initialisé.',
        categorie: 'evenements',
      },
      {
        horodatage: '[T0000]',
        message: 'Vaisseau prêt au départ, amarré à la station locale.',
        categorie: 'evenements',
      },
    ],

    statistiques: {
      totalMineraiExtrait: 0,
      totalCreditsGagnes: 0,
    },

    technique: {
      compteurTicks: 0,
    },
  }
}
