<script setup>
import { computed, onMounted, onUnmounted, reactive } from 'vue'
import ResourcePanel from './components/ResourcePanel.vue'
import ShipPanel from './components/ShipPanel.vue'
import SectorPanel from './components/SectorPanel.vue'
import StationPanel from './components/StationPanel.vue'
import NavigationPanel from './components/NavigationPanel.vue'
import UpgradePanel from './components/UpgradePanel.vue'
import HeaderActions from './components/HeaderActions.vue'
import LogPanel from './components/LogPanel.vue'
import OperationPanel from './components/OperationPanel.vue'
import StationServicesPanel from './components/StationServicesPanel.vue'

import { recupererEtatJeu, reinitialiserEtatJeu } from './game/etatJeu'
import { chargerJeu, sauvegarderJeu } from './game/systemeSauvegarde'
import {
  minerMineraiManuellement,
  vendreTousLesMinerais,
  acheterDroneMinier,
} from './game/systemeMinage'
import { ravitaillerCarburant } from './game/systemeRavitaillement'
import { ameliorerVaisseau } from './game/systemeAmeliorations'
import {
  selectionnerDestination,
  lancerVoyageVersDestinationSelectionnee,
} from './game/systemeNavigation'
import { allerEnZoneOperations, retourALaStation } from './game/systemeLocalisation'
import { donneesSecteurs } from './game/donneesSecteurs'
import { demarrerBoucleJeu, arreterBoucleJeu } from './game/systemeTick'

const etat = reactive({})

function creerEtatUIInitial() {
  return {
    modeActif: 'operations',
    sousModeStation: 'commerce',
  }
}

const ui = reactive(creerEtatUIInitial())

const secteurCourantComplet = computed(
  () => donneesSecteurs.find((secteur) => secteur.id === etat.secteurCourant?.id) || null,
)

const stationCourante = computed(() => secteurCourantComplet.value?.stationPrincipale ?? null)

function normaliserSousModeStation() {
  const services = stationCourante.value?.services

  if (!services) {
    ui.sousModeStation = 'commerce'
    return
  }

  if (ui.sousModeStation === 'commerce' && services.commerce) return
  if (ui.sousModeStation === 'ravitaillement' && services.ravitaillement) return
  if (ui.sousModeStation === 'atelier' && services.atelier) return

  if (services.commerce) {
    ui.sousModeStation = 'commerce'
    return
  }

  if (services.ravitaillement) {
    ui.sousModeStation = 'ravitaillement'
    return
  }

  if (services.atelier) {
    ui.sousModeStation = 'atelier'
    return
  }

  ui.sousModeStation = 'commerce'
}

function synchroniserEtat() {
  const etatCourant = structuredClone(recupererEtatJeu())

  Object.keys(etat).forEach((cle) => {
    delete etat[cle]
  })

  Object.assign(etat, etatCourant)

  normaliserSousModeStation()
}

function gererMinageManuel() {
  minerMineraiManuellement()
  sauvegarderJeu()
  synchroniserEtat()
}

function gererVenteMinerai() {
  vendreTousLesMinerais()
  sauvegarderJeu()
  synchroniserEtat()
}

function gererAchatDrone() {
  acheterDroneMinier()
  sauvegarderJeu()
  synchroniserEtat()
}

function gererRavitaillement() {
  ravitaillerCarburant()
  sauvegarderJeu()
  synchroniserEtat()
}

function gererVoyage() {
  lancerVoyageVersDestinationSelectionnee()
  sauvegarderJeu()
  synchroniserEtat()
}

function gererSelectionDestination(idDestination) {
  selectionnerDestination(idDestination)
  sauvegarderJeu()
  synchroniserEtat()
}

function gererAmelioration(idAmelioration) {
  ameliorerVaisseau(idAmelioration)
  sauvegarderJeu()
  synchroniserEtat()
}

function gererAllerOperations() {
  allerEnZoneOperations()
  sauvegarderJeu()
  synchroniserEtat()
}

function gererRetourStation() {
  retourALaStation()
  sauvegarderJeu()
  synchroniserEtat()
}

