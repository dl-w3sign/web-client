import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'

const routes = [
  {
    path: '/',
    name: 'app',
    component: App,
    redirect: { name: 'home' },
    children: [
      {
        path: '/home',
        name: 'home',
        component: () => import('@/pages/HomePage.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
