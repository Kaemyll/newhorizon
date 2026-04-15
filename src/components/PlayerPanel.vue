<script setup>
defineProps({
  player: {
    type: Object,
    default: () => ({}),
  },
  credits: {
    type: Number,
    default: 0,
  },
})
</script>

<template>
  <section class="panel player-panel">
    <div class="player-panel-header">
      <h2>◉ Pilote</h2>

      <span class="player-panel-badge">
        {{ player?.statut || 'Indépendant' }}
      </span>
    </div>

    <div class="player-panel-grid">
      <div class="player-panel-card">
        <span class="player-panel-label">Identité</span>
        <strong class="player-panel-value">
          {{ player?.identite || 'À renseigner' }}
        </strong>
      </div>

      <div class="player-panel-card">
        <span class="player-panel-label">Réputation</span>
        <strong class="player-panel-value">
          {{ player?.reputation || 'Inconnue' }}
        </strong>
      </div>

      <div class="player-panel-card">
        <span class="player-panel-label">Fortune</span>
        <strong class="player-panel-value"> {{ credits }} crédits </strong>
      </div>
    </div>
  </section>
</template>
