import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GatheringCard from '../GatheringCard.vue'
import StatusBadge from '../StatusBadge.vue'
import { aGathering } from '@/__tests__/fixtures'

describe('GatheringCard', () => {
  const gathering = aGathering({
    title: 'Vue meetup',
    description: 'Talks about Vue',
    date: '2027-01-01T18:00:00.000Z',
    capacity: 20,
    participantCount: 12,
    organizerId: 'bob',
  })

  it('shows the gathering details', () => {
    const wrapper = mount(GatheringCard, { props: { gathering } })

    expect(wrapper.get('h3').text()).toBe('Vue meetup')
    expect(wrapper.get('time').attributes('datetime')).toBe('2027-01-01T18:00:00.000Z')
    expect(wrapper.text()).toContain('Talks about Vue')
    expect(wrapper.text()).toContain('12 / 20 registered')
    expect(wrapper.text()).toContain('Organized by bob')
  })

  it('shows no status badge when I am not registered', () => {
    const wrapper = mount(GatheringCard, { props: { gathering } })

    expect(wrapper.findComponent(StatusBadge).exists()).toBe(false)
  })

  it.each([
    ['confirmed', 'Registered'],
    ['waitlisted', 'Waitlisted'],
  ] as const)('shows the %s status', (myStatus, label) => {
    const wrapper = mount(GatheringCard, { props: { gathering: { ...gathering, myStatus } } })

    expect(wrapper.getComponent(StatusBadge).text()).toBe(label)
  })

  it('renders the actions slot', () => {
    const wrapper = mount(GatheringCard, {
      props: { gathering },
      slots: { default: '<button>Register</button>' },
    })

    expect(wrapper.get('button').text()).toBe('Register')
  })

  it('shows no withdraw button by default', () => {
    const wrapper = mount(GatheringCard, { props: { gathering } })

    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('emits withdraw with the gathering id when the withdraw button is clicked', async () => {
    const wrapper = mount(GatheringCard, { props: { gathering, withdrawable: true } })

    const button = wrapper.get('button')
    expect(button.text()).toBe('withdraw')
    expect(button.attributes('aria-label')).toBe('Withdraw from Vue meetup')
    await button.trigger('click')

    expect(wrapper.emitted('withdraw')).toEqual([[gathering.id]])
  })
})
