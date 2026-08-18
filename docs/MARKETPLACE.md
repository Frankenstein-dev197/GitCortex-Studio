# Marketplace — GitCortex Studio

> ⚠️ **État : planifié.** Aucune marketplace GitCortex n'est développée à ce jour. Ce document décrit l'architecture cible. On ne développe **pas** de marketplace fictive.

## 1. Objectif

GitCortex Studio conserve la compatibilité avec l'écosystème d'extensions VS Code. La marketplace GitCortex (future) sera basée sur **Open VSX / Eclipse Open VSX** lorsque c'est approprié, plutôt que sur le Marketplace Microsoft (soumis à ses propres conditions).

## 2. Architecture cible

```
GitCortex Studio
   ↓
GitCortex Marketplace API
   ↓
Registre ouvert compatible VSX
   ├── Extensions
   ├── Versions
   ├── Éditeurs (publishers)
   ├── Recherche
   └── Téléchargements
```

## 3. Compatibilité des extensions

GitCortex Studio conserve l'**hôte d'extension** VS Code et l'API d'extension VS Code autant que possible : fichiers `.vsix`, commandes, contributions, serveurs de langage, thèmes, débogueurs.

## 4. État actuel

- ❌ Marketplace GitCortex dédiée : non implémentée (projet séparé futur).
- ✅ **Open VSX configuré** : `product.json` → `extensionsGallery` pointe vers le registre public Eclipse Open VSX (`https://open-vsx.org/vscode/gallery`). C'est le mécanisme officiel VS Code pour le marketplace ; aucune marketplace fictive n'est développée.
- ✅ Hôte d'extension VS Code : conservé (hérité de l'amont).

Configuration appliquée dans `product.json` :

```json
"extensionsGallery": {
  "serviceUrl": "https://open-vsx.org/vscode/gallery",
  "itemUrl": "https://open-vsx.org/vscode/item",
  "publisherUrl": "https://open-vsx.org/vscode/publisher/{publisher}",
  "resourceUrlTemplate": "https://open-vsx.org/vscode/asset/{publisher}/{name}/{version}/{type}/{path}",
  "extensionUrlTemplate": "https://open-vsx.org/vscode/asset/{publisher}/{name}/{version}/Microsoft.VisualStudio.Code.VSIXPackage",
  "controlUrl": "https://open-vsx.org/vscode/control",
  "nlsBaseUrl": "https://open-vsx.org/vscode/extensionLanguageResources"
}
```

## 5. Extensions GitCortex (futures)

Pourront être proposées, **si elles respectent l'architecture réelle de VS Code** :

- `extensions/gitcortex-ai` — point d'entrée de l'agent (future)
- `extensions/gitcortex-tools` — outils GitCortex (future)
- `extensions/gitcortex-theme` — thème GitCortex (future)
