import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { GatheringCreationPayload, GatheringDto, RegistrationResult } from '@/api/types'
import { useGatheringsApi } from '@/composables/useGatheringsApi'
import { useSessionStore } from './session'

export type LastRegistration = {
  title: string
  status: RegistrationResult['status']
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Unexpected error'
}

export const useGatheringsStore = defineStore('gatherings', () => {
  const api = useGatheringsApi()
  const session = useSessionStore()

  const items = ref<GatheringDto[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastRegistration = ref<LastRegistration | null>(null)

  const available = computed(() =>
    items.value.filter((g) => g.organizerId !== session.userId && g.myStatus === 'unregistered'),
  )
  const joined = computed(() => items.value.filter((g) => g.myStatus !== 'unregistered'))
  const organized = computed(() => items.value.filter((g) => g.organizerId === session.userId))

  function upsert(gathering: GatheringDto) {
    const index = items.value.findIndex((g) => g.id === gathering.id)
    if (index === -1) {
      items.value.push(gathering)
    } else {
      items.value[index] = gathering
    }
  }

  async function run(action: () => Promise<void>): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      await action()
      return true
    } catch (e) {
      error.value = messageOf(e)
      return false
    } finally {
      loading.value = false
    }
  }

  function fetchAll() {
    return run(async () => {
      items.value = await api.list()
    })
  }

  function fetchOne(id: string) {
    return run(async () => {
      upsert(await api.get(id))
    })
  }

  function register(id: string) {
    lastRegistration.value = null
    return run(async () => {
      const { status } = await api.register(id)
      const gathering = items.value.find((g) => g.id === id)
      if (gathering) {
        gathering.myStatus = status
        gathering.participantCount += 1
        lastRegistration.value = { title: gathering.title, status }
      }
    })
  }

  function create(payload: GatheringCreationPayload) {
    return run(async () => {
      upsert(await api.create(payload))
    })
  }

  function updateCapacity(id: string, capacity: number) {
    return run(async () => {
      upsert(await api.updateCapacity(id, capacity))
    })
  }

  return {
    items,
    loading,
    error,
    lastRegistration,
    available,
    joined,
    organized,
    fetchAll,
    fetchOne,
    register,
    create,
    updateCapacity,
  }
})
