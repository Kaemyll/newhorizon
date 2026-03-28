# New Horizon

**New Horizon** est un prototype de jeu **spacesim incrémental / semi-idle** en cours de développement, pensé pour être jouable très tôt, puis enrichi **brique par brique**.

Le projet s’inspire de l’ambiance et de certaines logiques systémiques de jeux comme **EVE Online** et **Elite Dangerous**, tout en conservant une ambition volontairement plus simple, plus lisible, et plus progressive dans son développement.

---

## 🎯 Vision du projet

New Horizon repose sur quelques principes simples :

- développer **progressivement**, sans complexité inutile
- maintenir un jeu **fonctionnel à chaque version**
- privilégier la **lisibilité et la cohérence**
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

**Version actuelle : v0.3.10**

### Fonctionnalités principales

- minage manuel et via drones
- scanner et exploitation d’amas miniers
- distinction **station / zone d’opérations**
- navigation inter-sectorielle
- gestion du carburant
- assistance automatique (remorquage)
- commerce local avec variations de prix
- taxation selon la sécurité du secteur
- amélioration du vaisseau (atelier)
- journal de bord structuré (events / commerce / combat)
- système de temps : **1 tick = 1 heure**

---

## 🧱 Structure du projet

Le projet est structuré selon une séparation claire entre données et logique :

src/
data/ → données du jeu (JSON)
game/ → logique du jeu
components/ → interface utilisateur


### Données

Depuis la version **v0.3.10**, les données sont externalisées :

src/data/
minerais.json
vaisseaux.json
secteurs.json
trajets.json


Objectifs :

- meilleure lisibilité
- facilité d’équilibrage
- export possible (Google Sheets, outils externes)
- séparation données / logique

---

## 🛠️ Installation et test en local

### Prérequis

- Node.js (version LTS recommandée)
- npm
- un éditeur de code :
    - VS Code
    - IntelliJ IDEA

---

### 1. Récupérer le projet

#### Avec Git

```bash
git clone <URL_DU_DEPOT>
cd newhorizon
```

#### Sans Git
- Télécharger le projet via Download ZIP. 
- Extraire l’archive.
- Ouvrir le dossier.

### 2. Vérifier l’installation

```bash
node -v
npm -v
```

### 3. Installer les dépendances

```bash
npm install
```

### 4. Lancer le projet

```bash
npm run dev
```

Puis ouvrir :

http://localhost:5173/

### 5. Arrêter le projet

```bash
Ctrl + C
```

---

## 🎮 Boucle de jeu actuelle

1. rester en station
2. utiliser les services :
   - commerce
   - ravitaillement
   - atelier
3. rejoindre la zone d’opérations
4. miner
5. revenir en station
6. vendre
7. améliorer le vaisseau
8. voyager vers un autre secteur

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

---

## ⛽ Carburant
- consommé uniquement lors des déplacements
- pas lié au temps passif
En cas de carburant nul :
- dérive du vaisseau
- remorquage automatique
- coût appliqué
---
## 🤖 Drones
- autonomie : 8 ticks
- recharge : 2 ticks
- extraction automatique
---
## 🌌 Secteurs
Chaque secteur possède :
-un niveau de sécurité
-une station principale
-une répartition minière
-une économie locale
### Sécurité
- High-Sec : 1.0 → 0.5
- Low-Sec : 0.4 → 0.1
- Null-Sec : prévu
---
## 🛰️ Position locale
Deux états :
- Station
- Zone d’opérations
Contraintes :
- minage → uniquement zone d’opérations
- services → uniquement station
---
## 🚢 Vaisseau de départ
- **HW Mule**
- constructeur : **Hardspan Works**
### Améliorations
- soute
- drones
- carburant
- extraction
---
## 💰 Économie
### Prix local
Chaque station applique :
- des modificateurs économiques
- une variation locale des prix
### Taxe
- appliquée une seule fois
- sur le total de la vente
- dépend de la sécurité
---
## 🧠 Philosophie de développement
- progression incrémentale
- lisibilité avant complexité
- prototype jouable en permanence
- ajout de systèmes par couches
---
## 📦 Scripts

```bash
npm run dev
npm run build
npm run lint
```
---
## 🐛 Signaler un bug
Merci de préciser :
- version
- action
- résultat attendu
---
## 🔭 Roadmap
Voir :
```bash
ROADMAP.md
```
---
## ⚠️ Important
- projet en développement actif
- équilibrage en cours
- sauvegarde locale navigateur
- bouton reset disponible
---
## 📜 Licence
Projet personnel en cours de développement.