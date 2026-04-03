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
