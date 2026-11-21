<script setup>
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()
async function logout() {
  await supabase.auth.signOut()
  router.push('/login')
}
</script>

<template>
  <main style="max-width: 480px; margin: 2rem auto; padding: 0 1rem; font-family: sans-serif">
    <h1>Helados Mary</h1>
    <nav style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px">
      <RouterLink to="/materias">Materias primas</RouterLink>
      <RouterLink to="/compras">Compras</RouterLink>
    </nav>
    <button @click="logout">Cerrar sesión</button>
  </main>
</template>