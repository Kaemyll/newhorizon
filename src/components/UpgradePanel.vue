<script setup>
import { computed } from 'vue'
import { donneesVaisseaux } from '../game/dataVaisseaux'

const props = defineProps({
  vaisseau: {
    type: Object,
    required: true,
  },
  secteurCourant: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['ameliorer'])

const modeleVaisseau = computed(
  () =>
    donneesVaisseaux.find(
      (vaisseau) => vaisseau.id === (props.vaisseau.modeleId || props.vaisseau.id),
    ) || null,
)

const ameliorations = computed(() => modeleVaisseau.value?.ameliorations || [])

function recupererValeurActuelle(idAmelioration) {
  if (idAmelioration === 'soute') {
    return props.vaisseau.souteMax
  }

  if (idAmelioration === 'drones') {
    return props.vaisseau.dronesMiniersMax
  }

  if (idAmelioration === 'carburant') {
    return props.vaisseau.carburantMax
  }

  if (idAmelioration === 'extraction') {
    return props.vaisseau.puissanceMiniere
  }

  return 0
}

function estAuMaximum(amelioration) {
  return recupererValeurActuelle(amelioration.id) >= amelioration.valeurMax
}

function labelValeur(idAmelioration) {
  if (idAmelioration === 'soute') return 'Capacité'
  if (idAmelioration === 'drones') return 'Baie'
  if (idAmelioration === 'carburant') return 'Réservoir'
  if (idAmelioration === 'extraction') return 'Canon'
  return 'Valeur'
}
</script>

<template>
  <section class="panel upgrade-panel upgrade-panel--atelier">
    <h2>⚙ Atelier / Améliorations</h2>

    <div class="upgrade-grid" v-if="ameliorations.length > 0">
      <article v-for="amelioration in ameliorations" :key="amelioration.id" class="upgrade-card">
        <div class="upgrade-card-head">
          <strong>{{ amelioration.nom }}</strong>
          <span v-if="estAuMaximum(amelioration)" class="upgrade-badge upgrade-badge--max">
            Max
          </span>
        </div>

        <p class="upgrade-card-description">
          {{ amelioration.description }}
        </p>

        <div class="upgrade-card-stats">
          <p>
            <span>{{ labelValeur(amelioration.id) }}</span>
            <strong>
              {{ recupererValeurActuelle(amelioration.id) }} / {{ amelioration.valeurMax }}
            </strong>
          </p>

          <p>
            <span>Coût</span>
            <strong>{{ amelioration.cout }} cr.</strong>
          </p>
        </div>

        <div class="action-group">
          <button
            :disabled="estAuMaximum(amelioration)"
            @click="emit('ameliorer', amelioration.id)"
          >
            {{ estAuMaximum(amelioration) ? 'Maximum atteint' : 'Améliorer' }}
          </button>
        </div>
      </article>
    </div>

    <p v-else class="panel-note">Aucune amélioration disponible pour ce châssis.</p>
  </section>
</template>
