<script setup>
import { computed } from 'vue'
import { donneesMinerais } from '../game/dataMinerais'

const props = defineProps({
  ressources: {
    type: Object,
    required: true,
  },
  vaisseau: {
    type: Object,
    required: true,
  },
  industrie: {
    type: Object,
    required: true,
  },
  navigation: {
    type: Object,
    required: true,
  },
  positionLocale: {
    type: String,
    required: true,
  },
  exploration: {
    type: Object,
    required: true,
  },
  assistance: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits([
  'miner',
  'aller-operations',
  'retour-station',
  'deployer-drones',
  'rappeler-drones',
  'scanner',
])

const nbDeployes = computed(
  () => props.industrie.drones.filter((drone) => drone.etat === 'deploie').length,
)

const nbPrets = computed(
  () =>
    props.industrie.drones.filter(
      (drone) => drone.etat === 'embarque' && drone.ticksRechargeRestants === 0,
    ).length,
)

const nbEnRecharge = computed(
  () =>
    props.industrie.drones.filter(
      (drone) => drone.etat === 'embarque' && drone.ticksRechargeRestants > 0,
    ).length,
)

const badgeLocal = computed(() =>
  props.positionLocale === 'station'
    ? {
        icone: '⌂',
        titre: 'Amarré à la station',
        sousTitre: 'Services de station disponibles',
        classe: 'ops-local-badge-station',
      }
    : {
        icone: '✦',
        titre: 'Zone d’opérations',
        sousTitre: 'Extraction et scanner disponibles',
        classe: 'ops-local-badge-operations',
      },
)

const statutVol = computed(() =>
  props.navigation.enVoyage ? 'En transit inter-sectoriel' : 'Disponible localement',
)

const statutCanon = computed(() => {
  if ((props.vaisseau?.puissanceMiniere || 0) <= 0) return 'Aucun canon'
  if (props.navigation.enVoyage) return 'Indisponible'
  if (props.positionLocale !== 'operations') return 'Hors zone'
  return 'Prêt'
})

const rendementMinierLabel = computed(() => {
  const puissance = props.vaisseau?.puissanceMiniere || 0

  if (puissance >= 3) return '2 unités / action'
  if (puissance >= 2) return '1 à 2 unités / action'
  if (puissance >= 1) return '1 unité / action'
  return 'Aucun rendement'
})

const typeScannerLabel = computed(() => {
  const type = props.vaisseau?.scanner?.type || 'base'
  if (type === 'standard') return 'Module standard'
  if (type === 'avance') return 'Module avancé'
  return 'Module de base'
})

const qualiteScanLabel = computed(() => {
  const qualite = props.exploration?.siteActif?.qualiteScan
  if (qualite === 'bonne') return 'Bonne'
  if (qualite === 'moyenne') return 'Moyenne'
  if (qualite === 'faible') return 'Faible'
  return '—'
})

const qualiteScanClasse = computed(() => {
  const qualite = props.exploration?.siteActif?.qualiteScan
  if (qualite === 'bonne') return 'ops-badge-scan-bonne'
  if (qualite === 'moyenne') return 'ops-badge-scan-moyenne'
  if (qualite === 'faible') return 'ops-badge-scan-faible'
  return 'ops-badge-scan-neutre'
})

const reserveSiteLabel = computed(() => {
  const site = props.exploration?.siteActif
  if (!site) return '—'
  return `${site.reserveRestante} / ${site.reserveTotale}`
})

const compositionSiteLabel = computed(() => {
  const site = props.exploration?.siteActif
  if (!site) return 'Aucun amas actif'

  if (!site.composition || site.composition.length === 0) {
    return 'Aucune signature exploitable'
  }

  return site.composition
    .map((c) => donneesMinerais.find((m) => m.id === c.idMinerai)?.abreviation || c.idMinerai)
    .join(', ')
})

const nomSiteLabel = computed(() => props.exploration?.siteActif?.nom || 'Aucun amas actif')

const typeAmasLabel = computed(() => {
  const typeAmas = props.exploration?.siteActif?.typeAmas

  if (typeAmas === 'sterile') return 'Amas pauvre'
  if (typeAmas === 'mono') return 'Amas simple'
  if (typeAmas === 'double') return 'Amas mixte'
  if (typeAmas === 'triple') return 'Amas dense'
  return '—'
})

const statutOperationnel = computed(() => {
  if (props.assistance.remorquageEnCours) {
    return {
      niveau: 'critique',
      titre: 'Remorquage en cours',
      texte: `Retour automatique vers ${props.assistance.stationCibleNom} dans ${props.assistance.ticksRestants} tick(s).`,
    }
  }

  if (props.navigation.enVoyage) {
    return {
      niveau: 'info',
      titre: 'Transit inter-sectoriel',
      texte: 'Les opérations locales sont indisponibles pendant le trajet.',
    }
  }

  if (props.positionLocale === 'station') {
    return {
      niveau: 'standard',
      titre: 'À quai',
      texte: 'Services de station disponibles. Quittez la station pour scanner et miner.',
    }
  }

  if (props.vaisseau.soute >= props.vaisseau.souteMax) {
    return {
      niveau: 'alerte',
      titre: 'Soute pleine',
      texte: 'Extraction interrompue tant que la cargaison n’est pas déchargée.',
    }
  }

  if ((props.vaisseau?.puissanceMiniere || 0) <= 0) {
    return {
      niveau: 'info',
      titre: 'Vaisseau marchand',
      texte:
        'Ce châssis ne dispose pas de canon de minage. Privilégiez le transport et le commerce.',
    }
  }

  if (!props.exploration?.siteActif) {
    return {
      niveau: 'alerte',
      titre: 'Aucun amas actif',
      texte: 'Lancez un scan pour détecter un nouveau site exploitable.',
    }
  }

  return {
    niveau: 'succes',
    titre: 'Fenêtre d’exploitation ouverte',
    texte: 'Un amas actif est détecté. Le minage local peut reprendre.',
  }
})

const statutOperationnelClasse = computed(() => {
  const niveau = statutOperationnel.value.niveau
  if (niveau === 'critique') return 'ops-status-critical'
  if (niveau === 'alerte') return 'ops-status-warning'
  if (niveau === 'succes') return 'ops-status-success'
  if (niveau === 'info') return 'ops-status-info'
  return 'ops-status-standard'
})

const scannerDisponible = computed(
  () =>
    !props.navigation.enVoyage &&
    props.positionLocale === 'operations' &&
    !props.assistance.remorquageEnCours,
)

const minageDisponible = computed(
  () =>
    (props.vaisseau?.puissanceMiniere || 0) > 0 &&
    !props.navigation.enVoyage &&
    props.positionLocale === 'operations' &&
    !props.assistance.remorquageEnCours,
)

const deploiementDronesDisponible = computed(
  () =>
    !props.navigation.enVoyage &&
    props.positionLocale === 'operations' &&
    !props.assistance.remorquageEnCours,
)

const rappelDronesDisponible = computed(
  () => !props.navigation.enVoyage && !props.assistance.remorquageEnCours,
)

function decrireDrone(drone) {
  if (drone.etat === 'deploie') {
    return `Déployé — autonomie ${drone.autonomieRestante}/8`
  }

  if (drone.ticksRechargeRestants > 0) {
    return `Embarqué — recharge ${drone.ticksRechargeRestants} tick(s)`
  }

  return 'Embarqué — prêt'
}
</script>

<template>
  <section class="panel ops-panel ops-panel--enhanced">
    <div class="ops-header">
      <div>
        <h2>⌘ Opérations</h2>
        <p class="ops-subtitle">Console de bord locale du vaisseau</p>
      </div>

      <div class="ops-header-actions">
        <div class="ops-local-badge" :class="badgeLocal.classe">
          <span class="ops-local-badge-icon">{{ badgeLocal.icone }}</span>
          <div class="ops-local-badge-text">
            <strong>{{ badgeLocal.titre }}</strong>
            <span>{{ badgeLocal.sousTitre }}</span>
          </div>
        </div>

        <button
          v-if="positionLocale === 'station'"
          class="ops-context-button"
          :disabled="navigation.enVoyage || assistance.remorquageEnCours"
          @click="emit('aller-operations')"
        >
          Rejoindre la zone d’opérations
        </button>

        <button
          v-if="positionLocale === 'operations'"
          class="ops-context-button"
          :disabled="navigation.enVoyage || assistance.remorquageEnCours"
          @click="emit('retour-station')"
        >
          Retourner à la station
        </button>
      </div>
    </div>

    <section class="ops-status-banner" :class="statutOperationnelClasse">
      <div class="ops-status-banner-head">
        <span class="ops-status-dot"></span>
        <strong>{{ statutOperationnel.titre }}</strong>
      </div>
      <p>{{ statutOperationnel.texte }}</p>
    </section>

    <div class="ops-grid ops-grid--top">
      <section class="ops-block">
        <h3>Situation</h3>

        <div class="ops-metric-grid">
          <div class="ops-metric-card">
            <span class="ops-metric-label">Statut de vol</span>
            <strong>{{ statutVol }}</strong>
          </div>

          <div class="ops-metric-card">
            <span class="ops-metric-label">Soute</span>
            <strong>{{ vaisseau.soute }} / {{ vaisseau.souteMax }}</strong>
          </div>

          <div class="ops-metric-card">
            <span class="ops-metric-label">Carburant</span>
            <strong>{{ ressources.carburant }} / {{ vaisseau.carburantMax }}</strong>
          </div>

          <div class="ops-metric-card">
            <span class="ops-metric-label">Coque</span>
            <strong>{{ vaisseau.coque }} / {{ vaisseau.coqueMax }}</strong>
          </div>
        </div>
      </section>

      <section class="ops-block">
        <h3>Systèmes embarqués</h3>

        <div class="ops-system-list">
          <div class="ops-system-item">
            <span class="ops-system-name">Canon de minage</span>
            <span class="ops-system-value">{{ statutCanon }}</span>
          </div>

          <div class="ops-system-item">
            <span class="ops-system-name">Puissance minière</span>
            <span class="ops-system-value">{{ vaisseau.puissanceMiniere }}</span>
          </div>

          <div class="ops-system-item">
            <span class="ops-system-name">Rendement manuel</span>
            <span class="ops-system-value">{{ rendementMinierLabel }}</span>
          </div>

          <div class="ops-system-item">
            <span class="ops-system-name">Scanner</span>
            <span class="ops-system-value">{{ typeScannerLabel }}</span>
          </div>

          <div class="ops-system-item">
            <span class="ops-system-name">Baie à drones</span>
            <span class="ops-system-value">
              {{ industrie.drones.length }} / {{ vaisseau.dronesMiniersMax }}
            </span>
          </div>
        </div>
      </section>
    </div>

    <div class="ops-grid ops-grid--main">
      <section class="ops-block">
        <div class="ops-block-header">
          <h3>Exploitation</h3>
          <span v-if="exploration.siteActif" class="ops-badge-scan" :class="qualiteScanClasse">
            {{ qualiteScanLabel }}
          </span>
        </div>

        <div class="ops-system-list">
          <div class="ops-system-item">
            <span class="ops-system-name">Amas actif</span>
            <span class="ops-system-value">{{ nomSiteLabel }}</span>
          </div>

          <div class="ops-system-item">
            <span class="ops-system-name">Type d’amas</span>
            <span class="ops-system-value">{{ typeAmasLabel }}</span>
          </div>

          <div class="ops-system-item">
            <span class="ops-system-name">Réserve</span>
            <span class="ops-system-value">{{ reserveSiteLabel }}</span>
          </div>

          <div class="ops-system-item ops-system-item--multiline">
            <span class="ops-system-name">Composition</span>
            <span class="ops-system-value">{{ compositionSiteLabel }}</span>
          </div>
        </div>

        <div class="action-group action-group--inline">
          <button :disabled="!scannerDisponible" @click="emit('scanner')">Scanner un amas</button>

          <button :disabled="!minageDisponible" @click="emit('miner')">Miner manuellement</button>
        </div>
      </section>

      <section class="ops-block">
        <div class="ops-block-header">
          <h3>Drones</h3>
          <span class="ops-drone-summary">
            {{ nbDeployes }} déployé(s) · {{ nbPrets }} prêt(s) · {{ nbEnRecharge }} en recharge
          </span>
        </div>

        <div class="ops-drone-counters">
          <div class="ops-mini-counter">
            <span class="ops-mini-counter-label">Déployés</span>
            <strong>{{ nbDeployes }}</strong>
          </div>
          <div class="ops-mini-counter">
            <span class="ops-mini-counter-label">Prêts</span>
            <strong>{{ nbPrets }}</strong>
          </div>
          <div class="ops-mini-counter">
            <span class="ops-mini-counter-label">Recharge</span>
            <strong>{{ nbEnRecharge }}</strong>
          </div>
        </div>

        <div class="action-group action-group--inline">
          <button :disabled="!deploiementDronesDisponible" @click="emit('deployer-drones')">
            Déployer les drones
          </button>

          <button :disabled="!rappelDronesDisponible" @click="emit('rappeler-drones')">
            Rappeler les drones
          </button>
        </div>

        <ul v-if="industrie.drones.length > 0" class="drone-status-list">
          <li v-for="drone in industrie.drones" :key="drone.id">
            <span class="drone-status-name">Drone #{{ drone.id }}</span>
            <span class="drone-status-meta">{{ decrireDrone(drone) }}</span>
          </li>
        </ul>

        <p v-else class="panel-note">Aucun drone embarqué pour le moment.</p>
      </section>
    </div>

    <p class="panel-note">
      Le scanner peut détecter des amas pauvres, simples, mixtes ou denses. La qualité du relevé
      influence la réserve estimée et la composition du site.
    </p>
  </section>
</template>
