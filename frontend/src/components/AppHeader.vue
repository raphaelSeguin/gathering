<script setup lang="ts">
defineProps<{ username: string }>()

const emit = defineEmits<{ logout: [] }>()
</script>

<template>
  <header class="app-header">
    <RouterLink to="/" class="app-header__brand">Gathering</RouterLink>
    <nav aria-label="Main">
      <RouterLink to="/gatherings/new">New gathering</RouterLink>
    </nav>
    <p class="app-header__user">
      Signed in as <strong>{{ username }}</strong>
      <button type="button" @click="emit('logout')">Log out</button>
    </p>
  </header>
</template>
