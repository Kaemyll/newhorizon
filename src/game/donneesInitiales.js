import { donneesVaisseaux } from './dataVaisseaux'

export function creerEtatInitialJeu() {
  const vaisseauDepart = donneesVaisseaux.find((vaisseau) => vaisseau.id === 'hw_mule')

  return {
    meta: {
      version: '0.3.11',
      auteur: 'Kaemyll',
      annee: 2026,
    },

    ressources: {
      credits: 0,
      carburant: vaisseauDepart.carburantMax,
      minerais: {
        roche_carbonee: 0,
        poussiere_silicatee: 0,
        olivine: 0,
        pyroxene: 0,
        fer_nickel_brut: 0,
        cobalt_natif: 0,
      },
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
      coutDroneMinier: 20,
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
