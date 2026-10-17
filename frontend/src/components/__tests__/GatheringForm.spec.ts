import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GatheringForm from '../GatheringForm.vue'
import ErrorMessage from '../ErrorMessage.vue'
import type { GatheringFormValues } from '@/validation/gatheringForm'

const existing: GatheringFormValues = {
  title: 'Vue meetup',
  description: 'Talks about Vue',
  date: '2099-01-01T18:00',
  capacity: 10,
}

async function fill(wrapper: ReturnType<typeof mount>, values: GatheringFormValues) {
  await wrapper.get('#title').setValue(values.title)
  await wrapper.get('#description').setValue(values.description)
  await wrapper.get('#date').setValue(values.date)
  await wrapper.get('#capacity').setValue(String(values.capacity ?? ''))
}

describe('GatheringForm — create', () => {
  it('has a label for each field', () => {
    const wrapper = mount(GatheringForm, { props: { mode: 'create', serverError: null } })

    expect(wrapper.get('label[for="title"]').text()).toBe('Title')
    expect(wrapper.get('label[for="description"]').text()).toBe('Description')
    expect(wrapper.get('label[for="date"]').text()).toBe('Date')
    expect(wrapper.get('label[for="capacity"]').text()).toBe('Capacity')
    expect(wrapper.get('#description').element.tagName).toBe('TEXTAREA')
    expect(wrapper.get('#date').attributes('type')).toBe('datetime-local')
    expect(wrapper.get('#capacity').attributes('type')).toBe('number')
    expect(wrapper.get('button[type="submit"]').text()).toBe('Create gathering')
  })

  it('emits the values when they are valid', async () => {
    const wrapper = mount(GatheringForm, { props: { mode: 'create', serverError: null } })

    await fill(wrapper, existing)
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')).toEqual([[existing]])
  })

  it('shows field errors and does not emit when values are invalid', async () => {
    const wrapper = mount(GatheringForm, { props: { mode: 'create', serverError: null } })

    await fill(wrapper, { ...existing, title: '', capacity: 0 })
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
    const title = wrapper.get('#title')
    expect(title.attributes('aria-invalid')).toBe('true')
    expect(wrapper.get(`#${title.attributes('aria-describedby')}`).text()).toBe('Title is required')
    expect(wrapper.get('#capacity').attributes('aria-invalid')).toBe('true')
    expect(wrapper.get('#description').attributes('aria-invalid')).toBeUndefined()
  })

  it('shows the server error', () => {
    const wrapper = mount(GatheringForm, { props: { mode: 'create', serverError: 'Server down' } })

    expect(wrapper.getComponent(ErrorMessage).text()).toBe('Server down')
  })
})

describe('GatheringForm — edit', () => {
  it('is prefilled and only lets the capacity change', () => {
    const wrapper = mount(GatheringForm, {
      props: { mode: 'edit', initialValues: existing, serverError: null },
    })

    expect((wrapper.get('#title').element as HTMLInputElement).value).toBe('Vue meetup')
    expect(wrapper.get('#title').attributes('disabled')).toBeDefined()
    expect(wrapper.get('#description').attributes('disabled')).toBeDefined()
    expect(wrapper.get('#date').attributes('disabled')).toBeDefined()
    expect(wrapper.get('#capacity').attributes('disabled')).toBeUndefined()
    expect(wrapper.get('button[type="submit"]').text()).toBe('Save')
  })

  it('emits the values with the new capacity', async () => {
    const wrapper = mount(GatheringForm, {
      props: { mode: 'edit', initialValues: existing, serverError: null },
    })

    await wrapper.get('#capacity').setValue('25')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')).toEqual([[{ ...existing, capacity: 25 }]])
  })

  it('does not reject a date that is now in the past, since it cannot be edited', async () => {
    const wrapper = mount(GatheringForm, {
      props: { mode: 'edit', initialValues: { ...existing, date: '2000-01-01T00:00' }, serverError: null },
    })

    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')).toHaveLength(1)
  })
})
