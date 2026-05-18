import JSZip from 'jszip';
import type { ProjectConfig } from '@stack-init/schema';
import { slugify, toTs } from './common';

export async function generateIntegration(zip: JSZip, config: ProjectConfig, rootDir: string = '') {
  const { models, stack, react } = config;

  const isFastAPI = stack?.includes('fastapi');
  const isNestJS  = stack?.includes('nestjs');
  const httpLib   = react?.http_lib ?? 'axios';

  const apiBaseUrl = config.backendUrl || (isFastAPI ? 'http://localhost:8000' : 'http://localhost:3000/api');
  const prefix     = rootDir ? `${rootDir}/` : '';

  // Next.js always uses process.env.NEXT_PUBLIC_* (never Vite env)
  const envVar = 'NEXT_PUBLIC_API_URL';

  // FastAPI and NestJS use PATCH for updates; Express uses PUT
  const updateMethod = (isFastAPI || isNestJS) ? 'patch' : 'put';

  // ── API client ────────────────────────────────────────────────────────────────

  if (httpLib === 'ky') {
    zip.file(`${prefix}src/lib/api.ts`, `import ky from 'ky';

const api = ky.extend({
  prefixUrl: process.env.${envVar} ?? '${apiBaseUrl}',
  hooks: {
    beforeRequest: [
      (request) => {
        if (typeof window === 'undefined') return;
        const token = localStorage.getItem('token');
        if (token) request.headers.set('Authorization', \`Bearer \${token}\`);
      },
    ],
  },
});

export default api;
`);
  } else if (httpLib === 'axios') {
    zip.file(`${prefix}src/lib/api.ts`, `import axios from 'axios';

const api = axios.create({
  baseURL: process.env.${envVar} ?? '${apiBaseUrl}',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config;
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = \`Bearer \${token}\`;
  return config;
});

export default api;
`);
  } else {
    // Native fetch wrapper
    zip.file(`${prefix}src/lib/api.ts`, `const BASE_URL = process.env.${envVar} ?? '${apiBaseUrl}';

function getHeaders() {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = \`Bearer \${token}\`;
  }
  return headers;
}

const api = {
  get: <T>(path: string) => fetch(\`\${BASE_URL}\${path}\`, { headers: getHeaders() }).then(r => r.json() as Promise<T>),
  post: <T>(path: string, data: unknown) => fetch(\`\${BASE_URL}\${path}\`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(r => r.json() as Promise<T>),
  patch: <T>(path: string, data: unknown) => fetch(\`\${BASE_URL}\${path}\`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify(data) }).then(r => r.json() as Promise<T>),
  put: <T>(path: string, data: unknown) => fetch(\`\${BASE_URL}\${path}\`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(r => r.json() as Promise<T>),
  delete: (path: string) => fetch(\`\${BASE_URL}\${path}\`, { method: 'DELETE', headers: getHeaders() }),
};

export default api;
`);
  }

  // ── Entity types + API services ───────────────────────────────────────────────

  for (const model of models) {
    const slug = slugify(model.name);

    const fieldLines = model.fields
      .map((f) => `  ${f.name}${f.nullable ? '?' : ''}: ${f.values?.length ? f.values.map(v => `'${v}'`).join(' | ') : toTs(f.type)};`)
      .join('\n');

    zip.file(`${prefix}src/types/${model.name}.ts`, `export interface ${model.name} {
  id: number;
${fieldLines}
  created_at: string;
  updated_at: string;
}

export type Create${model.name}Dto = Omit<${model.name}, 'id' | 'created_at' | 'updated_at'>;
export type Update${model.name}Dto = Partial<Create${model.name}Dto>;
`);

    // API service — adapt to http_lib
    if (httpLib === 'ky') {
      zip.file(`${prefix}src/api/${slug}.ts`, `import api from '../lib/api';
import type { ${model.name}, Create${model.name}Dto, Update${model.name}Dto } from '../types/${model.name}';

export const ${model.name}Api = {
  getAll: (params?: Record<string, string>) =>
    api.get<${model.name}[]>('${slug}', { searchParams: params }).json(),

  getById: (id: number) =>
    api.get<${model.name}>('${slug}/' + id).json(),

  create: (data: Create${model.name}Dto) =>
    api.post<${model.name}>('${slug}', { json: data }).json(),

  update: (id: number, data: Update${model.name}Dto) =>
    api.${updateMethod}<${model.name}>('${slug}/' + id, { json: data }).json(),

  delete: (id: number) =>
    api.delete('${slug}/' + id),
};
`);
    } else if (httpLib === 'axios') {
      zip.file(`${prefix}src/api/${slug}.ts`, `import api from '../lib/api';
import type { ${model.name}, Create${model.name}Dto, Update${model.name}Dto } from '../types/${model.name}';

export const ${model.name}Api = {
  getAll: (params?: any) =>
    api.get<${model.name}[]>('/${slug}', { params }).then(r => r.data),

  getById: (id: number) =>
    api.get<${model.name}>(\`/${slug}/\${id}\`).then(r => r.data),

  create: (data: Create${model.name}Dto) =>
    api.post<${model.name}>('/${slug}', data).then(r => r.data),

  update: (id: number, data: Update${model.name}Dto) =>
    api.${updateMethod}<${model.name}>(\`/${slug}/\${id}\`, data).then(r => r.data),

  delete: (id: number) =>
    api.delete(\`/${slug}/\${id}\`),
};
`);
    } else {
      // Native fetch api service
      zip.file(`${prefix}src/api/${slug}.ts`, `import api from '../lib/api';
import type { ${model.name}, Create${model.name}Dto, Update${model.name}Dto } from '../types/${model.name}';

export const ${model.name}Api = {
  getAll: () => api.get<${model.name}[]>('/${slug}'),
  getById: (id: number) => api.get<${model.name}>(\`/${slug}/\${id}\`),
  create: (data: Create${model.name}Dto) => api.post<${model.name}>('/${slug}', data),
  update: (id: number, data: Update${model.name}Dto) => api.${updateMethod}<${model.name}>(\`/${slug}/\${id}\`, data),
  delete: (id: number) => api.delete(\`/${slug}/\${id}\`),
};
`);
    }
  }
}
