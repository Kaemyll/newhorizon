<script setup>
import { computed, watch } from "vue";
import { donneesSecteurs } from "../game/dataSecteurs";
import { donneesTrajets } from "../game/dataTrajets";

let contexteAudioVoyage = null;
let tentativeDepartVoyage = false;
let minuterieTentativeDepartVoyage = null;
let sonDepartVoyageJoue = false;
let dernierTickPulseVoyage = null;

const props = defineProps({
  secteurCourantId: {
    type: String,
    required: true,
  },
  navigation: {
    type: Object,
    required: true,
  },
  positionLocale: {
    type: String,
    default: "station",
  },
  modeActif: {
    type: String,
    default: "station",
  },
});

const emit = defineEmits(["selectionner-destination", "voyager"]);

const secteurCourant = computed(() =>
  donneesSecteurs.find((secteur) => secteur.id === props.secteurCourantId),
);

const secteurDestinationActive = computed(() =>
  donneesSecteurs.find(
    (secteur) => secteur.id === props.navigation.secteurDestinationId,
  ),
);

const autresSecteurs = computed(() =>
  donneesSecteurs.filter((secteur) => secteur.id !== props.secteurCourantId),
);

const trajetSelectionne = computed(() =>
  donneesTrajets.find(
    (trajet) =>
      trajet.origine === props.secteurCourantId &&
      trajet.destination === props.navigation.destinationSelectionneeId,
  ),
);

const trajetActif = computed(() =>
  donneesTrajets.find(
    (trajet) =>
      trajet.origine === props.secteurCourantId &&
      trajet.destination === props.navigation.secteurDestinationId,
  ),
);

const estModeNavigationActif = computed(() => props.modeActif === "navigation");

const classesNavigationPanel = computed(() => ({
  "navigation-panel--active": estModeNavigationActif.value,
  "navigation-panel--in-transit": props.navigation.enVoyage,
  "navigation-panel--operations-context":
    props.positionLocale === "operations" && !props.navigation.enVoyage,
  "navigation-panel--station-context":
    props.positionLocale === "station" && !props.navigation.enVoyage,
}));

const libellePosition = computed(() =>
  props.positionLocale === "operations" ? "Zone d’opérations" : "Station",
);

const classePastillePosition = computed(() =>
  props.positionLocale === "operations"
    ? "ui-state-pill ui-state-warning navigation-context-pill"
    : "ui-state-pill ui-state-neutral navigation-context-pill",
);

const statutNavigation = computed(() => {
  if (props.navigation.enVoyage) {
    return {
      libelle: "En transit",
      classe: "ui-state-pill ui-state-info navigation-status-pill",
    };
  }

  if (estModeNavigationActif.value) {
    return {
      libelle: "Console active",
      classe: "ui-state-pill ui-state-success navigation-status-pill",
    };
  }

  return {
    libelle: "Prêt au départ",
    classe: "ui-state-pill ui-state-neutral navigation-status-pill",
  };
});

const progressionTransit = computed(() => {
  const dureeTotale = Number(trajetActif.value?.tempsTrajet || 0);
  const ticksRestants = Number(props.navigation.ticksRestants || 0);

  if (!props.navigation.enVoyage || dureeTotale <= 0) {
    return 0;
  }

  const progression = ((dureeTotale - ticksRestants) / dureeTotale) * 100;
  return Math.min(100, Math.max(0, progression));
});

const styleProgressionTransit = computed(() => ({
  "--navigation-transit-progress": `${progressionTransit.value}%`,
}));

function recupererContexteAudioVoyage() {
  if (typeof window === "undefined") {
    return null;
  }

  const AudioContextClasse = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClasse) {
    return null;
  }

  if (!contexteAudioVoyage || contexteAudioVoyage.state === "closed") {
    contexteAudioVoyage = new AudioContextClasse();
  }

  if (contexteAudioVoyage.state === "suspended") {
    contexteAudioVoyage.resume();
  }

  return contexteAudioVoyage;
}

