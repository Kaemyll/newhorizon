<script setup>
defineProps({
  industrie: {
    type: Object,
    required: true,
  },
  vaisseau: {
    type: Object,
    required: true,
  },
  economie: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <section class="panel">
    <h2>⚙ Industrie</h2>
    <p>Drones embarqués : {{ industrie.drones.length }} / {{ vaisseau.dronesMiniersMax }}</p>
    <p>Coût d’un drone minier : {{ economie.coutDroneMinier }} crédits</p>
    <p>Rendement drone : 1 extraction / 4 ticks</p>
    <p>Maintenance : 20 cycles actifs, puis 5 cycles off</p>
  </section>
</template>
