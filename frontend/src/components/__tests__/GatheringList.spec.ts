import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GatheringList from '../GatheringList.vue'
import GatheringCard from '../GatheringCard.vue'
import { aGathering } from '@/__tests__/fixtures'

describe('GatheringList', () => {
  it('is a section labelled by its heading', () => {
    const wrapper = mount(GatheringList, {
      props: { heading: 'Open gatherings', gatherings: [], emptyMessage: 'Nothing here' },
    })

    const section = wrapper.get('section')
    const heading = wrapper.get('h2')
    expect(heading.text()).toBe('Open gatherings')
    expect(section.attributes('aria-labelledby')).toBe(heading.attributes('id'))
  })

  it('shows the empty message when there is no gathering', () => {
    const wrapper = mount(GatheringList, {
      props: { heading: 'Open gatherings', gatherings: [], emptyMessage: 'Nothing here' },
    })

    expect(wrapper.text()).toContain('Nothing here')
    expect(wrapper.find('ul').exists()).toBe(false)
  })

  it('renders one card per gathering with its actions', () => {
    const gatherings = [aGathering({ id: 'a', title: 'A' }), aGathering({ id: 'b', title: 'B' })]
    const wrapper = mount(GatheringList, {
      props: { heading: 'Open gatherings', gatherings, emptyMessage: 'Nothing here' },
      slots: { actions: '<template #actions="{ gathering }"><button>Join {{ gathering.title }}</button></template>' },
    })

    expect(wrapper.findAllComponents(GatheringCard)).toHaveLength(2)
    expect(wrapper.findAll('li button').map((b) => b.text())).toEqual(['Join A', 'Join B'])
    expect(wrapper.text()).not.toContain('Nothing here')
  })

  it('makes cards withdrawable and forwards their withdraw event', async () => {
    const gatherings = [aGathering({ id: 'a' }), aGathering({ id: 'b' })]
    const wrapper = mount(GatheringList, {
      props: { heading: 'My registrations', gatherings, emptyMessage: 'Nothing here', withdrawable: true },
    })

    const cards = wrapper.findAllComponents(GatheringCard)
    expect(cards.map((c) => c.props('withdrawable'))).toEqual([true, true])
    await cards[1]!.get('button').trigger('click')

    expect(wrapper.emitted('withdraw')).toEqual([['b']])
  })
})
