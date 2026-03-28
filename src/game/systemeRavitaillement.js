import { recupererEtatJeu } from './etatJeu'
import { donneesSecteurs } from './donneesSecteurs'
import { ajouterAuJournal } from './systemeMinage'

function recupererSecteurCourant() {
  const etat = recupererEtatJeu()

  return donneesSecteurs.find((secteur) => secteur.id === etat.secteurCourant.id) || null
}

export function ravitaillerCarburant() {
  const etat = recupererEtatJeu()

  if (etat.navigation?.enVoyage) {
    ajouterAuJournal('Impossible de ravitailler le vaisseau pendant un trajet.', 'commerce')
    return
  }

  if (etat.positionLocale !== 'station') {
    ajouterAuJournal('Le ravitaillement n’est possible qu’à la station.', 'commerce')
    return
  }

  const secteurCourant = recupererSecteurCourant()
  const station = secteurCourant?.stationPrincipale

  if (!station?.services?.ravitaillement) {
    ajouterAuJournal('Aucun service de ravitaillement disponible dans cette station.', 'commerce')
    return
  }

  const carburantManquant = etat.vaisseau.carburantMax - etat.ressources.carburant

  if (carburantManquant <= 0) {
    ajouterAuJournal(`Réservoir déjà plein à ${station.nom}.`, 'commerce')
    return
  }

  const prixParUnite = station.economie?.coutCarburantParUnite ?? 1

  if (etat.ressources.credits <= 0) {
    ajouterAuJournal('Crédits insuffisants pour procéder au ravitaillement.', 'commerce')
    return
  }

  const unitesAchetables = Math.min(
    carburantManquant,
    Math.floor(etat.ressources.credits / prixParUnite),
  )

  if (unitesAchetables <= 0) {
    ajouterAuJournal('Crédits insuffisants pour procéder au ravitaillement.', 'commerce')
    return
  }

  const coutFinal = unitesAchetables * prixParUnite

  etat.ressources.credits -= coutFinal
  etat.ressources.carburant += unitesAchetables

  if (unitesAchetables === carburantManquant) {
    ajouterAuJournal(
      `Ravitaillement terminé à ${station.nom} : +${unitesAchetables} carburant pour ${coutFinal} crédits.`,
      'commerce',
    )
    return
  }

  ajouterAuJournal(
    `Ravitaillement partiel à ${station.nom} : +${unitesAchetables} carburant pour ${coutFinal} crédits.`,
    'commerce',
  )
}
