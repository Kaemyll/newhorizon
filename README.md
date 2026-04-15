# New Horizon

**New Horizon** est un prototype de jeu **spacesim incrémental / semi-idle** en cours de développement, pensé pour être jouable très tôt, puis enrichi **brique par brique**.

Le projet s’inspire de l’ambiance et de certaines logiques systémiques de jeux comme **EVE Online** et **Elite Dangerous**, tout en conservant une ambition volontairement plus simple, plus lisible et plus progressive dans son développement.

---

## 🎯 Vision du projet

New Horizon repose sur quelques principes simples :

- développer **progressivement**, sans complexité inutile
- maintenir un jeu **fonctionnel à chaque version**
- privilégier la **lisibilité**, la **cohérence** et la **maintenabilité**
- construire une boucle de jeu basée sur :
  - l’extraction minière
  - la logistique
  - le voyage
  - le commerce
  - les services de station
  - l’amélioration du vaisseau

À terme, le projet vise à proposer :

- exploration locale
- exploitation minière
- transport et arbitrage commercial
- gestion des risques
- progression matérielle
- automatisation partielle (drones, modules)

---

## 🚀 État actuel du projet

**Version actuelle : v0.3.14**

### Fonctionnalités principales

- minage manuel et via drones
- scanner et exploitation d’amas miniers
- distinction **station / zone d’opérations**
- navigation inter-sectorielle
- gestion du carburant
- assistance automatique (remorquage)
- commerce local avec variations de prix
- taxation selon la sécurité du secteur
- amélioration du vaisseau et services de station
- hangar et gestion des vaisseaux possédés
- intégrité de coque par vaisseau
- risques miniers et dégâts de coque
- réparation partielle et complète en station
- restrictions d’actions selon l’état du vaisseau
- journal de bord structuré (**événements / commerce / combat**)
- système de temps : **1 tick = 1 heure**
- interface rationalisée par zones fonctionnelles
- CSS modulaire organisé par couches et zones UI

---

## 🧱 Structure du projet

Le projet repose sur une séparation claire entre :

- les **données**
- la **logique de jeu**
- les **composants d’interface**
- les **styles modulaires**

### Arborescence simplifiée

```text
src/
  assets/
    styles/
  components/
  data/
  game/
```

## Données

Les données du jeu sont externalisées dans `src/data/` :

```text
src/data/
  minerais.json
  vaisseaux.json
  secteurs.json
  trajets.json
```

Objectifs :

- meilleure lisibilité
- facilité d’équilibrage
- export possible vers des outils externes
- séparation nette entre données et logique

## Logique de jeu

Le dossier `src/game/` contient les systèmes métier du prototype, par exemple :

- exploration
- minage
- navigation
- commerce
- réparation
- coque
- sauvegarde
- temps / ticks
- états visuels

## Interface

Le dossier `src/components/` regroupe les panneaux et composants de l’interface :

- vaisseau
- opérations
- station
- hangar
- ressources
- navigation
- journal

## Styles

Les styles sont centralisés dans `src/assets/styles/` avec un point d’entrée unique :

- base
- layout
- components
- features

---

## 🛠️ Installation et test en local

### Prérequis

- Node.js (version LTS recommandée)
- npm
- un éditeur de code, par exemple :
  - VS Code
  - IntelliJ IDEA

## 1. Récupérer le projet

### Avec Git

```bash
git clone <URL_DU_DEPOT>
cd newhorizon
```

### Sans Git

- télécharger le projet via Download ZIP
- extraire l’archive
- ouvrir le dossier

## 2. Vérifier l’installation

```bash
node -v
npm -v
```

## 3. Installer les dépendances

```bash
npm install
```

## 4. Lancer le projet

```bash
npm run dev
```

Puis ouvrir :

```text
http://localhost:5173/
```

## 5. Arrêter le projet

```bash
Ctrl + C
```

---

## 🎮 Boucle de jeu actuelle

1. rester en station
2. utiliser les services disponibles :
   - commerce
   - ravitaillement
   - atelier
   - hangar
