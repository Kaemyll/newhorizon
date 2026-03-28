<script setup>
defineProps({
  modeActif: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['changer-mode', 'reinitialiser'])
</script>

<template>
  <div class="header-actions">
    <button
      :class="{ 'is-active': modeActif === 'operations' }"
      @click="emit('changer-mode', 'operations')"
    >
      Opérations
    </button>

    <button
      :class="{ 'is-active': modeActif === 'station' }"
      @click="emit('changer-mode', 'station')"
    >
      Station
    </button>

    <button
      :class="{ 'is-active': modeActif === 'navigation' }"
      @click="emit('changer-mode', 'navigation')"
    >
      Navigation
    </button>

    <button @click="emit('reinitialiser')">Réinitialiser</button>
  </div>
</template>
