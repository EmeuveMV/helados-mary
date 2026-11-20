import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [supabase.auth.signInWithPassword({ email, password }), (supabase.auth.getSession())],
})

export default router
