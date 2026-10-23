<script setup lang="ts">
import { computed } from 'vue'
import type { GatheringDto } from '@/api/types'
import StatusBadge from './StatusBadge.vue'

const props = defineProps<{ gathering: GatheringDto; withdrawable?: boolean }>()
const emit = defineEmits<{ withdraw: [id: string] }>()

const formattedDate = computed(() =>
  new Date(props.gathering.date).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }),
)
</script>

<template>
  <article class="card">
    <header class="card__header">
      <h3>{{ gathering.title }}</h3>
      <StatusBadge v-if="gathering.myStatus !== 'unregistered'" :status="gathering.myStatus" />
    </header>
    <p class="card__meta">
      <time :datetime="gathering.date">{{ formattedDate }}</time>
      · Organized by {{ gathering.organizerId }}
      · {{ gathering.participantCount }} / {{ gathering.capacity }} registered
    </p>
    <p>{{ gathering.description }}</p>
    <div v-if="$slots.default || withdrawable" class="card__actions">
      <slot />
      <button
        v-if="withdrawable"
        type="button"
        :aria-label="`Withdraw from ${gathering.title}`"
        @click="emit('withdraw', gathering.id)"
      >
        withdraw
      </button>
    </div>
  </article>
</template>
