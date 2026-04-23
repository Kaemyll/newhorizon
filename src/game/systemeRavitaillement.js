import { recupererEtatJeu } from "./etatJeu";
import { donneesSecteurs } from "./dataSecteurs";
import { ajouterAuJournal } from "./systemeMinage";
import {
  recupererVaisseauActif,
  synchroniserVaisseauActifDansEtat,
} from "./systemeVaisseaux";

function recupererSecteurCourant() {
  const etat = recupererEtatJeu();

  return (
    donneesSecteurs.find((secteur) => secteur.id === etat.secteurCourant.id) ||
    null
  );
}

export function ravitaillerCarburant() {
  const etat = recupererEtatJeu();
  const vaisseauActif = recupererVaisseauActif(etat);

  if (!vaisseauActif) {
    ajouterAuJournal(
      "Aucun vaisseau actif disponible pour le ravitaillement.",
      "commerce",
      "alerte",
    );
    return;
  }

  if (etat.navigation?.enVoyage) {
    ajouterAuJournal(
      "Impossible de ravitailler le vaisseau pendant un trajet.",
      "commerce",
      "alerte",
    );
    return;
  }

  if (etat.positionLocale !== "station") {
    ajouterAuJournal(
      "Le ravitaillement n’est possible qu’à la station.",
      "commerce",
      "alerte",
    );
    return;
  }

  const secteurCourant = recupererSecteurCourant();
  const station = secteurCourant?.stationPrincipale;

  if (!station?.services?.ravitaillement) {
    ajouterAuJournal(
      "Aucun service de ravitaillement disponible dans cette station.",
      "commerce",
      "alerte",
    );
    return;
  }

  const carburantManquant =
    vaisseauActif.carburantMax - vaisseauActif.carburant;

  if (carburantManquant <= 0) {
    ajouterAuJournal(
      `Réservoir déjà plein à ${station.nom}.`,
      "commerce",
      "info",
    );
    return;
  }

  const prixParUnite = station.economie?.coutCarburantParUnite ?? 1;

  if (etat.ressources.credits <= 0) {
    ajouterAuJournal(
      "Crédits insuffisants pour procéder au ravitaillement.",
      "commerce",
      "alerte",
    );
    return;
  }

  const unitesAchetables = Math.min(
    carburantManquant,
    Math.floor(etat.ressources.credits / prixParUnite),
  );

  if (unitesAchetables <= 0) {
    ajouterAuJournal(
      "Crédits insuffisants pour procéder au ravitaillement.",
      "commerce",
      "alerte",
    );
    return;
  }

  const coutFinal = unitesAchetables * prixParUnite;

  etat.ressources.credits -= coutFinal;
  vaisseauActif.carburant += unitesAchetables;
  synchroniserVaisseauActifDansEtat(etat);

  if (unitesAchetables === carburantManquant) {
    ajouterAuJournal(
      `Ravitaillement terminé à ${station.nom} : +${unitesAchetables} carburant pour ${coutFinal} crédits.`,
      "commerce",
      "succes",
    );
    return;
  }

  ajouterAuJournal(
    `Ravitaillement partiel à ${station.nom} : +${unitesAchetables} carburant pour ${coutFinal} crédits.`,
    "commerce",
    "succes",
  );
}
