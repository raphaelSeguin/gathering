import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorMessage from '../ErrorMessage.vue'

describe('ErrorMessage', () => {
  it('keeps an empty assertive live region when there is no error', () => {
    const wrapper = mount(ErrorMessage, { props: { message: null } })

    expect(wrapper.attributes('aria-live')).toBe('assertive')
    expect(wrapper.text()).toBe('')
  })

  it('shows the message inside the live region', () => {
    const wrapper = mount(ErrorMessage, { props: { message: 'Server down' } })

    expect(wrapper.text()).toBe('Server down')
  })
})
