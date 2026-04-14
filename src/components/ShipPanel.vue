<script setup>
import { computed } from 'vue'
import { recupererEtatCoque } from '../game/systemeCoque'
import { recupererEtatVisuelCoque } from '../game/systemeEtatsVisuels'

const props = defineProps({
    vaisseau: {
        type: Object,
        required: true,
    },
    industrie: {
        type: Object,
        required: true,
    },
})

const roleLabel = computed(() => {
    if (props.vaisseau?.role === 'mineur_leger') return 'Mineur léger'
    if (props.vaisseau?.role === 'mineur_lourd') return 'Mineur lourd'
    if (props.vaisseau?.role === 'mineur_renforce') return 'Mineur renforcé'
    if (props.vaisseau?.role === 'transporteur_marchand') return 'Transporteur marchand'
    return 'Châssis polyvalent'
})

const accrocheRole = computed(() => {
    if (props.vaisseau?.role === 'transporteur_marchand') {
        return 'Conçu pour le fret et les rotations commerciales.'
    }

    if (props.vaisseau?.role === 'mineur_lourd') {
        return 'Pensé pour l’extraction soutenue et le rendement.'
    }

    if (props.vaisseau?.role === 'mineur_renforce') {
        return 'Prévu pour l’exploitation en zones plus exigeantes.'
    }

    return 'Châssis utilitaire d’extraction légère.'
})

const badgeRoleClasse = computed(() => {
    if (props.vaisseau?.role === 'transporteur_marchand') {
        return 'ship-role-badge ship-role-badge--trade'
    }

    if (props.vaisseau?.role === 'mineur_lourd') {
        return 'ship-role-badge ship-role-badge--heavy'
    }

    if (props.vaisseau?.role === 'mineur_renforce') {
        return 'ship-role-badge ship-role-badge--reinforced'
    }

    return 'ship-role-badge ship-role-badge--light'
})

const infosCoque = computed(() =>
    recupererEtatCoque(props.vaisseau?.coque ?? 0, props.vaisseau?.coqueMax ?? 0),
)

const etatVisuelCoque = computed(() => recupererEtatVisuelCoque(infosCoque.value.code))

const largeurBarreCoque = computed(() => `${infosCoque.value.pourcentage}%`)
</script>

<template>
    <section class="panel">
        <div class="ship-panel-header">
            <div class="ship-panel-title-block">
                <h2>⛭ Vaisseau</h2>
                <p class="ship-panel-subtitle">
          <span class="ship-panel-ship-group">
            <span class="ship-panel-ship-name">{{ vaisseau.nom }}</span>
            <span class="ship-panel-separator"> — </span>
          </span>
                    <span class="ship-panel-builder">{{ vaisseau.constructeur }}</span>
                </p>
            </div>

            <span :class="badgeRoleClasse">
        {{ roleLabel }}
      </span>
        </div>

        <p class="ship-panel-role-line">
            {{ accrocheRole }}
        </p>

        <div class="ship-panel-hull-status ship-panel-hull-status--compact">
            <div class="ship-panel-hull-status-head">
                <span class="ship-panel-hull-title">Intégrité de coque</span>
                <span :class="etatVisuelCoque.classeBadge">{{ etatVisuelCoque.label }}</span>
            </div>

            <div class="ship-panel-hull-bar">
                <div
                    class="ship-panel-hull-bar-fill"
                    :class="etatVisuelCoque.classeBarre"
                    :style="{ width: largeurBarreCoque }"
                ></div>
            </div>

            <p class="ship-panel-hull-meta">
                <span>{{ vaisseau.coque }} / {{ vaisseau.coqueMax }}</span>
                <span>{{ infosCoque.pourcentage }}%</span>
            </p>
        </div>

        <div class="ship-panel-metrics ship-panel-metrics--three-cols">
            <p>
                <span>Soute</span><strong>{{ vaisseau.soute }} / {{ vaisseau.souteMax }}</strong>
            </p>
            <p>
                <span>Canon minier</span><strong>{{ vaisseau.puissanceMiniere }}</strong>
            </p>
            <p>
        <span>Drones</span
        ><strong>{{ industrie.drones.length }} / {{ vaisseau.dronesMiniersMax }}</strong>
            </p>
        </div>
    </section>
</template>