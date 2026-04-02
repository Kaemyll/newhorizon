<script setup>
import { computed } from 'vue'

const props = defineProps({
  vaisseau: {
    type: Object,
    required: true,
  },
  industrie: {
    type: Object,
    required: true,
  },
})

const roleLabel = computed(() => {
  if (props.vaisseau?.role === 'mineur_leger') return 'Mineur léger'
  if (props.vaisseau?.role === 'mineur_lourd') return 'Mineur lourd'
  if (props.vaisseau?.role === 'mineur_renforce') return 'Mineur renforcé'
  if (props.vaisseau?.role === 'transporteur_marchand') return 'Transporteur marchand'
  return 'Châssis polyvalent'
})

const accrocheRole = computed(() => {
  if (props.vaisseau?.role === 'transporteur_marchand') {
    return 'Conçu pour le fret et les rotations commerciales.'
  }

  if (props.vaisseau?.role === 'mineur_lourd') {
    return 'Pensé pour l’extraction soutenue et le rendement.'
  }

  if (props.vaisseau?.role === 'mineur_renforce') {
    return 'Prévu pour l’exploitation en zones plus exigeantes.'
  }

  return 'Châssis utilitaire d’extraction légère.'
})

const badgeRoleClasse = computed(() => {
  if (props.vaisseau?.role === 'transporteur_marchand')
    return 'ship-role-badge ship-role-badge--trade'
  if (props.vaisseau?.role === 'mineur_lourd') return 'ship-role-badge ship-role-badge--heavy'
  if (props.vaisseau?.role === 'mineur_renforce')
    return 'ship-role-badge ship-role-badge--reinforced'
  return 'ship-role-badge ship-role-badge--light'
})
</script>

<template>
  <section class="panel">
    <div class="ship-panel-header">
      <div class="ship-panel-title-block">
        <h2>⛭ Vaisseau</h2>
        <p class="ship-panel-subtitle">
          <span class="ship-panel-ship-group">
            <span class="ship-panel-ship-name">{{ vaisseau.nom }}</span>
            <span class="ship-panel-separator"> — </span>
          </span>
          <span class="ship-panel-builder">{{ vaisseau.constructeur }}</span>
        </p>
      </div>

      <span :class="badgeRoleClasse">
        {{ roleLabel }}
      </span>
    </div>

    <p class="ship-panel-role-line">
      {{ accrocheRole }}
    </p>

    <div class="ship-panel-metrics">
      <p>
        <span>Coque</span><strong>{{ vaisseau.coque }} / {{ vaisseau.coqueMax }}</strong>
      </p>
      <p>
        <span>Soute</span><strong>{{ vaisseau.soute }} / {{ vaisseau.souteMax }}</strong>
      </p>
      <p>
        <span>Canon minier</span><strong>{{ vaisseau.puissanceMiniere }}</strong>
      </p>
      <p>
        <span>Drones</span
        ><strong>{{ industrie.drones.length }} / {{ vaisseau.dronesMiniersMax }}</strong>
      </p>
    </div>
  </section>
</template>
