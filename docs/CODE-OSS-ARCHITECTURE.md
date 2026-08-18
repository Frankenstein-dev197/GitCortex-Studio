# Architecture de Code-OSS (Microsoft VS Code) — Analyse réelle

> Ce document est le résultat d'une **inspection réelle** du dépôt
> https://github.com/microsoft/vscode au tag **`1.133.0`**
> (commit `a5b500951314efd502d07465bd138dfbd714a960`, 2026-08-11).
> GitCortex Studio importe cette base (voir `CODE-OSS-UPSTREAM.md`).

## 1. Structure racine

```
microsoft/vscode/
├── src/              code source TypeScript (src/vs, src/vscode-dts, src/vs/workbench …)
├── build/            scripts de build (gulp, esbuild, electron, packaging)
├── extensions/       106 extensions intégrées
├── resources/        icônes, logos, manifestes de plateforme (darwin, linux, win32, server)
├── remote/           code pour le server distant / remote development
├── cli/              CLI Rust (code-server, tunnel) — séparé
├── scripts/          scripts utilitaires
├── test/             tests d'intégration / smoke
├── product.json      configuration produit (nom, applicationName, protocole, etc.)
├── package.json      dépendances, scripts (86 scripts), version 1.133.0
├── gulpfile.mjs      orchestration du build
├── eslint.config.js  lint
├── tsfmt.json        formatage TypeScript
├── cgmanifest.json   / cglicenses.json  composants tiers & licences
├── LICENSE.txt       MIT
├── ThirdPartyNotices.txt
├── AGENTS.md / CONTRIBUTING.md / SECURITY.md  (amont)
```

## 2. `src/vs/` — le cœur

| Dossier            | Rôle |
|--------------------|------|
| `src/vs/base/`     | Fondamentaux : types, events, arrays, collections, network, strings, décorateurs, lifecycle. Brique réutilisable partout. |
| `src/vs/platform/`| Services transverses réutilisables (~106 sous-dossiers) : configuration, storage, telemetry, credentials, clipboard, environment, instantiation/DI, notifications, dialogs, quick input, layout, log, opener, progress, request, severity, etc. |
| `src/vs/editor/`   | **Monaco** — le moteur d'éditeur de code (model, view, controller, services d'éditeur, languages, commands). C'est ce qui est aussi publié séparément comme `monaco-editor`. |
| `src/vs/workbench/`| **Le Workbench** — l'IDE complet : activity bar, side bar, panel, status bar, editor groups, explorer, search, scm (Git), debug, testing, terminal, output, problems, host d'extension, commandes, contributions. |
| `src/vs/code/`     | Points d'entrée : `electron-main` (process principal Electron), `electron-utility` (shared process), `electron-browser` (renderer/workbench desktop), `node` (server), `browser` (web). |
| `src/vs/server/`    | Serveur distant (remote development). |
| `src/vs/sessions/` | Gestion de sessions. |
| `src/vs/monaco.d.ts`| Déclarations d'API publique de l'éditeur. |
| `src/vs/nls.ts`    | Internationalisation (i18n / NLS). |
| `src/vs/amdX.ts`   | loader AMD. |

### Workbench en détail (`src/vs/workbench/`)

- `api/` — implémentation de l'API d'extension VS Code (`vscode.*`).
- `browser/` — rendu navigateur/Electron (workbench, layout, parts).
- `common/` — code commun (services, composants).
- `contrib/` — **contributions** : fonctionnalités optionnelles branchées dans le workbench (explorer, search, scm, debug, testing, terminal, output, problems, welcome, walkthroughs, etc.).
- `electron-browser/` — variantes desktop (renderer).
- `services/` — services du workbench (textMate, model, editor, files, search, etc.).
- `workbench.common.main.ts`, `workbench.desktop.main.ts`, `workbench.web.main.ts` — manifestes de contributions qui assemblent les couches (commun / desktop / web).

### Système de contributions

VS Code assemble ses parties via des **layers manifests** (`*.main.ts`) qui référencent des modules à charger. Les contributions vivent dans `src/vs/workbench/contrib/` et déclarent des views, commands, actions, etc. via le `Registry`. Ce mécanisme est **conservé** tel quel par GitCortex Studio.

## 3. `build/` — système de build réel

