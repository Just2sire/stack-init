# stack-init — Configuration du projet web

## Ce qu'on construit

Un site Next.js 15 avec deux pages : une landing page et un wizard de configuration. Tout le traitement se fait côté client — pas de serveur, pas d'API routes. Le site est un export statique déployable n'importe où.

---

## Commandes de setup dans l'ordre

### 1. Créer l'app Next.js dans le monorepo

```bash
cd stack-init
npx create-next-app@latest apps/web \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --no-eslint \
  --import-alias "@/*"
```

### 2. Installer les dépendances

```bash
cd apps/web

npm install \
  zustand \
  handlebars \
  jszip \
  js-yaml \
  react-hook-form \
  @hookform/resolvers \
  lucide-react \
  clsx \
  tailwind-merge \
  class-variance-authority
```

### 3. Initialiser shadcn/ui

```bash
npx shadcn@latest init
# Style        : default
# Base color   : neutral
# CSS variables: yes
```

Puis installer les composants nécessaires pour le wizard :

```bash
npx shadcn@latest add \
  button input label select checkbox switch badge \
  dialog sheet tooltip separator tabs card
```

### 4. Lier le package schema local

Dans `apps/web/package.json`, ajouter dans `dependencies` :

```json
{
  "dependencies": {
    "@stack-init/schema": "file:../../packages/schema"
  }
}
```

Dans `apps/web/tsconfig.json`, ajouter dans `compilerOptions` :

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@stack-init/schema": ["../../packages/schema/src/index.ts"]
    }
  }
}
```

### 5. Créer la structure de dossiers

```bash
mkdir -p \
  src/stores \
  src/lib/generator \
  src/lib/templates/react/base \
  src/lib/templates/react/overlays \
  src/components/wizard/steps \
  src/components/landing \
  src/types
```

---

## Structure complète du projet

```
apps/web/
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── components.json                       ← config shadcn/ui
└── src/
    ├── app/                              ← App Router
    │   ├── layout.tsx                    ← layout racine (fonts, metadata)
    │   ├── page.tsx                      ← landing page  →  route /
    │   └── create/
    │       └── page.tsx                  ← wizard        →  route /create
    │
    ├── components/
    │   ├── wizard/
    │   │   ├── WizardShell.tsx           ← layout + navigation entre étapes
    │   │   ├── WizardSidebar.tsx         ← liste des étapes à gauche
    │   │   ├── WizardOutput.tsx          ← dernière étape, déclenche la génération
    │   │   └── steps/                    ← une étape = un composant
    │   │       ├── StackStep.tsx
    │   │       ├── ModelsStep.tsx
    │   │       ├── RelationsStep.tsx
    │   │       ├── LaravelStep.tsx
    │   │       ├── ReactStep.tsx
    │   │       └── OutputStep.tsx
    │   ├── ui/                           ← composants shadcn/ui (générés ici)
    │   └── landing/                      ← sections de la landing page
    │
    ├── stores/
    │   └── useWizardStore.ts             ← Zustand, état global du wizard
    │
    ├── lib/
    │   ├── generator/
    │   │   ├── index.ts                  ← point d'entrée : ZIP ou YAML selon le stack
    │   │   ├── zip.ts                    ← génère le ZIP React (Handlebars + JSZip)
    │   │   └── yaml.ts                   ← sérialise la config en stack-init.yaml
    │   └── templates/
    │       └── react/
    │           ├── base/                 ← templates de base communs à tous
    │           └── overlays/             ← un dossier par option (zustand/, rhf-zod/, etc.)
    │
    └── types/
        └── wizard.ts                     ← types locaux si besoin (en général on importe depuis schema)
