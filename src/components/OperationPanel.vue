<script setup>
defineProps({
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

const emit = defineEmits(['miner', 'aller-operations', 'retour-station'])
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
    <p>Drones embarqués : {{ industrie.drones.length }} / {{ vaisseau.dronesMiniersMax }}</p>
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
        @click="emit('miner')"
      >
        Miner manuellement
      </button>
    </div>

    <p class="panel-note">
      En v0.3.7, le minage n’est possible qu’en zone d’opérations. Les services de station ne sont
      disponibles qu’une fois amarré.
    </p>
  </section>
</template>
