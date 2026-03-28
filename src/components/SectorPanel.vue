<script setup>
import { computed } from 'vue'
import { donneesSecteurs } from '../game/donneesSecteurs'
import { donneesMinerais } from '../game/donneesMinerais'

const props = defineProps({
  secteurCourant: {
    type: Object,
    required: true,
  },
})

const secteur = computed(() =>
  donneesSecteurs.find((entree) => entree.id === props.secteurCourant.id),
)

const ressourcesLocales = computed(() => {
  if (!secteur.value?.repartitionMinerais) {
    return []
  }

  return secteur.value.repartitionMinerais
    .map((entree) => {
      const minerai = donneesMinerais.find((item) => item.id === entree.idMinerai)

      if (!minerai) {
        return null
      }

      return {
        ...minerai,
        poids: entree.poids,
      }
    })
    .filter(Boolean)
})

const libelleSecurite = computed(() => {
  const valeur = secteur.value?.securite

  if (valeur === 0) {
    return 'Null-Sec'
  }

  if (valeur >= 0.5) {
    return 'High-Sec'
  }

  return 'Low-Sec'
})
</script>

<template>
  <section class="panel" v-if="secteur">
    <h2>⌖ Secteur</h2>
    <p>Nom : {{ secteur.nom }}</p>
    <p>Type : {{ secteur.type }}</p>
    <p>Sécurité : {{ secteur.securite.toFixed(1) }} — {{ libelleSecurite }}</p>
    <p>Station principale : {{ secteur.stationPrincipale.nom }}</p>

    <h3>Ressources locales</h3>
    <ul class="resource-list resource-list-sector">
      <li v-for="minerai in ressourcesLocales" :key="minerai.id">
        <span class="resource-icon">{{ minerai.icone }}</span>
        <span class="resource-name">{{ minerai.nom }}</span>
        <span class="resource-weight">{{ minerai.poids }}</span>
      </li>
    </ul>

    <p class="sector-description">
      {{ secteur.description }}
    </p>
  </section>
</template>
