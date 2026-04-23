<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
    player: {
        type: Object,
        default: () => ({}),
    },
    credits: {
        type: Number,
        default: 0,
    },
})

const emit = defineEmits(['renommer-pilote'])

const modeEditionNom = ref(false)
const identiteBrouillon = ref('')

const identiteAffichee = computed(() => props.player?.identite || 'Sans indicatif')

const statutEconomique = computed(() => {
    const credits = Number(props.credits) || 0

    if (credits >= 20000000) return 'VII — Consortium privé'
    if (credits >= 5000000) return 'VI — Armateur privé'
    if (credits >= 1000000) return 'V — Magnat local'
    if (credits >= 250000) return 'IV — Exploitant'
    if (credits >= 50000) return 'III — Opérateur'
    if (credits >= 10000) return 'II — Freelancer'
    return 'I — Indépendant'
})

const reputationAffichee = computed(() => props.player?.reputation || 'I — Neutre')

watch(
    () => props.player?.identite,
    (nouvelleIdentite) => {
        identiteBrouillon.value = nouvelleIdentite || 'Sans indicatif'
    },
    { immediate: true },
)

function activerEditionNom() {
    identiteBrouillon.value = identiteAffichee.value
    modeEditionNom.value = true
}

function validerEditionNom() {
    const valeurNettoyee = (identiteBrouillon.value || '').trim()
    emit('renommer-pilote', valeurNettoyee || 'Sans indicatif')
    modeEditionNom.value = false
}

function annulerEditionNom() {
    identiteBrouillon.value = identiteAffichee.value
    modeEditionNom.value = false
}
</script>

<template>
    <section class="panel player-panel">
        <div class="player-panel-header">
            <h2>◉ Pilote</h2>

            <span class="player-panel-badge">
        {{ statutEconomique }}
      </span>
        </div>

        <div class="player-panel-grid">
            <div class="player-panel-card">
                <div class="player-panel-line-header">
                    <span class="player-panel-label">Identité</span>

                    <button
                        v-if="!modeEditionNom"
                        type="button"
                        class="player-panel-edit-button"
                        @click="activerEditionNom"
                        aria-label="Modifier l'identité du pilote"
                        title="Modifier l'identité du pilote"
                    >
                        ✎
                    </button>
                </div>

                <div v-if="modeEditionNom" class="player-panel-edit-row">
                    <input
                        v-model="identiteBrouillon"
                        type="text"
                        maxlength="40"
                        class="player-panel-input"
                        @keydown.enter.prevent="validerEditionNom"
                        @keydown.esc.prevent="annulerEditionNom"
                        @blur="validerEditionNom"
                    />
                </div>

                <strong v-else class="player-panel-value">
                    {{ identiteAffichee }}
                </strong>
            </div>

            <div class="player-panel-card">
                <span class="player-panel-label">Réputation</span>
                <strong class="player-panel-value">
                    {{ reputationAffichee }}
                </strong>
            </div>

            <div class="player-panel-card">
                <span class="player-panel-label">Fortune</span>
                <strong class="player-panel-value">
                    {{ credits }} crédits
                </strong>
            </div>
        </div>
    </section>
</template>