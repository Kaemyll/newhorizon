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
})

const emit = defineEmits(['miner'])
</script>

<template>
  <section class="panel">
    <h2>⌘ Opérations</h2>

    <p>Statut du vaisseau : {{ navigation.enVoyage ? 'En transit' : 'À quai / en opération' }}</p>
    <p>Canon de minage : {{ navigation.enVoyage ? 'Indisponible en transit' : 'Prêt' }}</p>
    <p>Drones embarqués : {{ industrie.drones.length }} / {{ vaisseau.dronesMiniersMax }}</p>
    <p>Soute : {{ vaisseau.soute }} / {{ vaisseau.souteMax }}</p>
    <p>Carburant : {{ ressources.carburant }} / {{ vaisseau.carburantMax }}</p>

    <div class="action-group">
      <button :disabled="navigation.enVoyage" @click="emit('miner')">Miner manuellement</button>
    </div>

    <p class="panel-note">
      Les commandes détaillées des drones et des systèmes embarqués seront ajoutées plus tard.
    </p>
  </section>
</template>
