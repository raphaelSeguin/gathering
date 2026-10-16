# Backend

## Commandes
- `pnpm test` : tests unitaires et d'intégration
- `pnpm run test:watch` : TDD en continu
- `pnpm run lint` : ESLint et vérification des types

## Architecture
- `src/domain/` : agrégats, objets-valeurs, événements de domaine
- `src/application/` : cas d'usage et ports (interfaces)
- `src/infrastructure/` : adaptateurs HTTP, persistance, notification
- Les dépendances pointent toujours vers le domaine, jamais l'inverse.
- Validation des entrées avec Zod, uniquement dans l'adaptateur HTTP.
- Erreurs métier → codes HTTP : non trouvé 404, conflit 409,
  interdit 403, règle violée 422.
