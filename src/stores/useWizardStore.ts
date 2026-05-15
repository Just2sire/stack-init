import { create } from 'zustand';
import type {
  Stack, Model, NamedField, Relation,
  LaravelOptions, ReactOptions, ModelPages,
  LaravelGenerateOptions, ProjectConfig,
  ExpressConfig, NestConfig, NextjsOptions
} from '@stack-init/schema';

// Identifiants des étapes du wizard
export type StepId =
  | 'stack'
  | 'usage'          // Next.js uniquement
  | 'architecture'   // React, Next.js, Express, NestJS
  | 'database'       // Express, NestJS, Next.js Full-Stack
  | 'models'         // Laravel, Express, NestJS, Next.js Full-Stack
  | 'relations'
  | 'routes'         // Express, NestJS
  | 'middlewares'    // Express
  | 'laravel-setup'
  | 'nest-setup'
  | 'react-setup'
  | 'output';

const DEFAULT_LARAVEL_OPTIONS: LaravelOptions = {
  pattern: 'api-only',
  auth: 'sanctum',
  php_version: '8.2',
  laravel_version: '11',
  db_engine: 'mysql',
};

const DEFAULT_REACT_OPTIONS: ReactOptions = {
  state_lib: 'zustand',
  form_lib: 'react-hook-form',
  ui_lib: 'shadcn',
  http_lib: 'axios',
  router: 'none',
  css: 'tailwind',
};

const DEFAULT_EXPRESS_OPTIONS: ExpressConfig = {
  architecture: 'layered',
  database: 'prisma',
  db_engine: 'postgresql',
  middlewares: ['cors', 'morgan'] as any,
};

const DEFAULT_NEST_OPTIONS: NestConfig = {
  architecture: 'modular',
  database: 'prisma',
  db_engine: 'postgresql',
  swagger: true,
};

const DEFAULT_MODEL_PAGES: ModelPages = {
  list: true,
  detail: true,
  create: true,
  edit: false,
};

interface WizardStore {
  // Navigation
  steps: StepId[];
  currentStepId: StepId;
  setStep: (id: StepId) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Config projet
  stack: Stack | null;
  projectName: string;
  nextjsUsage: 'frontend-only' | 'full-stack' | null;
  models: Model[];
  
  // Options par stack
  laravelOptions: LaravelOptions;
  reactOptions: ReactOptions;
  expressOptions: ExpressConfig;
  nestOptions: NestConfig;

  // UI State
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  activePreviewTab: string;
  setActivePreviewTab: (tab: string) => void;

  // Actions config principale
  setStack: (stack: Stack) => void;
  setNextjsUsage: (usage: 'frontend-only' | 'full-stack') => void;
  setProjectName: (name: string) => void;
  setLaravelOptions: (patch: Partial<LaravelOptions>) => void;
  setReactOptions: (patch: Partial<ReactOptions>) => void;
  setExpressOptions: (patch: Partial<ExpressConfig>) => void;
  setNestOptions: (patch: Partial<NestConfig>) => void;

  // Actions modèles
  addModel: (model: Model) => void;
  updateModel: (name: string, patch: Partial<Model>) => void;
  removeModel: (name: string) => void;

  // Actions champs
  addField: (modelName: string, field: NamedField) => void;
  updateField: (modelName: string, fieldName: string, patch: Partial<NamedField>) => void;
  removeField: (modelName: string, fieldName: string) => void;

  // Actions relations
  addRelation: (modelName: string, rel: Relation) => void;
  removeRelation: (modelName: string, index: number) => void;

  // Toggles generate par modèle
  setGenerate: (modelName: string, key: keyof LaravelGenerateOptions, val: boolean) => void;
  setGenerateAll: (key: keyof LaravelGenerateOptions, val: boolean) => void;

  // Pages React par modèle
  setModelPages: (modelName: string, pages: Partial<ModelPages>) => void;

  // Utilitaires
  canProceed: () => boolean;
  getConfig: () => ProjectConfig;
  reset: () => void;
}

// Calcule les étapes en fonction du stack sélectionné
function computeSteps(stack: Stack | null, nextjsUsage: string | null): StepId[] {
  if (!stack) return ['stack'];

  const base: StepId[] = ['stack'];

  switch (stack) {
    case 'react':
      return [...base, 'architecture', 'models', 'react-setup', 'output'];

    case 'nextjs':
      if (!nextjsUsage) return [...base, 'usage'];
      if (nextjsUsage === 'frontend-only')
        return [...base, 'usage', 'architecture', 'models', 'react-setup', 'output'];
      return [...base, 'usage', 'database', 'architecture', 'models', 'relations', 'react-setup', 'output'];

    case 'laravel':
      return [...base, 'models', 'relations', 'laravel-setup', 'output'];

    case 'express':
      return [...base, 'architecture', 'database', 'models', 'relations', 'routes', 'middlewares', 'output'];

    case 'nestjs':
      return [...base, 'architecture', 'database', 'models', 'relations', 'nest-setup', 'output'];

    case 'laravel+react':
    case 'laravel+nextjs':
      return [...base, 'models', 'relations', 'laravel-setup', 'react-setup', 'output'];

    case 'express+react':
      return [...base, 'architecture', 'database', 'models', 'relations', 'middlewares', 'react-setup', 'output'];

    default:
      return [...base, 'output'];
  }
}

