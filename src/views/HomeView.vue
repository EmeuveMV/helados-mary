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
  <main style="max-width: 480px; margin: 4rem auto; font-family: sans-serif">
    <h1>Bienvenido a Helados Mary</h1>
    <button @click="logout">Cerrar sesión</button>
  </main>
</template>