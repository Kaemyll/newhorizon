<script setup>
import { donneesMinerais } from '../game/dataMinerais'

defineProps({
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
</script>

<template>
    <section class="panel">
        <h2>◈ Ressources</h2>

        <h3>Contenu minéral de la soute</h3>
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