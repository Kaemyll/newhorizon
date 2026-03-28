# ROADMAP — New Horizon

## Vision générale

**New Horizon** est un prototype de jeu spatial incrémental / semi-idle, centré sur l’extraction minière, la logistique, le commerce, l’exploration locale et la progression du vaisseau.

Le développement suit une logique simple :

- chaque version doit être **jouable**
- chaque évolution doit être **compréhensible**
- les systèmes doivent être ajoutés **brique par brique**
- l’interface doit rester **sobre, lisible et immersive**
- les données du jeu doivent progressivement devenir **propres, exportables et réutilisables**

L’objectif à long terme est de construire un spacesim minimaliste mais riche en systèmes, où le joueur gère :
- ses déplacements,
- son carburant,
- son extraction,
- ses drones,
- ses cargos,
- ses ventes,
- ses risques,
- puis plus tard son réseau commercial, ses finances et sa flotte.

---

## Principes de développement

### 1. Jouable à chaque version
Chaque version doit laisser le jeu dans un état jouable, même si le système n’est encore que partiellement développé.

### 2. Complexité progressive
Les nouveaux systèmes doivent s’ajouter sans casser les fondations existantes.

### 3. Lisibilité avant sophistication
Les mécaniques doivent être claires avant d’être complexes.

### 4. Données séparées de la logique
Le projet doit tendre vers une architecture où :
- les **données** sont stockées proprement
- la **logique** du jeu les exploite
- l’export externe reste possible

### 5. Versionnement explicite
Chaque version du projet doit correspondre à une avancée identifiable, documentée par un commit clair.

---

## Règles de versionnement

Le projet suit une logique de type :

`vMAJEUR.MINEUR.PATCH`

### MAJEUR
Change lorsqu’un cap structurant ou une nouvelle ère du projet est franchie.

### MINEUR
Change lorsqu’un nouveau système important ou une refonte significative est introduit.

### PATCH
Change lorsqu’on améliore, corrige, consolide ou affine un système existant.

---

## Versions déjà réalisées

### v0.3.6
Consolidation du temps de simulation et densification de l’interface.

- formalisation du tick comme unité de temps
- minage manuel consommant un tick
- densification du panneau commerce local
- réinitialisation complète du jeu via reconstruction de l’état initial

### v0.3.7
Distinction locale entre station et zone d’opérations.

- séparation station / opérations
- minage autorisé uniquement en zone d’opérations
- services de station accessibles uniquement à quai
- mouvements locaux coûtant du carburant et du temps

### v0.3.8
Gestion active des drones et refonte immersive du panneau Opérations.

- déploiement et rappel des drones
- autonomie des drones
- recharge automatique
- panneau Opérations transformé en console de bord
- meilleur signal visuel station / opérations

### v0.3.9
Scanner, amas miniers et sécurité carburant.

- ajout du scanner
- introduction d’un amas minier actif
- exploitation sur réserve locale
- épuisement des sites
- gestion du carburant critique hors station
- remorquage automatique
- crédits négatifs autorisés en cas d’assistance

---

## Priorités immédiates

### Priorité 1 — Structuration des données
Le projet doit migrer progressivement vers des données stockées dans des fichiers JSON propres et homogènes, afin de :
- faciliter l’équilibrage
- permettre l’export externe
- préparer des outils de suivi
- réduire la dépendance du code à des données embarquées dans les systèmes

### Priorité 2 — Suivi du projet
Le projet doit disposer d’une vraie roadmap maintenue et d’un suivi clair des versions à venir.

### Priorité 3 — Extension contrôlée du contenu
Avant d’ouvrir de gros systèmes supplémentaires, il faut enrichir progressivement :
- les données du monde
- la variété des vaisseaux
- les minerais
- les secteurs

---

## Versions prévues à court terme

### v0.3.10 — Migration initiale vers des données JSON
Objectif : rationaliser les données du projet.

#### Contenu prévu
- création du dossier `src/data/`
- migration progressive de :
    - `minerais`
    - `vaisseaux`
    - `secteurs`
    - `trajets`
      vers des fichiers `.json`
- création de modules d’accès / adaptateurs côté jeu
- homogénéisation des clés et identifiants
- préparation à l’export externe vers Google Sheets ou autres outils

#### Résultat attendu
- données plus propres
- architecture plus claire
- meilleure maintenabilité
- base saine pour les prochains systèmes

---

### v0.3.11 — Suivi projet et backlog structuré
Objectif : formaliser le pilotage du projet.

#### Contenu prévu
- ajout et stabilisation de `ROADMAP.md`
- mise en place d’un tableau de suivi (GitHub Projects ou équivalent)
- classement des tâches :
    - gameplay
    - données
    - interface
    - économie
    - monde
    - dette technique
- intégration de la migration JSON dans le suivi de production

#### Résultat attendu
- développement plus lisible
- meilleure priorisation
- meilleure communication sur GitHub et Discord

---

### v0.3.12 — Extension du contenu minier et sectoriel
Objectif : enrichir le monde à petite échelle.

