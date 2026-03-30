<script setup>
import { computed } from 'vue'
import { donneesSecteurs } from '../game/dataSecteurs'
import {
  calculerCoursLocauxPourStation,
  calculerTauxTaxePourSecurite,
  formaterPourcentageTaxe,
} from '../game/systemeCommerce'

const props = defineProps({
  secteurCourant: {
    type: Object,
    required: true,
  },
  vaisseau: {
    type: Object,
    required: true,
  },
  ressources: {
    type: Object,
    required: true,
  },
  sousModeStation: {
    type: String,
    required: true,
  },
  positionLocale: {
    type: String,
    required: true,
  },
  economie: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits([
  'changer-sous-mode-station',
  'vendre',
  'ravitailler',
  'acheter-drone',
  'retour-station',
])

const secteur = computed(() =>
  donneesSecteurs.find((entree) => entree.id === props.secteurCourant.id),
)

const station = computed(() => secteur.value?.stationPrincipale ?? null)

const carburantManquant = computed(() => props.vaisseau.carburantMax - props.ressources.carburant)

const coutRavitaillementComplet = computed(() => {
  const coutUnitaire = station.value?.economie?.coutCarburantParUnite ?? 1
  return Math.max(0, carburantManquant.value) * coutUnitaire
})

const tauxTaxe = computed(() => calculerTauxTaxePourSecurite(secteur.value?.securite ?? 1))

const taxeLocalePourcent = computed(() => formaterPourcentageTaxe(tauxTaxe.value))

const coursLocaux = computed(() => calculerCoursLocauxPourStation(station.value))

const coutDroneMinier = computed(() => props.economie?.coutDroneMinier ?? 400)
</script>

<template>
  <section class="panel station-services-panel" v-if="station">
    <div class="station-services-header">
      <h2>⌘ Services de station</h2>
      <p class="station-services-subtitle">{{ station.nom }} — {{ station.type }}</p>
    </div>

    <template v-if="positionLocale !== 'station'">
      <div class="station-service-card station-service-card-commerce">
        <div class="station-service-card-header">
          <h3>Accès indisponible</h3>
          <span class="station-service-badge">Hors station</span>
        </div>

        <p class="station-service-description">
          Les services de station ne sont accessibles qu’une fois revenu et amarré à la station
          locale.
        </p>

        <div class="action-group">
          <button @click="emit('retour-station')">Retourner à la station</button>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="station-mode-tabs">
        <button
          v-if="station.services.commerce"
          :class="{ 'is-active': sousModeStation === 'commerce' }"
          @click="emit('changer-sous-mode-station', 'commerce')"
        >
          Commerce
        </button>

        <button
          v-if="station.services.ravitaillement"
          :class="{ 'is-active': sousModeStation === 'ravitaillement' }"
          @click="emit('changer-sous-mode-station', 'ravitaillement')"
        >
          Ravitaillement
        </button>

        <button
          v-if="station.services.atelier"
          :class="{ 'is-active': sousModeStation === 'atelier' }"
          @click="emit('changer-sous-mode-station', 'atelier')"
        >
          Atelier
        </button>
      </div>

      <div
        v-if="sousModeStation === 'commerce'"
        class="station-service-card station-service-card-commerce"
      >
        <div class="station-service-card-header">
          <h3>¤ Commerce local</h3>
          <span class="station-service-badge">Actif</span>
        </div>

        <div class="station-service-grid">
          <div class="station-service-metric">
            <span class="station-service-label">Service commercial</span>
            <strong>Disponible</strong>
          </div>

          <div class="station-service-metric">
            <span class="station-service-label">Taxe locale</span>
            <strong>{{ taxeLocalePourcent }}</strong>
          </div>
        </div>

        <p class="station-service-description">
          Les cours ci-dessous représentent les prix locaux bruts par unité. La taxe locale
          s’applique une seule fois, sur le montant brut total de la transaction.
        </p>

        <div class="market-rate-grid market-rate-grid-three-cols">
          <div v-for="minerai in coursLocaux" :key="minerai.id" class="market-rate-item">
            <span class="market-rate-name">
              <span class="resource-icon">{{ minerai.icone }}</span>
              {{ minerai.abreviation }}
            </span>

            <span
              class="market-rate-variation"
              :class="{
                'market-rate-variation-up': minerai.variation === 'hausse',
                'market-rate-variation-down': minerai.variation === 'baisse',
                'market-rate-variation-stable': minerai.variation === 'stable',
              }"
            >
              {{ minerai.variationSymbole }}
            </span>

            <span class="market-rate-values"> {{ minerai.prixBrut }} cr </span>

            <span class="market-rate-average"> (moy. {{ minerai.prixMoyen }} cr) </span>
          </div>
        </div>

        <p class="market-rate-legend">
          Affichage : cours local brut par unité, comparé au cours moyen
        </p>

        <div class="action-group">
          <button @click="emit('vendre')">Vendre la cargaison</button>
        </div>
      </div>

      <div
        v-else-if="sousModeStation === 'ravitaillement'"
        class="station-service-card station-service-card-fuel"
      >
        <div class="station-service-card-header">
          <h3>⛽ Ravitaillement</h3>
          <span class="station-service-badge">Actif</span>
        </div>

        <div class="station-service-grid">
          <div class="station-service-metric">
            <span class="station-service-label">Carburant actuel</span>
            <strong>{{ ressources.carburant }} / {{ vaisseau.carburantMax }}</strong>
          </div>

          <div class="station-service-metric">
            <span class="station-service-label">Carburant manquant</span>
            <strong>{{ carburantManquant }}</strong>
          </div>

          <div class="station-service-metric">
            <span class="station-service-label">Coût du plein</span>
            <strong>{{ coutRavitaillementComplet }} crédits</strong>
          </div>
        </div>

        <p class="station-service-description">
          Recharge du réservoir principal au tarif local de la station.
        </p>

        <div class="action-group">
          <button @click="emit('ravitailler')">Ravitailler le vaisseau</button>
        </div>
      </div>

      <div
        v-else-if="sousModeStation === 'atelier'"
        class="station-service-card station-service-card-workshop"
      >
        <div class="station-service-card-header">
          <h3>⚙ Atelier technique</h3>
          <span class="station-service-badge">Actif</span>
        </div>

        <div class="station-service-grid">
          <div class="station-service-metric">
            <span class="station-service-label">Service atelier</span>
            <strong>Disponible</strong>
          </div>

          <div class="station-service-metric">
            <span class="station-service-label">Capacité</span>
            <strong>Maintenance légère</strong>
          </div>
        </div>

        <p class="station-service-description">
          Accès aux améliorations du vaisseau et à l’acquisition de drones miniers.
        </p>

        <div class="action-group">
          <div class="station-service-metric">
            <span class="station-service-label">Drone minier</span>
            <strong>{{ coutDroneMinier }} crédits / unité</strong>
          </div>
          <button @click="emit('acheter-drone')">
            Acheter un drone minier — {{ coutDroneMinier }} crédits
          </button>
        </div>

        <div class="station-upgrade-shell">
          <slot name="atelier" />
        </div>
      </div>
    </template>
  </section>
</template>
