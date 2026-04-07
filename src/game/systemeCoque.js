export const ETATS_COQUE = [
  {
    code: 'hors_service',
    label: 'Hors service',
    seuilMin: 0,
    seuilMax: 0,
  },
  {
    code: 'critique',
    label: 'Critique',
    seuilMin: 1,
    seuilMax: 39,
  },
  {
    code: 'degradee',
    label: 'Dégradée',
    seuilMin: 40,
    seuilMax: 74,
  },
  {
    code: 'nominale',
    label: 'Nominale',
    seuilMin: 75,
    seuilMax: 100,
  },
]

export function bornerValeur(valeur, minimum, maximum) {
  return Math.min(Math.max(valeur, minimum), maximum)
}

export function calculerPourcentageCoque(coqueActuelle, coqueMax) {
  const max = Number(coqueMax) || 0

  if (max <= 0) {
    return 0
  }

  const actuelleBornee = bornerValeur(Number(coqueActuelle) || 0, 0, max)
  return Math.round((actuelleBornee / max) * 100)
}

export function recupererEtatCoqueDepuisPourcentage(pourcentage) {
  const valeur = bornerValeur(Number(pourcentage) || 0, 0, 100)

  return (
    ETATS_COQUE.find((etat) => valeur >= etat.seuilMin && valeur <= etat.seuilMax) || ETATS_COQUE[0]
  )
}

export function recupererEtatCoque(coqueActuelle, coqueMax) {
  const pourcentage = calculerPourcentageCoque(coqueActuelle, coqueMax)
  const etat = recupererEtatCoqueDepuisPourcentage(pourcentage)

  return {
    ...etat,
    pourcentage,
  }
}

export function estCoqueCritique(coqueActuelle, coqueMax) {
  return recupererEtatCoque(coqueActuelle, coqueMax).code === 'critique'
}

export function estCoqueHorsService(coqueActuelle, coqueMax) {
  return recupererEtatCoque(coqueActuelle, coqueMax).code === 'hors_service'
}

export function appliquerDegatsCoqueSurVaisseau(vaisseau, quantite) {
  if (!vaisseau) {
    return {
      degatsAppliques: 0,
      coqueAvant: 0,
      coqueApres: 0,
      etatAvant: recupererEtatCoque(0, 0),
      etatApres: recupererEtatCoque(0, 0),
    }
  }

  const coqueMax = Number(vaisseau.coqueMax) || 0
  const coqueAvant = bornerValeur(Number(vaisseau.coque) || 0, 0, coqueMax)
  const etatAvant = recupererEtatCoque(coqueAvant, coqueMax)

  const degatsDemandes = Math.max(0, Math.floor(Number(quantite) || 0))
  const coqueApres = bornerValeur(coqueAvant - degatsDemandes, 0, coqueMax)
  const degatsAppliques = coqueAvant - coqueApres

  vaisseau.coque = coqueApres

  const etatApres = recupererEtatCoque(coqueApres, coqueMax)

  return {
    degatsAppliques,
    coqueAvant,
    coqueApres,
    etatAvant,
    etatApres,
  }
}
