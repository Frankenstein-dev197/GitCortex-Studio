# Roadmap — GitCortex Studio

Cette roadmap présente l'état réel et planifié du produit. **Aucune fonctionnalité n'est marquée "terminée" sans avoir été vérifiée.**

## Statut actuel

| Étape | Description | Statut |
|-------|-------------|--------|
| 1 | Création du dépôt GitCortex-Studio | ✅ Terminée |
| 2 | Clonage de Microsoft VS Code | ✅ Terminée |
| 3 | Analyse de l'architecture Code-OSS | ✅ Terminée (voir `docs/CODE-OSS-ARCHITECTURE.md`) |
| 4 | Import de la vraie base | ✅ Terminée (voir `CODE-OSS-UPSTREAM.md`) |
| 5 | Compilation de la base originale | ⏳ En cours (headless) |
| 6-7 | Rebranding GitCortex | ⏳ En cours |
| 8 | Vérification post-branding | ⏳ À faire |
| 9 | Intégration GitCortex AI | 🔜 Future (couche d'intégration) |
| 10 | Intégration Marketplace/Open VSX | 🔜 Future |
| 11-14 | Build / tests / corrections / docs | ⏳ En cours |
| 15 | Validation finale + push | ⏳ À faire |

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
