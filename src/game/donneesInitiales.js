import { donneesVaisseaux } from "./dataVaisseaux";
import { donneesMinerais } from "./dataMinerais";

function creerStockMineraisInitial() {
  return Object.fromEntries(donneesMinerais.map((minerai) => [minerai.id, 0]));
}

function creerInstanceVaisseauDepuisModele(modele) {
  return {
    id: `${modele.id}_001`,
    modeleId: modele.id,
    nom: modele.nom,
    constructeur: modele.constructeur,
    role: modele.role,
    coque: modele.coqueMax,
    coqueMax: modele.coqueMax,
    soute: 0,
    souteMax: modele.souteMax,
    puissanceMiniere: modele.puissanceMiniere,
    dronesMiniersMax: modele.dronesMiniersMax,
    carburant: modele.carburantMax,
    carburantMax: modele.carburantMax,
    assuranceNiveau: "aucune",
    assuranceSouscriptionTick: 0,
    assuranceExpirationTick: 0,
    scanner: structuredClone(modele.scanner || {}),
    ameliorations: structuredClone(modele.ameliorations || []),
    ameliorationsMax: structuredClone(modele.ameliorationsMax || {}),
  };
}

export function creerEtatInitialJeu() {
  const modeleDepart = donneesVaisseaux.find(
    (vaisseau) => vaisseau.id === "hw_mule",
  );
  const vaisseauDepart = creerInstanceVaisseauDepuisModele(modeleDepart);

  return {
    meta: {
      version: "0.3.15",
      auteur: "Kaemyll",
      annee: 2026,
    },

    joueur: {
      identite: "Sans indicatif",
      reputation: "I — Neutre",
    },

    ressources: {
      credits: 100,
      minerais: creerStockMineraisInitial(),
      cargaisonMarchande: {},
    },

    vaisseauxPossedes: [vaisseauDepart],
    vaisseauActifId: vaisseauDepart.id,

    vaisseau: {
      id: vaisseauDepart.id,
      modeleId: vaisseauDepart.modeleId,
      nom: vaisseauDepart.nom,
      constructeur: vaisseauDepart.constructeur,
      role: vaisseauDepart.role,
      coque: vaisseauDepart.coque,
      coqueMax: vaisseauDepart.coqueMax,
      soute: vaisseauDepart.soute,
      souteMax: vaisseauDepart.souteMax,
      puissanceMiniere: vaisseauDepart.puissanceMiniere,
      dronesMiniersMax: vaisseauDepart.dronesMiniersMax,
      carburant: vaisseauDepart.carburant,
      carburantMax: vaisseauDepart.carburantMax,
      assuranceNiveau: vaisseauDepart.assuranceNiveau,
      assuranceSouscriptionTick: vaisseauDepart.assuranceSouscriptionTick,
      assuranceExpirationTick: vaisseauDepart.assuranceExpirationTick,
      scanner: structuredClone(vaisseauDepart.scanner || {}),
      ameliorations: structuredClone(vaisseauDepart.ameliorations || []),
      ameliorationsMax: structuredClone(vaisseauDepart.ameliorationsMax || {}),
    },

    industrie: {
      drones: [],
      prochainDroneId: 1,
    },

    secteurCourant: {
      id: "ceinture_khepri",
    },

    positionLocale: "station",

    navigation: {
      enVoyage: false,
      destinationSelectionneeId: "anneau_demeter",
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
        horodatage: "[T0000]",
        message: "Système initialisé.",
        categorie: "evenements",
      },
      {
        horodatage: "[T0000]",
        message: "Vaisseau prêt au départ, amarré à la station locale.",
        categorie: "evenements",
      },
    ],

    statistiques: {
      totalMineraiExtrait: 0,
      totalCreditsGagnes: 0,
    },

    technique: {
      compteurTicks: 0,
    },
  };
}