export const useWizardStore = create<WizardStore>((set, get) => ({
  steps: ['stack'],
  currentStepId: 'stack',
  stack: null,
  projectName: 'my-project',
  nextjsUsage: null,
  models: [],
  laravelOptions: { ...DEFAULT_LARAVEL_OPTIONS },
  reactOptions: { ...DEFAULT_REACT_OPTIONS },
  expressOptions: { ...DEFAULT_EXPRESS_OPTIONS },
  nestOptions: { ...DEFAULT_NEST_OPTIONS },

  // UI State
  isDrawerOpen: false,
  setIsDrawerOpen: (open) => set({ isDrawerOpen: open }),
  activePreviewTab: 'erd',
  setActivePreviewTab: (tab) => set({ activePreviewTab: tab }),

  setStep: (id) => set({ currentStepId: id }),
  nextStep: () => {
    const { steps, currentStepId } = get();
    const idx = steps.indexOf(currentStepId);
    if (idx < steps.length - 1) {
      set({ currentStepId: steps[idx + 1] });
    }
  },
  prevStep: () => {
    const { steps, currentStepId } = get();
    const idx = steps.indexOf(currentStepId);
    if (idx > 0) {
      set({ currentStepId: steps[idx - 1] });
    }
  },

  setStack: (stack) => {
    const { nextjsUsage } = get();
    const newSteps = computeSteps(stack, nextjsUsage);
    set({ stack, steps: newSteps });
  },
  
  setNextjsUsage: (usage) => {
    const { stack } = get();
    const newSteps = computeSteps(stack, usage);
    set({ nextjsUsage: usage, steps: newSteps });
  },

  setProjectName: (name) => {
    const sanitized = name
      .toLowerCase()
      .replace(/\s+/g, '-')       // Espaces -> tirets
      .replace(/[^a-z0-9-_]/g, '') // Supprime caractères spéciaux
      .replace(/-+/g, '-')        // Évite tirets multiples
      .replace(/^-+|-+$/g, '');   // Supprime tirets début/fin
    set({ projectName: sanitized });
  },

  setLaravelOptions: (patch) => set((s) => ({ laravelOptions: { ...s.laravelOptions, ...patch } })),
  setReactOptions: (patch) => set((s) => ({ reactOptions: { ...s.reactOptions, ...patch } })),
  setExpressOptions: (patch) => set((s) => ({ expressOptions: { ...s.expressOptions, ...patch } })),
  setNestOptions: (patch) => set((s) => ({ nestOptions: { ...s.nestOptions, ...patch } })),

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

  addRelation: (modelName, rel) => set((s) => {
    const newModels = s.models.map((m) =>
      m.name === modelName ? { ...m, relations: [...m.relations, rel] } : m
    );

    // Logique de relations réciproques
    let reciprocalType: string | null = null;
    if (rel.type === 'hasOne' || rel.type === 'hasMany') reciprocalType = 'belongsTo';
    else if (rel.type === 'belongsToMany') reciprocalType = 'belongsToMany';

    if (reciprocalType) {
      const targetModel = newModels.find(m => m.name === rel.model);
      if (targetModel) {
        const alreadyHasReciprocal = targetModel.relations.some(r => r.model === modelName && r.type === reciprocalType);
        if (!alreadyHasReciprocal) {
          return {
            models: newModels.map(m => 
              m.name === rel.model 
                ? { ...m, relations: [...m.relations, { type: reciprocalType as any, model: modelName }] }
                : m
            )
          };
        }
      }
    }

    return { models: newModels };
  }),
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

  setModelPages: (modelName, pages) => set((s) => ({
    models: s.models.map((m) =>
      m.name === modelName
        ? { ...m, pages: { ...DEFAULT_MODEL_PAGES, ...m.pages, ...pages } }
        : m
    ),
  })),

  canProceed: () => {
    const { currentStepId, stack, projectName, models, nextjsUsage } = get();
    if (currentStepId === 'stack') return !!stack && projectName.trim().length > 0;
    if (currentStepId === 'usage') return !!nextjsUsage;
    if (currentStepId === 'models') return models.length > 0;
    return true;
  },

  getConfig: () => {
    const { stack, projectName, models, laravelOptions, reactOptions, expressOptions, nestOptions } = get();
    return {
      name: projectName,
      stack: stack!,
      models,
      laravel: laravelOptions,
      react: reactOptions,
      express: expressOptions,
      nest: nestOptions,
    } as ProjectConfig;
  },

  reset: () => set({
    steps: ['stack'],
    currentStepId: 'stack',
    stack: null,
    projectName: '',
    nextjsUsage: null,
    models: [],
    laravelOptions: { ...DEFAULT_LARAVEL_OPTIONS },
    reactOptions: { ...DEFAULT_REACT_OPTIONS },
    expressOptions: { ...DEFAULT_EXPRESS_OPTIONS },
    nestOptions: { ...DEFAULT_NEST_OPTIONS },
  }),
}));

