<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabase'

const materias = ref([])
const proveedores = ref([])
const compras = ref([])
const error = ref('')
const ok = ref('')

const hoy = () => new Date().toLocaleDateString('en-CA')
const nueva = () => ({
  id: crypto.randomUUID(),
  proveedor_id: '',
  proveedor_nombre: '',
  fecha: hoy(),
  notas: '',
  items: [{ materia_prima_id: '', cantidad: 1, precio_unitario: 0 }],
})
const form = ref(nueva())

const total = computed(() =>
  form.value.items.reduce((s, i) => s + Number(i.cantidad) * Number(i.precio_unitario), 0)
)
const unidadDe = (id) => materias.value.find((m) => m.id === id)?.unidad_compra ?? ''

async function cargar() {
  const [m, p, c] = await Promise.all([
    supabase.from('materias_primas').select('id,nombre,unidad_compra').eq('activa', true).order('nombre'),
    supabase.from('proveedores').select('id,nombre').order('nombre'),
    supabase.from('compras').select('id,fecha,total,proveedores(nombre)')
      .order('fecha', { ascending: false }).order('creado_en', { ascending: false }).limit(20),
  ])
  const fallo = m.error || p.error || c.error
  if (fallo) { error.value = fallo.message; return }
  materias.value = m.data
  proveedores.value = p.data
  compras.value = c.data
}

async function guardar() {
  error.value = ''
  ok.value = ''
  const f = form.value
  const items = f.items.filter((i) => i.materia_prima_id)
  if (!items.length) { error.value = 'Agrega al menos un insumo'; return }
  const { error: e } = await supabase.rpc('registrar_compra', {
    p_id: f.id,
    p_proveedor_id: f.proveedor_id || null,
    p_proveedor_nombre: f.proveedor_nombre || null,
    p_fecha: f.fecha,
    p_notas: f.notas || null,
    p_items: items.map((i) => ({
      materia_prima_id: i.materia_prima_id,
      cantidad: Number(i.cantidad),
      precio_unitario: Number(i.precio_unitario),
    })),
  })
  if (e) { error.value = e.message; return }
  ok.value = 'Compra registrada'
  form.value = nueva()
  cargar()
}

onMounted(cargar)
</script>

<template>
  <main class="wrap">
    <RouterLink to="/">← Inicio</RouterLink>
    <h1>Compras</h1>

    <label>Proveedor</label>
    <select v-model="form.proveedor_id">
      <option value="">— nuevo o ninguno —</option>
      <option v-for="p in proveedores" :key="p.id" :value="p.id">{{ p.nombre }}</option>
    </select>
    <input v-if="!form.proveedor_id" v-model="form.proveedor_nombre" placeholder="Nombre del proveedor nuevo" />

    <label>Fecha</label>
    <input v-model="form.fecha" type="date" />

    <label>Insumos</label>
    <div v-for="(it, i) in form.items" :key="i" class="fila">
      <div class="campo campo-insumo">
        <label>Insumo</label>
        <select v-model="it.materia_prima_id">
          <option value="">Seleccionar…</option>
          <option v-for="m in materias" :key="m.id" :value="m.id">{{ m.nombre }}</option>
        </select>
      </div>
      <div class="campo">
        <label>Cantidad{{ unidadDe(it.materia_prima_id) ? ' (' + unidadDe(it.materia_prima_id) + ')' : '' }}</label>
        <input v-model.number="it.cantidad" type="number" step="any" min="0" />
      </div>
      <div class="campo">
        <label>Precio por {{ unidadDe(it.materia_prima_id) || 'unidad' }} (RD$)</label>
        <input v-model.number="it.precio_unitario" type="number" step="any" min="0" />
      </div>
      <button class="quitar" @click="form.items.splice(i, 1)">Quitar</button>
    </div>
    <button @click="form.items.push({ materia_prima_id: '', cantidad: 1, precio_unitario: 0 })">
      + Agregar insumo
    </button>

    <p><strong>Total: RD$ {{ total.toFixed(2) }}</strong></p>
    <button @click="guardar">Registrar compra</button>
    <p v-if="error" style="color: red">{{ error }}</p>
    <p v-if="ok" style="color: green">{{ ok }}</p>

    <h2>Últimas compras</h2>
    <ul>
      <li v-for="c in compras" :key="c.id">
        {{ c.fecha }} · {{ c.proveedores?.nombre ?? 'Sin proveedor' }} · RD$ {{ Number(c.total).toFixed(2) }}
      </li>
    </ul>
  </main>
</template>

<style scoped>
.wrap { max-width: 640px; margin: 1rem auto; padding: 0 1rem; font-family: sans-serif; }
input, select { display: block; width: 100%; box-sizing: border-box; margin-bottom: 8px; padding: 6px; }
label { display: block; font-size: 0.85rem; margin-top: 6px; }
.fila { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; align-items: end; border-bottom: 1px solid #ddd; padding: 8px 0; }
.campo label { margin-top: 0; }
.campo-insumo { grid-column: 1 / -1; }
.quitar { grid-column: 1 / -1; justify-self: end; }
.fila input, .fila select { margin-bottom: 0; }
</style>