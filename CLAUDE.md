# Meetup — gestion d'événements avec liste d'attente

Projet de démonstration : DDD, architecture hexagonale, TDD.
Monorepo : `backend/` (Fastify, TypeScript) et `frontend/` (Vue 3, Vite).

## Règles de travail
- Toujours en TDD : écrire un test qui échoue avant tout code de production.
- Petits pas : un comportement par cycle, un commit par cycle vert.
- Messages de commit en français, au format Conventional Commits.
- Ne jamais ajouter de dépendance sans me le proposer d'abord.
- Le langage métier est en anglais dans le code : Event, Registration,
  Waitlist, Organizer, Participant.

## Périmètre volontairement exclu
Authentification réelle, paiement, recherche, modification du titre ou de la date.
