<script setup>
import { computed } from "vue";

const props = defineProps({
  modeActif: {
    type: String,
    required: true,
  },
  sousModeStation: {
    type: String,
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
});

const contexteBandeau = computed(() => {
  if (props.navigation?.enVoyage) {
    return {
      id: "transit",
      titre: "Transit inter-sectoriel",
      sousTitre: "Trajectoire verrouillée · propulsion active",
      icone: "⟁",
      classe: "context-banner--transit",
    };
  }

  if (props.modeActif === "operations") {
    return {
      id: "operations",
      titre: "Zone d’opérations",
      sousTitre: "Prospection locale · exploitation minière",
      icone: "✦",
      classe: "context-banner--operations",
    };
  }

  if (props.modeActif === "navigation") {
    return {
      id: "navigation",
      titre: "Console de navigation",
      sousTitre: "Calcul de route · préparation du trajet",
      icone: "🧭",
      classe: "context-banner--navigation",
    };
  }

  if (props.modeActif === "station") {
    if (props.sousModeStation === "commerce") {
      return {
        id: "station_commerce",
        titre: "Marché de station",
        sousTitre: "Cours locaux · transactions · fret",
        icone: "¤",
        classe: "context-banner--commerce",
      };
    }

    if (props.sousModeStation === "ravitaillement") {
      return {
        id: "station_ravitaillement",
        titre: "Ravitaillement",
        sousTitre: "Réservoirs · carburant · autonomie",
        icone: "⛽",
        classe: "context-banner--fuel",
      };
    }

    if (props.sousModeStation === "atelier") {
      return {
        id: "station_atelier",
        titre: "Atelier technique",
        sousTitre: "Réparations · améliorations · maintenance",
        icone: "⚙",
        classe: "context-banner--workshop",
      };
    }

    if (props.sousModeStation === "assurance") {
      return {
        id: "station_assurance",
        titre: "Service d’assurance",
        sousTitre: "Contrats · couverture · indemnisation",
        icone: "★",
        classe: "context-banner--insurance",
      };
    }

    return {
      id: "station_hangar",
      titre: "Hangar de station",
      sousTitre: "Vaisseaux · stockage · préparation",
      icone: "⌂",
      classe: "context-banner--hangar",
    };
  }

  return {
    id: "station_hangar",
    titre: "Station locale",
    sousTitre: "Services disponibles · vaisseau amarré",
    icone: "⌂",
    classe: "context-banner--hangar",
  };
});

const classesBandeau = computed(() => [
  "context-banner",
  contexteBandeau.value.classe,
  {
    "context-banner--station-local": props.positionLocale === "station",
    "context-banner--operations-local": props.positionLocale === "operations",
  },
]);
</script>

<template>
  <section :class="classesBandeau" :data-context="contexteBandeau.id">
    <div class="context-banner-visual" aria-hidden="true">
      <span class="context-banner-orb context-banner-orb--primary"></span>
      <span class="context-banner-orb context-banner-orb--secondary"></span>
      <span class="context-banner-orb context-banner-orb--tertiary"></span>

      <span class="context-banner-line context-banner-line--one"></span>
      <span class="context-banner-line context-banner-line--two"></span>
      <span class="context-banner-line context-banner-line--three"></span>

      <span class="context-banner-grid"></span>
      <span class="context-banner-noise"></span>
    </div>

    <div class="context-banner-content">
      <div class="context-banner-icon" aria-hidden="true">
        {{ contexteBandeau.icone }}
      </div>

      <div class="context-banner-text">
        <span class="context-banner-kicker">Contexte opérationnel</span>
        <strong>{{ contexteBandeau.titre }}</strong>
        <span>{{ contexteBandeau.sousTitre }}</span>
      </div>
    </div>
  </section>
</template>
