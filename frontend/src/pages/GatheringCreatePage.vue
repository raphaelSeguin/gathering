<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import GatheringForm from '@/components/GatheringForm.vue'
import { useGatheringsStore } from '@/stores/gatherings'
import type { GatheringFormValues } from '@/validation/gatheringForm'

const store = useGatheringsStore()
const { error } = storeToRefs(store)
const router = useRouter()

onMounted(() => store.clearError())

async function onSubmit(values: GatheringFormValues) {
  const created = await store.create({
    title: values.title,
    description: values.description,
    date: new Date(values.date).toISOString(),
    capacity: values.capacity!,
  })
  if (created) {
    await router.push('/')
  }
}
</script>

<template>
  <main class="page page--narrow">
    <h1>New gathering</h1>
    <GatheringForm mode="create" :server-error="error" @submit="onSubmit" />
  </main>
</template>
