export const donneesSecteurs = [
  {
    id: 'ceinture_khepri',
    nom: 'Ceinture de Khepri',
    securite: 1.0,
    type: 'Ceinture minière',
    description: 'Ceinture minière sûre et banale, adaptée aux petits indépendants.',
    stationPrincipale: {
      id: 'hawking_exchange',
      nom: 'Hawking Exchange',
      type: 'Station commerciale orbitale',
      description:
        'Plateforme commerciale majeure du secteur, connue pour ses services fiables et ses taxes élevées.',
      services: {
        ravitaillement: true,
        commerce: true,
        atelier: true,
      },
      economie: {
        coutCarburantParUnite: 1,
        modificateursMinerais: {
          roche_carbonee: 0.75,
          poussiere_silicatee: 0.82,
          olivine: 0.9,
          pyroxene: 1.08,
          fer_nickel_brut: 1.2,
          cobalt_natif: 1.35,
        },
      },
    },
    repartitionMinerais: [
      { idMinerai: 'roche_carbonee', poids: 50 },
      { idMinerai: 'poussiere_silicatee', poids: 35 },
      { idMinerai: 'olivine', poids: 15 },
    ],
  },
  {
    id: 'anneau_demeter',
    nom: 'Anneau de Déméter',
    securite: 0.6,
    type: 'Anneau minier',
    description: 'Zone plus riche et plus rude, encore relativement fréquentée.',
    stationPrincipale: {
      id: 'demeter_prospect',
      nom: 'Demeter Prospect',
      type: 'Station industrielle orbitale',
      description:
        'Installation minière dense, spécialisée dans le transit de cargaisons et le ravitaillement.',
      services: {
        ravitaillement: true,
        commerce: true,
        atelier: false,
      },
      economie: {
        coutCarburantParUnite: 1,
        modificateursMinerais: {
          roche_carbonee: 0.7,
          poussiere_silicatee: 0.92,
          olivine: 1.05,
          pyroxene: 1.18,
          fer_nickel_brut: 1.08,
          cobalt_natif: 1.15,
        },
      },
    },
    repartitionMinerais: [
      { idMinerai: 'poussiere_silicatee', poids: 30 },
      { idMinerai: 'olivine', poids: 45 },
      { idMinerai: 'pyroxene', poids: 25 },
    ],
  },
  {
    id: 'banc_persephone',
    nom: 'Banc de Perséphone',
    securite: 0.3,
    type: 'Banc d’astéroïdes',
    description: 'Champ fragmenté, plus isolé, offrant des extraits plus intéressants.',
    stationPrincipale: {
      id: 'persephone_anchorage',
      nom: 'Persephone Anchorage',
      type: 'Mouillage orbital',
      description:
        'Mouillage excentré et rugueux, fréquenté par des opérateurs indépendants plus audacieux.',
      services: {
        ravitaillement: true,
        commerce: true,
        atelier: false,
      },
      economie: {
        coutCarburantParUnite: 1,
        modificateursMinerais: {
          roche_carbonee: 0.68,
          poussiere_silicatee: 0.8,
          olivine: 0.95,
          pyroxene: 1.12,
          fer_nickel_brut: 1.22,
          cobalt_natif: 1.18,
        },
      },
    },
    repartitionMinerais: [
      { idMinerai: 'olivine', poids: 20 },
      { idMinerai: 'pyroxene', poids: 45 },
      { idMinerai: 'fer_nickel_brut', poids: 35 },
    ],
  },
  {
    id: 'nuee_hecate',
    nom: 'Nuée d’Hécate',
    securite: 0.1,
    type: 'Nuée d’astéroïdes',
    description: 'Zone lointaine et peu sûre, réputée pour ses gisements rares.',
    stationPrincipale: {
      id: 'blackwake_terminal',
      nom: 'Blackwake Terminal',
      type: 'Terminal orbital avancé',
      description:
        'Terminal lointain au trafic plus âpre, où l’on échange des cargaisons rares sous forte spéculation.',
      services: {
        ravitaillement: true,
        commerce: true,
        atelier: false,
      },
      economie: {
        coutCarburantParUnite: 1,
        modificateursMinerais: {
          roche_carbonee: 0.6,
          poussiere_silicatee: 0.72,
          olivine: 0.84,
          pyroxene: 1.0,
          fer_nickel_brut: 1.15,
          cobalt_natif: 1.32,
        },
      },
    },
    repartitionMinerais: [
      { idMinerai: 'pyroxene', poids: 25 },
      { idMinerai: 'fer_nickel_brut', poids: 50 },
      { idMinerai: 'cobalt_natif', poids: 25 },
    ],
  },
]
