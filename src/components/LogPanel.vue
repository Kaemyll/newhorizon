<script setup>
defineProps({
  entrees: {
    type: Array,
    required: true,
  },
})

function filtrerParCategorie(categorie) {
  return (entree) => entree.categorie === categorie
}
</script>

<template>
  <section class="journal-footer">
    <header class="journal-footer-header">
      <h2>Journal de bord</h2>
    </header>

    <div class="journal-shell">
      <section class="journal-column">
        <h3 class="journal-title">Événements</h3>
        <ul class="log-list">
          <li
            v-for="(entree, index) in entrees.filter(filtrerParCategorie('evenements'))"
            :key="`evt-${index}`"
            :class="{
              'log-entry-critical': entree.niveau === 'critique',
            }"
          >
            <span class="log-timestamp">{{ entree.horodatage }}</span>
            <span class="log-message">{{ entree.message }}</span>
          </li>
          <li
            v-if="entrees.filter(filtrerParCategorie('evenements')).length === 0"
            class="log-placeholder"
          >
            Aucun événement enregistré.
          </li>
        </ul>
      </section>

      <section class="journal-column">
        <h3 class="journal-title">Commerce</h3>
        <ul class="log-list">
          <li
            v-for="(entree, index) in entrees.filter(filtrerParCategorie('commerce'))"
            :key="`com-${index}`"
            :class="{
              'log-entry-critical': entree.niveau === 'critique',
            }"
          >
            <span class="log-timestamp">{{ entree.horodatage }}</span>
            <span class="log-message">{{ entree.message }}</span>
          </li>
          <li
            v-if="entrees.filter(filtrerParCategorie('commerce')).length === 0"
            class="log-placeholder"
          >
            Aucune opération commerciale.
          </li>
        </ul>
      </section>

      <section class="journal-column">
        <h3 class="journal-title">Combat</h3>
        <ul class="log-list">
          <li class="log-placeholder">Aucun contact hostile détecté.</li>
        </ul>
      </section>
    </div>
  </section>
</template>
