import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import AppHeader from '../AppHeader.vue'

function mountHeader() {
  return mount(AppHeader, {
    props: { username: 'alice' },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('AppHeader', () => {
  it('shows the username', () => {
    expect(mountHeader().text()).toContain('alice')
  })

  it('links to home and to the creation form', () => {
    const links = mountHeader().findAllComponents(RouterLinkStub)

    expect(links.map((l) => [l.text(), l.props('to')])).toEqual([
      ['Meetup', '/'],
      ['New gathering', '/gatherings/new'],
    ])
  })

  it('emits logout when the logout button is clicked', async () => {
    const wrapper = mountHeader()

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('logout')).toHaveLength(1)
  })
})
