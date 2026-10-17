export type GatheringFormValues = {
  title: string
  description: string
  /** value of an `<input type="datetime-local">`, in local time */
  date: string
  capacity: number | null
}

export type GatheringFormErrors = Partial<Record<keyof GatheringFormValues, string>>

export function validateGatheringForm(values: GatheringFormValues, now: Date): GatheringFormErrors {
  const errors: GatheringFormErrors = {}

  if (!values.title.trim()) {
    errors.title = 'Title is required'
  }
  if (!values.description.trim()) {
    errors.description = 'Description is required'
  }
  if (!values.date) {
    errors.date = 'Date is required'
  } else if (new Date(values.date) <= now) {
    errors.date = 'Date must be in the future'
  }
  if (values.capacity === null || !Number.isInteger(values.capacity) || values.capacity < 1) {
    errors.capacity = 'Capacity must be a whole number of at least 1'
  }

  return errors
}
