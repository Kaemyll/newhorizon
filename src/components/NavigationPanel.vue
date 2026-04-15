<script setup>
import { computed } from 'vue'
import { donneesSecteurs } from '../game/dataSecteurs'
import { donneesTrajets } from '../game/dataTrajets'

const props = defineProps({
  secteurCourantId: {
    type: String,
    required: true,
  },
  navigation: {
    type: Object,
    required: true,
  },
  positionLocale: {
    type: String,
    default: 'station',
  },
})

const emit = defineEmits(['selectionner-destination', 'voyager'])

const secteurCourant = computed(() =>
  donneesSecteurs.find((secteur) => secteur.id === props.secteurCourantId),
)

const secteurDestinationActive = computed(() =>
  donneesSecteurs.find((secteur) => secteur.id === props.navigation.secteurDestinationId),
)

const autresSecteurs = computed(() =>
  donneesSecteurs.filter((secteur) => secteur.id !== props.secteurCourantId),
)

const trajetSelectionne = computed(() =>
  donneesTrajets.find(
    (trajet) =>
      trajet.origine === props.secteurCourantId &&
      trajet.destination === props.navigation.destinationSelectionneeId,
  ),
)
</script>

<template>
  <section class="panel">
    <h2>⟁ Navigation</h2>

    <p>Secteur actuel : {{ secteurCourant?.nom }}</p>
    <p>Position : {{ positionLocale === 'operations' ? 'Zone d’opérations' : 'Station' }}</p>

    <template v-if="navigation.enVoyage">
      <p>Destination : {{ secteurDestinationActive?.nom }}</p>
      <p>Temps restant : {{ navigation.ticksRestants }} ticks</p>
      <p class="navigation-status">Statut : En transit</p>
    </template>

    <template v-else>
      <div class="navigation-destination-row">
        <label class="navigation-label navigation-label--inline" for="destination-select">
          Destination
        </label>

        <select
          id="destination-select"
          class="navigation-select navigation-select--compact"
          :value="navigation.destinationSelectionneeId"
          @change="emit('selectionner-destination', $event.target.value)"
        >
          <option v-for="secteur in autresSecteurs" :key="secteur.id" :value="secteur.id">
            {{ secteur.nom }}
          </option>
        </select>
      </div>

      <template v-if="trajetSelectionne">
        <p class="navigation-route-meta">
          Durée : {{ trajetSelectionne.tempsTrajet }} ticks · Coût carburant :
          {{ trajetSelectionne.coutCarburant }}
        </p>
      </template>

      <div class="action-group">
        <button class="action-button-with-icon" @click="emit('voyager')">
          <span class="button-icon" aria-hidden="true">🧭</span>
          <span>Lancer le trajet</span>
        </button>
      </div>

      <p class="navigation-status">Statut : Prêt au départ</p>
    </template>
  </section>
</template>
