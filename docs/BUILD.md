# Build — GitCortex Studio

GitCortex Studio utilise le **vrai système de build de VS Code** : Node.js + Yarn (Classic) + Gulp + esbuild + Electron. Aucun faux script de build n'est utilisé.

## 1. Prérequis

- Node.js (version précisée dans `package.json` → `engines`)
- Yarn Classic 1.x
- Git
- Python 3 et un toolchain C++ (pour les modules natifs, selon la plateforme)
- Pour le lancement graphique : un environnement avec affichage (X11 / Wayland / macOS / Windows)

## 2. Installation des dépendances

```bash
yarn install
```

## 3. Compilation (headless)

```bash
yarn compile
```

Cette tâche lance la compilation TypeScript via gulp/esbuild **sans nécessiter d'affichage**. C'est la validation principale en environnement headless.

## 4. Lancement graphique (Electron)

Le lancement de la fenêtre Electron nécessite un affichage. Dans un environnement headless sans serveur X, la fenêtre ne peut pas s'ouvrir ; on indique alors clairement :

> **BUILD NON TESTÉ GRAPHIQUEMENT**

Commande usuelle de lancement (sur une machine avec affichage) :

```bash
yarn run electron
# ou selon la cible :
yarn launch
```

Voir le script exact dans `package.json` → `scripts`.

## 5. Production / packaging

Le packaging desktop (Linux/Windows/macOS) utilise les scripts `build/` de l'amont (gulp tasks). À exécuter sur une machine cible avec les dépendances système appropriées.

## 6. Validation après modification

Après toute modification du branding ou de la configuration, recompiler :

```bash
yarn compile
```

et vérifier qu'aucune erreur TypeScript n'est introduite.
