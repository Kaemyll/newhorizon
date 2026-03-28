<script setup>
const emit = defineEmits(['miner', 'vendre', 'reinitialiser'])
</script>

<template>
  <section class="panel">
    <h2>Actions</h2>

    <div class="button-group">
      <button @click="emit('miner')">Miner</button>
      <button @click="emit('vendre')">Vendre la cargaison</button>
      <button @click="emit('reinitialiser')">Réinitialiser</button>
    </div>
  </section>
</template>
