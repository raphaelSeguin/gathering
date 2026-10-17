<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import GatheringList from '@/components/GatheringList.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import { useGatheringsStore } from '@/stores/gatherings'

const store = useGatheringsStore()
const { available, joined, organized, loading, error, lastRegistration } = storeToRefs(store)

const announcement = computed(() => {
  if (!lastRegistration.value) return ''
  const { title, status } = lastRegistration.value
  return status === 'confirmed'
    ? `You are registered for ${title}`
    : `You are on the waitlist for ${title}`
})

onMounted(() => store.fetchAll())
</script>

<template>
  <main class="page">
    <h1>Gatherings</h1>
    <p class="status" aria-live="polite">{{ announcement }}</p>
    <ErrorMessage :message="error" />

    <GatheringList
      heading="Open gatherings"
      :gatherings="available"
      empty-message="No open gathering to register for."
    >
      <template #actions="{ gathering }">
        <button
          type="button"
          :aria-label="`Register for ${gathering.title}`"
          :disabled="loading"
          @click="store.register(gathering.id)"
        >
          Register
        </button>
      </template>
    </GatheringList>

    <GatheringList
      heading="My registrations"
      :gatherings="joined"
      empty-message="You are not registered for any gathering yet."
    />

    <GatheringList
      heading="Organized by me"
      :gatherings="organized"
      empty-message="You do not organize any gathering yet."
    >
      <template #actions="{ gathering }">
        <RouterLink :to="`/gatherings/${gathering.id}/edit`" :aria-label="`Edit ${gathering.title}`">
          Edit
        </RouterLink>
      </template>
    </GatheringList>
  </main>
</template>
