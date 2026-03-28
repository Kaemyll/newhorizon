<script setup>
import { computed } from 'vue'
import { donneesMinerais } from '../game/dataMinerais'
import { donneesSecteurs } from '../game/dataSecteurs'
import { calculerValeurCargaisonPourStation } from '../game/systemeCommerce'

const props = defineProps({
  ressources: {
    type: Object,
    required: true,
  },
  vaisseau: {
    type: Object,
    required: true,
  },
  secteurCourant: {
    type: Object,
    required: true,
  },
})

const totalMineraisEmbarques = computed(() =>
  Object.values(props.ressources.minerais || {}).reduce((total, quantite) => total + quantite, 0),
)

const secteur = computed(() =>
  donneesSecteurs.find((entree) => entree.id === props.secteurCourant.id),
)

const stationCourante = computed(() => secteur.value?.stationPrincipale ?? null)

const estimationCargaison = computed(() => {
  if (!stationCourante.value || !secteur.value) {
    return {
      valeurBrute: 0,
      montantTaxe: 0,
      valeurNette: 0,
    }
  }

  return calculerValeurCargaisonPourStation(
    props.ressources.minerais,
    stationCourante.value,
    secteur.value.securite,
  )
})
</script>

<template>
  <section class="panel">
    <h2>◈ Ressources</h2>
    <p>Crédits : {{ ressources.credits }}</p>
    <p>Carburant : {{ ressources.carburant }} / {{ vaisseau.carburantMax }}</p>
    <p>Total embarqué : {{ totalMineraisEmbarques }} / {{ vaisseau.souteMax }}</p>
    <p>Valeur brute estimée : {{ estimationCargaison.valeurBrute }} crédits</p>
    <p>Valeur nette estimée : {{ estimationCargaison.valeurNette }} crédits</p>

    <h3>Minerais en soute</h3>
    <ul class="resource-list resource-list-compact resource-list-mineraux">
      <li v-for="minerai in donneesMinerais" :key="minerai.id">
        <span class="resource-inline">
          <span class="resource-icon">{{ minerai.icone }}</span>
          <span class="resource-name">{{ minerai.abreviation }}</span>
        </span>
        <span class="resource-value">{{ ressources.minerais[minerai.id] || 0 }}</span>
      </li>
    </ul>
  </section>
</template>
