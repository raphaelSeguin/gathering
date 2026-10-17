<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  validateGatheringForm,
  type GatheringFormErrors,
  type GatheringFormValues,
} from '@/validation/gatheringForm'
import ErrorMessage from './ErrorMessage.vue'

const props = defineProps<{
  mode: 'create' | 'edit'
  initialValues?: GatheringFormValues
  serverError: string | null
}>()

const emit = defineEmits<{ submit: [values: GatheringFormValues] }>()

const values = reactive<GatheringFormValues>(
  props.initialValues
    ? { ...props.initialValues }
    : { title: '', description: '', date: '', capacity: null },
)
const errors = ref<GatheringFormErrors>({})

const isEdit = computed(() => props.mode === 'edit')

function onSubmit() {
  const submitted: GatheringFormValues = {
    ...values,
    capacity: typeof values.capacity === 'number' ? values.capacity : null,
  }
  const allErrors = validateGatheringForm(submitted, new Date())
  // In edit mode only the capacity can change, so only its rule applies.
  errors.value = isEdit.value ? { capacity: allErrors.capacity } : allErrors
  if (Object.values(errors.value).some(Boolean)) {
    return
  }
  emit('submit', submitted)
}

function fieldA11y(field: keyof GatheringFormValues) {
  return errors.value[field]
    ? { 'aria-invalid': 'true' as const, 'aria-describedby': `${field}-error` }
    : {}
}
</script>

<template>
  <form class="stack" novalidate @submit.prevent="onSubmit">
    <div class="field">
      <label for="title">Title</label>
      <input id="title" v-model="values.title" :disabled="isEdit" v-bind="fieldA11y('title')" />
      <p v-if="errors.title" id="title-error" class="field__error">{{ errors.title }}</p>
    </div>
    <div class="field">
      <label for="description">Description</label>
      <textarea
        id="description"
        v-model="values.description"
        rows="4"
        :disabled="isEdit"
        v-bind="fieldA11y('description')"
      />
      <p v-if="errors.description" id="description-error" class="field__error">
        {{ errors.description }}
      </p>
    </div>
    <div class="field">
      <label for="date">Date</label>
      <input
        id="date"
        v-model="values.date"
        type="datetime-local"
        :disabled="isEdit"
        v-bind="fieldA11y('date')"
      />
      <p v-if="errors.date" id="date-error" class="field__error">{{ errors.date }}</p>
    </div>
    <div class="field">
      <label for="capacity">Capacity</label>
      <input
        id="capacity"
        v-model.number="values.capacity"
        type="number"
        min="1"
        step="1"
        v-bind="fieldA11y('capacity')"
      />
      <p v-if="errors.capacity" id="capacity-error" class="field__error">{{ errors.capacity }}</p>
    </div>
    <ErrorMessage :message="serverError" />
    <button type="submit">{{ isEdit ? 'Save' : 'Create gathering' }}</button>
  </form>
</template>
