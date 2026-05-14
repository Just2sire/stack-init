import { create } from 'zustand';
import type {
  Stack, Model, NamedField, Relation,
  LaravelOptions, ReactOptions, ModelPages,
  LaravelGenerateOptions, ProjectConfig
} from '@stack-init/schema';

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

const DEFAULT_MODEL_PAGES: ModelPages = {
  list: true,
  detail: true,
  create: true,
  edit: false,
};

interface WizardStore {
  // Navigation
  currentStep: number;
  setStep: (n: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Config projet
  stack: Stack | null;
  projectName: string;
  models: Model[];
  laravelOptions: LaravelOptions;
  reactOptions: ReactOptions;

  // UI State
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  activePreviewTab: string;
  setActivePreviewTab: (tab: string) => void;

  // Actions config principale
  setStack: (stack: Stack) => void;
  setProjectName: (name: string) => void;
  setLaravelOptions: (patch: Partial<LaravelOptions>) => void;
  setReactOptions: (patch: Partial<ReactOptions>) => void;

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

export const useWizardStore = create<WizardStore>((set, get) => ({
  currentStep: 0,
  stack: null,
  projectName: '',
  models: [],
  laravelOptions: { ...DEFAULT_LARAVEL_OPTIONS },
  reactOptions: { ...DEFAULT_REACT_OPTIONS },

  // UI State
  isDrawerOpen: false,
  setIsDrawerOpen: (open) => set({ isDrawerOpen: open }),
  activePreviewTab: 'erd',
  setActivePreviewTab: (tab) => set({ activePreviewTab: tab }),

  setStep: (n) => set({ currentStep: n }),
  nextStep: () => set((s) => ({ currentStep: s.currentStep + 1 })),
  prevStep: () => set((s) => ({ currentStep: Math.max(0, s.currentStep - 1) })),

  setStack: (stack) => set({ stack }),
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

  setModelPages: (modelName, pages) => set((s) => ({
    models: s.models.map((m) =>
      m.name === modelName
        ? { ...m, pages: { ...DEFAULT_MODEL_PAGES, ...m.pages, ...pages } }
        : m
    ),
  })),

  canProceed: () => {
    const { currentStep, stack, projectName, models } = get();
    if (currentStep === 0) return !!stack && projectName.trim().length > 0;
    if (currentStep === 1) return models.length > 0;
    return true;
  },

  getConfig: () => {
    const { stack, projectName, models, laravelOptions, reactOptions } = get();
    return {
      name: projectName,
      stack: stack!,
      models,
      laravel: laravelOptions,
      react: reactOptions,
    } as ProjectConfig;
  },

  reset: () => set({
    currentStep: 0,
    stack: null,
    projectName: '',
    models: [],
    laravelOptions: { ...DEFAULT_LARAVEL_OPTIONS },
    reactOptions: { ...DEFAULT_REACT_OPTIONS },
  }),
}));
