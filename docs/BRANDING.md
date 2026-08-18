# Branding — GitCortex Studio

Ce document décrit la stratégie de rebranding de Code-OSS vers GitCortex Studio, l'audit effectué, et l'état précis après l'application du branding.

## Principe directeur

Nous transformons l'identité du produit **sans détruire l'architecture VS Code** ni casser la compatibilité avec l'écosystème d'extensions.

Le produit final doit s'afficher comme **GitCortex Studio** (et non "Visual Studio Code" ni "Code - OSS") auprès de l'utilisateur final, tout en restant un véritable IDE basé sur le moteur Code-OSS de Microsoft.

## Distinction critique (5 catégories)

Le rebranding **sépare** les catégories de références, car un remplacement aveugle de toutes les chaînes "vscode"/"Code" casserait l'écosystème :

### 1. Branding visible (MODIFIÉ)
Chaînes que l'utilisateur final voit : nom produit, titre de fenêtre, écrans d'accueil, descriptions, icônes, logos, manifestes d'application, métadonnées de packaging.

### 2. Identifiants techniques (CONSERVÉS)
Références techniques internes : `code-oss` dans chemins de modules, noms de variables internes (`VSCODE_*`), structures de dossiers internes, clés d'objets, configs de build (build/package.json, build/rspack/package.json).

### 3. Compatibilité API/extensions (CONSERVÉE)
Namespace `vscode`, `engines.vscode`, points de contribution, manifestes d'extension, contrat d'API.

### 4. Références upstream (CONSERVÉES pour attribution)
Licences, attributions, `ThirdPartyNotices.txt`, URL de licence pointant vers l'amont Microsoft.

### 5. Noms de binaires/paquets Electron (techniques, reportés)
Noms de fichiers binaires produits par l'étape de packaging Electron (ex. "Code - OSS.exe") — dépendent de l'étape de packaging, modifiés via les champs win32 de `product.json` au moment du packaging, pas par édition de texte libre.

## Identité cible GitCortex

| Champ | Valeur |
|---|---|
| Nom produit (long) | GitCortex Studio |
| Nom court | GitCortex |
| `applicationName` | `gitcortex-studio` |
| `urlProtocol` | `gitcortex` |
| `dataFolderName` | `GitCortexStudio` |
| Bundle ID (darwin) | `studio.gitcortex.Studio` |
| App User Model ID (win32) | `studio.gitcortex.Studio` |
| `linuxIconName` | `gitcortex-studio` |
| `serverApplicationName` | `gitcortex-server` |
| `tunnelApplicationName` | `gitcortex-tunnel` |

## Audit appliqué

| Fichier | Champ(s) modifié(s) | Catégorie |
|---|---|---|
| `product.json` | nameShort, nameLong, applicationName, dataFolderName, sharedDataFolderName, win32MutexName, win32DirName, win32NameVersion, win32RegValueName, win32AppUserModelId, win32ShellNameShort, win32TunnelServiceMutex, win32TunnelMutex, darwinBundleIdentifier, linuxIconName, serverApplicationName, serverDataFolderName, tunnelApplicationName, urlProtocol, win32*AppId (GUIDs valides), darwinProfile*UUID | 1 (visible) |
| `src/vs/platform/product/common/product.ts` | fallback dev nameShort/nameLong/applicationName/dataFolderName/urlProtocol/version | 1 (visible, dev) |
| `package.json` | name, description, repository, contributors (author Microsoft préservé) | 1 (visible) |
| `resources/server/manifest.json` | name, short_name | 1 (visible) |
| `resources/win32/VisualElementsManifest.xml` | ShortDisplayName | 1 (visible) |
| `resources/linux/code.appdata.xml` | summary, description | 1 (visible) |
| `resources/linux/debian/control.template` | Description | 1 (visible) |
| `resources/linux/debian/templates.template` | texte produit | 1 (visible) |
| `resources/linux/rpm/code.spec.template` | summary/description | 1 (visible) |
| `resources/linux/snap/snapcraft.yaml` | description | 1 (visible) |
| `src/vs/workbench/contrib/welcomeWalkthrough/browser/editor/vs_code_editor_walkthrough.ts` | mentions produit | 1 (visible) |
| `src/vs/workbench/contrib/welcomeOnboarding/browser/onboardingVariationA.ts` | aria-label welcome | 1 (visible) |

## Références intentionnellement CONSERVÉES (techniques)

- `scripts/code.sh` -> "Code - OSS.exe" : nom du binaire Electron téléchargé (catégorie 5). À rebrandér via le packaging win32, pas par édition libre.
- `build/package.json`, `build/npm/gyp/package.json`, `build/rspack/package.json` : noms internes de sous-workspaces de build (catégorie 2).
- Variables `VSCODE_*`, namespace `vscode`, `engines.vscode` : compatibilité API/extensions (catégorie 3).
- `LICENSE.txt`, `ThirdPartyNotices.txt`, `cgmanifest.json` : attribution upstream (catégorie 4).
- Commentaires illustratifs (ex. `// appRoot = /Applications/Visual Studio Code - Insiders.app/...`) : exemples de chemin, pas du branding runtime.

## Conserver l'interface VS Code

Le Workbench de VS Code est conservé. Les fonctionnalités GitCortex (IA, marketplace) sont intégrées dans les points d'extension existants (Activity Bar, Side Bar, Panel, Command Palette) plutôt que de remplacer l'UI.

## Suivi

Le branding visible de base est appliqué. Le branding des **icônes/binaires** (logo dans la barre de titre, .icns, .ico) et le packaging final desktop restent à finaliser lors de l'étape de packaging (ÉTAPE 11) car ils dépendent de la production des binaires. Voir `docs/ROADMAP.md`.