```

---

## Dépendances expliquées

### Core

| Package | Rôle |
|---|---|
| `next@15` | Framework. App Router, Server Components, export statique. |
| `react@19` | UI library. |
| `typescript@5` | Typage fort. Les types viennent de `@stack-init/schema`. |
| `tailwindcss@4` | CSS utilitaire. v4 = zero config, CSS natif, plus rapide. |
| `@stack-init/schema` | Package local. Types Zod partagés avec le CLI. |

### UI

| Package | Rôle |
|---|---|
| `shadcn/ui` | Composants copiés dans `src/components/ui/`. C'est du code qu'on possède, pas une dépendance npm. |
| `@radix-ui/*` | Primitives accessibles (Dialog, Select, Tabs...). Utilisées par shadcn sous le capot. |
| `lucide-react` | Icônes SVG cohérentes avec shadcn. |
| `class-variance-authority` | Variantes de composants (taille, couleur) sans chaos de classes. |
| `clsx` + `tailwind-merge` | Fusion propre de classes Tailwind sans conflits. |

### State et logique

| Package | Rôle |
|---|---|
| `zustand@5` | Store global du wizard. Léger, sans Provider, subscribe natif. |
| `zod@3` | Déjà dans `@stack-init/schema`. Valide la config avant génération. |
| `react-hook-form` | Formulaires (ajout de modèle, de champ). Intégré avec Zod via `@hookform/resolvers`. |

### Génération

| Package | Rôle |
|---|---|
| `handlebars@4` | Moteur de templates pour générer les fichiers React. Même lib que le CLI. |
| `jszip@3` | Crée le ZIP dans le browser. Zéro serveur. |
| `js-yaml@4` | Sérialise la config en YAML propre pour Laravel. |

---

## Routing

Deux routes uniquement :

```
/        → app/page.tsx      landing page
/create  → app/create/page.tsx   wizard
```

Pas d'API routes. Toute la génération (ZIP ou YAML) se fait dans le browser. Le site peut donc être exporté comme site statique :

```js
// next.config.ts
const config: NextConfig = {
  output: 'export',   // export statique — déployable partout
}
export default config
```

---

## Zustand store — structure

```typescript
// src/stores/useWizardStore.ts

import { create } from 'zustand'
import type {
  Stack, Model, NamedField, Relation,
  LaravelOptions, ReactOptions,
  LaravelGenerateOptions, ProjectConfig
} from '@stack-init/schema'

interface WizardStore {
  // Navigation
  currentStep: number
  setStep: (n: number) => void
  nextStep: () => void
  prevStep: () => void

  // Config projet
  stack: Stack | null
  projectName: string
  models: Model[]
  laravelOptions: LaravelOptions
  reactOptions: ReactOptions

  // Actions modèles
  addModel: (model: Model) => void
  updateModel: (name: string, patch: Partial<Model>) => void
  removeModel: (name: string) => void

  // Actions champs
  addField: (modelName: string, field: NamedField) => void
  updateField: (modelName: string, fieldName: string, patch: Partial<NamedField>) => void
  removeField: (modelName: string, fieldName: string) => void

  // Actions relations
  addRelation: (modelName: string, rel: Relation) => void
  removeRelation: (modelName: string, index: number) => void

  // Toggles generate par modèle
  setGenerate: (modelName: string, key: keyof LaravelGenerateOptions, val: boolean) => void
  setGenerateAll: (key: keyof LaravelGenerateOptions, val: boolean) => void

  // Utilitaires
  canProceed: () => boolean       // valide l'étape courante avant de passer à la suivante
  getConfig: () => ProjectConfig  // retourne la config complète prête pour le générateur
  reset: () => void
}

export const useWizardStore = create<WizardStore>((set, get) => ({
  currentStep: 0,
  stack: null,
  projectName: '',
  models: [],
  laravelOptions: { /* defaults depuis LaravelOptionsSchema */ } as LaravelOptions,
  reactOptions: { /* defaults depuis ReactOptionsSchema */ } as ReactOptions,

  setStep: (n) => set({ currentStep: n }),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),

  addModel: (model) => set((s) => ({ models: [...s.models, model] })),
  updateModel: (name, patch) => set((s) => ({
    models: s.models.map((m) => m.name === name ? { ...m, ...patch } : m),
  })),
  removeModel: (name) => set((s) => ({
    models: s.models.filter((m) => m.name !== name),
  })),

  addField: (modelName, field) => set((s) => ({
    models: s.models.map((m) =>
      m.name === modelName ? { ...m, fields: [...m.fields, field] } : m
    ),
  })),
  updateField: (modelName, fieldName, patch) => set((s) => ({
    models: s.models.map((m) =>
      m.name === modelName
        ? { ...m, fields: m.fields.map((f) => f.name === fieldName ? { ...f, ...patch } : f) }
        : m
    ),
  })),
  removeField: (modelName, fieldName) => set((s) => ({
    models: s.models.map((m) =>
      m.name === modelName
        ? { ...m, fields: m.fields.filter((f) => f.name !== fieldName) }
        : m
    ),
  })),

  addRelation: (modelName, rel) => set((s) => ({
    models: s.models.map((m) =>
      m.name === modelName ? { ...m, relations: [...m.relations, rel] } : m
    ),
  })),
  removeRelation: (modelName, index) => set((s) => ({
    models: s.models.map((m) =>
      m.name === modelName
        ? { ...m, relations: m.relations.filter((_, i) => i !== index) }
        : m
    ),
  })),

  setGenerate: (modelName, key, val) => set((s) => ({
    models: s.models.map((m) =>
      m.name === modelName
        ? { ...m, generate: { ...m.generate, [key]: val } }
        : m
    ),
  })),
  setGenerateAll: (key, val) => set((s) => ({
    models: s.models.map((m) => ({ ...m, generate: { ...m.generate, [key]: val } })),
  })),

  canProceed: () => {
    const { currentStep, stack, projectName, models } = get()
    if (currentStep === 0) return !!stack
    if (currentStep === 1) return !!projectName && projectName.length > 0
    if (currentStep === 2) return models.length > 0
    return true
  },

  getConfig: () => {
    const { stack, projectName, models, laravelOptions, reactOptions } = get()
    return {
      name: projectName,
      stack: stack!,
      models,
      laravel: laravelOptions,
      react: reactOptions,
    } as ProjectConfig
  },

  reset: () => set({ currentStep: 0, stack: null, projectName: '', models: [] }),
}))
```

---

## Point d'entrée du générateur

```typescript
// src/lib/generator/index.ts