- `gulpfile.ts` / `gulpfile.*.ts` — tâches gulp (compile, hygiene, vscode linux/win32/web, reh, extensions, editor).
- `lib/` — librairies de build (`compilation.ts`, `bundles.ts`, `esbuild.ts`, `i18n.ts`, `hygiene.ts`, `watch.ts`, `reporter.ts`, etc.).
- `buildConfig.ts`, `buildfile.ts` — configuration des bundles.
- `azure-pipelines/` — CI.
- `darwin/`, `linux/`, `win32/` (sous `resources/`) — packaging par plateforme.
- `eslint.ts`, `gulp-eslint.ts`, `hygiene.ts` — qualité de code.
- `agent-sdk/`, `codex/`, `copilot-migrate-pr.ts`, `dictation-runtime` — modules propres à l'amont (non requis pour GitCortex).

### Scripts de build (`package.json`)

- `yarn compile` → `npm-run-all2 -lp compile-client compile-copilot` où `compile-client` → `gulp compile`.
- `yarn build-fast` → transpile + extensions + copilot.
- `yarn typecheck-client`, `yarn check-cyclic-dependencies`.
- `yarn watch*` — mode watch pour le dev.

## 4. `product.json` — configuration produit (branding)

Valeurs amont (Code-OSS) au tag 1.133.0 :

| Champ                  | Valeur amont            |
|------------------------|-------------------------|
| `applicationName`      | `code-oss`              |
| `nameLong`             | `Code - OSS`            |
| `win32AppUserModelId`  | `Microsoft.CodeOSS`     |
| `win32MutexName`       | `vscodeoss`             |
| `darwinBundleIdentifier` | `com.visualstudio.code.oss` |
| `urlProtocol`          | `code-oss`              |
| `dataFolderName`       | `.vscode-oss`           |
| `serverApplicationName`| `code-server-oss`       |
| `tunnelApplicationName`| `code-tunnel-oss`       |
| `licenseName`          | `MIT`                   |

Ces champs sont les **cibles principales du rebranding GitCortex** (voir `docs/BRANDING.md`).

## 5. `extensions/` (106 extensions intégrées)

Inclut les langages (bat, cpp, csharp, css, dart, docker, fsharp, git, go, etc.), `configuration-editing`, `debug-auto-launch`, `debug-server-ready`, `diff`, `emmet`, `extension-editing`, `copilot`, etc. Ces extensions sont **conservées** par GitCortex Studio pour préserver l'expérience VS Code.

## 6. `resources/`

- `resources/darwin/` — `Info.plist`, icônes macOS.
- `resources/linux/` — `.desktop`, `code.appdata.xml`, icônes.
- `resources/win32/` — manifestes, icônes, installer.
- `resources/server/` — ressources du serveur distant.
- `resources/completions/` — complétions shell (bash, zsh, etc.).

Ces ressources contiennent les **icônes et noms visibles** qui seront rebrandés en GitCortex.

## 7. Système de licences / tiers

- `LICENSE.txt` (MIT), `ThirdPartyNotices.txt`, `cgmanifest.json`, `cglicenses.json`.
- GitCortex Studio **conserve** ces fichiers.

## 8. Ce que GitCortex Studio conserve (résumé)

- Monaco (`src/vs/editor`)
- Le Workbench (`src/vs/workbench`) — activity bar, side bar, panel, status bar, editor, tabs, terminal, problems, output, debug console, command palette, search, scm, run & debug, testing, extensions
- L'hôte d'extension et l'API `vscode.*` (`src/vs/workbench/api/`)
- Les services `src/vs/platform/`
- Les fondamentaux `src/vs/base/`
- Le build `build/` (gulp, esbuild, electron)
- Les extensions intégrées `extensions/`
- Les licences et notices tiers

## 9. Ce que GitCortex Studio modifie (ciblé)

- `product.json` — identité produit (nom, protocole, dossier de données, etc.).
- `package.json` — nom du paquet, description, scripts de lancement.
- `package.nls.json` / `.nls.json` — chaînes visibles ("Welcome to …", titres, etc.).
- `resources/` — logos, icônes, manifestes de plateforme.
- Nouveaux dossiers GitCortex : `docs/`, `resources/logos/`, `resources/icons/`, `resources/themes/`.

GitCortex Studio **ne réinvente pas** ces moteurs : il les conserve et les rebrande.