#### Contenu prévu
- ajout de **1 ou 2 nouveaux secteurs**
- ajout de **1 ou 2 nouveaux minerais**
- ajustement des tables de répartition par secteur
- premières différences plus marquées entre zones économiques

#### Résultat attendu
- boucle de minage plus variée
- meilleure sensation de progression géographique
- bases plus solides pour le commerce

---

### v0.3.13 — Nouveaux vaisseaux
Objectif : introduire une vraie diversité de coques.

#### Vaisseaux prévus
- **Mineur lourd**
    - plus grosse soute
    - meilleure capacité d’extraction
    - capacités défensives limitées
- **Transporteur marchand**
    - grande soute
    - faible vocation minière
    - pensé pour le commerce et le transport
- **Mineur renforcé**
    - plus robuste défensivement
    - moins rentable qu’un mineur pur
    - pensé pour des zones plus risquées

#### Résultat attendu
- premiers choix de spécialisation
- meilleure projection du joueur
- base pour une progression multi-vaisseaux

---

## Cap de développement intermédiaire

### v0.4.0 — Stargates et carte sectorielle
Objectif : transformer la navigation inter-sectorielle en vraie structure spatiale.

#### Contenu prévu
- ajout des **stargates**
- connexions réelles entre secteurs
- tous les secteurs ne communiquent plus directement
- introduction d’une topologie spatiale lisible
- début de la cartographie du monde

#### Résultat attendu
- voyages plus crédibles
- routes commerciales réelles
- secteurs périphériques / centraux
- base pour futurs systèmes de sécurité, de contrôle et de risque

---

## Versions prévues à moyen terme

### v0.4.1 — Qualité de scan et sites plus riches
- amélioration du scanner
- meilleure détection des amas
- meilleure lecture des réserves
- premières différences qualitatives de sites

### v0.4.2 — Événements locaux et sécurité
- premiers événements liés au niveau de sécurité
- incidents mineurs en zone d’opérations
- début de la tension entre High-Sec et Low-Sec

### v0.4.3 — Finances et service bancaire
- service **Finances** dans certaines stations
- gestion des crédits négatifs
- découvert / remboursement / frais éventuels
- dépôt et retrait de fonds
- premières bases d’épargne ou de placement

### v0.5.0 — Marchandises et commerce étendu
- achat et revente de marchandises
- transport commercial au-delà du minerai
- enrichissement des marchés stationnaires
- premiers circuits de profit logistique

---

## Chantiers structurels permanents

### Données
- homogénéiser les fichiers de données
- documenter les schémas
- rendre les exports possibles

### Interface
- maintenir une interface sobre et dense
- conserver un journal de bord lisible
- améliorer la sensation de “console de bord”

### Équilibrage
- ajuster valeurs, coûts, réserves, autonomie, taxation
- garder une progression lisible

### Documentation
- README à jour
- roadmap à jour
- messages de commit explicites
- historique des versions

---

## Backlog d’idées

### Monde et navigation
- stargates
- cartographie
- hubs régionaux
- zones frontières
- zones très risquées

### Minage et exploitation
- scanner amélioré
- sites spéciaux
- anomalies
- meilleure lecture des rendements
- qualité des amas

### Vaisseaux
- nouvelles coques
- rôles spécialisés
- capacités défensives
- modules spécifiques
- progression technologique

### Économie
- marchandises
- commerce régional
- finances
- dette
- investissement
- spéculation

### Risques et sécurité
- incidents en Low-Sec
- pirates
- avaries
- coûts d’assistance variables
- menaces sur les drones

### Industrie et automatisation
- drones spécialisés
- améliorations avancées
- modules plus complexes
- production / transformation plus tard

---

## Dette technique identifiée

- migration vers des données JSON propres
- séparation toujours plus nette entre données et logique
- nettoyage progressif des imports
- centralisation de certaines règles système
- meilleure standardisation des messages et niveaux d’alerte du journal

---

## Mode de suivi recommandé

Le suivi du projet peut être doublé :

### 1. Documentation dans le dépôt
- `README.md`
- `ROADMAP.md`

### 2. Suivi des tâches
À gérer de préférence via :
- **GitHub Projects**  
  ou éventuellement
- **Trello** si un outil plus visuel est préféré

---

## Prochaine étape recommandée

### Prochaine priorité proposée
**v0.3.10 — migration initiale vers des données JSON**

Pourquoi :
- le projet a désormais assez de matière pour justifier une vraie séparation données / logique
- les prochaines extensions (nouveaux vaisseaux, nouveaux secteurs, nouveaux minerais) seront beaucoup plus simples à gérer ainsi
- cela prépare les exports et le suivi externe

---

## Résumé stratégique

Le projet doit maintenant entrer dans une phase de **consolidation structurante** :

1. rationaliser les données
2. formaliser le suivi
3. enrichir le contenu
4. ouvrir progressivement la carte et l’économie

Le cap reste le même :
construire un spacesim incrémental, lisible, immersif et systémique, version après version.