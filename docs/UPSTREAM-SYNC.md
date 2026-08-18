# Stratégie de synchronisation avec l'amont — GitCortex Studio

GitCortex Studio est dérivé du dépôt officiel Microsoft VS Code :
https://github.com/microsoft/vscode

## 1. Origine de l'import

L'import initial et le commit exact de l'amont sont documentés dans [`CODE-OSS-UPSTREAM.md`](../CODE-OSS-UPSTREAM.md). Toute modification future de la base amont doit mettre à jour ce fichier.

## 2. Pourquoi synchroniser

L'amont VS Code reçoit des corrections de sécurité, des améliorations de performance et de nouvelles fonctionnalités. GitCortex Studio souhaite bénéficier de ces évolutions tout en conservant son identité et ses extensions propres.

## 3. Méthode de synchronisation (plan)

1. Ajouter l'amont comme remote supplémentaire :
   ```bash
   git remote add upstream https://github.com/microsoft/vscode.git
   git fetch upstream
   ```
2. Créer une branche de synchronisation depuis `main` :
   ```bash
   git checkout -b sync/upstream-<date>
   ```
3. Fusionner (ou rebaser) les changements de l'amont :
   ```bash
   git merge upstream/main   # ou git rebase upstream/main
   ```
4. Résoudre les conflits en priorité sur :
   - `product.json`, `package.json`, `package.nls.json` (conflits de branding),
   - `resources/` (logos/icônes GitCortex),
   - `docs/` (documentation GitCortex),
   - `CODE-OSS-UPSTREAM.md` (mettre à jour le SHA/version).
5. Recompiler (`yarn install` + `yarn compile`) et valider.
6. Mettre à jour `CODE-OSS-UPSTREAM.md` avec le nouveau commit amont.

## 4. Conflits connus à anticiper

- **Branding** : les fichiers de marque GitCortex (`product.json`, chaînes visibles, logos) doivent être préservés lors des merges.
- **Identifiants techniques** : ne pas réintroduire accidentellement des chaînes `vscode` là où GitCortex a délibérément gardé des identifiants techniques.

## 5. Fréquence

Synchronisation recommandée à chaque version majeure de l'amont, ou en cas d'alerte de sécurité importante.