import type { ProjectConfig } from '@stack-init/schema'
import { isZipStack, isCliStack, isMixedStack } from '@stack-init/schema'
import { generateZip } from './zip'
import { generateYaml } from './yaml'

export async function generate(config: ProjectConfig): Promise<void> {
  if (isZipStack(config.stack)) {
    // React, Next.js → ZIP dans le browser
    await generateZip(config)
    return
  }

  if (isCliStack(config.stack)) {
    // Laravel, Django... → fichier YAML à télécharger
    generateYaml(config)
    return
  }

  // Stack mixte (ex: laravel+react) → les deux en parallèle
  await Promise.all([
    generateZip(config),
    generateYaml(config),
  ])
}
```

---

## next.config.ts

```typescript
import type { NextConfig } from 'next'

const config: NextConfig = {
  output: 'export',   // site statique, déployable partout sans serveur
}

export default config
```

---

## tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
    },
  },
  plugins: [],
}

export default config
```

---

## tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@stack-init/schema": ["../../packages/schema/src/index.ts"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Étapes du wizard

| # | Composant | Ce que l'utilisateur fait |
|---|---|---|
| 0 | `StackStep` | Choisit son stack (Laravel, React, Laravel+React...) |
| 1 | `ModelsStep` | Définit ses modèles et leurs champs |
| 2 | `RelationsStep` | Vérifie / ajuste les relations auto-détectées |
| 3 | `LaravelStep` | Active les toggles par modèle (migration, policy, tests...) |
| 4 | `ReactStep` | Choisit les pages et librairies React |
| 5 | `OutputStep` | Télécharge le ZIP et/ou le YAML |

Les steps 3 et 4 apparaissent uniquement si le stack correspondant est sélectionné.

---

## Ce qu'on code en premier

Dans l'ordre logique :

1. `useWizardStore.ts` — le store Zustand
2. `WizardShell.tsx` + `WizardSidebar.tsx` — le layout du wizard
3. `StackStep.tsx` — première étape (la plus simple)
4. `ModelsStep.tsx` — le plus complexe, le plus important
5. `RelationsStep.tsx`
6. `LaravelStep.tsx` + `ReactStep.tsx`
7. `lib/generator/yaml.ts` — pour pouvoir tester une vraie génération
8. `OutputStep.tsx`
9. `lib/generator/zip.ts` — génération React
10. Landing page