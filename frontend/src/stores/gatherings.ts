import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { GatheringDto } from '@/api/types'
import { useSessionStore } from './session'

export const useGatheringsStore = defineStore('gatherings', () => {
  const session = useSessionStore()
  const items = ref<GatheringDto[]>([])

  const available = computed(() =>
    items.value.filter((g) => g.organizerId !== session.userId && g.myStatus === 'unregistered'),
  )
  const joined = computed(() => items.value.filter((g) => g.myStatus !== 'unregistered'))
  const organized = computed(() => items.value.filter((g) => g.organizerId === session.userId))

  return { items, available, joined, organized }
})
