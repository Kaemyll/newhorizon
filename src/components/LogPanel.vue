<script setup>
import { computed } from 'vue'

const props = defineProps({
  entrees: {
    type: Array,
    required: true,
  },
})

const logsEvenements = computed(() =>
  props.entrees.filter((entree) => entree.categorie === 'evenements'),
)

const logsCommerce = computed(() =>
  props.entrees.filter((entree) => entree.categorie === 'commerce'),
)

const logsCombat = computed(() => props.entrees.filter((entree) => entree.categorie === 'combat'))
</script>

<template>
  <section class="journal-footer">
    <div class="journal-footer-header">
      <h2>Journal de Bord</h2>
    </div>

    <div class="journal-shell">
      <div class="journal-column">
        <h3 class="journal-title">✦ Événements</h3>
        <ul class="log-list">
          <li v-for="(entree, index) in logsEvenements" :key="`evt-${index}`">
            <span class="log-timestamp">{{ entree.horodatage }}</span>
            <span class="log-message">{{ entree.message }}</span>
          </li>
        </ul>
      </div>

      <div class="journal-column">
        <h3 class="journal-title">¤ Commerce</h3>
        <ul class="log-list">
          <li v-for="(entree, index) in logsCommerce" :key="`com-${index}`">
            <span class="log-timestamp">{{ entree.horodatage }}</span>
            <span class="log-message">{{ entree.message }}</span>
          </li>
        </ul>
      </div>

      <div class="journal-column">
        <h3 class="journal-title">⚠ Combat</h3>
        <ul class="log-list">
          <li v-if="logsCombat.length === 0" class="log-placeholder">
            <span class="log-message">Aucune activité de combat.</span>
          </li>
          <li v-for="(entree, index) in logsCombat" :key="`cmb-${index}`">
            <span class="log-timestamp">{{ entree.horodatage }}</span>
            <span class="log-message">{{ entree.message }}</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
