import { createRouter, createWebHashHistory } from 'vue-router'
import { supabase } from '../lib/supabase'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView },
    { path: '/', name: 'home', component: HomeView, meta: { requiresAuth: true } },
  ],
})

router.beforeEach(async (to) => {
  const { data } = await supabase.auth.getSession()
  if (to.meta.requiresAuth && !data.session) return '/login'
  if (to.name === 'login' && data.session) return '/'
})

export default router