# Architecture — GitCortex Studio

GitCortex Studio est un IDE de bureau basé sur la **véritable base open source de Microsoft VS Code / Code-OSS**. L'architecture interne est celle de VS Code ; ce document résume la structure et renvoie vers les documents détaillés.

## 1. Provenance

- **Amont :** https://github.com/microsoft/vscode
- **Commit d'import :** voir `CODE-OSS-UPSTREAM.md`
- **Analyse amont :** voir `docs/CODE-OSS-ARCHITECTURE.md`

## 2. Structure du dépôt

| Chemin               | Rôle                                                      |
|----------------------|-----------------------------------------------------------|
| `src/vs/base/`       | Utilitaires de base (types, events, network, etc.)       |
| `src/vs/platform/`   | Services transverses réutilisables (storage, config, etc.)|
| `src/vs/editor/`     | **Monaco** — le moteur d'éditeur                          |
| `src/vs/workbench/`  | **Le Workbench** : activity bar, side bar, panel, etc.    |
| `src/vs/code/`       | Points d'entrée Electron + entry web                      |
| `build/`             | Scripts de build (gulp, esbuild, electron)                |
| `extensions/`        | Extensions intégrées                                      |
| `resources/`         | Icônes, logos, manifestes de plateforme                   |
| `product.json`       | Configuration produit (nom, applicationName, etc.)        |
| `package.json`       | Dépendances, scripts, configuration                       |

## 3. Principes

1. **On ne réinvente pas** Monaco, le Workbench, l'Explorer, le terminal, Git, le débogueur, l'hôte d'extension, etc.
2. **On ne détruit pas le Workbench** pour créer un dashboard web.
3. Le branding est appliqué de façon ciblée (voir `docs/BRANDING.md`).
4. Les licences et mentions tiers sont conservées (voir `LICENSE`, `ThirdPartyNotices.txt`).

## 4. Évolutions GitCortex (futures)

- GitCortex AI — voir `docs/AI-ARCHITECTURE.md`
- Marketplace — voir `docs/MARKETPLACE.md`
- Extensions GitCortex — voir `docs/EXTENSIONS.md`
- Sync amont — voir `docs/UPSTREAM-SYNC.md`
- Roadmap — voir `docs/ROADMAP.md`