function jouerSonDepartVoyage() {
  const contexte = recupererContexteAudioVoyage();

  if (!contexte) {
    return;
  }

  const maintenant = contexte.currentTime;
  const duree = 0.68;

  const gainSortie = contexte.createGain();
  gainSortie.gain.setValueAtTime(0.52, maintenant);
  gainSortie.connect(contexte.destination);

  const oscillateurGrave = contexte.createOscillator();
  oscillateurGrave.type = "sawtooth";
  oscillateurGrave.frequency.setValueAtTime(168, maintenant);
  oscillateurGrave.frequency.exponentialRampToValueAtTime(
    72,
    maintenant + 0.42,
  );
  oscillateurGrave.frequency.exponentialRampToValueAtTime(
    58,
    maintenant + duree,
  );

  const oscillateurHarmonique = contexte.createOscillator();
  oscillateurHarmonique.type = "sawtooth";
  oscillateurHarmonique.frequency.setValueAtTime(520, maintenant);
  oscillateurHarmonique.frequency.exponentialRampToValueAtTime(
    260,
    maintenant + 0.3,
  );
  oscillateurHarmonique.frequency.exponentialRampToValueAtTime(
    190,
    maintenant + duree,
  );

  const filtre = contexte.createBiquadFilter();
  filtre.type = "lowpass";
  filtre.frequency.setValueAtTime(1600, maintenant);
  filtre.frequency.exponentialRampToValueAtTime(520, maintenant + 0.38);
  filtre.frequency.exponentialRampToValueAtTime(360, maintenant + duree);
  filtre.Q.setValueAtTime(1.35, maintenant);

  const gainGrave = contexte.createGain();
  gainGrave.gain.setValueAtTime(0.0001, maintenant);
  gainGrave.gain.exponentialRampToValueAtTime(0.08, maintenant + 0.025);
  gainGrave.gain.linearRampToValueAtTime(0.06, maintenant + 0.24);
  gainGrave.gain.exponentialRampToValueAtTime(0.0001, maintenant + duree);

  const gainHarmonique = contexte.createGain();
  gainHarmonique.gain.setValueAtTime(0.0001, maintenant);
  gainHarmonique.gain.exponentialRampToValueAtTime(0.028, maintenant + 0.018);
  gainHarmonique.gain.linearRampToValueAtTime(0.018, maintenant + 0.16);
  gainHarmonique.gain.exponentialRampToValueAtTime(0.0001, maintenant + 0.48);

  oscillateurGrave.connect(gainGrave);
  oscillateurHarmonique.connect(gainHarmonique);
  gainGrave.connect(filtre);
  gainHarmonique.connect(filtre);
  filtre.connect(gainSortie);

  oscillateurGrave.start(maintenant);
  oscillateurHarmonique.start(maintenant);
  oscillateurGrave.stop(maintenant + duree + 0.03);
  oscillateurHarmonique.stop(maintenant + 0.52);
}

function jouerSonArriveeVoyage() {
  const contexte = recupererContexteAudioVoyage();

  if (!contexte) {
    return;
  }

  const maintenant = contexte.currentTime;
  const duree = 0.72;

  const gainSortie = contexte.createGain();
  gainSortie.gain.setValueAtTime(0.42, maintenant);
  gainSortie.connect(contexte.destination);

  const oscillateurBulle = contexte.createOscillator();
  oscillateurBulle.type = "sine";
  oscillateurBulle.frequency.setValueAtTime(180, maintenant);
  oscillateurBulle.frequency.exponentialRampToValueAtTime(
    360,
    maintenant + 0.12,
  );
  oscillateurBulle.frequency.exponentialRampToValueAtTime(
    210,
    maintenant + duree,
  );

  const gainBulle = contexte.createGain();
  gainBulle.gain.setValueAtTime(0.0001, maintenant);
  gainBulle.gain.exponentialRampToValueAtTime(0.052, maintenant + 0.025);
  gainBulle.gain.exponentialRampToValueAtTime(0.024, maintenant + 0.16);
  gainBulle.gain.exponentialRampToValueAtTime(0.006, maintenant + 0.42);
  gainBulle.gain.exponentialRampToValueAtTime(0.0001, maintenant + duree);

  const filtreBulle = contexte.createBiquadFilter();
  filtreBulle.type = "lowpass";
  filtreBulle.frequency.setValueAtTime(900, maintenant);
  filtreBulle.frequency.exponentialRampToValueAtTime(420, maintenant + duree);
  filtreBulle.Q.setValueAtTime(0.9, maintenant);

  const oscillateurReflet = contexte.createOscillator();
  oscillateurReflet.type = "triangle";
  oscillateurReflet.frequency.setValueAtTime(620, maintenant + 0.04);
  oscillateurReflet.frequency.exponentialRampToValueAtTime(
    380,
    maintenant + 0.48,
  );

  const gainReflet = contexte.createGain();
  gainReflet.gain.setValueAtTime(0.0001, maintenant + 0.04);
  gainReflet.gain.exponentialRampToValueAtTime(0.015, maintenant + 0.08);
  gainReflet.gain.exponentialRampToValueAtTime(0.005, maintenant + 0.26);
  gainReflet.gain.exponentialRampToValueAtTime(0.0001, maintenant + 0.52);

  const filtreReflet = contexte.createBiquadFilter();
  filtreReflet.type = "bandpass";
  filtreReflet.frequency.setValueAtTime(520, maintenant + 0.04);
  filtreReflet.frequency.exponentialRampToValueAtTime(300, maintenant + 0.52);
  filtreReflet.Q.setValueAtTime(1.4, maintenant + 0.04);

  const bruitBuffer = contexte.createBuffer(
    1,
    contexte.sampleRate * duree,
    contexte.sampleRate,
  );
  const donneesBruit = bruitBuffer.getChannelData(0);

  for (let i = 0; i < donneesBruit.length; i += 1) {
    const progression = i / donneesBruit.length;
    const enveloppe =
      Math.sin(Math.PI * progression) * Math.pow(1 - progression, 1.4);
    donneesBruit[i] = (Math.random() * 2 - 1) * enveloppe;
  }

  const bruit = contexte.createBufferSource();
  bruit.buffer = bruitBuffer;

  const filtreBruit = contexte.createBiquadFilter();
  filtreBruit.type = "lowpass";
  filtreBruit.frequency.setValueAtTime(1450, maintenant);
  filtreBruit.frequency.exponentialRampToValueAtTime(380, maintenant + duree);
  filtreBruit.Q.setValueAtTime(0.65, maintenant);

  const gainBruit = contexte.createGain();
  gainBruit.gain.setValueAtTime(0.0001, maintenant);
  gainBruit.gain.exponentialRampToValueAtTime(0.03, maintenant + 0.035);
  gainBruit.gain.exponentialRampToValueAtTime(0.012, maintenant + 0.18);
  gainBruit.gain.exponentialRampToValueAtTime(0.002, maintenant + 0.52);
  gainBruit.gain.exponentialRampToValueAtTime(0.0001, maintenant + duree);

  oscillateurBulle.connect(filtreBulle);
  filtreBulle.connect(gainBulle);
  gainBulle.connect(gainSortie);

  oscillateurReflet.connect(filtreReflet);
  filtreReflet.connect(gainReflet);
  gainReflet.connect(gainSortie);

  bruit.connect(filtreBruit);
  filtreBruit.connect(gainBruit);
  gainBruit.connect(gainSortie);

  oscillateurBulle.start(maintenant);
  oscillateurReflet.start(maintenant + 0.04);
  bruit.start(maintenant);

  oscillateurBulle.stop(maintenant + duree + 0.03);
  oscillateurReflet.stop(maintenant + 0.54);
  bruit.stop(maintenant + duree);
}

