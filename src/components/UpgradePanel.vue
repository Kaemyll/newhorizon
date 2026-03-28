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

const modeleVaisseau = computed(() =>
  donneesVaisseaux.find((vaisseau) => vaisseau.id === props.vaisseau.id),
)

const ameliorations = computed(() => Object.values(modeleVaisseau.value?.ameliorations || {}))

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
</script>

<template>
  <section class="panel">
    <h2>⚙ Atelier / Améliorations</h2>

    <div v-for="amelioration in ameliorations" :key="amelioration.id" class="upgrade-item">
      <div class="upgrade-header">
        <strong>{{ amelioration.nom }}</strong>
      </div>

      <p class="upgrade-description">
        {{ amelioration.description }}
      </p>

      <p>
        Valeur actuelle : {{ recupererValeurActuelle(amelioration.id) }} /
        {{ amelioration.valeurMax }}
      </p>

      <p>Coût : {{ amelioration.cout }} crédits</p>

      <button :disabled="estAuMaximum(amelioration)" @click="emit('ameliorer', amelioration.id)">
        {{ estAuMaximum(amelioration) ? 'Maximum atteint' : 'Améliorer' }}
      </button>
    </div>
  </section>
</template>
