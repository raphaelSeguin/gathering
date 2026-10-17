<script setup lang="ts">
import type { RegistrationResult } from '@/api/types'

defineProps<{ status: RegistrationResult['status'] }>()

const labels: Record<RegistrationResult['status'], string> = {
  confirmed: 'Registered',
  waitlisted: 'Waitlisted',
}
</script>

<template>
  <span class="badge" :class="`badge--${status}`">{{ labels[status] }}</span>
</template>
