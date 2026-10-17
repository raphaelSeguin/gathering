<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import GatheringForm from '@/components/GatheringForm.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import { useGatheringsStore } from '@/stores/gatherings'
import { toDateTimeLocal } from '@/utils/dateTimeLocal'
import type { GatheringFormValues } from '@/validation/gatheringForm'

const store = useGatheringsStore()
const { items, error } = storeToRefs(store)
const route = useRoute()
const router = useRouter()

const id = route.params.id as string
const gathering = computed(() => items.value.find((g) => g.id === id))

const initialValues = computed<GatheringFormValues | undefined>(() =>
  gathering.value
    ? {
        title: gathering.value.title,
        description: gathering.value.description,
        date: toDateTimeLocal(gathering.value.date),
        capacity: gathering.value.capacity,
      }
    : undefined,
)

onMounted(() => {
  store.clearError()
  store.fetchOne(id)
})

async function onSubmit(values: GatheringFormValues) {
  const updated = await store.updateCapacity(id, values.capacity!)
  if (updated) {
    await router.push('/')
  }
}
</script>

<template>
  <main class="page page--narrow">
    <h1>Edit gathering</h1>
    <GatheringForm
      v-if="initialValues"
      mode="edit"
      :initial-values="initialValues"
      :server-error="error"
      @submit="onSubmit"
    />
    <template v-else>
      <ErrorMessage :message="error" />
      <p v-if="!error">Loading…</p>
    </template>
  </main>
</template>
