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

function decrireDrone(drone) {
  if (drone.etat === 'deploie') {
    return `Déployé — autonomie ${drone.autonomieRestante}/8`
  }

  if (drone.ticksRechargeRestants > 0) {
    return `Embarqué — recharge ${drone.ticksRechargeRestants} tick(s)`
  }

  return `Embarqué — prêt`
}
</script>

<template>
  <section class="panel">
    <h2>⌘ Opérations</h2>

    <p>Statut du vaisseau : {{ navigation.enVoyage ? 'En transit' : 'Disponible' }}</p>
    <p>Position locale : {{ positionLocale === 'station' ? 'Station' : 'Zone d’opérations' }}</p>
    <p>
      Canon de minage :
      {{ positionLocale === 'operations' && !navigation.enVoyage ? 'Prêt' : 'Hors service local' }}
    </p>
    <p>Drones embarqués : {{ nbEmbarques }} / {{ industrie.drones.length }}</p>
    <p>Drones déployés : {{ nbDeployes }}</p>
    <p>Soute : {{ vaisseau.soute }} / {{ vaisseau.souteMax }}</p>
    <p>Carburant : {{ ressources.carburant }} / {{ vaisseau.carburantMax }}</p>

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

    <h3>État des drones</h3>

    <ul v-if="industrie.drones.length > 0" class="drone-status-list">
      <li v-for="drone in industrie.drones" :key="drone.id">
        <span class="drone-status-name">Drone #{{ drone.id }}</span>
        <span class="drone-status-meta">{{ decrireDrone(drone) }}</span>
      </li>
    </ul>

    <p v-else class="panel-note">Aucun drone embarqué pour le moment.</p>

    <p class="panel-note">
      En v0.3.8, un drone déployé extrait une fois par tick, dispose de 8 ticks d’autonomie, puis
      revient automatiquement pour 2 ticks de recharge.
    </p>
  </section>
</template>
