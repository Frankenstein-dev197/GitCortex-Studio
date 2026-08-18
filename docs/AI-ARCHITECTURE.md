# Architecture GitCortex AI — GitCortex Studio

> ⚠️ **État : planifié.** À ce jour, GitCortex AI est une **couche d'intégration prévue**, pas un backend fonctionnel. Aucune fonctionnalité AI n'est présentée comme terminée tant que le backend réel n'existe pas.

## 1. Vision

GitCortex Studio vise à intégrer progressivement un agent d'assistance au développement (GitCortex AI) dans le Workbench existant de VS Code, **sans détruire l'interface professionnelle**.

Architecture cible :

```
User
 ↓
GitCortex AI
 ↓
Project
 ↓
Files
 ↓
Terminal
 ↓
Tests
 ↓
Git
 ↓
Deploy
```

## 2. Capacités cibles (futures)

- Comprendre le projet
- Lire / rechercher dans le code
- Modifier / créer des fichiers
- Exécuter des commandes (terminal)
- Lancer les tests
- Analyser les erreurs
- Corriger les erreurs
- Utiliser Git
- Préparer un déploiement

Chaque capacité ne sera marquée "fonctionnelle" que lorsqu'un **backend réel** sera connecté.

## 3. Points d'intégration naturels (VS Code Workbench)

GitCortex AI sera intégré dans les emplacements existants de VS Code :

- **Activity Bar** : une vue GitCortex dédiée.
- **Side Bar** : panneau de conversation / tâches.
- **Command Palette** : commandes GitCortex.
- **Panel** : sortie de l'agent.
- **Status Bar** : état de l'agent.
- **Menus & Views** : contributions via le système de contributions VS Code.

## 4. Intégration d'agents externes (ex. OpenHands)

Une **interface propre** est prévue pour brancher un agent externe :

```
GitCortex Studio
   ↓
GitCortex AI Service
   ↓
Agent Execution
   ├── OpenHands (intégration future)
   ├── autre agent compatible
   ↓
Workspace Tools
```

**Important :** aucun code tiers n'est copié arbitrairement dans le dépôt. Seule une interface d'intégration sera définie.

## 5. État actuel

- ❌ Backend GitCortex AI : non implémenté.
- ❌ Service d'agent : non implémenté.
- ⏳ Plan d'architecture : ce document.
