<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabase'

const items = ref([])
const error = ref('')
const vacio = () => ({ id: null, nombre: '', unidad_compra: '', unidad_uso: '', factor: 1, stock_minimo: 0 })
const form = ref(vacio())

async function cargar() {
  const { data, error: e } = await supabase
    .from('materias_primas').select('*').eq('activa', true).order('nombre')
  if (e) error.value = e.message
  else items.value = data
}

async function guardar() {
  error.value = ''
  const f = form.value
  const datos = {
    nombre: f.nombre.trim(),
    unidad_compra: f.unidad_compra.trim(),
    unidad_uso: f.unidad_uso.trim(),
    factor: Number(f.factor),
    stock_minimo: Number(f.stock_minimo),
  }
  if (!datos.nombre || !datos.unidad_compra || !datos.unidad_uso || !(datos.factor > 0)) {
    error.value = 'Completa nombre, unidades y un factor mayor que 0'
    return
  }
  const { error: e } = f.id
    ? await supabase.from('materias_primas').update(datos).eq('id', f.id)
    : await supabase.from('materias_primas').insert({ id: crypto.randomUUID(), ...datos })
  if (e) { error.value = e.message; return }
  form.value = vacio()
  cargar()
}

function editar(m) { form.value = { ...m } }

async function archivar(m) {
  const { error: e } = await supabase.from('materias_primas').update({ activa: false }).eq('id', m.id)
  if (e) error.value = e.message
  else cargar()
}

onMounted(cargar)
</script>

<template>
  <main class="wrap">
    <RouterLink to="/">← Inicio</RouterLink>
    <h1>Materias primas</h1>

    <label>Nombre</label>
    <input v-model="form.nombre" placeholder="Ej. Leche" />
    <label>Unidad de compra (como viene)</label>
    <input v-model="form.unidad_compra" placeholder="Ej. cartón" />
    <label>Unidad de uso (como la mide la receta)</label>
    <input v-model="form.unidad_uso" placeholder="Ej. ml" />
    <label>Cuántas unidades de uso trae 1 unidad de compra</label>
    <input v-model.number="form.factor" type="number" step="any" min="0" />
    <label>Stock mínimo (en unidad de uso)</label>
    <input v-model.number="form.stock_minimo" type="number" step="any" min="0" />
    <button @click="guardar">{{ form.id ? 'Actualizar' : 'Agregar' }}</button>
    <button v-if="form.id" @click="form = vacio()">Cancelar</button>
    <p v-if="error" style="color: red">{{ error }}</p>

    <table>
      <thead><tr><th>Insumo</th><th>Stock</th><th>Costo por uso</th><th></th></tr></thead>
      <tbody>
        <tr v-for="m in items" :key="m.id"
            :style="{ background: m.stock_minimo > 0 && m.stock <= m.stock_minimo ? '#fdd' : '' }">
          <td>{{ m.nombre }}<br /><small>1 {{ m.unidad_compra }} = {{ m.factor }} {{ m.unidad_uso }}</small></td>
          <td>{{ m.stock }} {{ m.unidad_uso }}</td>
          <td>RD$ {{ Number(m.ultimo_costo).toFixed(2) }}</td>
          <td>
            <button @click="editar(m)">Editar</button>
            <button @click="archivar(m)">Archivar</button>
          </td>
        </tr>
      </tbody>
    </table>
  </main>
</template>

<style scoped>
.wrap { max-width: 640px; margin: 1rem auto; padding: 0 1rem; font-family: sans-serif; }
input { display: block; width: 100%; box-sizing: border-box; margin-bottom: 8px; padding: 6px; }
label { display: block; font-size: 0.85rem; margin-top: 6px; }
table { width: 100%; margin-top: 16px; border-collapse: collapse; }
th, td { text-align: left; padding: 6px; border-bottom: 1px solid #ddd; }
</style>