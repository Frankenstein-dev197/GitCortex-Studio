# CODE-OSS-UPSTREAM — Provenance de la base importée

GitCortex Studio est dérivé de la **véritable base open source de Microsoft
Visual Studio Code / Code-OSS**. Ce document enregistre précisément l'origine
de l'import, le commit exact, la version et la méthode. Il est mis à jour à
chaque synchronisation avec l'amont (voir `docs/UPSTREAM-SYNC.md`).

## Métadonnées de l'import initial

| Champ                | Valeur                                                       |
|----------------------|--------------------------------------------------------------|
| Amont (upstream)     | https://github.com/microsoft/vscode                          |
| Commit amont         | `a5b500951314efd502d07465bd138dfbd714a960`                   |
| Tag amont            | `1.133.0`                                                    |
| Version amont        | 1.133.0                                                      |
| Date du commit amont | 2026-08-11                                                   |
| Date de l'import     | 2026-08-18                                                   |
| Méthode d'import     | `git clone --depth=1 --branch 1.133.0` puis copie du contenu (hors `.git`) dans le dépôt GitCortex-Studio. L'historique amont n'est **pas** importé : la base est enregistrée comme un snapshot propre. Le SHA amont ci-dessus identifie de façon univoque l'état exact du code importé. |
| Branche cible        | `main` (dépôt Frankenstein-dev197/GitCortex-Studio)          |

## Vérification de l'import

Le code importé provient bien du dépôt officiel `microsoft/vscode`. On peut le
vérifier en comparant le contenu de `src/`, `build/`, `extensions/`,
`product.json`, `package.json` avec le commit amont ci-dessus.

Les fichiers suivants sont conservés **verbatim** depuis l'amont (non modifiés
par GitCortex) pour préserver les licences et attributions :

- `LICENSE.txt` — MIT, copyright Microsoft Corporation
- `ThirdPartyNotices.txt`
- `cgmanifest.json`, `cglicenses.json`
- `src/vs/` — le moteur (Monaco, Workbench, platform, base, code, server)
- `build/` — le système de build
- `extensions/` — les extensions intégrées
- `resources/` (darwin, linux, win32, server, completions) — manifestes et icônes amont

Les fichiers modifiés par GitCortex (branding ciblé) sont listés dans
`docs/BRANDING.md`.

## Ne pas prétendre

Conformément à la mission fondatrice : GitCortex Studio n'a pas importé VS Code
« en secret ». L'import ci-dessus est réel et traçable via le SHA amont. Toute
synchronisation future mettra à jour ce fichier.
