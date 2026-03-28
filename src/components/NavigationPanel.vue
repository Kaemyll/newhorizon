<script setup>
import { computed } from 'vue'
import { donneesSecteurs } from '../game/donneesSecteurs'
import { donneesTrajets } from '../game/donneesTrajets'

const props = defineProps({
  secteurCourantId: {
    type: String,
    required: true,
  },
  navigation: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['selectionner-destination', 'voyager'])

const secteurCourant = computed(() =>
  donneesSecteurs.find((secteur) => secteur.id === props.secteurCourantId),
)

const secteurDestinationSelectionnee = computed(() =>
  donneesSecteurs.find((secteur) => secteur.id === props.navigation.destinationSelectionneeId),
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

    <template v-if="navigation.enVoyage">
      <p>Destination : {{ secteurDestinationActive?.nom }}</p>
      <p>Temps restant : {{ navigation.ticksRestants }} ticks</p>
      <p class="navigation-status">Statut : En transit</p>
    </template>

    <template v-else>
      <label class="navigation-label" for="destination-select"> Destination </label>

      <select
        id="destination-select"
        class="navigation-select"
        :value="navigation.destinationSelectionneeId"
        @change="emit('selectionner-destination', $event.target.value)"
      >
        <option v-for="secteur in autresSecteurs" :key="secteur.id" :value="secteur.id">
          {{ secteur.nom }}
        </option>
      </select>

      <template v-if="secteurDestinationSelectionnee && trajetSelectionne">
        <p>Coût carburant : {{ trajetSelectionne.coutCarburant }}</p>
        <p>Durée du trajet : {{ trajetSelectionne.tempsTrajet }} ticks</p>
      </template>

      <div class="action-group">
        <button @click="emit('voyager')">Lancer le trajet</button>
      </div>

      <p class="navigation-status">Statut : À quai</p>
    </template>
  </section>
</template>
