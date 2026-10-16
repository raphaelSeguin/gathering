---
paths:
  - "backend/src/domain/**"
---

# Domaine
- Le domaine n'importe rien d'extérieur : ni Fastify, ni Prisma, ni Zod.
- Je l'écris moi-même en TDD. Ne modifie pas ces fichiers sans demande
  explicite. Propose plutôt le prochain test de la liste.
- Les invariants sont protégés par l'agrégat Event, jamais par les cas d'usage.
- Les erreurs métier sont des classes dédiées dans errors.ts.
