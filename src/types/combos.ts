export const COMBO_DEFINITIONS = {
  mern: {
    label:       'MERN Stack',
    description: 'MongoDB · Express · React · Node.js — Le combo JavaScript classique.',
    stack:       'mern',
    backend:     'express',
    frontend:    'react',
    backendConfig: {
      orm:          'mongoose',
      db_engine:    'mongodb',
      architecture: 'layered',
      middlewares:  ['cors', 'morgan', 'error-handler'],
    },
    frontendConfig: {
      state_lib:    'zustand',
      http_lib:     'axios',
      ui_lib:       'shadcn',
      css:          'tailwind',
    },
  },
  pern: {
    label:       'PERN Stack',
    description: 'PostgreSQL · Express · React · Node.js — MERN mais avec PostgreSQL et Prisma.',
    stack:       'pern',
    backend:     'express',
    frontend:    'react',
    backendConfig: {
      orm:          'prisma',
      db_engine:    'postgresql',
      architecture: 'layered',
    },
    frontendConfig: {
      state_lib:    'zustand',
      http_lib:     'axios',
      ui_lib:       'shadcn',
      css:          'tailwind',
    },
  },
  'fastapi-react': {
    label:       'FastAPI + React',
    description: 'FastAPI · SQLModel · React · Python — API Python moderne + frontend React.',
    stack:       'fastapi+react',
    backend:     'fastapi',
    frontend:    'react',
    backendConfig: {
      orm:          'sqlmodel',
      db_engine:    'postgresql',
    },
    frontendConfig: {
      state_lib:    'zustand',
      http_lib:     'axios',
      ui_lib:       'shadcn',
      css:          'tailwind',
    },
  },
  mevn: {
    label:       'MEVN Stack',
    description: 'MongoDB · Express · Vue · Node.js — Note: Vue frontend generated as React (Vue not yet supported).',
    stack:       'mevn',
    backend:     'express',
    frontend:    'react',
    backendConfig: {
      orm:          'mongoose',
      db_engine:    'mongodb',
      architecture: 'layered',
      middlewares:  ['cors', 'morgan', 'error-handler'],
    },
    frontendConfig: {
      state_lib:    'zustand',
      http_lib:     'axios',
      ui_lib:       'shadcn',
      css:          'tailwind',
    },
  },
  mean: {
    label:       'MEAN Stack',
    description: 'MongoDB · Express · Angular · Node.js — Note: Angular frontend generated as React (Angular not yet supported).',
    stack:       'mean',
    backend:     'express',
    frontend:    'react',
    backendConfig: {
      orm:          'mongoose',
      db_engine:    'mongodb',
      architecture: 'layered',
      middlewares:  ['cors', 'morgan', 'error-handler'],
    },
    frontendConfig: {
      state_lib:    'zustand',
      http_lib:     'axios',
      ui_lib:       'shadcn',
      css:          'tailwind',
    },
  },
} as const;

export type ComboId = keyof typeof COMBO_DEFINITIONS;
