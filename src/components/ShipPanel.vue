<script setup>
defineProps({
  vaisseau: {
    type: Object,
    required: true,
  },
  industrie: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <section class="panel">
    <h2>⛭ Vaisseau</h2>
    <p>Nom : {{ vaisseau.nom }}</p>
    <p>Constructeur : {{ vaisseau.constructeur }}</p>
    <p>Coque : {{ vaisseau.coque }}%</p>
    <p>Soute : {{ vaisseau.soute }} / {{ vaisseau.souteMax }}</p>
    <p>Puissance minière : {{ vaisseau.puissanceMiniere }}</p>
    <p>Drones miniers : {{ industrie.drones.length }} / {{ vaisseau.dronesMiniersMax }}</p>
  </section>
</template>
