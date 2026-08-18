# Build — GitCortex Studio

GitCortex Studio utilise le **vrai système de build de VS Code** (tag amont 1.133.0) : **Node.js + npm + Gulp + esbuild + Electron**. Aucun faux script de build n'est utilisé.

> ⚠️ **Important :** à partir de l'amont 1.133.0, VS Code utilise **npm** (et non plus Yarn). Le `package-lock.json` (npm) est présent ; il n'y a pas de `yarn.lock`. Le script `build/npm/preinstall.ts` rejette explicitement Yarn.

## 1. Prérequis

- **Node.js v24.18.0** (version exacte spécifiée dans `.nvmrc` ; le `preinstall` vérifie la majeure/minure)
- **npm** (version < 12.0.0 ; la version fournie avec Node 24 convient)
- **Git**
- **Python 3** et un **toolchain C++** (pour les modules natifs : kerberos, native-keymap, etc.)
- **Dépendances système natives** (Linux) : `libkrb5-dev`, `libxkbfile-dev`, `libx11-dev`, `libsecret-1-dev` (installées via apt). Sur d'autres OS, voir la doc amont.
- Pour le lancement graphique : un environnement avec affichage (X11 / Wayland / macOS / Windows)

## 2. Installation des dépendances

```bash
npm ci          # installe depuis package-lock.json (reproductible)
# ou, si le lockfile n'est pas à jour :
npm install
```

Le `postinstall` (`node build/npm/postinstall.ts`) installe aussi les dépendances de chaque extension et télécharge Electron.

## 3. Compilation (headless)

```bash
npm run compile          # = npm-run-all2 -lp compile-client compile-copilot
# ou directement :
npm run gulp compile
```

Cette tâche lance la compilation TypeScript via gulp/esbuild **sans nécessiter d'affichage**. C'est la validation principale en environnement headless.

> ✅ **Vérifié le 2026-08-18 :** `npm ci` puis `npm run gulp compile` s'exécutent avec **0 erreur TypeScript** sur la base importée (tag amont 1.133.0), et génèrent `out/vs/` (base, platform, editor, workbench, code, server).

## 4. Lancement graphique (Electron)

Le lancement de la fenêtre Electron nécessite un affichage. Dans un environnement headless sans serveur X, la fenêtre ne peut pas s'ouvrir ; on indique alors clairement :

> **BUILD NON TESTÉ GRAPHIQUEMENT**

Le binaire Electron est téléchargé par le `postinstall` (voir `node_modules/electron/dist`). Sur une machine avec affichage, lancer via les scripts de `package.json` (ex. `./scripts/code.sh` ou la tâche gulp de lancement).

## 5. Production / packaging

Le packaging desktop (Linux/Windows/macOS) utilise les scripts `build/` de l'amont (gulp tasks). À exécuter sur une machine cible avec les dépendances système appropriées.

## 6. Validation après modification

Après toute modification du branding ou de la configuration, recompiler :

```bash
yarn compile
```

et vérifier qu'aucune erreur TypeScript n'est introduite.
