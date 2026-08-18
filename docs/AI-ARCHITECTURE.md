# Architecture GitCortex AI

Ce document décrit la fondation d'intégration de GitCortex AI dans GitCortex Studio.

## Principe d'honnêteté

**Aucune fonctionnalité AI n'est simulée.** Tant qu'aucun backend réel n'est
enregistré, le service `IGitCortexAgentService` signale `isBackendConnected = false`
et toute commande renvoie un message clair indiquant qu'aucun agent n'a tourné.
Le code ne fabrique **jamais** un résultat d'agent.

## Architecture cible

```
Utilisateur
     |
     v
GitCortex AI  (couche de contribution dans le Workbench)
     |
     v
Projet
     |
     v
Fichiers → Terminal → Tests → Git → Déploiement
```

La couche GitCortex AI est une **contribution réelle au Workbench VS Code**
(catégorie `src/vs/workbench/contrib/gitcortex/`), pas une interface séparée.

## Composants réels (compilés, 0 erreur TS)

### `src/vs/workbench/contrib/gitcortex/common/gitcortex.ts`
- Interface `IGitCortexAgentService` (service DI, `createDecorator`).
- `IGitCortexAgentBackend` : contrat pour un backend externe.
- `IGitCortexAgentCapabilities` : drapeaux honnêtes de capacité
  (readsFiles, writesFiles, runsTerminal, runsTests, usesGit, deploys).
- `GitCortexBackendNotConnectedError` : erreur explicite quand aucun backend.

### `src/vs/workbench/contrib/gitcortex/common/gitcortexAgentService.ts`
- Implémentation par défaut `GitCortexAgentService`.
- `registerSingleton` (DI réelle de VS Code).
- `run()` renvoie `{ connected: false, error: ... }` si aucun backend — pas de fake.

### `src/vs/workbench/contrib/gitcortex/common/openhands.ts`
- Interface d'adaptateur `IOpenHandsAdapterDescriptor` + `IOpenHandsBackendFactory`.
- **Aucun code OpenHands n'est copié dans le dépôt.** C'est un contrat d'adaptateur
  ; l'implémentation réelle (pont vers un runtime d'agent externe) est livrée
  séparément (ex. extension). Le cœur reste runtime-agnostique.

### `src/vs/workbench/contrib/gitcortex/browser/gitcortex.contribution.ts`
- Enregistre un **vrai View Container** dans l'Activity Bar
  (`workbench.view.gitcortex`, icône `Codicon.hubot`).
- Commandes réelles dans la Command Palette :
  - `gitcortex.runAgent` — affiche honnêtement que le backend n'est pas connecté
    si c'est le cas.
  - `gitcortex.showStatus` — affiche l'état de connexion du backend.
- Entrée dans le menu View.
- Enregistrée dans `src/vs/workbench/workbench.common.main.ts` comme toutes les
  autres contributions VS Code.

## Mains ouvertes (OpenHands)

L'intégration OpenHands se fait via l'interface `IOpenHandsBackendFactory` :

```
GitCortex Studio
       |
       v
IGitCortexAgentService  (cœur, runtime-agnostique)
       |
       v
IOpenHandsBackendFactory  (adaptateur, hors-arbre)
       |
       v
Runtime d'agent externe (ex. OpenHands agent-server)
       |
       v
Outils de l'espace de travail (fichiers, terminal, tests, git, déploiement)
```

L'adaptateur concret sera livré séparément (ex. extension `gitcortex-ai`)
afin de ne pas vendoriser de code tiers dans le dépôt principal.

## Statut

| Composant | État |
|---|---|
| Interface du service AI | **Fait** (compilé) |
| View Container Activity Bar | **Fait** (compilé) |
| Commandes Command Palette | **Faites** (compilées) |
| Interface adaptateur OpenHands | **Faite** (contrat) |
| Backend agent réel | **Futur** — non connecté volontairement |
| Adaptateur OpenHands concret | **Futur** — livré hors-arbre |

La fondation est en place et honnête. Le backend sera branché lorsqu'un runtime
d'agent réel sera disponible.