function jouerPulseTransitVoyage() {
  const contexte = recupererContexteAudioVoyage();

  if (!contexte) {
    return;
  }

  const maintenant = contexte.currentTime;
  const duree = 0.24;

  const gainSortie = contexte.createGain();
  gainSortie.gain.setValueAtTime(0.34, maintenant);
  gainSortie.connect(contexte.destination);

  const oscillateurGrave = contexte.createOscillator();
  oscillateurGrave.type = "sine";
  oscillateurGrave.frequency.setValueAtTime(132, maintenant);
  oscillateurGrave.frequency.exponentialRampToValueAtTime(
    108,
    maintenant + duree,
  );

  const oscillateurTexture = contexte.createOscillator();
  oscillateurTexture.type = "triangle";
  oscillateurTexture.frequency.setValueAtTime(260, maintenant);
  oscillateurTexture.frequency.exponentialRampToValueAtTime(
    190,
    maintenant + duree,
  );

  const filtre = contexte.createBiquadFilter();
  filtre.type = "lowpass";
  filtre.frequency.setValueAtTime(720, maintenant);
  filtre.frequency.exponentialRampToValueAtTime(360, maintenant + duree);
  filtre.Q.setValueAtTime(0.85, maintenant);

  const gainGrave = contexte.createGain();
  gainGrave.gain.setValueAtTime(0.0001, maintenant);
  gainGrave.gain.exponentialRampToValueAtTime(0.072, maintenant + 0.018);
  gainGrave.gain.linearRampToValueAtTime(0.038, maintenant + 0.09);
  gainGrave.gain.exponentialRampToValueAtTime(0.0001, maintenant + duree);

  const gainTexture = contexte.createGain();
  gainTexture.gain.setValueAtTime(0.0001, maintenant);
  gainTexture.gain.exponentialRampToValueAtTime(0.024, maintenant + 0.024);
  gainTexture.gain.linearRampToValueAtTime(0.012, maintenant + 0.08);
  gainTexture.gain.exponentialRampToValueAtTime(0.0001, maintenant + 0.18);

  oscillateurGrave.connect(gainGrave);
  oscillateurTexture.connect(gainTexture);

  gainGrave.connect(filtre);
  gainTexture.connect(filtre);

  filtre.connect(gainSortie);

  oscillateurGrave.start(maintenant);
  oscillateurTexture.start(maintenant);

  oscillateurGrave.stop(maintenant + duree + 0.03);
  oscillateurTexture.stop(maintenant + 0.2);
}

