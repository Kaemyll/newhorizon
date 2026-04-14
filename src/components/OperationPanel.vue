<script setup>
import { computed } from 'vue'
import { donneesMinerais } from '../game/dataMinerais'
import { recupererEtatCoque } from '../game/systemeCoque'
import {
    recupererEtatVisuelBandeau,
    recupererEtatVisuelCoque,
    recupererEtatVisuelRisque,
    recupererEtatVisuelScan,
} from '../game/systemeEtatsVisuels'

const props = defineProps({
    ressources: {
        type: Object,
        required: true,
    },
    vaisseau: {
        type: Object,
        required: true,
    },
    industrie: {
        type: Object,
        required: true,
    },
    navigation: {
        type: Object,
        required: true,
    },
    positionLocale: {
        type: String,
        required: true,
    },
    exploration: {
        type: Object,
        required: true,
    },
    assistance: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits([
    'miner',
    'aller-operations',
    'retour-station',
    'deployer-drones',
    'rappeler-drones',
    'scanner',
])

const infosCoque = computed(() =>
    recupererEtatCoque(props.vaisseau?.coque ?? 0, props.vaisseau?.coqueMax ?? 0),
)

const etatVisuelCoque = computed(() => recupererEtatVisuelCoque(infosCoque.value.code))

const coqueCritique = computed(() => infosCoque.value.code === 'critique')
const coqueHorsService = computed(() => infosCoque.value.code === 'hors_service')
const coqueOperationsVerrouillees = computed(
    () => coqueCritique.value || coqueHorsService.value,
)

const nbDeployes = computed(
    () => props.industrie.drones.filter((drone) => drone.etat === 'deploie').length,
)

const nbPrets = computed(
    () =>
        props.industrie.drones.filter(
            (drone) => drone.etat === 'embarque' && drone.ticksRechargeRestants === 0,
        ).length,
)

const nbEnRecharge = computed(
    () =>
        props.industrie.drones.filter(
            (drone) => drone.etat === 'embarque' && drone.ticksRechargeRestants > 0,
        ).length,
)

const badgeLocal = computed(() =>
    props.positionLocale === 'station'
        ? {
            icone: '⌂',
            titre: 'Amarré à la station',
            sousTitre: 'Services de station disponibles',
            classe: 'ops-local-badge-station',
        }
        : {
            icone: '✦',
            titre: 'Zone d’opérations',
            sousTitre: 'Extraction et scanner disponibles',
            classe: 'ops-local-badge-operations',
        },
)

const roleVaisseau = computed(() => props.vaisseau?.role || 'inconnu')

const estTransporteurMarchand = computed(() => roleVaisseau.value === 'transporteur_marchand')

const roleVaisseauLabel = computed(() => {
    if (roleVaisseau.value === 'mineur_leger') return 'Mineur léger'
    if (roleVaisseau.value === 'mineur_lourd') return 'Mineur lourd'
    if (roleVaisseau.value === 'mineur_renforce') return 'Mineur renforcé'
    if (roleVaisseau.value === 'transporteur_marchand') return 'Transporteur marchand'
    return 'Châssis polyvalent'
})

const doctrineOperationnelle = computed(() => {
    if (roleVaisseau.value === 'transporteur_marchand') {
        return 'Transport, fret et rotations commerciales'
    }

    if (roleVaisseau.value === 'mineur_lourd') {
        return 'Extraction prioritaire à haut rendement'
    }

    if (roleVaisseau.value === 'mineur_renforce') {
        return 'Exploitation en zones plus exigeantes'
    }

    return 'Prospection et exploitation locale'
})

const statutVol = computed(() =>
    props.navigation.enVoyage ? 'En transit inter-sectoriel' : 'Disponible localement',
)

const statutCanon = computed(() => {
    if ((props.vaisseau?.puissanceMiniere || 0) <= 0) return 'Aucun canon'
    if (props.navigation.enVoyage) return 'Indisponible'
    if (props.positionLocale !== 'operations') return 'Hors zone'
    if (coqueOperationsVerrouillees.value) return 'Verrouillé'
    return 'Prêt'
})

const rendementMinierLabel = computed(() => {
    const puissance = props.vaisseau?.puissanceMiniere || 0

    if (puissance >= 3) return '2 unités / action'
    if (puissance >= 2) return '1 à 2 unités / action'
    if (puissance >= 1) return '1 unité / action'
    return 'Aucun rendement'
})

const typeScannerLabel = computed(() => {
    const type = props.vaisseau?.scanner?.type || 'base'
    if (type === 'standard') return 'Module standard'
    if (type === 'avance') return 'Module avancé'
    return 'Module de base'
})

const etatVisuelScan = computed(() =>
    recupererEtatVisuelScan(props.exploration?.siteActif?.qualiteScan),
)

const etatVisuelRisque = computed(() =>
    recupererEtatVisuelRisque(
        props.exploration?.siteActif?.niveauRisque,
        props.exploration?.siteActif?.libelleRisque
            ? props.exploration.siteActif.libelleRisque.charAt(0).toUpperCase() +
            props.exploration.siteActif.libelleRisque.slice(1)
            : null,
    ),
)

const reserveSiteLabel = computed(() => {
    const site = props.exploration?.siteActif
    if (!site) return '—'
    return `${site.reserveRestante} / ${site.reserveTotale}`
})

const compositionSiteLabel = computed(() => {
    const site = props.exploration?.siteActif
    if (!site) return 'Aucun amas actif'

    if (!site.composition || site.composition.length === 0) {
        return 'Aucune signature exploitable'
    }

    return site.composition
        .map((c) => donneesMinerais.find((m) => m.id === c.idMinerai)?.abreviation || c.idMinerai)
        .join(', ')
})

const nomSiteLabel = computed(() => props.exploration?.siteActif?.nom || 'Aucun amas actif')

const typeAmasLabel = computed(() => {
    const typeAmas = props.exploration?.siteActif?.typeAmas

    if (typeAmas === 'sterile') return 'Amas pauvre'
    if (typeAmas === 'mono') return 'Amas simple'
    if (typeAmas === 'double') return 'Amas mixte'
    if (typeAmas === 'triple') return 'Amas dense'
    return '—'
})

const statutOperationnel = computed(() => {
    if (props.assistance.remorquageEnCours) {
        return {
            niveau: 'critique',
            titre: 'Remorquage en cours',
            texte: `Retour automatique vers ${props.assistance.stationCibleNom} dans ${props.assistance.ticksRestants} tick(s).`,
        }
    }

    if (coqueHorsService.value) {
        return {
            niveau: 'critique',
            titre: 'Châssis hors service',
            texte: 'Les opérations minières et le voyage sont suspendus jusqu’à réparation.',
        }
    }

    if (coqueCritique.value) {
        return {
            niveau: 'alerte',
            titre: 'Coque critique',
            texte: 'Les opérations minières sont verrouillées jusqu’à réparation du vaisseau.',
        }
    }

    if (props.navigation.enVoyage) {
        return {
            niveau: 'info',
            titre: 'Transit inter-sectoriel',
            texte: 'Les opérations locales sont indisponibles pendant le trajet.',
        }
    }

    if (props.positionLocale === 'station') {
        return {
            niveau: 'standard',
            titre: 'À quai',
            texte: 'Services de station disponibles. Quittez la station pour scanner et miner.',
        }
    }

    if (estTransporteurMarchand.value) {
        return {
            niveau: 'info',
            titre: 'Configuration marchande',
            texte: 'Ce châssis privilégie le fret et le commerce plutôt que le minage manuel.',
        }
    }

    if (props.vaisseau.soute >= props.vaisseau.souteMax) {
        return {
            niveau: 'alerte',
            titre: 'Soute pleine',
            texte: 'Extraction interrompue tant que la cargaison n’est pas déchargée.',
        }
    }

    if ((props.vaisseau?.puissanceMiniere || 0) <= 0) {
        return {
            niveau: 'info',
            titre: 'Vaisseau marchand',
            texte:
                'Ce châssis ne dispose pas de canon de minage. Privilégiez le transport et le commerce.',
        }
    }

    if (!props.exploration?.siteActif) {
        return {
            niveau: 'alerte',
            titre: 'Aucun amas actif',
            texte: 'Lancez un scan pour détecter un nouveau site exploitable.',
        }
    }

    return {
        niveau: 'succes',
        titre: 'Fenêtre d’exploitation ouverte',
        texte: 'Un amas actif est détecté. Le minage local peut reprendre.',
    }
})

const etatVisuelBandeau = computed(() =>
    recupererEtatVisuelBandeau(statutOperationnel.value.niveau),
)

const scannerDisponible = computed(
    () =>
        !estTransporteurMarchand.value &&
        !props.navigation.enVoyage &&
        props.positionLocale === 'operations' &&
        !props.assistance.remorquageEnCours &&
        !coqueOperationsVerrouillees.value,
)

const minageDisponible = computed(
    () =>
        !estTransporteurMarchand.value &&
        (props.vaisseau?.puissanceMiniere || 0) > 0 &&
        !props.navigation.enVoyage &&
        props.positionLocale === 'operations' &&
        !props.assistance.remorquageEnCours &&
        !coqueOperationsVerrouillees.value,
)

const deploiementDronesDisponible = computed(
    () =>
        !estTransporteurMarchand.value &&
        !props.navigation.enVoyage &&
        props.positionLocale === 'operations' &&
        !props.assistance.remorquageEnCours &&
        !coqueOperationsVerrouillees.value,
)

const rappelDronesDisponible = computed(
    () => !props.navigation.enVoyage && !props.assistance.remorquageEnCours && nbDeployes.value > 0,
)

const afficherActionsExploitation = computed(() => !estTransporteurMarchand.value)

const afficherActionsDrones = computed(() => !estTransporteurMarchand.value)

function decrireDrone(drone) {
    if (drone.etat === 'deploie') {
        return `Déployé — autonomie ${drone.autonomieRestante}/8`
    }

    if (drone.ticksRechargeRestants > 0) {
        return `Embarqué — recharge ${drone.ticksRechargeRestants} tick(s)`
    }

    return 'Embarqué — prêt'
}
</script>

<template>
    <section class="panel ops-panel ops-panel--enhanced ops-panel--scrollable">
        <div class="ops-header">
            <div>
                <h2>⌘ Opérations</h2>
                <p class="ops-subtitle">Console de bord locale du vaisseau</p>
            </div>

            <div class="ops-header-actions">
                <div class="ops-local-badge" :class="badgeLocal.classe">
                    <span class="ops-local-badge-icon">{{ badgeLocal.icone }}</span>
                    <div class="ops-local-badge-text">
                        <strong>{{ badgeLocal.titre }}</strong>
                        <span>{{ badgeLocal.sousTitre }}</span>
                    </div>
                </div>

                <button
                    v-if="positionLocale === 'station'"
                    class="ops-context-button action-button-with-icon"
                    :disabled="navigation.enVoyage || assistance.remorquageEnCours"
                    @click="emit('aller-operations')"
                >
                    <span class="button-icon" aria-hidden="true">🚀</span>
                    <span>Rejoindre la zone d’opérations</span>
                </button>

                <button
                    v-if="positionLocale === 'operations'"
                    class="ops-context-button action-button-with-icon"
                    :disabled="navigation.enVoyage || assistance.remorquageEnCours"
                    @click="emit('retour-station')"
                >
                    <span class="button-icon" aria-hidden="true">⌂</span>
                    <span>Retourner à la station</span>
                </button>
            </div>
        </div>

        <section class="ops-status-banner" :class="etatVisuelBandeau.classeBandeau">
            <div class="ops-status-banner-head">
                <span class="ops-status-dot"></span>
                <strong>{{ statutOperationnel.titre }}</strong>
            </div>
            <p>{{ statutOperationnel.texte }}</p>
        </section>

        <div class="ops-grid ops-grid--top">
            <section class="ops-block">
                <h3>Situation</h3>

                <div class="ops-metric-grid">
                    <div class="ops-metric-card">
                        <span class="ops-metric-label">Statut de vol</span>
                        <strong>{{ statutVol }}</strong>
                    </div>

                    <div class="ops-metric-card">
                        <span class="ops-metric-label">Soute</span>
                        <strong>{{ vaisseau.soute }} / {{ vaisseau.souteMax }}</strong>
                    </div>

                    <div class="ops-metric-card">
                        <span class="ops-metric-label">Carburant</span>
                        <strong>{{ ressources.carburant }} / {{ vaisseau.carburantMax }}</strong>
                    </div>

                    <div class="ops-metric-card">
                        <span class="ops-metric-label">Coque</span>
                        <strong>{{ vaisseau.coque }} / {{ vaisseau.coqueMax }}</strong>
                    </div>
                </div>
            </section>

            <section class="ops-block">
                <h3>Systèmes embarqués</h3>

                <div class="ops-system-list">
                    <div class="ops-system-item">
                        <span class="ops-system-name">Rôle</span>
                        <span class="ops-system-value">{{ roleVaisseauLabel }}</span>
                    </div>

                    <div class="ops-system-item ops-system-item--multiline">
                        <span class="ops-system-name">Doctrine</span>
                        <span class="ops-system-value">{{ doctrineOperationnelle }}</span>
                    </div>

                    <div class="ops-system-item">
                        <span class="ops-system-name">Canon de minage</span>
                        <span class="ops-system-value">{{ statutCanon }}</span>
                    </div>

                    <div class="ops-system-item">
                        <span class="ops-system-name">Puissance minière</span>
                        <span class="ops-system-value">{{ vaisseau.puissanceMiniere }}</span>
                    </div>

                    <div class="ops-system-item">
                        <span class="ops-system-name">Rendement manuel</span>
                        <span class="ops-system-value">{{ rendementMinierLabel }}</span>
                    </div>

                    <div class="ops-system-item">
                        <span class="ops-system-name">Scanner</span>
                        <span class="ops-system-value">{{ typeScannerLabel }}</span>
                    </div>

                    <div class="ops-system-item">
                        <span class="ops-system-name">Baie à drones</span>
                        <span class="ops-system-value">
              {{ industrie.drones.length }} / {{ vaisseau.dronesMiniersMax }}
            </span>
                    </div>

                    <div class="ops-system-item">
                        <span class="ops-system-name">État coque</span>
                        <span class="ops-system-value">{{ etatVisuelCoque.label }}</span>
                    </div>
                </div>
            </section>
        </div>

        <div class="ops-grid ops-grid--main">
            <section class="ops-block">
                <div class="ops-block-header">
                    <h3>Exploitation</h3>

                    <div v-if="exploration.siteActif" class="ops-header-badges">
            <span class="ops-badge-scan" :class="etatVisuelScan.classeBadge">
              {{ etatVisuelScan.label }}
            </span>

                        <span class="ops-badge-risk" :class="etatVisuelRisque.classeBadge">
              Risque {{ etatVisuelRisque.label }}
            </span>
                    </div>
                </div>

                <div class="ops-system-list">
                    <div class="ops-system-item">
                        <span class="ops-system-name">Amas actif</span>
                        <span class="ops-system-value">{{ nomSiteLabel }}</span>
                    </div>

                    <div class="ops-system-item">
                        <span class="ops-system-name">Type d’amas</span>
                        <span class="ops-system-value">{{ typeAmasLabel }}</span>
                    </div>

                    <div class="ops-system-item">
                        <span class="ops-system-name">Réserve</span>
                        <span class="ops-system-value">{{ reserveSiteLabel }}</span>
                    </div>

                    <div class="ops-system-item ops-system-item--multiline">
                        <span class="ops-system-name">Composition</span>
                        <span class="ops-system-value">{{ compositionSiteLabel }}</span>
                    </div>
                </div>

                <div v-if="afficherActionsExploitation" class="action-group action-group--inline">
                    <button
                        class="action-button-with-icon"
                        :disabled="!scannerDisponible"
                        @click="emit('scanner')"
                    >
                        <span class="button-icon" aria-hidden="true">⌘</span>
                        <span>Scanner un amas</span>
                    </button>

                    <button
                        class="action-button-with-icon"
                        :disabled="!minageDisponible"
                        @click="emit('miner')"
                    >
                        <span class="button-icon" aria-hidden="true">⛏</span>
                        <span>Miner manuellement</span>
                    </button>
                </div>

                <p v-else class="panel-note">
                    Ce châssis marchand n’est pas configuré pour la prospection ni l’extraction locale.
                </p>
            </section>

            <section class="ops-block">
                <div class="ops-block-header">
                    <h3>Drones</h3>
                    <span class="ops-drone-summary">
            {{ nbDeployes }} déployé(s) · {{ nbPrets }} prêt(s) · {{ nbEnRecharge }} en recharge
          </span>
                </div>

                <div class="ops-drone-counters">
                    <div class="ops-mini-counter">
                        <span class="ops-mini-counter-label">Déployés</span>
                        <strong>{{ nbDeployes }}</strong>
                    </div>
                    <div class="ops-mini-counter">
                        <span class="ops-mini-counter-label">Prêts</span>
                        <strong>{{ nbPrets }}</strong>
                    </div>
                    <div class="ops-mini-counter">
                        <span class="ops-mini-counter-label">Recharge</span>
                        <strong>{{ nbEnRecharge }}</strong>
                    </div>
                </div>

                <div v-if="afficherActionsDrones" class="action-group action-group--inline">
                    <button
                        class="action-button-with-icon"
                        :disabled="!deploiementDronesDisponible"
                        @click="emit('deployer-drones')"
                    >
                        <span class="button-icon" aria-hidden="true">⇪</span>
                        <span>Déployer les drones</span>
                    </button>

                    <button
                        class="action-button-with-icon"
                        :disabled="!rappelDronesDisponible"
                        @click="emit('rappeler-drones')"
                    >
                        <span class="button-icon" aria-hidden="true">⇩</span>
                        <span>Rappeler les drones</span>
                    </button>
                </div>

                <p v-else class="panel-note">
                    Le rôle principal de ce vaisseau est le fret. Les opérations minières locales ne sont pas
                    proposées.
                </p>

                <ul v-if="industrie.drones.length > 0" class="drone-status-list">
                    <li v-for="drone in industrie.drones" :key="drone.id">
                        <span class="drone-status-name">Drone #{{ drone.id }}</span>
                        <span class="drone-status-meta">{{ decrireDrone(drone) }}</span>
                    </li>
                </ul>

                <p v-else class="panel-note">Aucun drone embarqué pour le moment.</p>
            </section>
        </div>

        <p class="panel-note">
            <template v-if="estTransporteurMarchand">
                Ce transporteur marchand est optimisé pour le fret et les rotations commerciales entre
                stations.
            </template>
            <template v-else-if="coqueHorsService">
                Coque hors service : retour à la station et réparation impératifs.
            </template>
            <template v-else-if="coqueCritique">
                Coque critique : les opérations minières sont suspendues jusqu’à réparation.
            </template>
            <template v-else>
                Le scanner peut détecter des amas pauvres, simples, mixtes ou denses. La qualité du relevé
                influence la réserve estimée, la composition du site et son niveau de risque.
            </template>
        </p>
    </section>
</template>