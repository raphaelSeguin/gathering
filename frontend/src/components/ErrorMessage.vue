<script setup lang="ts">
defineProps<{ message: string | null }>()
</script>

<template>
  <div class="error" aria-live="assertive">
    <p v-if="message">{{ message }}</p>
  </div>
</template>
