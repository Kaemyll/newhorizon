import { recupererEtatJeu } from "./etatJeu";
import { ajouterAuJournal, rappelerDrones } from "./systemeMinage";
import { avancerTemps } from "./systemeTemps";
import { verifierPanneSecheEtDeclencher } from "./systemeAssistance";
import {
  recupererVaisseauActif,
  synchroniserVaisseauActifDansEtat,
} from "./systemeVaisseaux";

const COUT_CARBURANT_LOCAL = 1;
const COUT_TICKS_LOCAL = 1;

export function allerEnZoneOperations() {
  const etat = recupererEtatJeu();
  const vaisseauActif = recupererVaisseauActif(etat);

  if (!vaisseauActif) {
    ajouterAuJournal(
      "Aucun vaisseau actif disponible.",
      "evenements",
      "alerte",
    );
    return;
  }

  if (etat.navigation?.enVoyage) {
    ajouterAuJournal(
      "Impossible de quitter la station pendant un trajet inter-sectoriel.",
      "evenements",
      "alerte",
    );
    return;
  }

  if (etat.assistance?.remorquageEnCours) {
    ajouterAuJournal(
      "Impossible de quitter la station pendant un remorquage.",
      "evenements",
      "alerte",
    );
    return;
  }

  if (etat.positionLocale === "operations") {
    ajouterAuJournal(
      "Le vaisseau est déjà en zone d’opérations.",
      "evenements",
      "alerte",
    );
    return;
  }

  if (vaisseauActif.carburant < COUT_CARBURANT_LOCAL) {
    ajouterAuJournal(
      "Carburant insuffisant pour rejoindre la zone d’opérations.",
      "evenements",
      "alerte",
    );
    return;
  }

  vaisseauActif.carburant -= COUT_CARBURANT_LOCAL;
  synchroniserVaisseauActifDansEtat(etat);

  avancerTemps(COUT_TICKS_LOCAL);
  etat.positionLocale = "operations";

  verifierPanneSecheEtDeclencher();

  if (!etat.assistance.remorquageEnCours) {
    ajouterAuJournal(
      "Décollage de la station vers la zone d’opérations locale.",
      "evenements",
      "info",
    );
  }
}

export function retourALaStation() {
  const etat = recupererEtatJeu();
  const vaisseauActif = recupererVaisseauActif(etat);

  if (!vaisseauActif) {
    ajouterAuJournal(
      "Aucun vaisseau actif disponible.",
      "evenements",
      "alerte",
    );
    return;
  }

  if (etat.navigation?.enVoyage) {
    ajouterAuJournal(
      "Impossible de retourner à la station pendant un trajet inter-sectoriel.",
      "evenements",
      "alerte",
    );
    return;
  }

  if (etat.assistance?.remorquageEnCours) {
    ajouterAuJournal("Remorquage déjà en cours.", "evenements", "alerte");
    return;
  }

  if (etat.positionLocale === "station") {
    ajouterAuJournal(
      "Le vaisseau est déjà amarré à la station.",
      "evenements",
      "alerte",
    );
    return;
  }

  if (vaisseauActif.carburant < COUT_CARBURANT_LOCAL) {
    vaisseauActif.carburant = 0;
    synchroniserVaisseauActifDansEtat(etat);
    verifierPanneSecheEtDeclencher();
    return;
  }

  rappelerDrones(true);

  vaisseauActif.carburant -= COUT_CARBURANT_LOCAL;
  synchroniserVaisseauActifDansEtat(etat);

  avancerTemps(COUT_TICKS_LOCAL);
  etat.positionLocale = "station";

  ajouterAuJournal(
    "Retour à la station locale et procédure d’amarrage terminée.",
    "evenements",
    "info",
  );
}
