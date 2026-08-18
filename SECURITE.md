# Politique de sécurité — GitCortex Studio

## Signaler une vulnérabilité

Si vous découvrez une vulnérabilité de sécurité dans GitCortex Studio, **n'ouvrez pas d'issue publique**. Merci de signaler le problème de manière responsable en contactant les mainteneurs via une issue marquée confidentielle ou via le canal indiqué sur le dépôt.

Veuillez inclure :

- Une description du problème et de son impact potentiel.
- Les étapes pour reproduire.
- La version concernée (et le commit upstream, voir `CODE-OSS-UPSTREAM.md`).
- Toute suggestion de mitigation.

## Délai de réponse

Nous accusons réception dans les meilleurs délais et nous efforçons de traiter le rapport de manière coordonnée.

## Versions supportnées

GitCortex Studio suit l'état de l'amont Microsoft VS Code au moment de l'import documenté dans `CODE-OSS-UPSTREAM.md`. Les correctifs de sécurité de l'amont seront intégrés selon la stratégie de synchronisation (voir `docs/UPSTREAM-SYNC.md`).

## Note

GitCortex Studio est dérivé d'un grand codebase open source tiers. Une partie des vulnérabilités potentielles peut provenir de l'amont ; dans ce cas, le rapport sera orienté vers le projet Microsoft VS Code lorsque c'est approprié.
