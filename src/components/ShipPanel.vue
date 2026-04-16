<script setup>
import { computed } from 'vue'

const props = defineProps({
    vaisseau: {
        type: Object,
        required: true,
    },
    industrie: {
        type: Object,
        required: true,
    },
    ressources: {
        type: Object,
        required: true,
    },
})

const roleLabel = computed(() => {
    switch (props.vaisseau.role) {
        case 'mineur_leger':
            return 'Mineur léger'
        case 'mineur_renforce':
            return 'Mineur renforcé'
        case 'mineur_lourd':
            return 'Mineur lourd'
        case 'transporteur_marchand':
            return 'Transporteur marchand'
        default:
            return 'Vaisseau'
    }
})

const roleClass = computed(() => {
    switch (props.vaisseau.role) {
        case 'mineur_leger':
            return 'ship-role-badge--light'
        case 'mineur_renforce':
            return 'ship-role-badge--reinforced'
        case 'mineur_lourd':
            return 'ship-role-badge--heavy'
        case 'transporteur_marchand':
            return 'ship-role-badge--trade'
        default:
            return 'ship-role-badge--light'
    }
})

const descriptionVaisseau = computed(() => props.vaisseau.description || 'Vaisseau opérationnel.')

const coquePourcentage = computed(() => {
    if (!props.vaisseau.coqueMax) return 0
    return Math.max(0, Math.min(100, Math.round((props.vaisseau.coque / props.vaisseau.coqueMax) * 100)))
})

const etatCoque = computed(() => {
    const pourcentage = coquePourcentage.value

    if (pourcentage <= 0) {
        return {
            libelle: 'Hors service',
            classeCss: 'ship-hull-badge--hors-service',
        }
    }

    if (pourcentage <= 39) {
        return {
            libelle: 'Critique',
            classeCss: 'ship-hull-badge--critique',
        }
    }

    if (pourcentage <= 74) {
        return {
            libelle: 'Dégradée',
            classeCss: 'ship-hull-badge--degradee',
        }
    }

    return {
        libelle: 'Nominale',
        classeCss: 'ship-hull-badge--nominale',
    }
})

const carburantActuel = computed(() => Number(props.ressources?.carburant) || 0)

const carburantPourcentage = computed(() => {
    if (!props.vaisseau.carburantMax) return 0
    return Math.max(
        0,
        Math.min(100, Math.round((carburantActuel.value / props.vaisseau.carburantMax) * 100)),
    )
})

const carburantEtatClass = computed(() => {
    if (carburantPourcentage.value <= 15) return 'ship-fuel-badge--critique'
    if (carburantPourcentage.value <= 40) return 'ship-fuel-badge--degrade'
    return 'ship-fuel-badge--nominal'
})

const carburantEtatLibelle = computed(() => {
    if (carburantPourcentage.value <= 15) return 'Réserve critique'
    if (carburantPourcentage.value <= 40) return 'Réserve basse'
    return 'Réserve correcte'
})

const nombreDronesActifs = computed(() => props.industrie?.drones?.length || 0)
</script>

<template>
    <section class="panel">
        <div class="ship-panel-header">
            <div class="ship-panel-title-block">
                <h2>⛭ Vaisseau</h2>
                <p class="ship-panel-subtitle">
                    <span class="ship-panel-ship-name">{{ vaisseau.nom }}</span>
                    <span class="ship-panel-separator">—</span>
                    <span class="ship-panel-builder">{{ vaisseau.constructeur }}</span>
                </p>
            </div>

            <span class="ship-role-badge" :class="roleClass">
        {{ roleLabel }}
      </span>
        </div>

        <p class="ship-panel-role-line">{{ descriptionVaisseau }}</p>

        <div class="ship-panel-hull-status ship-panel-hull-status--compact">
            <div class="ship-panel-hull-status-head">
                <span class="ship-panel-hull-title">Intégrité de coque</span>
                <span class="ship-hull-badge" :class="etatCoque.classeCss">
          {{ etatCoque.libelle }}
        </span>
            </div>

            <div class="ship-panel-hull-bar">
                <div
                    class="ship-panel-hull-bar-fill"
                    :class="etatCoque.classeCss"
                    :style="{ width: `${coquePourcentage}%` }"
                />
            </div>

            <div class="ship-panel-hull-meta">
                <span>{{ vaisseau.coque }} / {{ vaisseau.coqueMax }}</span>
                <span>{{ coquePourcentage }}%</span>
            </div>
        </div>

        <div class="ship-panel-fuel-status">
            <div class="ship-panel-fuel-status-head">
                <span class="ship-panel-fuel-title">Carburant</span>
                <span class="ship-fuel-badge" :class="carburantEtatClass">
          {{ carburantPourcentage }}%
        </span>
            </div>

            <div class="ship-panel-fuel-bar">
                <div
                    class="ship-panel-fuel-bar-fill"
                    :class="carburantEtatClass"
                    :style="{ width: `${carburantPourcentage}%` }"
                />
            </div>

            <div class="ship-panel-fuel-meta">
                <span>{{ carburantActuel }} / {{ vaisseau.carburantMax }}</span>
                <span>{{ carburantEtatLibelle }}</span>
            </div>
        </div>

        <div class="ship-panel-metrics ship-panel-metrics--three-cols">
            <p>
                <span>Soute</span>
                <strong>{{ vaisseau.soute }} / {{ vaisseau.souteMax }}</strong>
            </p>
            <p>
                <span>Canon minier</span>
                <strong>{{ vaisseau.puissanceMiniere }}</strong>
            </p>
            <p>
                <span>Drones</span>
                <strong>{{ nombreDronesActifs }} / {{ vaisseau.dronesMiniersMax }}</strong>
            </p>
        </div>
    </section>
</template>