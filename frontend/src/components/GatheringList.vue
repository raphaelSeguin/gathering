<script setup lang="ts">
import { useId } from 'vue'
import type { GatheringDto } from '@/api/types'
import GatheringCard from './GatheringCard.vue'

defineProps<{
  heading: string
  gatherings: GatheringDto[]
  emptyMessage: string
  withdrawable?: boolean
}>()

const emit = defineEmits<{ withdraw: [id: string] }>()

defineSlots<{ actions?: (props: { gathering: GatheringDto }) => unknown }>()

const headingId = useId()
</script>

<template>
  <section :aria-labelledby="headingId">
    <h2 :id="headingId">{{ heading }}</h2>
    <ul v-if="gatherings.length" class="gathering-list">
      <li v-for="gathering in gatherings" :key="gathering.id">
        <GatheringCard
          :gathering="gathering"
          :withdrawable="withdrawable"
          @withdraw="emit('withdraw', $event)"
        >
          <slot v-if="$slots.actions" name="actions" :gathering="gathering" />
        </GatheringCard>
      </li>
    </ul>
    <p v-else class="empty">{{ emptyMessage }}</p>
  </section>
</template>
