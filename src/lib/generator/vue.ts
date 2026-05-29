import JSZip from 'jszip'
import type { ProjectConfig } from '@stack-init/schema'

function pascal(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
function camel(s: string) {
  return s.charAt(0).toLowerCase() + s.slice(1)
}
function kebab(s: string) {
  return s.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')
}
function plural(s: string) {
  return s.endsWith('s') ? s : s + 's'
}

export async function generateVueProject(folder: JSZip, config: ProjectConfig): Promise<void> {
  const projectName = config.name

  // ── package.json ────────────────────────────────────────────────────────────
  folder.file('package.json', JSON.stringify({
    name: 'frontend',
    private: true,
    version: '0.1.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'vue-tsc && vite build',
      preview: 'vite preview',
      typecheck: 'vue-tsc --noEmit',
      lint: 'eslint . --ext .vue,.ts --fix',
    },
    dependencies: {
      vue: '^3.5.13',
      'vue-router': '^4.5.0',
      pinia: '^2.3.1',
      axios: '^1.9.0',
    },
    devDependencies: {
      '@vitejs/plugin-vue': '^5.2.1',
      vite: '^6.3.5',
      'vue-tsc': '^2.2.10',
      typescript: '^5.8.3',
    },
  }, null, 2))

  // ── vite.config.ts ──────────────────────────────────────────────────────────
  folder.file('vite.config.ts', `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
`)

  // ── tsconfig.json ────────────────────────────────────────────────────────────
  folder.file('tsconfig.json', JSON.stringify({
    files: [],
    references: [
      { path: './tsconfig.node.json' },
      { path: './tsconfig.app.json' },
    ],
  }, null, 2))

  folder.file('tsconfig.app.json', JSON.stringify({
    extends: '@vue/tsconfig/tsconfig.dom.json',
    include: ['env.d.ts', 'src/**/*', 'src/**/*.vue'],
    exclude: ['src/**/__tests__/*'],
    compilerOptions: {
      tsBuildInfoFile: './node_modules/.tmp/tsconfig.app.tsbuildinfo',
      paths: { '@/*': ['./src/*'] },
    },
  }, null, 2))

  folder.file('tsconfig.node.json', JSON.stringify({
    extends: '@tsconfig/node22/tsconfig.json',
    include: ['vite.config.*', 'vitest.config.*', 'cypress.config.*', 'nightwatch.conf.*', 'playwright.config.*'],
    compilerOptions: {
      tsBuildInfoFile: './node_modules/.tmp/tsconfig.node.tsbuildinfo',
      module: 'ESNext',
      moduleResolution: 'Bundler',
      types: ['node'],
    },
  }, null, 2))

  // ── index.html ────────────────────────────────────────────────────────────────
  folder.file('index.html', `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"><\/script>
  </body>
</html>
`)

  // ── env.d.ts ──────────────────────────────────────────────────────────────────
  folder.file('src/env.d.ts', `/// <reference types="vite/client" />
`)

  // ── Router ────────────────────────────────────────────────────────────────────
  const routableModels = config.models.filter(m => m.generate?.routes !== false)

  const routerRoutes = routableModels.map(m => {
    const slug = plural(kebab(m.name))
    return `  { path: '/${slug}', component: () => import('../views/${m.name}ListView.vue') },
  { path: '/${slug}/new', component: () => import('../views/${m.name}FormView.vue') },
  { path: '/${slug}/:id/edit', component: () => import('../views/${m.name}FormView.vue') },`
  }).join('\n')

  folder.file('src/router/index.ts', `import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomeView },
${routerRoutes}
  ],
})

export default router
`)

  // ── Pinia store template ──────────────────────────────────────────────────────
  const storeDir = folder.folder('src/stores')!

  for (const model of routableModels) {
    const mCamel = camel(model.name)
    const mPlural = plural(mCamel)
    storeDir.file(`${mCamel}.ts`, `import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getAll${model.name}s, get${model.name}, create${model.name}, update${model.name}, delete${model.name} } from '@/api/${mCamel}'

export const use${model.name}Store = defineStore('${mCamel}', () => {
  const ${mPlural} = ref<any[]>([])
  const current = ref<any | null>(null)
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    try { ${mPlural}.value = await getAll${model.name}s() }
    finally { loading.value = false }
  }

  async function fetchOne(id: number | string) {
    loading.value = true
    try { current.value = await get${model.name}(id) }
    finally { loading.value = false }
  }

  async function create(data: Record<string, unknown>) {
    const item = await create${model.name}(data)
    ${mPlural}.value.push(item)
    return item
  }

  async function update(id: number | string, data: Record<string, unknown>) {
    const item = await update${model.name}(id, data)
    const idx = ${mPlural}.value.findIndex((i: any) => i.id === id)
    if (idx !== -1) ${mPlural}.value[idx] = item
    return item
  }

  async function remove(id: number | string) {
    await delete${model.name}(id)
    ${mPlural}.value = ${mPlural}.value.filter((i: any) => i.id !== id)
  }

  return { ${mPlural}, current, loading, fetchAll, fetchOne, create, update, remove }
})
`)
  }

  // ── API clients ───────────────────────────────────────────────────────────────
  const backendUrl = (config as any).backendUrl ?? 'http://localhost:3000'
  const apiDir = folder.folder('src/api')!

  apiDir.file('client.ts', `import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '${backendUrl}',
  headers: { 'Content-Type': 'application/json' },
})

export default api
`)

  for (const model of routableModels) {
    const mCamel = camel(model.name)
    const slug   = plural(kebab(model.name))
    apiDir.file(`${mCamel}.ts`, `import api from './client'

export async function getAll${model.name}s() {
  const res = await api.get('/${slug}')
  return res.data
}

export async function get${model.name}(id: number | string) {
  const res = await api.get(\`/${slug}/\${id}\`)
  return res.data
}

export async function create${model.name}(data: Record<string, unknown>) {
  const res = await api.post('/${slug}', data)
  return res.data
}

export async function update${model.name}(id: number | string, data: Record<string, unknown>) {
  const res = await api.patch(\`/${slug}/\${id}\`, data)
  return res.data
}

export async function delete${model.name}(id: number | string) {
  await api.delete(\`/${slug}/\${id}\`)
}
`)
  }

  // ── Views ─────────────────────────────────────────────────────────────────────
  const viewsDir = folder.folder('src/views')!

  viewsDir.file('HomeView.vue', `<template>
  <div class="home">
    <h1>${projectName}</h1>
    <nav>
      <RouterLink v-for="link in links" :key="link.to" :to="link.to">
        {{ link.label }}
      </RouterLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

const links = [
${routableModels.map(m => `  { to: '/${plural(kebab(m.name))}', label: '${plural(m.name)}' },`).join('\n')}
]
</script>

<style scoped>
nav { display: flex; gap: 1rem; margin-top: 1rem; }
nav a { color: inherit; }
</style>
`)

  for (const model of routableModels) {
    const mCamel  = camel(model.name)
    const slug    = plural(kebab(model.name))
    const mPlural = plural(model.name)

    viewsDir.file(`${model.name}ListView.vue`, `<template>
  <div>
    <h1>${mPlural}</h1>
    <RouterLink to="/${slug}/new">New ${model.name}</RouterLink>
    <div v-if="store.loading">Loading…</div>
    <ul v-else>
      <li v-for="item in store.${plural(mCamel)}" :key="item.id">
        <span>{{ item.id }}</span>
        <RouterLink :to="\`/${slug}/\${item.id}/edit\`">Edit</RouterLink>
        <button @click="remove(item.id)">Delete</button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { use${model.name}Store } from '@/stores/${mCamel}'

const store = use${model.name}Store()

onMounted(() => store.fetchAll())

async function remove(id: number | string) {
  if (confirm('Delete this ${model.name}?')) await store.remove(id)
}
</script>
`)

    const formFields = model.fields.map(f => {
      const fAny = f as any
      return `      <div>
        <label>${fAny.name}</label>
        <input v-model="form.${fAny.name}" type="text" />\n      </div>`
    }).join('\n')

    const formInit = model.fields.map(f => {
      const fAny = f as any
      return `    ${fAny.name}: '',`
    }).join('\n')

    viewsDir.file(`${model.name}FormView.vue`, `<template>
  <div>
    <h1>{{ isEdit ? 'Edit' : 'New' }} ${model.name}</h1>
    <form @submit.prevent="submit">
${formFields}
      <button type="submit">{{ isEdit ? 'Update' : 'Create' }}</button>
      <RouterLink to="/${slug}">Cancel</RouterLink>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { use${model.name}Store } from '@/stores/${mCamel}'

const route  = useRoute()
const router = useRouter()
const store  = use${model.name}Store()
const isEdit = computed(() => !!route.params.id)

const form = reactive({
${formInit}
})

onMounted(async () => {
  if (isEdit.value) {
    await store.fetchOne(route.params.id as string)
    Object.assign(form, store.current)
  }
})

async function submit() {
  if (isEdit.value) {
    await store.update(route.params.id as string, form)
  } else {
    await store.create(form)
  }
  router.push('/${slug}')
}
</script>
`)
  }

  // ── main.ts ───────────────────────────────────────────────────────────────────
  folder.file('src/main.ts', `import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
`)

  // ── App.vue ───────────────────────────────────────────────────────────────────
  folder.file('src/App.vue', `<template>
  <RouterView />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>
`)

  // ── .env.example ─────────────────────────────────────────────────────────────
  folder.file('.env.example', `VITE_API_URL=${backendUrl}\n`)
  folder.file('.env', `VITE_API_URL=${backendUrl}\n`)
}
