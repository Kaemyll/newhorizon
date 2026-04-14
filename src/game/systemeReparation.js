import { recupererEtatJeu } from './etatJeu'
import { donneesSecteurs } from './dataSecteurs'
import { ajouterAuJournal } from './systemeMinage'
import { recupererVaisseauActif, synchroniserVaisseauActifDansEtat } from './systemeVaisseaux'

export const COUT_REPARATION_PAR_POINT = 15

function recupererSecteurCourant(etat) {
    return donneesSecteurs.find((secteur) => secteur.id === etat.secteurCourant?.id) || null
}

function recupererStationCourante(etat) {
    return recupererSecteurCourant(etat)?.stationPrincipale ?? null
}

export function calculerPointsCoqueManquants(vaisseau) {
    if (!vaisseau) {
        return 0
    }

    const coqueMax = Number(vaisseau.coqueMax) || 0
    const coque = Number(vaisseau.coque) || 0

    return Math.max(0, coqueMax - coque)
}

export function calculerCoutReparationVaisseau(vaisseau) {
    return calculerPointsCoqueManquants(vaisseau) * COUT_REPARATION_PAR_POINT
}

export function peutReparerVaisseauActif(etat = recupererEtatJeu()) {
    if (etat.navigation?.enVoyage) {
        return {
            ok: false,
            raison: 'Impossible de réparer un vaisseau pendant un trajet.',
        }
    }

    if (etat.positionLocale !== 'station') {
        return {
            ok: false,
            raison: 'Les réparations ne sont possibles qu’en station.',
        }
    }

    const station = recupererStationCourante(etat)

    if (!station?.services?.atelier) {
        return {
            ok: false,
            raison: 'Aucun atelier disponible dans cette station.',
        }
    }

    const vaisseauActif = recupererVaisseauActif(etat)

    if (!vaisseauActif) {
        return {
            ok: false,
            raison: 'Aucun vaisseau actif détecté.',
        }
    }

    const pointsManquants = calculerPointsCoqueManquants(vaisseauActif)

    if (pointsManquants <= 0) {
        return {
            ok: false,
            raison: 'La coque est déjà à son niveau maximal.',
        }
    }

    const coutReparation = calculerCoutReparationVaisseau(vaisseauActif)

    if ((etat.ressources?.credits || 0) < coutReparation) {
        return {
            ok: false,
            raison: 'Crédits insuffisants pour une réparation complète.',
        }
    }

    return {
        ok: true,
        raison: null,
        coutReparation,
        pointsManquants,
        vaisseauActif,
    }
}

export function reparerVaisseauActif() {
    const etat = recupererEtatJeu()
    const validation = peutReparerVaisseauActif(etat)

    if (!validation.ok) {
        ajouterAuJournal(validation.raison, 'commerce', 'alerte')
        return false
    }

    const { vaisseauActif, coutReparation, pointsManquants } = validation

    etat.ressources.credits -= coutReparation
    vaisseauActif.coque = vaisseauActif.coqueMax

    synchroniserVaisseauActifDansEtat(etat)

    ajouterAuJournal(
        `Réparation complète effectuée sur ${vaisseauActif.nom} : +${pointsManquants} coque pour ${coutReparation} crédits.`,
        'commerce',
        'succes',
    )

    return true
}