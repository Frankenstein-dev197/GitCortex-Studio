# Extensions — GitCortex Studio

GitCortex Studio conserve l'**hôte d'extension** VS Code et l'**API d'extension** VS Code autant que possible, afin de rester compatible avec l'écosystème existant.

## 1. Compatibilité conservée

On ne casse pas inutilement :

- l'hôte d'extension (extension host),
- l'API d'extension VS Code (`vscode.*`),
- le format `.vsix`,
- les commandes et contributions,
- les serveurs de langage (LSP),
- les thèmes,
- les débogueurs.

## 2. Extensions intégrées (héritées de l'amont)

Le dossier `extensions/` contient les extensions intégrées provenant de Microsoft VS Code (ex. languages, themes, debuggers de base). Ces extensions sont conservées.

## 3. Extensions GitCortex (futures)

Pourront être ajoutées **si elles respectent l'architecture réelle de VS Code** :

- `extensions/gitcortex-ai` — intégration de l'agent (future, voir `docs/AI-ARCHITECTURE.md`)
- `extensions/gitcortex-tools` — outils GitCortex (future)
- `extensions/gitcortex-theme` — thème GitCortex (future)

Aucune de ces extensions n'est présente comme fonctionnelle tant que son backend n'existe pas réellement.

## 4. Marketplace

Voir `docs/MARKETPLACE.md`.
