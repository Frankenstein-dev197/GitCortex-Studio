# GitCortex Studio

<p align="center">
  <strong>GitCortex Studio</strong> — un éditeur de code de bureau professionnel basé sur la véritable base open source de Visual Studio Code / Code-OSS publiée par Microsoft.
</p>

---

## Qu'est-ce que GitCortex Studio ?

GitCortex Studio est un IDE (Integrated Development Environment) de bureau construit **à partir de la véritable base open source de Microsoft Visual Studio Code**. Il ne s'agit pas d'une maquette, ni d'un éditeur simplifié, ni d'une interface web qui ressemble à VS Code : c'est le moteur réel de Code-OSS, rebrandé et étendu progressivement sous l'identité **GitCortex**.

GitCortex Studio conserve l'expérience professionnelle complète de VS Code :

- **Activity Bar** (barre d'activité)
- **Side Bar** (barre latérale) et **Explorer**
- **Editor** avec onglets (tabs)
- **Panel** : Terminal, Problems, Output, Debug Console
- **Status Bar** (barre d'état)
- **Command Palette** (palette de commandes)
- **Search** (recherche globale)
- **Source Control** (gestion de version Git)
- **Run and Debug** (exécuter et déboguer)
- **Tests**
- **Extensions** (hôte d'extension VS Code)

Le but est de **transformer le produit**, pas de reconstruire un éditeur depuis zéro. Le moteur Monaco, le Workbench, le système de contributions, l'hôte d'extension et l'architecture interne de VS Code sont conservés.

## Identité du produit

| Champ               | Valeur              |
|---------------------|---------------------|
| Nom                  | GitCortex Studio    |
| Nom court            | GitCortex           |
| Application ID       | `studio.gitcortex`  |
| Protocol             | `gitcortex://`      |
 | Data directory      | `GitCortexStudio`   |
| Dépôt                | Frankenstein-dev197/GitCortex-Studio |

## Provenance (upstream)

GitCortex Studio est dérivé du dépôt officiel Microsoft VS Code :

- **Amont (upstream) :** https://github.com/microsoft/vscode

Le commit exact, la version et la méthode d'import sont documentés dans [`CODE-OSS-UPSTREAM.md`](./CODE-OSS-UPSTREAM.md). L'analyse de l'architecture Code-OSS est documentée dans [`docs/CODE-OSS-ARCHITECTURE.md`](./docs/CODE-OSS-ARCHITECTURE.md).

## Licence

GitCortex Studio conserve les licences d'origine du code provenant de Microsoft / Code-OSS et de ses composants tiers. Voir le fichier [`LICENSE`](./LICENSE) et [`ThirdPartyNotices.txt`](./ThirdPartyNotices.txt) (provenant de l'amont). Les modifications propres à GitCortex sont apportées dans le respect de ces obligations de licence.
