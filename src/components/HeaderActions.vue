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
      class="action-button-with-icon"
      :class="{ 'is-active': modeActif === 'operations' }"
      @click="emit('changer-mode', 'operations')"
    >
      <span class="button-icon" aria-hidden="true">⌘</span>
      <span>Opérations</span>
    </button>

    <button
      class="action-button-with-icon"
      :class="{ 'is-active': modeActif === 'station' }"
      @click="emit('changer-mode', 'station')"
    >
      <span class="button-icon" aria-hidden="true">⌂</span>
      <span>Station</span>
    </button>

    <button
      class="action-button-with-icon"
      :class="{ 'is-active': modeActif === 'navigation' }"
      @click="emit('changer-mode', 'navigation')"
    >
      <span class="button-icon" aria-hidden="true">🧭</span>
      <span>Navigation</span>
    </button>

    <button class="action-button-with-icon" @click="emit('reinitialiser')">
      <span class="button-icon" aria-hidden="true">↺</span>
      <span>Réinitialiser</span>
    </button>
  </div>
</template>
