export function recupererEtatVisuelCoque(codeEtat = 'nominale') {
    if (codeEtat === 'hors_service') {
        return {
            code: 'hors_service',
            label: 'Hors service',
            classeBadge: 'ship-hull-badge ship-hull-badge--hors-service',
            classeBarre: 'ship-hull-badge--hors-service',
            niveauAlerte: 'critique',
        }
    }

    if (codeEtat === 'critique') {
        return {
            code: 'critique',
            label: 'Critique',
            classeBadge: 'ship-hull-badge ship-hull-badge--critique',
            classeBarre: 'ship-hull-badge--critique',
            niveauAlerte: 'alerte',
        }
    }

    if (codeEtat === 'degradee') {
        return {
            code: 'degradee',
            label: 'Dégradée',
            classeBadge: 'ship-hull-badge ship-hull-badge--degradee',
            classeBarre: 'ship-hull-badge--degradee',
            niveauAlerte: 'alerte',
        }
    }

    return {
        code: 'nominale',
        label: 'Nominale',
        classeBadge: 'ship-hull-badge ship-hull-badge--nominale',
        classeBarre: 'ship-hull-badge--nominale',
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
        }
    }

    if (niveau === 1) {
        return {
            niveau: 1,
            label: libelleRisque || 'Faible',
            classeBadge: 'ops-badge-risk-faible',
            niveauAlerte: 'info',
        }
    }

    if (niveau === 2) {
        return {
            niveau: 2,
            label: libelleRisque || 'Modéré',
            classeBadge: 'ops-badge-risk-modere',
            niveauAlerte: 'alerte',
        }
    }

    return {
        niveau: 3,
        label: libelleRisque || 'Élevé',
        classeBadge: 'ops-badge-risk-eleve',
        niveauAlerte: 'critique',
    }
}

export function recupererEtatVisuelScan(qualiteScan = null) {
    if (qualiteScan === 'bonne') {
        return {
            label: 'Bonne',
            classeBadge: 'ops-badge-scan-bonne',
            niveauAlerte: 'succes',
        }
    }

    if (qualiteScan === 'moyenne') {
        return {
            label: 'Moyenne',
            classeBadge: 'ops-badge-scan-moyenne',
            niveauAlerte: 'info',
        }
    }

    if (qualiteScan === 'faible') {
        return {
            label: 'Faible',
            classeBadge: 'ops-badge-scan-faible',
            niveauAlerte: 'alerte',
        }
    }

    return {
        label: '—',
        classeBadge: 'ops-badge-scan-neutre',
        niveauAlerte: 'standard',
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