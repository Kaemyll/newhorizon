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
  modeActif: {
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

const estModeNavigationActif = computed(() => props.modeActif === 'navigation')

const classesNavigationPanel = computed(() => ({
  'navigation-panel--active': estModeNavigationActif.value,
  'navigation-panel--in-transit': props.navigation.enVoyage,
  'navigation-panel--operations-context':
    props.positionLocale === 'operations' && !props.navigation.enVoyage,
  'navigation-panel--station-context':
    props.positionLocale === 'station' && !props.navigation.enVoyage,
}))

const libellePosition = computed(() =>
  props.positionLocale === 'operations' ? 'Zone d’opérations' : 'Station',
)

const classePastillePosition = computed(() =>
  props.positionLocale === 'operations'
    ? 'ui-state-pill ui-state-warning navigation-context-pill'
    : 'ui-state-pill ui-state-neutral navigation-context-pill',
)

const statutNavigation = computed(() => {
  if (props.navigation.enVoyage) {
    return {
      libelle: 'En transit',
      classe: 'ui-state-pill ui-state-info navigation-status-pill',
    }
  }

  if (estModeNavigationActif.value) {
    return {
      libelle: 'Console active',
      classe: 'ui-state-pill ui-state-success navigation-status-pill',
    }
  }

  return {
    libelle: 'Prêt au départ',
    classe: 'ui-state-pill ui-state-neutral navigation-status-pill',
  }
})
</script>

<template>
  <section :class="['panel', 'navigation-panel', classesNavigationPanel]">
    <div class="navigation-panel-header">
      <h2>⟁ Navigation</h2>

      <div class="navigation-panel-badges">
        <span :class="classePastillePosition">{{ libellePosition }}</span>
        <span :class="statutNavigation.classe">{{ statutNavigation.libelle }}</span>
      </div>
    </div>

    <div class="navigation-panel-body">
      <p>Secteur actuel : {{ secteurCourant?.nom }}</p>

      <template v-if="navigation.enVoyage">
        <p>Destination : {{ secteurDestinationActive?.nom }}</p>
        <p>Temps restant : {{ navigation.ticksRestants }} ticks</p>
        <p class="navigation-status">Transit inter-sectoriel en cours.</p>
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
          <button
            class="action-button-with-icon"
            :class="{ 'is-active': estModeNavigationActif }"
            @click="emit('voyager')"
          >
            <span class="button-icon" aria-hidden="true">🧭</span>
            <span>Lancer le trajet</span>
          </button>
        </div>

        <p class="navigation-status">Sélection de trajectoire prête.</p>
      </template>
    </div>
  </section>
</template>
