# Contribuer à GitCortex Studio

Merci de votre intérêt pour GitCortex Studio. Ce document explique comment contribuer proprement.

## 1. Prérequis

- **Node.js** (version LTS recommandée ; voir `package.json` `engines`)
- **Yarn** (Classic 1.x, tel qu'utilisé par l'amont VS Code)
- **Git**
- Python 3 (pour certains modules natifs)
- Un compilateur C++ (pour les modules natifs, selon la plateforme)

## 2. Récupérer le code

```bash
git clone https://github.com/Frankenstein-dev197/GitCortex-Studio.git
cd GitCortex-Studio
yarn install
```

## 3. Compiler

```bash
yarn compile        # compilation TypeScript headless
```

Pour le lancement graphique (Electron), voir `docs/BUILD.md`. En environnement headless, la compilation est validée mais la fenêtre ne peut pas être lancée.

## 4. Conventions de commits

Utiliser des préfixes courts en français (cohérents avec l'historique du projet) :

- `tâche:` — tâche d'infra ou de gestion
- `fonctionnalité:` — nouvelle fonctionnalité
- `prouesse:` — accomplissement / jalon
- `compilation:` — build
- `correction:` — correction de bug
- `docs:` — documentation

Exemple : `fonctionnalité: ajout de la marque gitcortex dans product.json`

Les commits doivent rester **atomiques** : un sujet logique par commit.

## 5. Règles de modification importantes

GitCortex Studio est dérivé de la base Microsoft VS Code. En conséquence :

1. **Ne pas détruire le Workbench** ni l'architecture interne de VS Code.
2. **Ne pas faire de remplacement aveugle** de chaînes `vscode`. Les identifiants techniques assurant la compatibilité API/extensions doivent rester.
3. **Ne pas supprimer** les licences ou les mentions tiers.
4. **Ne pas simuler** une fonctionnalité absente. Marquer `TODO` et documenter dans `docs/ROADMAP.md`.
5. Documenter toute modification de branding dans `docs/BRANDING.md`.

## 6. Code de conduite

Voir `CODE-DE-CONDUITE.md`. Soyez respectueux et professionnel.

## 7. Sécurité

Voir `SECURITE.md` pour signaler une vulnérabilité. Ne pas ouvrir d'issue publique pour des failles de sécurité.

## 8. Licence

En contribuant, vous acceptez que vos contributions soient licenciées sous les mêmes termes que le projet (voir `LICENSE`), dans le respect des licences amont Microsoft / Code-OSS.
