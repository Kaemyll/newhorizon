import { recupererEtatJeu } from './etatJeu'
import { donneesSecteurs } from './donneesSecteurs'
import { calculerTauxTaxePourSecurite } from './systemeCommerce'
import { ajouterAuJournal, rappelerDrones } from './systemeMinage'

export function verifierPanneSecheEtDeclencher() {
  const etat = recupererEtatJeu()

  if (etat.assistance?.remorquageEnCours) {
    return
  }

  if (etat.navigation?.enVoyage) {
    return
  }

  if (etat.positionLocale === 'station') {
    return
  }

  if (etat.ressources.carburant > 0) {
    return
  }

  const secteur = donneesSecteurs.find((s) => s.id === etat.secteurCourant.id)
  const stationNom = secteur?.stationPrincipale?.nom || 'station locale'

  rappelerDrones(true)

  etat.assistance.remorquageEnCours = true
  etat.assistance.ticksRestants = 4
  etat.assistance.stationCibleNom = stationNom

  ajouterAuJournal(
    'Panne sèche détectée hors station. Service de remorquage local déclenché.',
    'evenements',
  )
  ajouterAuJournal(`Remorquage estimé : 4 ticks jusqu’à ${stationNom}.`, 'evenements')
}

export function faireAvancerRemorquage() {
  const etat = recupererEtatJeu()

  if (!etat.assistance?.remorquageEnCours) {
    return
  }

  etat.assistance.ticksRestants -= 1

  if (etat.assistance.ticksRestants > 0) {
    return
  }

  const secteur = donneesSecteurs.find((s) => s.id === etat.secteurCourant.id)
  const station = secteur?.stationPrincipale
  const tauxTaxe = calculerTauxTaxePourSecurite(secteur?.securite ?? 1)
  const coutBase = etat.assistance.coutBase ?? 5
  const taxe = Math.floor(coutBase * tauxTaxe)
  const coutFinal = coutBase + taxe

  etat.ressources.credits -= coutFinal
  etat.positionLocale = 'station'
  etat.assistance.remorquageEnCours = false
  etat.assistance.ticksRestants = 0
  etat.assistance.stationCibleNom = null
  etat.exploration.siteActif = null

  ajouterAuJournal(`Remorquage terminé vers ${station?.nom || 'la station locale'}.`, 'commerce')
  ajouterAuJournal(
    `Frais de remorquage : ${coutBase} cr + ${taxe} cr de taxe = ${coutFinal} cr.`,
    'commerce',
  )
}
