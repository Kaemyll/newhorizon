export function recupererEtatVisuelCoque(codeEtat = 'nominale') {
    if (codeEtat === 'hors_service') {
        return {
            code: 'hors_service',
            label: 'Hors service',
            classeBadge: 'ship-hull-badge ship-hull-badge--hors-service',
            classeBarre: 'ship-hull-badge--hors-service',
            classePanneau: 'ops-panel--hull-hors-service',
            niveauAlerte: 'critique',
        }
    }

    if (codeEtat === 'critique') {
        return {
            code: 'critique',
            label: 'Critique',
            classeBadge: 'ship-hull-badge ship-hull-badge--critique',
            classeBarre: 'ship-hull-badge--critique',
            classePanneau: 'ops-panel--hull-critique',
            niveauAlerte: 'alerte',
        }
    }

    if (codeEtat === 'degradee') {
        return {
            code: 'degradee',
            label: 'Dégradée',
            classeBadge: 'ship-hull-badge ship-hull-badge--degradee',
            classeBarre: 'ship-hull-badge--degradee',
            classePanneau: 'ops-panel--hull-degradee',
            niveauAlerte: 'alerte',
        }
    }

    return {
        code: 'nominale',
        label: 'Nominale',
        classeBadge: 'ship-hull-badge ship-hull-badge--nominale',
        classeBarre: 'ship-hull-badge--nominale',
        classePanneau: 'ops-panel--hull-nominale',
        niveauAlerte: 'succes',
    }
}

export function recupererEtatVisuelRisque(niveauRisque = 0, libelleRisque = null) {
    const niveau = Number(niveauRisque || 0)

    if (niveau <= 0) {
        return {
            niveau: 0,
            label: libelleRisque || 'Négligeable',
            classeBadge: 'ops-badge-risk-negligeable',
            niveauAlerte: 'standard',
            variante: 'standard',
        }
    }

    if (niveau === 1) {
        return {
            niveau: 1,
            label: libelleRisque || 'Faible',
            classeBadge: 'ops-badge-risk-faible',
            niveauAlerte: 'info',
            variante: 'info',
        }
    }

    if (niveau === 2) {
        return {
            niveau: 2,
            label: libelleRisque || 'Modéré',
            classeBadge: 'ops-badge-risk-modere',
            niveauAlerte: 'alerte',
            variante: 'warning',
        }
    }

    return {
        niveau: 3,
        label: libelleRisque || 'Élevé',
        classeBadge: 'ops-badge-risk-eleve',
        niveauAlerte: 'critique',
        variante: 'danger',
    }
}

export function recupererEtatVisuelScan(qualiteScan = null) {
    if (qualiteScan === 'bonne') {
        return {
            label: 'Bonne',
            classeBadge: 'ops-badge-scan-bonne',
            niveauAlerte: 'succes',
            variante: 'success',
        }
    }

    if (qualiteScan === 'moyenne') {
        return {
            label: 'Moyenne',
            classeBadge: 'ops-badge-scan-moyenne',
            niveauAlerte: 'info',
            variante: 'info',
        }
    }

    if (qualiteScan === 'faible') {
        return {
            label: 'Faible',
            classeBadge: 'ops-badge-scan-faible',
            niveauAlerte: 'alerte',
            variante: 'warning',
        }
    }

    return {
        label: '—',
        classeBadge: 'ops-badge-scan-neutre',
        niveauAlerte: 'standard',
        variante: 'standard',
    }
}

export function recupererEtatVisuelBandeau(niveau = 'standard') {
    if (niveau === 'critique') {
        return {
            niveau: 'critique',
            classeBandeau: 'ops-status-critical',
        }
    }

    if (niveau === 'alerte') {
        return {
            niveau: 'alerte',
            classeBandeau: 'ops-status-warning',
        }
    }

    if (niveau === 'succes') {
        return {
            niveau: 'succes',
            classeBandeau: 'ops-status-success',
        }
    }

    if (niveau === 'info') {
        return {
            niveau: 'info',
            classeBandeau: 'ops-status-info',
        }
    }

    return {
        niveau: 'standard',
        classeBandeau: 'ops-status-standard',
    }
}

function creerBadgeOperation(id, label, variante = 'standard') {
    return {
        id,
        label,
        classe: `ops-phase-badge ops-phase-badge--${variante}`,
    }
}

export function recupererBadgesOperationnels({
                                                 positionLocale = 'station',
                                                 enVoyage = false,
                                                 remorquageEnCours = false,
                                                 siteActif = null,
                                                 niveauRisque = 0,
                                                 libelleRisque = null,
                                                 nbDeployes = 0,
                                                 coqueCode = 'nominale',
                                                 estTransporteurMarchand = false,
                                             } = {}) {
    const badges = []

    if (remorquageEnCours) {
        badges.push(creerBadgeOperation('phase-remorquage', 'Remorquage', 'danger'))
    } else if (enVoyage) {
        badges.push(creerBadgeOperation('phase-transit', 'Transit', 'info'))
    } else if (positionLocale === 'station') {
        badges.push(creerBadgeOperation('phase-station', 'En station', 'standard'))
    } else {
        badges.push(creerBadgeOperation('phase-operations', 'Zone d’opérations', 'warning'))
    }

    if (coqueCode === 'hors_service') {
        badges.push(creerBadgeOperation('etat-coque', 'Coque hors service', 'danger'))
    } else if (coqueCode === 'critique') {
        badges.push(creerBadgeOperation('etat-coque', 'Maintenance requise', 'warning'))
    } else if (positionLocale === 'operations' && !enVoyage && !remorquageEnCours) {
        if (estTransporteurMarchand) {
            badges.push(creerBadgeOperation('phase-role', 'Fret local', 'info'))
        } else if (siteActif) {
            badges.push(creerBadgeOperation('phase-action', 'Extraction prête', 'success'))
        } else {
            badges.push(creerBadgeOperation('phase-action', 'Prospection', 'info'))
        }
    }

    if (positionLocale === 'operations' && siteActif) {
        const risque = recupererEtatVisuelRisque(niveauRisque, libelleRisque)
        badges.push(
            creerBadgeOperation(
                'niveau-risque',
                `Risque ${risque.label}`,
                risque.variante || 'standard',
            ),
        )
    }

    if (nbDeployes > 0) {
        badges.push(
            creerBadgeOperation(
                'drones',
                nbDeployes > 1 ? `${nbDeployes} drones déployés` : 'Drone déployé',
                'info',
            ),
        )
    }

    return badges.slice(0, 4)
}