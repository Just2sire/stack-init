import JSZip from 'jszip';
import type { ProjectConfig, NamedField } from '@stack-init/schema';
import { slugify } from './common';

export async function generateReactProject(zip: JSZip, config: ProjectConfig) {
  const { models, name: projectName } = config;
  const opts = (config.react || {}) as any;

  const stateLib: string = opts.state_lib     || 'zustand';
  const formLib:  string = opts.form_lib      || 'react-hook-form';
  const uiLib:    string = opts.ui_lib        || 'shadcn';
  const httpLib:  string = opts.http_lib      || 'axios';
  const router:   string = opts.router        || 'react-router-v6';
  const css:      string = opts.css           || 'tailwind';
  const query:    string = opts.data_fetching || 'tanstack-query';

  // ── package.json ──────────────────────────────────────────────────────────────
  const deps: Record<string, string> = {
    react:       '^19.1.0',
    'react-dom': '^19.1.0',
    ...(router === 'react-router-v6' && { 'react-router-dom':           '^7.6.0'  }),
    ...(router === 'tanstack-router' && { '@tanstack/react-router':      '^1.114.0' }),
    ...(stateLib === 'zustand'       && { zustand:                       '^5.0.4'  }),
    ...(stateLib === 'redux-toolkit' && { '@reduxjs/toolkit':             '^2.6.1', 'react-redux': '^9.2.0' }),
    ...(stateLib === 'jotai'         && { jotai:                         '^2.12.3' }),
    ...(httpLib  === 'axios'         && { axios:                         '^1.9.0'  }),
    ...(httpLib  === 'ky'            && { ky:                            '^1.8.1'  }),
    ...(query    === 'tanstack-query' && { '@tanstack/react-query':       '^5.76.1' }),
    ...(query    === 'swr'           && { swr:                           '^2.3.3'  }),
    ...(formLib  === 'react-hook-form' && { 'react-hook-form':            '^7.56.4', zod: '^3.24.0' }),
    ...(formLib  === 'formik'        && { formik:                        '^2.4.6',  yup: '^1.6.1'  }),
    ...(uiLib    === 'shadcn'        && { 'class-variance-authority':    '^0.7.1',  clsx: '^2.1.1', 'tailwind-merge': '^3.3.0', 'lucide-react': '^0.511.0' }),
    ...(uiLib    === 'mui'           && { '@mui/material':               '^6.4.8',  '@emotion/react': '^11.14.0', '@emotion/styled': '^11.14.0', '@mui/icons-material': '^6.4.8' }),
    ...(uiLib    === 'antd'          && { antd:                          '^5.24.7' }),
  };

  const devDeps: Record<string, string> = {
    '@vitejs/plugin-react': '^4.5.1',
    vite:                   '^6.3.5',
    typescript:             '^5.8.3',
    '@types/react':         '^19.1.4',
    '@types/react-dom':     '^19.1.4',
    ...(css === 'tailwind' && { tailwindcss: '^4.1.7', autoprefixer: '^10.4.21', postcss: '^8.5.3' }),
  };

  zip.file('package.json', JSON.stringify({
    name:    slugify(projectName),
    version: '0.1.0',
    private: true,
    type:    'module',
    scripts: {
      dev:     'vite',
      build:   'tsc -b && vite build',
      preview: 'vite preview',
      lint:    'tsc --noEmit',
    },
    dependencies:    deps,
    devDependencies: devDeps,
  }, null, 2));

  // ── vite.config.ts ────────────────────────────────────────────────────────────
  zip.file('vite.config.ts', `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': '/src' } },
});
`);

  // ── tsconfig.json ─────────────────────────────────────────────────────────────
  zip.file('tsconfig.json', JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      useDefineForClassFields: true,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      isolatedModules: true,
      moduleDetection: 'force',
      noEmit: true,
      jsx: 'react-jsx',
      strict: true,
      baseUrl: '.',
      paths: { '@/*': ['src/*'] },
    },
    include: ['src'],
    references: [{ path: './tsconfig.node.json' }],
  }, null, 2));

  zip.file('tsconfig.node.json', JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      lib: ['ES2023'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      isolatedModules: true,
      moduleDetection: 'force',
      noEmit: true,
      strict: true,
    },
    include: ['vite.config.ts'],
  }, null, 2));

  // ── index.html ────────────────────────────────────────────────────────────────
  zip.file('index.html', `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`);

  // ── .gitignore + .env.example ─────────────────────────────────────────────────
  zip.file('.gitignore', `node_modules\ndist\ndist-ssr\n*.local\n.env\n.DS_Store\n`);
  zip.file('.env.example', `VITE_API_URL=http://localhost:3000\n`);

  // ── CSS setup ─────────────────────────────────────────────────────────────────
  if (css === 'tailwind') {
    zip.file('tailwind.config.js', `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
`);
    zip.file('postcss.config.js', `export default { plugins: { tailwindcss: {}, autoprefixer: {} } };\n`);
    zip.file('src/index.css', `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`);
  } else {
    zip.file('src/index.css', `* { box-sizing: border-box; }\nbody { margin: 0; font-family: system-ui, sans-serif; }\n`);
  }

  // ── API client ────────────────────────────────────────────────────────────────
  const apiBase = `(import.meta.env.VITE_API_URL ?? 'http://localhost:3000') + '/api'`;

  if (httpLib === 'axios') {
    zip.file('src/api/client.ts', `import axios from 'axios';

const client = axios.create({
  baseURL: ${apiBase},
  headers: { 'Content-Type': 'application/json' },
});

export default client;
`);
  } else if (httpLib === 'ky') {
    zip.file('src/api/client.ts', `import ky from 'ky';

const client = ky.extend({
  prefixUrl: ${apiBase},
  headers: { 'Content-Type': 'application/json' },
});

export default client;
`);
  } else {
    zip.file('src/api/client.ts', `const BASE_URL = ${apiBase};

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(\`\${BASE_URL}/\${path}\`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}

export const getAll  = <T>(path: string)                => req<T>(path);
export const getOne  = <T>(path: string)                => req<T>(path);
export const create  = <T>(path: string, body: unknown) => req<T>(path, { method: 'POST',   body: JSON.stringify(body) });
export const update  = <T>(path: string, body: unknown) => req<T>(path, { method: 'PUT',    body: JSON.stringify(body) });
export const remove  = (path: string)                   => req<void>(path, { method: 'DELETE' });
`);
  }

  // Per-model API files
  for (const model of models) {
    const slug = slugify(model.name);
    const mLow = model.name.toLowerCase();

    if (httpLib === 'axios') {
      zip.file(`src/api/${mLow}.api.ts`, `import client from './client';
export const ${mLow}Api = {
  findAll: ()                      => client.get<any[]>('/${slug}').then(r => r.data),
  findOne: (id: number)            => client.get<any>(\`/${slug}/\${id}\`).then(r => r.data),
  create:  (data: any)             => client.post<any>('/${slug}', data).then(r => r.data),
  update:  (id: number, data: any) => client.put<any>(\`/${slug}/\${id}\`, data).then(r => r.data),
  remove:  (id: number)            => client.delete(\`/${slug}/\${id}\`),
};
`);
    } else if (httpLib === 'ky') {
      zip.file(`src/api/${mLow}.api.ts`, `import client from './client';
export const ${mLow}Api = {
  findAll: ()                      => client.get('${slug}').json<any[]>(),
  findOne: (id: number)            => client.get(\`${slug}/\${id}\`).json<any>(),
  create:  (data: any)             => client.post('${slug}', { json: data }).json<any>(),
  update:  (id: number, data: any) => client.put(\`${slug}/\${id}\`, { json: data }).json<any>(),
  remove:  (id: number)            => client.delete(\`${slug}/\${id}\`),
};
`);
    } else {
      zip.file(`src/api/${mLow}.api.ts`, `import { getAll, getOne, create, update, remove } from './client';
export const ${mLow}Api = {
  findAll: ()                      => getAll<any[]>('${slug}'),
  findOne: (id: number)            => getOne<any>(\`${slug}/\${id}\`),
  create:  (data: any)             => create<any>('${slug}', data),
  update:  (id: number, data: any) => update<any>(\`${slug}/\${id}\`, data),
  remove:  (id: number)            => remove(\`${slug}/\${id}\`),
};
`);
    }
  }

  // ── State management ──────────────────────────────────────────────────────────
  if (stateLib === 'zustand') {
    zip.file('src/store/index.ts', `import { create } from 'zustand';

interface AppStore {
  // Add shared state here
}

export const useAppStore = create<AppStore>(() => ({}));
`);
  } else if (stateLib === 'redux-toolkit') {
    zip.file('src/store/index.ts', `import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

export const store = configureStore({ reducer: {} });

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
`);
  } else if (stateLib === 'jotai') {
    zip.file('src/store/atoms.ts', `import { atom } from 'jotai';
// Define global atoms here
export const exampleAtom = atom(0);
`);
  }

  // ── main.tsx ──────────────────────────────────────────────────────────────────
  const imports: string[] = [`import { StrictMode } from 'react';`, `import { createRoot } from 'react-dom/client';`, `import './index.css';`];
  const providersOpen:  string[] = [];
  const providersClose: string[] = [];

  if (query === 'tanstack-query') {
    imports.push(`import { QueryClient, QueryClientProvider } from '@tanstack/react-query';`);
    imports.push(`const queryClient = new QueryClient();`);
    providersOpen.push(`<QueryClientProvider client={queryClient}>`);
    providersClose.unshift(`</QueryClientProvider>`);
  }
  if (stateLib === 'redux-toolkit') {
    imports.push(`import { Provider } from 'react-redux';`, `import { store } from './store';`);
    providersOpen.push(`<Provider store={store}>`);
    providersClose.unshift(`</Provider>`);
  }
  if (uiLib === 'mui') {
    imports.push(`import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';`, `const theme = createTheme();`);
    providersOpen.push(`<ThemeProvider theme={theme}><CssBaseline />`);
    providersClose.unshift(`</ThemeProvider>`);
  }
  if (uiLib === 'antd') {
    imports.push(`import { ConfigProvider } from 'antd';`);
    providersOpen.push(`<ConfigProvider>`);
    providersClose.unshift(`</ConfigProvider>`);
  }
  imports.push(`import App from './App';`);

  const inner = [...providersOpen, `      <App />`, ...providersClose].join('\n      ');
  zip.file('src/main.tsx', `${imports.join('\n')}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      ${inner}
  </StrictMode>,
);
`);

  // ── App.tsx + routes ──────────────────────────────────────────────────────────
  if (router === 'react-router-v6') {
    const pageImports = models.map(m => {
      const pascal = toPascal(m.name);
      return `import ${pascal}ListPage from './pages/${pascal}/${pascal}ListPage';\nimport ${pascal}FormPage from './pages/${pascal}/${pascal}FormPage';`;
    }).join('\n');
    const routes = models.map(m => {
      const pascal = toPascal(m.name);
      const s = slugify(m.name);
      return `        <Route path="/${s}"     element={<${pascal}ListPage />} />\n        <Route path="/${s}/new" element={<${pascal}FormPage />} />\n        <Route path="/${s}/:id" element={<${pascal}FormPage />} />`;
    }).join('\n');
    zip.file('src/App.tsx', `import { BrowserRouter, Routes, Route } from 'react-router-dom';
${pageImports}
import HomePage from './pages/HomePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
${routes}
      </Routes>
    </BrowserRouter>
  );
}
`);
  } else if (router === 'tanstack-router') {
    zip.file('src/App.tsx', `import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';

const rootRoute    = createRootRoute({ component: Outlet });
const indexRoute   = createRoute({ getParentRoute: () => rootRoute, path: '/', component: () => <h1>${projectName}</h1> });
const routeTree    = rootRoute.addChildren([indexRoute]);
const router       = createRouter({ routeTree });

declare module '@tanstack/react-router' { interface Register { router: typeof router } }

export default function App() { return <RouterProvider router={router} />; }
`);
  } else {
    zip.file('src/App.tsx', `export default function App() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">${projectName}</h1>
    </div>
  );
}
`);
  }

  // ── HomePage ──────────────────────────────────────────────────────────────────
  zip.file('src/pages/HomePage.tsx', `export default function HomePage() {
  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">${projectName}</h1>
      <p className="text-gray-600">Welcome to your app.</p>
      <nav className="mt-6 flex flex-col gap-2">
${models.map(m => `        <a href="/${slugify(m.name)}" className="text-blue-600 hover:underline">${m.name}s</a>`).join('\n')}
      </nav>
    </main>
  );
}
`);

  // ── Per-model pages ───────────────────────────────────────────────────────────
  for (const model of models) {
    const pascal = toPascal(model.name);
    const mLow   = model.name.toLowerCase();
    const slug   = slugify(model.name);

    zip.file(`src/pages/${pascal}/${pascal}ListPage.tsx`,
      buildListPage(pascal, mLow, slug, query));

    zip.file(`src/pages/${pascal}/${pascal}FormPage.tsx`,
      buildFormPage(pascal, mLow, slug, model.fields, formLib));
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toPascal(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function buildListPage(pascal: string, mLow: string, slug: string, query: string): string {
  if (query === 'tanstack-query') {
    return `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ${mLow}Api } from '../../api/${mLow}.api';

export default function ${pascal}ListPage() {
  const queryClient = useQueryClient();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['${mLow}s'],
    queryFn:  ${mLow}Api.findAll,
  });
  const removeMutation = useMutation({
    mutationFn: ${mLow}Api.remove,
    onSuccess:  () => queryClient.invalidateQueries({ queryKey: ['${mLow}s'] }),
  });

  if (isLoading) return <p className="p-8">Loading…</p>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">${pascal}s</h1>
        <a href="/${slug}/new" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">New ${pascal}</a>
      </div>
      <table className="w-full border-collapse border border-gray-200">
        <tbody>
          {items.map((item: any) => (
            <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-4">{item.id}</td>
              <td className="py-3 px-4 flex gap-3">
                <a href={\`/${slug}/\${item.id}\`} className="text-blue-600 hover:underline">Edit</a>
                <button onClick={() => removeMutation.mutate(item.id)} className="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`;
  }

  // Plain useState fallback
  return `import { useEffect, useState } from 'react';
import { ${mLow}Api } from '../../api/${mLow}.api';

export default function ${pascal}ListPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => { ${mLow}Api.findAll().then(setItems); }, []);

  const handleDelete = async (id: number) => {
    await ${mLow}Api.remove(id);
    setItems(prev => prev.filter((i: any) => i.id !== id));
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">${pascal}s</h1>
        <a href="/${slug}/new" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">New ${pascal}</a>
      </div>
      <table className="w-full border-collapse border border-gray-200">
        <tbody>
          {items.map((item: any) => (
            <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-4">{item.id}</td>
              <td className="py-3 px-4 flex gap-3">
                <a href={\`/${slug}/\${item.id}\`} className="text-blue-600 hover:underline">Edit</a>
                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`;
}

function buildFormPage(pascal: string, mLow: string, slug: string, fields: NamedField[], formLib: string): string {
  const isNumber = (f: NamedField) => ['integer', 'bigInteger', 'tinyInteger', 'smallInteger', 'mediumInteger', 'float', 'double', 'decimal'].includes(f.type);
  const isBoolean = (f: NamedField) => f.type === 'boolean';

  if (formLib === 'react-hook-form') {
    const inputs = fields.map(f => {
      if (isBoolean(f)) return `        <label className="flex items-center gap-2"><input type="checkbox" {...register('${f.name}')} /> ${f.name}</label>`;
      return `        <div>
          <label className="block text-sm font-medium mb-1">${f.name}</label>
          <input type="${isNumber(f) ? 'number' : 'text'}" {...register('${f.name}'${isNumber(f) ? ", { valueAsNumber: true }" : ""})} className="w-full px-3 py-2 border rounded" />
        </div>`;
    }).join('\n');

    return `import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ${mLow}Api } from '../../api/${mLow}.api';

export default function ${pascal}FormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (id) ${mLow}Api.findOne(Number(id)).then(reset);
  }, [id, reset]);

  const onSubmit = async (data: any) => {
    if (id) await ${mLow}Api.update(Number(id), data);
    else    await ${mLow}Api.create(data);
    navigate('/${slug}');
  };

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold mb-6">{id ? 'Edit' : 'New'} ${pascal}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
${inputs}
        <div className="flex gap-3">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
          <button type="button" onClick={() => navigate('/${slug}')} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
        </div>
      </form>
    </div>
  );
}
`;
  }

  // Plain useState form
  const stateInit = fields.map(f => `${f.name}: ${isNumber(f) ? '0' : isBoolean(f) ? 'false' : "''"} as any`).join(', ');
  const inputs = fields.map(f => {
    if (isBoolean(f)) {
      return `        <label className="flex items-center gap-2">
          <input type="checkbox" checked={!!form.${f.name}} onChange={e => setForm(p => ({ ...p, ${f.name}: e.target.checked }))} />
          ${f.name}
        </label>`;
    }
    return `        <div>
          <label className="block text-sm font-medium mb-1">${f.name}</label>
          <input type="${isNumber(f) ? 'number' : 'text'}" value={form.${f.name}} onChange={e => setForm(p => ({ ...p, ${f.name}: e.target.value }))} className="w-full px-3 py-2 border rounded" />
        </div>`;
  }).join('\n');

  return `import { useEffect, useState } from 'react';
import { ${mLow}Api } from '../../api/${mLow}.api';

export default function ${pascal}FormPage() {
  const id = window.location.pathname.includes('/new') ? null : Number(window.location.pathname.split('/').pop());
  const [form, setForm] = useState({ ${stateInit} });

  useEffect(() => { if (id) ${mLow}Api.findOne(id).then(setForm); }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id) await ${mLow}Api.update(id, form);
    else    await ${mLow}Api.create(form);
    window.location.href = '/${slug}';
  };

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold mb-6">{id ? 'Edit' : 'New'} ${pascal}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
${inputs}
        <div className="flex gap-3">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
          <a href="/${slug}" className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</a>
        </div>
      </form>
    </div>
  );
}
`;
}
