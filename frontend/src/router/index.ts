import { createRouter, createWebHistory, type RouterHistory } from 'vue-router'
import { useSessionStore } from '@/stores/session'

export function createAppRouter(history: RouterHistory) {
  const router = createRouter({
    history,
    routes: [
      { path: '/login', component: () => import('@/pages/LoginPage.vue'), meta: { public: true } },
      { path: '/', component: () => import('@/pages/HomePage.vue') },
      { path: '/gatherings/new', component: () => import('@/pages/GatheringCreatePage.vue') },
      { path: '/gatherings/:id/edit', component: () => import('@/pages/GatheringEditPage.vue') },
    ],
  })

  router.beforeEach((to) => {
    const { isAuthenticated } = useSessionStore()
    if (!to.meta.public && !isAuthenticated) return '/login'
    if (to.path === '/login' && isAuthenticated) return '/'
  })

  return router
}

export default createAppRouter(createWebHistory(import.meta.env.BASE_URL))