function declencherVoyage() {
  tentativeDepartVoyage = true;

  if (minuterieTentativeDepartVoyage) {
    clearTimeout(minuterieTentativeDepartVoyage);
  }

  if (typeof window !== "undefined") {
    minuterieTentativeDepartVoyage = window.setTimeout(() => {
      tentativeDepartVoyage = false;
      minuterieTentativeDepartVoyage = null;
    }, 500);
  }

  emit("voyager");
}

watch(
  () => props.navigation.enVoyage,
  (enVoyage, etaitEnVoyage) => {
    if (
      enVoyage &&
      !etaitEnVoyage &&
      tentativeDepartVoyage &&
      !sonDepartVoyageJoue
    ) {
      jouerSonDepartVoyage();
      sonDepartVoyageJoue = true;
      dernierTickPulseVoyage = props.navigation.ticksRestants;
      tentativeDepartVoyage = false;

      if (minuterieTentativeDepartVoyage) {
        clearTimeout(minuterieTentativeDepartVoyage);
        minuterieTentativeDepartVoyage = null;
      }

      return;
    }

    if (!enVoyage && etaitEnVoyage && sonDepartVoyageJoue) {
      jouerSonArriveeVoyage();
      sonDepartVoyageJoue = false;
      dernierTickPulseVoyage = null;
    }
  },
);

watch(
  () => props.navigation.ticksRestants,
  (ticksRestants, anciensTicksRestants) => {
    if (!props.navigation.enVoyage || !sonDepartVoyageJoue) {
      return;
    }

    if (
      anciensTicksRestants === undefined ||
      ticksRestants === anciensTicksRestants ||
      ticksRestants === dernierTickPulseVoyage
    ) {
      return;
    }

    if (ticksRestants > 0 && ticksRestants < anciensTicksRestants) {
      jouerPulseTransitVoyage();
      dernierTickPulseVoyage = ticksRestants;
    }
  },
);
</script>

<template>
  <section :class="['panel', 'navigation-panel', classesNavigationPanel]">
    <div class="navigation-panel-header">
      <h2>⟁ Navigation</h2>

      <div class="navigation-panel-badges">
        <span :class="classePastillePosition">{{ libellePosition }}</span>
        <span :class="statutNavigation.classe">{{
          statutNavigation.libelle
        }}</span>
      </div>
    </div>

    <div class="navigation-panel-body">
      <p>Secteur actuel : {{ secteurCourant?.nom }}</p>

      <template v-if="navigation.enVoyage">
        <div
          class="navigation-transit-visual"
          :style="styleProgressionTransit"
          aria-hidden="true"
        >
          <div class="navigation-transit-stars"></div>
          <div class="navigation-transit-track">
            <span
              class="navigation-transit-node navigation-transit-node--origin"
            ></span>
            <span class="navigation-transit-line"></span>
            <span class="navigation-transit-progress"></span>
            <span class="navigation-transit-pulse"></span>
            <span
              class="navigation-transit-node navigation-transit-node--destination"
            ></span>
          </div>
        </div>

        <p>Destination : {{ secteurDestinationActive?.nom }}</p>
        <p>Temps restant : {{ navigation.ticksRestants }} ticks</p>
        <p class="navigation-status">Transit inter-sectoriel en cours.</p>
      </template>

      <template v-else>
        <div class="navigation-destination-row">
          <label
            class="navigation-label navigation-label--inline"
            for="destination-select"
          >
            Destination
          </label>

          <select
            id="destination-select"
            class="navigation-select navigation-select--compact"
            :value="navigation.destinationSelectionneeId"
            @change="emit('selectionner-destination', $event.target.value)"
          >
            <option
              v-for="secteur in autresSecteurs"
              :key="secteur.id"
              :value="secteur.id"
            >
              {{ secteur.nom }}
            </option>
          </select>
        </div>

        <template v-if="trajetSelectionne">
          <p class="navigation-route-meta">
            Durée : {{ trajetSelectionne.tempsTrajet }} ticks · Coût carburant :
            {{ trajetSelectionne.coutCarburant }}
          </p>
        </template>

        <div class="action-group">
          <button
            class="action-button-with-icon"
            :class="{ 'is-active': estModeNavigationActif }"
            @click="declencherVoyage"
          >
            <span class="button-icon" aria-hidden="true">🧭</span>
            <span>Lancer le trajet</span>
          </button>
        </div>

        <p class="navigation-status">Sélection de trajectoire prête.</p>
      </template>
    </div>
  </section>
</template>
