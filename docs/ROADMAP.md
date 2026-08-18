# Roadmap — GitCortex Studio

Cette roadmap présente l'état réel et planifié du produit. **Aucune fonctionnalité n'est marquée "terminée" sans avoir été vérifiée.**

## Statut actuel

| Étape | Description | Statut |
|-------|-------------|--------|
| 1 | Création du dépôt GitCortex-Studio | ✅ Terminée |
| 2 | Clonage de Microsoft VS Code | ✅ Terminée |
| 3 | Analyse de l'architecture Code-OSS | ✅ Terminée (voir `docs/CODE-OSS-ARCHITECTURE.md`) |
| 4 | Import de la vraie base | ✅ Terminée (voir `CODE-OSS-UPSTREAM.md`) |
| 5 | Compilation de la base originale | ✅ Terminée (`npm ci` + `npm run gulp compile` → 0 erreur TypeScript) |
| 6-7 | Rebranding GitCortex | ✅ Terminée (product layer rebrandé, voir `docs/BRANDING.md`) |
| 8 | Vérification post-branding | ✅ Terminée (re-compilation → 0 erreur TS) |
| 9 | Intégration GitCortex AI | ✅ Fondation posée (contribution Workbench réelle compilée, voir `docs/AI-ARCHITECTURE.md`) ; backend agent concret = futur |
| 10 | Intégration Marketplace/Open VSX | ✅ Open VSX configuré dans `product.json` (mécanisme officiel VS Code, voir `docs/MARKETPLACE.md`) |
| 11-14 | Build / tests / corrections / docs | ✅ Compilation validée ; docs à jour |
| 15 | Validation finale + push | ⏳ En cours (push vers GitHub) |

### Notes de validation (vérifiées réellement)

- `npm ci` : 1574 paquets, 0 erreur (modules natifs kerberos + native-keymap compilés).
- `npm run gulp compile` : "Finished compilation with 0 errors" après chaque étape de branding/intégration AI.
- BUILD NON TESTÉ GRAPHIQUEMENT : l'environnement headless ne permet pas de lancer Electron avec interface graphique. La compilation TypeScript et les modules natifs sont validés ; le lancement GUI desktop reste à valider sur une machine avec affichage.

## Fonctionnalités futures (non implémentées)

Les éléments suivants sont **planifiés mais pas encore fonctionnels**. Ils ne doivent pas être présentés comme terminés.

### GitCortex AI

- Compréhension de projet
- Lecture/recherche/création/modification de fichiers
- Exécution de commandes terminal
- Lancement et analyse de tests
- Analyse et correction d'erreurs
- Intégration Git
- Préparation de déploiement

→ Voir `docs/AI-ARCHITECTURE.md`

### Intégration d'agents externes (ex. OpenHands)

Une **interface propre** est prévue pour brancher un agent externe. Aucun code tiers n'est copié arbitrairement dans le dépôt.

### Marketplace GitCortex

Sera basée sur Open VSX / Eclipse Open VSX. Non développée à ce jour.

→ Voir `docs/MARKETPLACE.md`
