# New Horizon

**New Horizon** est un prototype de jeu **spacesim incrémental / semi-idle** en cours de développement, pensé pour être jouable très tôt, puis enrichi **brique par brique**.

Le projet s’inspire principalement de l’ambiance et de certaines logiques systémiques de jeux comme **EVE Online** et **Elite Dangerous**, tout en conservant une ambition volontairement plus simple, plus lisible, et plus progressive dans son développement.

L’objectif est de construire un jeu :
- **sobre visuellement**
- **clair dans ses mécaniques**
- **jouable à chaque étape**
- **facile à faire évoluer**
- et adapté à une progression par versions successives

---

## Vision du projet

New Horizon repose sur quelques principes simples :

- développer **petit à petit**, sans chercher à tout faire d’un coup
- garder un jeu **fonctionnel à chaque version**
- privilégier la **clarté** et la **cohérence système**
- construire une boucle de jeu basée sur :
    - l’extraction minière
    - la logistique
    - le voyage
    - le commerce
    - les services de station
    - l’amélioration progressive du vaisseau

À terme, le projet a vocation à proposer un gameplay de type :

- **exploration locale**
- **exploitation minière**
- **transport**
- **arbitrage commercial**
- **gestion des risques**
- **progression matérielle**
- **activité semi-idle** avec systèmes automatisés (drones, modules, etc.)

---

## État actuel du projet

Version actuelle : **v0.3.7**  
*(adapter si nécessaire selon l’état réel du dépôt au moment du commit)*

Le prototype permet déjà :

- d’incarner un pilote minier indépendant
- de se déplacer entre plusieurs secteurs
- de gérer un petit vaisseau industriel de départ
- d’extraire des minerais
- d’utiliser des drones miniers
- d’acheter des améliorations de vaisseau
- de consulter les services d’une station
- de vendre la cargaison selon un marché local simplifié
- de subir une fiscalité variable selon la sécurité locale
- de distinguer :
    - la **station**
    - la **zone d’opérations**
    - le **transit inter-sectoriel**

---

## Technologies utilisées

Le projet est actuellement développé avec :

- **Vue 3**
- **Vite**
- **JavaScript**
- **CSS maison**

Le choix de rester sur une base simple sans framework UI lourd permet :
- de mieux comprendre l’architecture
- de garder le contrôle sur l’interface
- de faire évoluer le projet sans dépendances inutiles

---

## Philosophie de développement

New Horizon est développé selon une logique de **versions courtes, explicites et cumulatives**.

Chaque version :
- apporte une amélioration concrète
- fait l’objet d’un commit explicite
- peut être présentée et suivie facilement
- conserve un état jouable du prototype

Le développement suit une logique de :
- **prototype**
- **test**
- **ajustement**
- **consolidation**
- **ajout de nouvelle brique**

---

## Système de versionnement

Le projet utilise une numérotation de type :

`vMAJEUR.MINEUR.PATCH`

Exemple :
- `v0.3.6`
- `v0.3.7`

### Règles

#### MAJEUR
Change lorsqu’une étape très importante du projet est franchie.

Tant que le jeu reste en prototype / alpha technique, cette valeur reste généralement à **0**.

#### MINEUR
Change lorsqu’on ajoute :
- un nouveau système
- une refonte importante
- une étape structurante du développement

#### PATCH
Change lorsqu’on apporte :
- des correctifs
- de l’équilibrage
- des améliorations ergonomiques
- des clarifications visuelles
- des consolidations techniques

### Exemple de lecture
- `v0.3.0` : nouveau palier important
- `v0.3.6` : consolidation d’un palier existant
- `v0.3.7` : ajout structurant dans la continuité du même bloc

---

## Boucle de jeu actuelle

La boucle de jeu actuelle repose sur :

1. rester **amarré à la station**
2. utiliser les **services de station** :
    - commerce
    - ravitaillement
    - atelier
3. rejoindre la **zone d’opérations**
4. extraire des minerais
5. revenir à la station
6. vendre la cargaison
7. améliorer le vaisseau
8. voyager vers d’autres secteurs pour profiter :
    - de ressources différentes
    - de conditions de marché différentes
    - de fiscalités différentes

