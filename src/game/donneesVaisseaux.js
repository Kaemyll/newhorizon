export const donneesVaisseaux = [
  {
    id: 'hw_mule',
    nom: 'HW Mule',
    constructeur: 'Hardspan Works',
    coqueMax: 100,
    souteMax: 20,
    puissanceMiniere: 1,
    dronesMiniersMax: 2,
    carburantMax: 10,
    description:
      'Petit vaisseau industriel d’entrée de gamme, conçu pour l’extraction légère et le transport local.',
    ameliorationsMax: {
      souteMax: 25,
      dronesMiniersMax: 3,
      carburantMax: 14,
      puissanceMiniere: 2,
    },
    ameliorations: {
      soute: {
        id: 'soute',
        nom: 'Extension de soute',
        description: 'Ajoute du volume de stockage à la soute principale.',
        cout: 25,
        increment: 5,
        valeurMax: 25,
      },
      drones: {
        id: 'drones',
        nom: 'Baie à drones renforcée',
        description: 'Permet d’embarquer un drone minier supplémentaire.',
        cout: 35,
        increment: 1,
        valeurMax: 3,
      },
      carburant: {
        id: 'carburant',
        nom: 'Réservoir auxiliaire',
        description: 'Augmente la capacité maximale de carburant du vaisseau.',
        cout: 20,
        increment: 2,
        valeurMax: 14,
      },
      extraction: {
        id: 'extraction',
        nom: 'Tête d’extraction améliorée',
        description: 'Renforce la puissance du système minier principal.',
        cout: 40,
        increment: 1,
        valeurMax: 2,
      },
    },
  },
]
