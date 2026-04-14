<script setup>
import { computed } from 'vue'
import { donneesSecteurs } from '../game/dataSecteurs'
import {
    calculerCoursLocauxPourStation,
    calculerTauxTaxePourSecurite,
    construireResumeMarcheStation,
    formaterPourcentageTaxe,
} from '../game/systemeCommerce'
import {
    calculerCoutReparationPartielleVaisseau,
    calculerCoutReparationVaisseau,
    calculerPointsCoqueManquants,
    calculerPointsReparationPartielle,
    COUT_REPARATION_PAR_POINT,
} from '../game/systemeReparation'

const props = defineProps({
    secteurCourant: {
        type: Object,
        required: true,
    },
    vaisseau: {
        type: Object,
        required: true,
    },
    ressources: {
        type: Object,
        required: true,
    },
    sousModeStation: {
        type: String,
        required: true,
    },
    positionLocale: {
        type: String,
        required: true,
    },
    economie: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits([
    'changer-sous-mode-station',
    'vendre',
    'vendre-bien',
    'acheter-bien',
    'ravitailler',
    'acheter-drone',
    'reparer-vaisseau',
    'reparer-partiellement-vaisseau',
    'aller-operations',
    'retour-station',
])

const secteur = computed(() =>
    donneesSecteurs.find((entree) => entree.id === props.secteurCourant.id),
)

const station = computed(() => secteur.value?.stationPrincipale ?? null)

const carburantManquant = computed(() => props.vaisseau.carburantMax - props.ressources.carburant)

const coutCarburantUnitaire = computed(() => station.value?.economie?.coutCarburantParUnite ?? 1)

const coutRavitaillementComplet = computed(() => {
    return Math.max(0, carburantManquant.value) * coutCarburantUnitaire.value
})

const tauxTaxe = computed(() => calculerTauxTaxePourSecurite(secteur.value?.securite ?? 1))

const taxeLocalePourcent = computed(() => formaterPourcentageTaxe(tauxTaxe.value))

const coursLocaux = computed(() =>
    calculerCoursLocauxPourStation(station.value, props.ressources.minerais || {}),
)

const resumeMarche = computed(() => construireResumeMarcheStation(station.value))

const souteRestante = computed(() => props.vaisseau.souteMax - props.vaisseau.soute)

const profilMarcheLabel = computed(() => {
    const typeStation = station.value?.type || ''

    if (typeStation.includes('commerciale')) return 'Hub commercial généraliste'
    if (typeStation.includes('industrielle')) return 'Marché industriel de transit'
    if (typeStation.includes('chantier')) return 'Débouché métallurgique et logistique'
    if (typeStation.includes('mouillage')) return 'Marché frontalier brut'
    if (typeStation.includes('port_franc')) return 'Port spéculatif périphérique'
    if (typeStation.includes('terminal')) return 'Point d’appui avancé'
    return 'Marché local'
})

const coutDroneMinier = computed(() => props.economie?.coutDroneMinier ?? 400)

const pointsCoqueManquants = computed(() => calculerPointsCoqueManquants(props.vaisseau))
const pointsReparationPartielle = computed(() => calculerPointsReparationPartielle(props.vaisseau))

const coutReparation = computed(() => calculerCoutReparationVaisseau(props.vaisseau))
const coutReparationPartielle = computed(() =>
    calculerCoutReparationPartielleVaisseau(props.vaisseau),
)

const reparationNecessaire = computed(() => pointsCoqueManquants.value > 0)

const reparationAbordable = computed(
    () => reparationNecessaire.value && (props.ressources?.credits || 0) >= coutReparation.value,
)

const reparationPartielleAbordable = computed(
    () =>
        reparationNecessaire.value &&
        pointsReparationPartielle.value > 0 &&
        (props.ressources?.credits || 0) >= coutReparationPartielle.value,
)

const tarifAtelier = computed(() => `${COUT_REPARATION_PAR_POINT} cr / pt`)

function recupererQuantiteEnSoute(idMinerai) {
    return props.ressources?.minerais?.[idMinerai] || 0
}

function calculerQuantiteMaxAchetable(minerai) {
    const prixUnitaire = minerai?.prixBrut || 0

    if (prixUnitaire <= 0) {
        return 0
    }

    const quantiteParCredits = Math.floor((props.ressources.credits || 0) / prixUnitaire)
    return Math.max(0, Math.min(souteRestante.value, quantiteParCredits))
}

function acheterUnMinerai(idMinerai) {
    emit('acheter-bien', idMinerai, 1)
}

function acheterMineraiMax(minerai) {
    const quantiteMax = calculerQuantiteMaxAchetable(minerai)

    if (quantiteMax > 0) {
        emit('acheter-bien', minerai.id, quantiteMax)
    }
}

function vendreUnMinerai(idMinerai) {
    emit('vendre-bien', idMinerai, 1)
}

function vendreMineraiMax(minerai) {
    const quantiteMax = recupererQuantiteEnSoute(minerai.id)

    if (quantiteMax > 0) {
        emit('vendre-bien', minerai.id, quantiteMax)
    }
}
</script>

<template>
    <section class="panel station-services-panel" v-if="station">
        <div class="station-services-header">
            <h2>⌘ Services de station</h2>
            <p class="station-services-subtitle">{{ station.nom }} — {{ station.type }}</p>
        </div>

        <div class="station-mode-tabs station-mode-tabs--with-launch">
            <button
                v-if="positionLocale === 'station'"
                class="station-launch-button action-button-with-icon"
                @click="emit('aller-operations')"
            >
                <span class="button-icon" aria-hidden="true">⌘</span>
                <span>Zone d’opérations</span>
            </button>

            <button
                :class="{ 'is-active': sousModeStation === 'hangar' }"
                class="action-button-with-icon"
                @click="emit('changer-sous-mode-station', 'hangar')"
            >
                <span class="button-icon" aria-hidden="true">⌂</span>
                <span>Hangar</span>
            </button>

            <button
                v-if="station.services.commerce"
                :class="{ 'is-active': sousModeStation === 'commerce' }"
                class="action-button-with-icon"
                @click="emit('changer-sous-mode-station', 'commerce')"
            >
                <span class="button-icon" aria-hidden="true">✦</span>
                <span>Commerce</span>
            </button>

            <button
                v-if="station.services.ravitaillement"
                :class="{ 'is-active': sousModeStation === 'ravitaillement' }"
                class="action-button-with-icon"
                @click="emit('changer-sous-mode-station', 'ravitaillement')"
            >
                <span class="button-icon" aria-hidden="true">⛽</span>
                <span>Ravitaillement</span>
            </button>

            <button
                v-if="station.services.atelier"
                :class="{ 'is-active': sousModeStation === 'atelier' }"
                class="action-button-with-icon"
                @click="emit('changer-sous-mode-station', 'atelier')"
            >
                <span class="button-icon" aria-hidden="true">⚙</span>
                <span>Atelier</span>
            </button>
        </div>

        <template v-if="positionLocale !== 'station'">
            <div class="station-service-card station-service-card-commerce">
                <div class="station-service-card-header">
                    <h3>Accès indisponible</h3>
                    <span class="station-service-badge">Hors station</span>
                </div>

                <p class="station-service-description">
                    Les services de station ne sont accessibles qu’une fois revenu et amarré à la station
                    locale.
                </p>

                <div class="action-group">
                    <button class="action-button-with-icon" @click="emit('retour-station')">
                        <span class="button-icon" aria-hidden="true">⌂</span>
                        <span>Retourner à la station</span>
                    </button>
                </div>
            </div>
        </template>

        <template v-else>
            <div v-if="sousModeStation === 'hangar'" class="station-service-mode-hangar-scroll">
                <slot name="hangar" />
            </div>

            <div
                v-else-if="sousModeStation === 'commerce'"
                class="station-service-card station-service-card-commerce station-service-card--scrollable"
            >
                <div class="station-service-card-header">
                    <h3>¤ Commerce local</h3>
                    <span class="station-service-badge">Actif</span>
                </div>

                <div class="station-service-grid">
                    <div class="station-service-metric">
                        <span class="station-service-label">Service commercial</span>
                        <strong>Disponible</strong>
                    </div>

                    <div class="station-service-metric">
                        <span class="station-service-label">Taxe locale</span>
                        <strong>{{ taxeLocalePourcent }}</strong>
                    </div>

                    <div class="station-service-metric">
                        <span class="station-service-label">Soute</span>
                        <strong>{{ vaisseau.soute }} / {{ vaisseau.souteMax }}</strong>
                    </div>

                    <div class="station-service-metric">
                        <span class="station-service-label">Capacité restante</span>
                        <strong>{{ souteRestante }}</strong>
                    </div>

                    <div class="station-service-metric station-service-metric--full">
                        <span class="station-service-label">Profil de marché</span>
                        <strong>{{ profilMarcheLabel }}</strong>
                    </div>
                </div>

                <p class="station-service-description">
                    Les achats et ventes utilisent la même soute embarquée. Les cours ci-dessous représentent
                    les prix locaux bruts par unité. La taxe locale s’applique lors des ventes, sur le montant
                    brut total de la transaction.
                </p>

                <div class="station-market-insights station-market-insights--compact">
                    <div class="station-market-insight-card">
                        <h4>Meilleures ventes locales</h4>
                        <ul v-if="resumeMarche.haussiers.length > 0" class="station-market-list">
                            <li v-for="minerai in resumeMarche.haussiers" :key="minerai.id">
                                <span>{{ minerai.nom }}</span>
                                <strong>{{ minerai.variationPourcentageLabel }}</strong>
                            </li>
                        </ul>
                        <p v-else class="panel-note">Aucune prime locale notable.</p>
                    </div>

                    <div class="station-market-insight-card">
                        <h4>Moins favorisées</h4>
                        <ul v-if="resumeMarche.baissiers.length > 0" class="station-market-list">
                            <li v-for="minerai in resumeMarche.baissiers" :key="minerai.id">
                                <span>{{ minerai.nom }}</span>
                                <strong>{{ minerai.variationPourcentageLabel }}</strong>
                            </li>
                        </ul>
                        <p v-else class="panel-note">Aucune décote locale notable.</p>
                    </div>
                </div>

                <div class="market-rate-grid market-rate-grid-three-cols">
                    <div v-for="minerai in coursLocaux" :key="minerai.id" class="market-rate-item">
                        <div class="market-rate-row market-rate-row--top">
              <span class="market-rate-name">
                <span class="resource-icon">{{ minerai.icone }}</span>
                {{ minerai.abreviation }}
              </span>

                            <span class="market-rate-values">{{ minerai.prixBrut }} cr</span>
                        </div>

                        <div class="market-rate-row market-rate-row--bottom">
              <span
                  class="market-rate-variation"
                  :class="{
                  'market-rate-variation-up': minerai.variation === 'hausse',
                  'market-rate-variation-down': minerai.variation === 'baisse',
                  'market-rate-variation-stable': minerai.variation === 'stable',
                }"
              >
                {{ minerai.variationSymbole }} {{ minerai.variationPourcentageLabel }}
              </span>

                            <span class="market-rate-average">moy. {{ minerai.prixMoyen }} cr</span>
                        </div>

                        <div class="market-rate-row market-rate-row--bottom">
              <span class="market-rate-average">
                En soute : {{ recupererQuantiteEnSoute(minerai.id) }}
              </span>
                        </div>

                        <div class="action-group-market">
                            <button
                                class="market-rate-buy-button"
                                :disabled="souteRestante <= 0 || ressources.credits < minerai.prixBrut"
                                @click="acheterUnMinerai(minerai.id)"
                            >
                                +1
                            </button>

                            <button
                                class="market-rate-buy-button"
                                :disabled="calculerQuantiteMaxAchetable(minerai) <= 0"
                                @click="acheterMineraiMax(minerai)"
                            >
                                +Max
                            </button>

                            <button
                                class="market-rate-buy-button"
                                :disabled="recupererQuantiteEnSoute(minerai.id) <= 0"
                                @click="vendreUnMinerai(minerai.id)"
                            >
                                -1
                            </button>

                            <button
                                class="market-rate-buy-button"
                                :disabled="recupererQuantiteEnSoute(minerai.id) <= 0"
                                @click="vendreMineraiMax(minerai)"
                            >
                                -Max
                            </button>
                        </div>
                    </div>
                </div>

                <p class="market-rate-legend">
                    Affichage : cours local brut par unité, comparé au cours moyen galactique.
                </p>

                <div class="action-group">
                    <button class="action-button-with-icon" @click="emit('vendre')">
                        <span class="button-icon" aria-hidden="true">✦</span>
                        <span>Vendre le contenu minéral de la soute</span>
                    </button>
                </div>
            </div>

            <div
                v-else-if="sousModeStation === 'ravitaillement'"
                class="station-service-card station-service-card-fuel"
            >
                <div class="station-service-card-header">
                    <h3>⛽ Ravitaillement</h3>
                    <span class="station-service-badge">Actif</span>
                </div>

                <div class="station-service-grid">
                    <div class="station-service-metric">
                        <span class="station-service-label">Carburant actuel</span>
                        <strong>{{ ressources.carburant }} / {{ vaisseau.carburantMax }}</strong>
                    </div>

                    <div class="station-service-metric">
                        <span class="station-service-label">Carburant manquant</span>
                        <strong>{{ carburantManquant }}</strong>
                    </div>

                    <div class="station-service-metric">
                        <span class="station-service-label">Prix unitaire</span>
                        <strong>{{ coutCarburantUnitaire }} cr. / unité</strong>
                    </div>

                    <div class="station-service-metric">
                        <span class="station-service-label">Coût du plein</span>
                        <strong>{{ coutRavitaillementComplet }} cr.</strong>
                    </div>
                </div>

                <p class="station-service-description">
                    Recharge du réservoir principal au tarif local de la station.
                </p>

                <div class="action-group">
                    <button class="action-button-with-icon" @click="emit('ravitailler')">
                        <span class="button-icon" aria-hidden="true">⛽</span>
                        <span>Ravitailler le vaisseau</span>
                    </button>
                </div>
            </div>

            <div
                v-else-if="sousModeStation === 'atelier'"
                class="station-service-card station-service-card-workshop"
            >
                <div class="station-service-card-header">
                    <h3>⚙ Atelier technique</h3>
                    <span class="station-service-badge">Actif</span>
                </div>

                <div class="station-service-grid station-service-grid--atelier-devis station-service-grid--atelier-devis-5">
                    <div class="station-service-metric station-service-metric--compact">
                        <span class="station-service-label">Coque</span>
                        <strong>{{ vaisseau.coque }} / {{ vaisseau.coqueMax }}</strong>
                    </div>

                    <div class="station-service-metric station-service-metric--compact">
                        <span class="station-service-label">À réparer</span>
                        <strong>{{ pointsCoqueManquants }} pts</strong>
                    </div>

                    <div class="station-service-metric station-service-metric--compact">
                        <span class="station-service-label">Tarif atelier</span>
                        <strong>{{ tarifAtelier }}</strong>
                    </div>

                    <div class="station-service-metric station-service-metric--compact">
                        <span class="station-service-label">Coût partiel</span>
                        <strong v-if="reparationNecessaire">{{ coutReparationPartielle }} cr</strong>
                        <strong v-else>—</strong>
                    </div>

                    <div class="station-service-metric station-service-metric--compact">
                        <span class="station-service-label">Coût complet</span>
                        <strong v-if="reparationNecessaire">{{ coutReparation }} cr</strong>
                        <strong v-else>—</strong>
                    </div>
                </div>

                <p class="station-service-description station-service-description--compact">
                    Réparation, amélioration et support technique du vaisseau actif.
                </p>

                <div class="action-group action-group--atelier-main action-group--atelier-main-split">
                    <button
                        class="action-button-with-icon"
                        :disabled="!reparationNecessaire || !reparationPartielleAbordable"
                        @click="emit('reparer-partiellement-vaisseau')"
                    >
                        <span class="button-icon" aria-hidden="true">🛠</span>
                        <span>Réparation partielle (+{{ pointsReparationPartielle }})</span>
                    </button>

                    <button
                        class="action-button-with-icon"
                        :disabled="!reparationNecessaire || !reparationAbordable"
                        @click="emit('reparer-vaisseau')"
                    >
                        <span class="button-icon" aria-hidden="true">🛠</span>
                        <span>Réparation complète</span>
                    </button>
                </div>

                <p v-if="!reparationNecessaire" class="panel-note">
                    Coque intacte.
                </p>

                <p
                    v-else-if="!reparationPartielleAbordable && !reparationAbordable"
                    class="panel-note panel-note-warning"
                >
                    Crédits insuffisants pour toute réparation.
                </p>

                <p
                    v-else-if="reparationPartielleAbordable && !reparationAbordable"
                    class="panel-note panel-note-warning"
                >
                    Réparation partielle possible. Crédits insuffisants pour une réparation complète.
                </p>

                <div class="action-group action-group--atelier-support">
                    <div
                        class="station-service-metric station-service-metric--compact station-service-metric--support"
                    >
                        <span class="station-service-label">Drone minier</span>
                        <strong>{{ coutDroneMinier }} cr / unité</strong>
                    </div>

                    <button class="action-button-with-icon" @click="emit('acheter-drone')">
                        <span class="button-icon" aria-hidden="true">⇪</span>
                        <span>Acheter un drone minier — {{ coutDroneMinier }} crédits</span>
                    </button>
                </div>

                <div class="station-upgrade-shell">
                    <slot name="atelier" />
                </div>
            </div>
        </template>
    </section>
</template>