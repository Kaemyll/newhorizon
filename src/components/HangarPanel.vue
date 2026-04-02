<script setup>
import { computed } from 'vue'
import { donneesSecteurs } from '../game/dataSecteurs'
import { recupererCatalogueVaisseauxStation } from '../game/systemeVaisseaux'

const props = defineProps({
  secteurCourant: {
    type: Object,
    required: true,
  },
  vaisseauActifId: {
    type: String,
    required: true,
  },
  vaisseauxPossedes: {
    type: Array,
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
})

const emit = defineEmits(['changer-vaisseau', 'acheter-vaisseau'])

const secteur = computed(
  () => donneesSecteurs.find((entree) => entree.id === props.secteurCourant.id) || null,
)

const station = computed(() => secteur.value?.stationPrincipale ?? null)

const catalogueVaisseaux = computed(() =>
  recupererCatalogueVaisseauxStation(props.secteurCourant.id, {
    secteurCourant: props.secteurCourant,
    positionLocale: 'station',
    navigation: { enVoyage: false },
    ressources: props.ressources,
    vaisseauxPossedes: props.vaisseauxPossedes,
  }),
)

function roleLabel(role) {
  if (role === 'mineur_leger') return 'Mineur léger'
  if (role === 'mineur_lourd') return 'Mineur lourd'
  if (role === 'mineur_renforce') return 'Mineur renforcé'
  if (role === 'transporteur_marchand') return 'Transporteur marchand'
  return 'Châssis polyvalent'
}

function changementImpossible(vaisseauCible) {
  return props.vaisseau.soute > vaisseauCible.souteMax
}

function prixFormate(prix) {
  return `${prix} cr.`
}
</script>

<template>
  <section
    class="station-service-card station-service-card-hangar station-service-card--scrollable"
  >
    <div class="station-service-card-header">
      <h3>⌂ Hangar</h3>
      <span class="station-service-badge">Actif</span>
    </div>

    <p class="station-service-description">
      Le hangar regroupe vos châssis possédés. Le changement de vaisseau n’est possible qu’à quai et
      reste refusé si la soute actuelle dépasse la capacité du châssis cible.
    </p>

    <div class="station-service-grid">
      <div class="station-service-metric">
        <span class="station-service-label">Station</span>
        <strong>{{ station?.nom || '—' }}</strong>
      </div>

      <div class="station-service-metric">
        <span class="station-service-label">Vaisseaux possédés</span>
        <strong>{{ vaisseauxPossedes.length }}</strong>
      </div>

      <div class="station-service-metric">
        <span class="station-service-label">Vaisseau actif</span>
        <strong>{{ vaisseau.nom }}</strong>
      </div>

      <div class="station-service-metric">
        <span class="station-service-label">Crédits disponibles</span>
        <strong>{{ ressources.credits }} cr.</strong>
      </div>
    </div>

    <div class="hangar-section">
      <h4>Vaisseaux possédés</h4>

      <div class="hangar-ship-list">
        <article v-for="ship in vaisseauxPossedes" :key="ship.id" class="hangar-ship-card">
          <div class="hangar-ship-card-head">
            <div>
              <strong>{{ ship.nom }}</strong>
              <p class="hangar-ship-meta">{{ roleLabel(ship.role) }}</p>
            </div>

            <span v-if="ship.id === vaisseauActifId" class="hangar-ship-badge">Actif</span>
          </div>

          <div class="hangar-ship-stats">
            <p>
              <span>Soute</span><strong>{{ ship.souteMax }}</strong>
            </p>
            <p>
              <span>Canon</span><strong>{{ ship.puissanceMiniere }}</strong>
            </p>
            <p>
              <span>Drones</span><strong>{{ ship.dronesMiniersMax }}</strong>
            </p>
            <p>
              <span>Carburant</span><strong>{{ ship.carburantMax }}</strong>
            </p>
          </div>

          <p
            v-if="ship.id !== vaisseauActifId && changementImpossible(ship)"
            class="panel-note panel-note-warning"
          >
            Soute actuelle trop chargée pour ce châssis.
          </p>

          <div class="action-group">
            <button
              v-if="ship.id !== vaisseauActifId"
              :disabled="changementImpossible(ship)"
              @click="emit('changer-vaisseau', ship.id)"
            >
              Activer
            </button>
          </div>
        </article>
      </div>
    </div>

    <div v-if="catalogueVaisseaux.length > 0" class="hangar-section">
      <h4>Marchand de vaisseaux</h4>

      <div class="hangar-ship-list">
        <article
          v-for="modele in catalogueVaisseaux"
          :key="modele.id"
          class="hangar-ship-card hangar-ship-card--vendor"
        >
          <div class="hangar-ship-card-head">
            <div>
              <strong>{{ modele.nom }}</strong>
              <p class="hangar-ship-meta">{{ roleLabel(modele.role) }}</p>
            </div>

            <span class="hangar-ship-price">{{ prixFormate(modele.prix) }}</span>
          </div>

          <p class="station-service-description">{{ modele.description }}</p>

          <div class="hangar-ship-stats">
            <p>
              <span>Soute</span><strong>{{ modele.souteMax }}</strong>
            </p>
            <p>
              <span>Canon</span><strong>{{ modele.puissanceMiniere }}</strong>
            </p>
            <p>
              <span>Drones</span><strong>{{ modele.dronesMiniersMax }}</strong>
            </p>
            <p>
              <span>Carburant</span><strong>{{ modele.carburantMax }}</strong>
            </p>
          </div>

          <div class="action-group">
            <button
              :disabled="modele.dejaPossede || ressources.credits < modele.prix"
              @click="emit('acheter-vaisseau', modele.id)"
            >
              {{
                modele.dejaPossede
                  ? 'Déjà possédé'
                  : ressources.credits < modele.prix
                    ? 'Crédits insuffisants'
                    : 'Acheter'
              }}
            </button>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
