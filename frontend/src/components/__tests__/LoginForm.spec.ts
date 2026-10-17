import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoginForm from '../LoginForm.vue'

describe('LoginForm', () => {
  it('has labelled, required username and password fields', () => {
    const wrapper = mount(LoginForm)

    const username = wrapper.get('input#username')
    const password = wrapper.get('input#password')
    expect(wrapper.get('label[for="username"]').text()).toBe('Username')
    expect(wrapper.get('label[for="password"]').text()).toBe('Password')
    expect(username.attributes('required')).toBeDefined()
    expect(password.attributes('type')).toBe('password')
    expect(password.attributes('required')).toBeDefined()
  })

  it('emits the trimmed username on submit', async () => {
    const wrapper = mount(LoginForm)

    await wrapper.get('input#username').setValue('  alice ')
    await wrapper.get('input#password').setValue('secret')
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('submit')).toEqual([['alice']])
  })
})
