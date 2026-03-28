<script setup>
import { computed } from 'vue'

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
})

const emit = defineEmits([
  'miner',
  'aller-operations',
  'retour-station',
  'deployer-drones',
  'rappeler-drones',
])

const nbDeployes = computed(
  () => props.industrie.drones.filter((drone) => drone.etat === 'deploie').length,
)

const nbEmbarques = computed(
  () => props.industrie.drones.filter((drone) => drone.etat === 'embarque').length,
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
        sousTitre: 'Extraction et drones actifs possibles',
        classe: 'ops-local-badge-operations',
      },
)

const statutVol = computed(() =>
  props.navigation.enVoyage ? 'En transit inter-sectoriel' : 'Disponible localement',
)

const statutCanon = computed(() => {
  if (props.navigation.enVoyage) {
    return 'Indisponible'
  }

  if (props.positionLocale !== 'operations') {
    return 'Hors zone'
  }

  return 'Prêt'
})

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
  <section class="panel ops-panel">
    <div class="ops-header">
      <div>
        <h2>⌘ Opérations</h2>
        <p class="ops-subtitle">Console de bord locale du vaisseau</p>
      </div>

      <div class="ops-local-badge" :class="badgeLocal.classe">
        <span class="ops-local-badge-icon">{{ badgeLocal.icone }}</span>
        <div class="ops-local-badge-text">
          <strong>{{ badgeLocal.titre }}</strong>
          <span>{{ badgeLocal.sousTitre }}</span>
        </div>
      </div>
    </div>

    <div class="ops-grid">
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
            <span class="ops-system-name">Canon de minage</span>
            <span class="ops-system-value">{{ statutCanon }}</span>
          </div>

          <div class="ops-system-item">
            <span class="ops-system-name">Puissance minière</span>
            <span class="ops-system-value">{{ vaisseau.puissanceMiniere }}</span>
          </div>

          <div class="ops-system-item">
            <span class="ops-system-name">Scanner</span>
            <span class="ops-system-value">Module de base / évolution future</span>
          </div>

          <div class="ops-system-item">
            <span class="ops-system-name">Baie à drones</span>
            <span class="ops-system-value"
              >{{ industrie.drones.length }} / {{ vaisseau.dronesMiniersMax }}</span
            >
          </div>
        </div>
      </section>
    </div>

    <section class="ops-block">
      <h3>Commandes</h3>

      <div class="action-group">
        <button
          v-if="positionLocale === 'station'"
          :disabled="navigation.enVoyage"
          @click="emit('aller-operations')"
        >
          Rejoindre la zone d’opérations
        </button>

        <button
          v-if="positionLocale === 'operations'"
          :disabled="navigation.enVoyage"
          @click="emit('retour-station')"
        >
          Retourner à la station
        </button>

        <button
          :disabled="navigation.enVoyage || positionLocale !== 'operations'"
          @click="emit('deployer-drones')"
        >
          Déployer les drones
        </button>

        <button :disabled="navigation.enVoyage" @click="emit('rappeler-drones')">
          Rappeler les drones
        </button>

        <button
          :disabled="navigation.enVoyage || positionLocale !== 'operations'"
          @click="emit('miner')"
        >
          Miner manuellement
        </button>
      </div>
    </section>

    <section class="ops-block">
      <div class="ops-drone-header">
        <h3>État des drones</h3>
        <span class="ops-drone-summary">
          {{ nbDeployes }} déployé(s) · {{ nbEmbarques }} embarqué(s)
        </span>
      </div>

      <ul v-if="industrie.drones.length > 0" class="drone-status-list">
        <li v-for="drone in industrie.drones" :key="drone.id">
          <span class="drone-status-name">Drone #{{ drone.id }}</span>
          <span class="drone-status-meta">{{ decrireDrone(drone) }}</span>
        </li>
      </ul>

      <p v-else class="panel-note">Aucun drone embarqué pour le moment.</p>
    </section>

    <p class="panel-note">
      En v0.3.8, un drone déployé extrait une fois par tick, dispose de 8 ticks d’autonomie, puis
      revient automatiquement pour 2 ticks de recharge.
    </p>
  </section>
</template>
