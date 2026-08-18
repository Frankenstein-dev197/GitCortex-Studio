# AGENTS.md — Guide de l'agent pour GitCortex Studio

Ce fichier sert de mémoire persistante pour tout agent (IA ou humain) travaillant sur le dépôt GitCortex Studio. Il documente les conventions, l'architecture, le build, et les pièges à éviter.

## 1. Ce qu'est GitCortex Studio

GitCortex Studio est un IDE de bureau basé sur la **véritable base open source de Microsoft VS Code / Code-OSS**. On ne reconstruit pas un éditeur : on transforme le produit existant.

- **Upstream :** https://github.com/microsoft/vscode
- **Commit d'import :** voir `CODE-OSS-UPSTREAM.md`
- **Identité :** GitCortex Studio (`studio.gitcortex`, `gitcortex://`, dossier `GitCortexStudio`)

## 2. Règles absolues

1. **Ne pas réinventer** Monaco, le Workbench, l'Explorer, le terminal, Git, le débogueur, etc. Ces moteurs viennent de l'amont et doivent rester.
2. **Ne pas détruire le Workbench** pour créer un dashboard web. L'interface principale reste le Workbench VS Code.
3. **Ne pas faire de remplacement aveugle** de toutes les chaînes `vscode`. Séparer :
   - branding visible (à changer),
   - identifiants techniques (à conserver pour la compatibilité API/extensions),
   - références upstream et licences (à conserver).
4. **Ne pas simuler** une fonctionnalité. Si le backend d'une fonctionnalité (ex. GitCortex AI) n'existe pas encore, la marquer comme future (TODO/ROADMAP) et ne pas prétendre qu'elle fonctionne.
5. **Ne pas supprimer** les licences existantes ni les mentions tiers.

## 3. Architecture (résumé)

Voir `docs/CODE-OSS-ARCHITECTURE.md` pour l'analyse détaillée de l'amont. En bref :

- `src/vs/base/` — utilitaires de base (types, événements, réseaux, etc.)
- `src/vs/platform/` — services transverses réutilisables (stockage, configuration, etc.)
- `src/vs/editor/` — **Monaco**, le moteur d'éditeur
- `src/vs/workbench/` — **le Workbench** : activity bar, side bar, panel, status bar, etc.
- `src/vs/code/` — points d'entrée Electron et entry web
- `build/` — scripts de build (gulp, esbuild, electron)
- `extensions/` — extensions intégrées
- `resources/` — icônes, logos, manifestes de plateforme
- `product.json` — configuration produit (nom, applicationName, etc.)

## 4. Build

GitCortex Studio utilise le **vrai système de build de VS Code** (amont 1.133.0) : Node.js **v24.18.0** + **npm** + Gulp + esbuild + Electron. À noter : l'amont 1.133.0 a migré de Yarn à npm (`package-lock.json` présent, `preinstall` rejette Yarn).

```bash
npm ci              # installe les dépendances (reproductible depuis package-lock.json)
npm run compile     # compilation TypeScript headless (via gulp) — VÉRIFIÉ : 0 erreur
```

> ⚠️ Le lancement graphique d'Electron nécessite un affichage. En environnement headless, on valide la compilation (`npm run compile`) et on indique clairement "BUILD NON TESTÉ GRAPHIQUEMENT" lorsqu'on ne peut pas lancer la fenêtre.

Voir `docs/BUILD.md` pour le détail.

## 5. Rebranding

Le rebranding est appliqué de façon ciblée et propre dans :

- `product.json` — `name`, `applicationName`, `urlProtocol`, `dataFolderName`, `win32Mutex`, etc.
- `package.json` — nom du paquet, scripts, description
- `package.nls.json` / fichiers `.nls.json` — chaînes visibles
- `resources/` — logos, icônes, manifestes plateforme
- Point d'entrée Electron (`src/vs/code/electron-main/`)

Les identifiants techniques (ex. `vscode` dans les noms de modules internes, les clés d'API d'extension, les chemins de compatibilité) sont **conservés** pour ne pas casser l'écosystème. Voir `docs/BRANDING.md`.

## 6. GitCortex AI (fondation posée)

La couche d'intégration GitCortex AI est **posée et compilée** (0 erreur TS) dans `src/vs/workbench/contrib/gitcortex/` :
- `common/gitcortex.ts` — `IGitCortexAgentService`, `IGitCortexAgentBackend`, `GitCortexBackendNotConnectedError`.
- `common/gitcortexAgentService.ts` — implémentation honnête (`isBackendConnected` false jusqu'à enregistrement d'un backend ; `run()` ne simule jamais).
- `common/openhands.ts` — contrat d'adaptateur OpenHands (hors-arbre ; aucun code OpenHands vendorisé).
- `browser/gitcortex.contribution.ts` — vrai View Container Activity Bar (`workbench.view.gitcortex`) + commandes `gitcortex.runAgent` / `gitcortex.showStatus` (reflètent l'état réel).

L'architecture cible (User → GitCortex AI → Project → Files → Terminal → Tests → Git → Deploy) est préparée comme **couche d'intégration**, pas comme backend simulé. Le **backend agent concret** et l'**adaptateur OpenHands** restent futurs (livrés hors-arbre). Voir `docs/AI-ARCHITECTURE.md`.

## 7. Marketplace (Open VSX configuré)

La compatibilité avec l'écosystème d'extensions VS Code est conservée. `product.json` → `extensionsGallery` pointe vers le registre public **Eclipse Open VSX** (`open-vsx.org/vscode/gallery`). C'est le mécanisme officiel VS Code pour le marketplace ; aucune marketplace fictive n'est développée. La marketplace GitCortex dédiée reste un projet séparé futur. Voir `docs/MARKETPLACE.md`.

## 8. Conventions de commits

Préfixes : `tâche:`, `fonctionnalité:`, `prouesse:`, `compilation:`, `correction:`, `docs:`. Commits propres et atomiques.

## 9. Sync avec l'amont

La stratégie de synchronisation avec Microsoft VS Code est documentée dans `docs/UPSTREAM-SYNC.md`.

## 10. Validation

Après chaque étape importante : vérifier Git, TypeScript, JSON, dépendances, compilation, tests, build, fonctionnement. Ne jamais dire "ça fonctionne" sans l'avoir vérifié.
