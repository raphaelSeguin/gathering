<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ submit: [username: string] }>()

const username = ref('')
const password = ref('')

function onSubmit() {
  emit('submit', username.value.trim())
}
</script>

<template>
  <form class="stack" @submit.prevent="onSubmit">
    <div class="field">
      <label for="username">Username</label>
      <input id="username" v-model="username" autocomplete="username" required />
    </div>
    <div class="field">
      <label for="password">Password</label>
      <input
        id="password"
        v-model="password"
        type="password"
        autocomplete="current-password"
        required
      />
    </div>
    <button type="submit">Log in</button>
  </form>
</template>
