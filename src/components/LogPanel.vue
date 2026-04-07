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

function normaliserNiveau(niveau) {
  if (niveau === 'info') return 'info'
  if (niveau === 'succes') return 'succes'
  if (niveau === 'alerte') return 'alerte'
  if (niveau === 'critique') return 'critique'
  return 'standard'
}

function libelleNiveau(niveau) {
  const niveauNormalise = normaliserNiveau(niveau)

  if (niveauNormalise === 'info') return 'INFO'
  if (niveauNormalise === 'succes') return 'SUCCÈS'
  if (niveauNormalise === 'alerte') return 'ALERTE'
  if (niveauNormalise === 'critique') return 'CRITIQUE'
  return 'STANDARD'
}

function classeNiveau(niveau) {
  const niveauNormalise = normaliserNiveau(niveau)
  return `log-entry-${niveauNormalise}`
}

function classeTagNiveau(niveau) {
  const niveauNormalise = normaliserNiveau(niveau)
  return `log-tag-${niveauNormalise}`
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
            :class="classeNiveau(entree.niveau)"
          >
            <span class="log-timestamp">{{ entree.horodatage }}</span>
            <span class="log-tag" :class="classeTagNiveau(entree.niveau)">
              {{ libelleNiveau(entree.niveau) }}
            </span>
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
            :class="classeNiveau(entree.niveau)"
          >
            <span class="log-timestamp">{{ entree.horodatage }}</span>
            <span class="log-tag" :class="classeTagNiveau(entree.niveau)">
              {{ libelleNiveau(entree.niveau) }}
            </span>
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
          <li
            v-for="(entree, index) in entrees.filter(filtrerParCategorie('combat'))"
            :key="`cmb-${index}`"
            :class="classeNiveau(entree.niveau)"
          >
            <span class="log-timestamp">{{ entree.horodatage }}</span>
            <span class="log-tag" :class="classeTagNiveau(entree.niveau)">
              {{ libelleNiveau(entree.niveau) }}
            </span>
            <span class="log-message">{{ entree.message }}</span>
          </li>
          <li
            v-if="entrees.filter(filtrerParCategorie('combat')).length === 0"
            class="log-placeholder"
          >
            Aucun contact hostile détecté.
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>