3. rejoindre la zone d’opérations
4. scanner un amas
5. exploiter manuellement ou via drones
6. surveiller la soute, le carburant et l’état du vaisseau
7. revenir en station
8. vendre, réparer, améliorer ou changer de vaisseau
9. voyager vers un autre secteur

---

## ⏱️ Système de simulation

### Temps

- 1 tick = 1 heure

### Actions consommant des ticks

- minage manuel
- déplacements locaux
- voyages inter-sectoriels
- recharge drones
- remorquage

### Actions sans tick

- navigation UI
- consultation des panneaux
- sélection sans validation
- lecture des informations de station et de secteur

---

## ⛽ Carburant

- consommé lors des déplacements
- non consommé par le simple passage du temps
- nécessaire pour les trajets et mouvements opérationnels

En cas de carburant nul :

- le vaisseau dérive
- un remorquage automatique peut être déclenché
- un coût est appliqué

---

## 🤖 Drones

- autonomie : 8 ticks
- recharge : 2 ticks
- extraction automatique sur amas actif
- rappel automatique si nécessaire selon le contexte de jeu

---

## 🛡️ Coque et intégrité du vaisseau

Chaque vaisseau possédé dispose désormais de sa propre intégrité de coque.

### États de coque

- Nominale : 75% à 100%
- Dégradée : 40% à 74%
- Critique : 1% à 39%
- Hors service : 0%

### Effets de gameplay

Selon l’état de coque, certaines actions peuvent être restreintes :

- scan
- minage manuel
- déploiement des drones
- voyage, si le vaisseau est hors service

### Réparation

La réparation est possible :

- en station
- via l’atelier
- sur le vaisseau actif

Deux modes existent :

- réparation partielle
- réparation complète

---

## ⚠️ Risque minier

Certains amas comportent un niveau de risque.

L’exploitation d’un amas risqué peut provoquer :

- des dégâts de coque
- des alertes visuelles
- des entrées dédiées dans le journal de bord

Le risque fait désormais partie intégrante de la boucle d’exploitation.

---

## 🌌 Secteurs

Chaque secteur possède :

- un niveau de sécurité
- une station principale
- une répartition minière
- une économie locale

### Sécurité

- High-Sec : 1.0 à 0.5
- Low-Sec : 0.4 à 0.1
- Null-Sec : prévu ultérieurement

---

## 🛰️ Position locale

Deux états principaux :

- Station
- Zone d’opérations

Contraintes :

- minage : uniquement en zone d’opérations
- services : uniquement en station

---

## 🚢 Vaisseau de départ

- HW Mule
- constructeur : Hardspan Works

### Progression et équipement

Le prototype permet déjà d’interagir avec plusieurs dimensions de progression :

- soute
- drones
- carburant
- puissance minière
- coque
- changement de vaisseau via hangar

---

## 💰 Économie

### Prix locaux

Chaque station applique :

- des modificateurs économiques
- une variation locale des prix

### Taxation

- appliquée sur les transactions concernées
- dépend du niveau de sécurité local

### Commerce

Le jeu permet déjà :

- la vente de cargaison
- l’achat selon les marchés disponibles
- une lecture locale des écarts économiques

---

## 🧠 Philosophie de développement

Le projet suit une logique simple :

- progression incrémentale
- lisibilité avant complexité
- prototype jouable en permanence
- ajout de systèmes par couches successives
- préférence pour les structures maintenables et refactorables

---

## 📦 Scripts

```bash
npm run dev
npm run build
npm run lint
```

---

## 🐛 Signaler un bug

Merci de préciser au minimum :

- la version concernée
- l’action effectuée
- le résultat observé
- le résultat attendu

Une capture d’écran ou un extrait du journal peut être utile selon le cas.

---

## 🔭 Roadmap

Voir :

```text
ROADMAP.md
```

---

## ⚠️ Important

- projet en développement actif
- équilibrage en cours
- sauvegarde locale navigateur
- bouton de réinitialisation disponible
- certaines mécaniques sont encore en évolution

---

## 📜 Licence

Projet personnel en cours de développement.
