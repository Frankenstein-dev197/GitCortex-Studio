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

- ❌ Marketplace GitCortex : non implémentée.
- ⏳ Étude Open VSX : à mener.
- ✅ Hôte d'extension VS Code : conservé (hérité de l'amont).

## 5. Extensions GitCortex (futures)

Pourront être proposées, **si elles respectent l'architecture réelle de VS Code** :

- `extensions/gitcortex-ai` — point d'entrée de l'agent (future)
- `extensions/gitcortex-tools` — outils GitCortex (future)
- `extensions/gitcortex-theme` — thème GitCortex (future)
