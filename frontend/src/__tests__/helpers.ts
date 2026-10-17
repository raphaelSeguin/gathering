import { createMemoryHistory, createRouter } from 'vue-router'

const Blank = { render: () => null }

/** A router with the app paths but blank components, to observe navigation from a page under test. */
export async function aTestRouter(initialPath = '/') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Blank },
      { path: '/login', component: Blank },
      { path: '/gatherings/new', component: Blank },
      { path: '/gatherings/:id/edit', component: Blank },
    ],
  })
  await router.push(initialPath)
  return router
}
