<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')

async function login() {
  error.value = ''
  const { error: err } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })
  if (err) error.value = err.message
  else router.push('/')
}
</script>

<template>
  <main style="max-width: 320px; margin: 4rem auto; font-family: sans-serif">
    <h1>Helados Mary</h1>
    <input v-model="email" type="email" placeholder="Correo" style="width: 100%; margin-bottom: 8px" />
    <input v-model="password" type="password" placeholder="Contraseña" style="width: 100%; margin-bottom: 8px" @keyup.enter="login" />
    <button @click="login" style="width: 100%">Entrar</button>
    <p v-if="error" style="color: red">{{ error }}</p>
  </main>
</template>