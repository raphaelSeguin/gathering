# Frontend

## Commandes
- `pnpm run dev` : serveur de développement
- `pnpm test` : tests Vitest

## Conventions
- Vue 3, Composition API, `<script setup lang="ts">`.
- Tous les appels HTTP passent par `src/api/client.ts`.
- L'utilisateur courant est stocké dans le sessionStorage
  et envoyé dans l'en-tête X-User-Id.

## Accessibilité
- HTML sémantique : vrais `<button>`, `<label>` sur chaque champ.
- Focus visible, messages d'erreur annoncés avec aria-live.
