<script setup>
import { computed } from 'vue'
import { donneesSecteurs } from '../game/dataSecteurs'
import { calculerTauxTaxePourSecurite, formaterPourcentageTaxe } from '../game/systemeCommerce'

const props = defineProps({
  secteurCourant: {
    type: Object,
    required: true,
  },
})

const secteur = computed(() =>
  donneesSecteurs.find((entree) => entree.id === props.secteurCourant.id),
)

const station = computed(() => secteur.value?.stationPrincipale ?? null)

const taxeLocale = computed(() => calculerTauxTaxePourSecurite(secteur.value?.securite ?? 1))
</script>

<template>
  <section class="panel station-summary-panel" v-if="station">
    <h2>⌘ Station</h2>

    <p>
      <strong>{{ station.nom }}</strong>
    </p>
    <p>{{ station.type }}</p>

    <div class="station-summary-block">
      <h3>Services disponibles</h3>
      <ul class="station-summary-list">
        <li>
          <span class="station-service-icon">⛽</span>
          <span>Ravitaillement</span>
          <span class="station-service-state">
            {{ station.services.ravitaillement ? 'Oui' : 'Non' }}
          </span>
        </li>
        <li>
          <span class="station-service-icon">¤</span>
          <span>Commerce</span>
          <span class="station-service-state">
            {{ station.services.commerce ? 'Oui' : 'Non' }}
          </span>
        </li>
        <li>
          <span class="station-service-icon">⚙</span>
          <span>Atelier</span>
          <span class="station-service-state">
            {{ station.services.atelier ? 'Oui' : 'Non' }}
          </span>
        </li>
      </ul>
    </div>

    <div class="station-summary-block">
      <h3>Conditions locales</h3>
      <p>Carburant : {{ station.economie.coutCarburantParUnite }} crédit / unité</p>
      <p>Taxe commerciale : {{ formaterPourcentageTaxe(taxeLocale) }}</p>
    </div>

    <p class="sector-description">
      {{ station.description }}
    </p>
  </section>
</template>
