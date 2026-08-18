# Branding — GitCortex Studio

Ce document décrit la stratégie de rebranding appliquée pour transformer Visual Studio Code / Code-OSS en **GitCortex Studio**, sans casser la compatibilité technique ni l'écosystème.

## 1. Principe directeur

On ne fait **pas** de remplacement aveugle de toutes les chaînes `vscode`. On sépare :

1. **Branding visible** (à changer) — ce que l'utilisateur final voit.
2. **Identifiants techniques** (à conserver) — noms de modules internes, clés d'API, chemins de compatibilité.
3. **Compatibilité API/extensions** (à conserver) — l'hôte d'extension et l'API VS Code restent compatibles.
4. **Références upstream & licences** (à conserver) — attribution Microsoft/Code-OSS.

## 2. Identité GitCortex

| Champ            | Valeur              |
|------------------|---------------------|
| Nom              | GitCortex Studio    |
| Nom court        | GitCortex           |
| Application ID   | `studio.gitcortex`  |
| Protocol         | `gitcortex://`      |
| Data directory   | `GitCortexStudio`   |

## 3. Fichiers modifiés pour le branding

### `product.json`

Champs visés : `name`, `applicationName`, `publisher`, `urlProtocol`, `dataFolderName`, `win32MutexName`, `win32AppId`, `darwinBundleIdentifier`, `tunnelApplicationName`, nom de l'exécutable, etc. Les valeurs techniques internes sont préservées.

### `package.json`

- Nom du paquet : `gitcortex-studio`
- Description, scripts, binaires CLI, etc.

### `package.nls.json` et fichiers `.nls.json`

Chaînes **visibles** ("Welcome to VS Code", titres de fenêtre, écrans d'accueil, etc.) → remplacées par les équivalents GitCortex. Les clés techniques restent.

### `resources/`

- Logos, icônes, manifestes de plateforme (Linux `.desktop`, Windows, macOS `Info.plist`), splash screen, favicon.

## 4. Ce qu'on NE change PAS (délibérément)

- Les noms de modules internes sous `src/vs/` (ex. `vs/editor`, `vs/platform`, `vs/workbench`) : ces chemins sont des identifiants techniques ancrés dans tout le code.
- Les clés de l'API d'extension (`vscode.*`) : compatibilité de l'écosystème.
- Les licences et mentions tiers (Microsoft, Code-OSS).
- Les références à l'amont dans la doc.

## 5. Audit du branding

Un audit des occurrences est effectué avec `grep`/`ripgrep` pour identifier les chaînes visibles vs techniques. Voir le journal de l'audit dans l'historique des commits (préfixe `fonctionnalité: ajout de la marque gitcortex`).