function gererReinitialisation() {
  reinitialiserEtatJeu()
  Object.assign(ui, creerEtatUIInitial())
  sauvegarderJeu()
  synchroniserEtat()
}

function changerMode(mode) {
  ui.modeActif = mode
  if (mode === 'station') {
    normaliserSousModeStation()
  }
}

function changerSousModeStation(sousMode) {
  ui.sousModeStation = sousMode
}

onMounted(() => {
  chargerJeu()
  synchroniserEtat()
  demarrerBoucleJeu(synchroniserEtat)
})

onUnmounted(() => {
  arreterBoucleJeu()
})
</script>

<template>
  <main
    class="app-shell"
    v-if="
      etat.ressources &&
      etat.vaisseau &&
      etat.industrie &&
      etat.economie &&
      etat.secteurCourant &&
      etat.navigation &&
      etat.journal
    "
  >
    <header class="app-header">
      <div class="header-top">
        <div class="header-brand">
          <h1 class="title-line">
            <span class="title-icon">✦</span>
            <span>New Horizon</span>
            <span class="title-icon">✦</span>
          </h1>

          <p class="subtitle">
            Simulation spatiale incrémentale de prospection minière et de commerce
          </p>

          <p class="meta-line">
            v{{ etat.meta?.version }} — {{ etat.meta?.auteur }} — {{ etat.meta?.annee }}
          </p>
        </div>

        <HeaderActions
          :mode-actif="ui.modeActif"
          @changer-mode="changerMode"
          @reinitialiser="gererReinitialisation"
        />
      </div>
    </header>

    <div class="app-main">
      <section class="main-column main-column-left">
        <ResourcePanel
          :ressources="etat.ressources"
          :vaisseau="etat.vaisseau"
          :secteur-courant="etat.secteurCourant"
        />
        <ShipPanel :vaisseau="etat.vaisseau" :industrie="etat.industrie" />
        <NavigationPanel
          :secteur-courant-id="etat.secteurCourant.id"
          :navigation="etat.navigation"
          :position-locale="etat.positionLocale"
          @selectionner-destination="gererSelectionDestination"
          @voyager="gererVoyage"
        />
      </section>

      <section class="main-column main-column-center">
        <div class="center-top">
          <OperationPanel
            v-if="ui.modeActif === 'operations'"
            :ressources="etat.ressources"
            :vaisseau="etat.vaisseau"
            :industrie="etat.industrie"
            :navigation="etat.navigation"
            :position-locale="etat.positionLocale"
            @miner="gererMinageManuel"
            @aller-operations="gererAllerOperations"
            @retour-station="gererRetourStation"
          />

          <StationServicesPanel
            v-else-if="ui.modeActif === 'station'"
            :secteur-courant="etat.secteurCourant"
            :vaisseau="etat.vaisseau"
            :ressources="etat.ressources"
            :sous-mode-station="ui.sousModeStation"
            :position-locale="etat.positionLocale"
            @changer-sous-mode-station="changerSousModeStation"
            @vendre="gererVenteMinerai"
            @ravitailler="gererRavitaillement"
            @acheter-drone="gererAchatDrone"
            @retour-station="gererRetourStation"
          >
            <template #atelier>
              <UpgradePanel
                :vaisseau="etat.vaisseau"
                :secteur-courant="etat.secteurCourant"
                @ameliorer="gererAmelioration"
              />
            </template>
          </StationServicesPanel>

          <NavigationPanel
            v-else-if="ui.modeActif === 'navigation'"
            :secteur-courant-id="etat.secteurCourant.id"
            :navigation="etat.navigation"
            :position-locale="etat.positionLocale"
            @selectionner-destination="gererSelectionDestination"
            @voyager="gererVoyage"
          />
        </div>

        <section class="journal-panel">
          <LogPanel :entrees="etat.journal" />
        </section>
      </section>

      <aside class="right-aside">
        <SectorPanel :secteur-courant="etat.secteurCourant" />
        <StationPanel :secteur-courant="etat.secteurCourant" />
      </aside>
    </div>
  </main>
</template>