---

## Règles de simulation actuelles

### Temps
La règle officielle actuelle est :

**1 tick = 1 heure de simulation**

Un tick n’est consommé que par une action qui fait réellement avancer le monde du jeu.

### Exemples d’actions qui consomment des ticks
- minage manuel
- déplacement local station → zone d’opérations
- déplacement local zone d’opérations → station
- voyage inter-sectoriel

### Exemples d’actions qui ne consomment pas de ticks
- consulter un panneau
- changer d’onglet d’interface
- ouvrir les services d’une station
- sélectionner une destination sans partir

### Carburant
Le carburant est actuellement lié au **déplacement**, pas au simple écoulement du temps.

---

## Structure actuelle du gameplay

### Secteurs
Les secteurs sont définis par :
- un nom
- un niveau de sécurité
- une station principale
- une répartition locale des minerais
- un profil économique local

### Sécurité
Le système suit une logique proche d’EVE Online :

- **High-Sec** : `1.0` à `0.5`
- **Low-Sec** : `0.4` à `0.1`
- **Null-Sec** : `0.0` *(prévu plus tard)*

### Station principale
Chaque secteur possède une station principale avec des services potentiels :
- ravitaillement
- commerce
- atelier

### Position locale
À l’intérieur d’un secteur, le joueur peut être :
- à la **station**
- en **zone d’opérations**

Cette distinction est importante :
- le minage ne peut se faire qu’en zone d’opérations
- les services de station ne sont accessibles qu’en station

---

## Vaisseau de départ

Le joueur commence actuellement avec un petit vaisseau industriel :

- **HW Mule**
- constructeur : **Hardspan Works**

Le vaisseau peut être amélioré dans certaines stations disposant d’un atelier.

### Améliorations actuellement prévues / disponibles
- extension de soute
- baie à drones renforcée
- réservoir auxiliaire
- tête d’extraction améliorée

---

## Économie et commerce

Le commerce repose actuellement sur deux couches distinctes :

### 1. Cours local brut
Chaque station applique des modificateurs locaux aux minerais, afin de représenter :
- la couleur économique du lieu
- une logique de demande locale artificielle
- une première différenciation entre secteurs

### 2. Taxe de transaction
Une taxe est ensuite appliquée **une seule fois** sur le **montant brut global** de la transaction.

Cette taxe dépend actuellement du niveau de sécurité local.

### Important
La taxe n’est **pas** appliquée minerai par minerai.  
Elle intervient **après** le calcul de la valeur brute totale de la cargaison vendue.

---

## Interface actuelle

L’interface est organisée en trois grandes colonnes :

### Colonne gauche
Informations internes au joueur :
- ressources
- vaisseau
- navigation

### Colonne centrale
Panneau d’action principal :
- opérations
- services de station
- navigation contextuelle
- journal de bord fixé en bas

### Colonne droite
Contexte local :
- secteur
- station

---

## Arborescence simplifiée

L’organisation exacte du projet peut évoluer, mais la structure générale actuelle ressemble à ceci :

```text
src/
├── assets/
│   └── styles/
│       └── main.css
├── components/
│   ├── HeaderActions.vue
│   ├── LogPanel.vue
│   ├── NavigationPanel.vue
│   ├── OperationPanel.vue
│   ├── ResourcePanel.vue
│   ├── SectorPanel.vue
│   ├── ShipPanel.vue
│   ├── StationPanel.vue
│   ├── StationServicesPanel.vue
│   └── UpgradePanel.vue
├── game/
│   ├── donneesInitiales.js
│   ├── donneesMinerais.js
│   ├── donneesSecteurs.js
│   ├── donneesTrajets.js
│   ├── donneesVaisseaux.js
│   ├── etatJeu.js
│   ├── systemeAmeliorations.js
│   ├── systemeCommerce.js
│   ├── systemeLocalisation.js
│   ├── systemeMinage.js
│   ├── systemeNavigation.js
│   ├── systemeRavitaillement.js
│   ├── systemeSauvegarde.js
│   ├── systemeTemps.js
│   └── systemeTick.js
├── App.vue
└── main.js