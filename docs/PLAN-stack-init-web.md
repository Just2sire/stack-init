# Plan d'Implémentation — `stack-init` (Plateforme Web)

> Wizard web Next.js. Génère soit un fichier `stack-init.yaml` (stacks backend) soit un ZIP complet (stacks frontend), soit les deux en simultané (stacks full-stack). Entièrement serverless — tout se passe dans le navigateur.

---

## État Actuel

Le projet existe avec un design system défini (Gold & Dark, glassmorphism, shadcn/ui + Radix). L'architecture technique est posée : Next.js 15 App Router, Zustand, Handlebars, JSZip, XYFlow pour le schéma ERD. Les READMEs sont rédigés. Mais le wizard lui-même n'est pas encore implémenté.

---

## Architecture du Projet

```
apps/web/                          (ou stack-init/ à la racine du repo web)
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                     ← landing page
│   │   └── create/
│   │       └── page.tsx                 ← wizard (page shell)
│   ├── components/
│   │   ├── wizard/
│   │   │   ├── WizardShell.tsx          ← layout sidebar + main
│   │   │   ├── WizardSidebar.tsx        ← étapes + navigation
│   │   │   ├── WizardFooter.tsx         ← Retour / dots / Suivant
│   │   │   └── steps/
│   │   │       ├── StackStep.tsx
│   │   │       ├── UsageStep.tsx        ← bifurcation Next.js
│   │   │       ├── ArchitectureStep.tsx
│   │   │       ├── DatabaseStep.tsx
│   │   │       ├── ModelsStep.tsx
│   │   │       ├── RoutesStep.tsx
│   │   │       ├── MiddlewaresStep.tsx
│   │   │       ├── LaravelOptionsStep.tsx
│   │   │       ├── NestOptionsStep.tsx
│   │   │       ├── ReactStep.tsx
│   │   │       └── OutputStep.tsx
│   │   ├── models/
│   │   │   ├── ModelCard.tsx
│   │   │   ├── FieldRow.tsx
│   │   │   ├── FieldTypeSelect.tsx
│   │   │   ├── FieldParamsPanel.tsx
│   │   │   └── RelationBadge.tsx
│   │   ├── erd/
│   │   │   ├── ErdCanvas.tsx            ← XYFlow
│   │   │   ├── ErdModelNode.tsx
│   │   │   └── ErdRelationEdge.tsx
│   │   ├── ui/                          ← shadcn/ui
│   │   └── landing/
│   │       ├── HeroSection.tsx
│   │       ├── HowItWorks.tsx
│   │       ├── StackGrid.tsx
│   │       └── Footer.tsx
│   ├── stores/
│   │   ├── useWizardStore.ts            ← Zustand principal
│   │   └── useErdStore.ts              ← état du canvas ERD
│   ├── lib/
│   │   ├── generator/
│   │   │   ├── index.ts                 ← routeur principal
│   │   │   ├── yaml.ts                  ← sérialisation YAML (backend)
│   │   │   ├── zip-react.ts            ← ZIP React SPA
│   │   │   ├── zip-nextjs.ts           ← ZIP Next.js Frontend Only
│   │   │   ├── zip-nextjs-fullstack.ts ← ZIP Next.js Full-Stack
│   │   │   └── getting-started.ts      ← génère GETTING_STARTED.md
│   │   ├── templates/
│   │   │   ├── react/
│   │   │   ├── nextjs/
│   │   │   └── nextjs-fullstack/
│   │   ├── steps-config.ts             ← définit les étapes selon le stack
│   │   └── utils.ts
│   └── types/
│       └── wizard.ts
├── package.json
├── next.config.ts
└── tailwind.config.ts
```

---

## Design System

Le design system est déjà défini dans le README existant. Rappel des tokens clés à implémenter en CSS variables dans `globals.css` :

```css
:root {
  /* Surfaces */
  --bg-primary:   #0a0a0a;
  --bg-secondary: #111111;
  --bg-glass:     rgba(255, 255, 255, 0.04);

  /* Accent Gold */
  --accent:         #D4AF37;
  --accent-hover:   #C9A227;
  --accent-subtle:  rgba(212, 175, 55, 0.08);
  --accent-border:  rgba(212, 175, 55, 0.25);
  --accent-text:    #F0D060;

  /* Bordures & textes */
  --border-primary:   rgba(255, 255, 255, 0.08);
  --border-secondary: rgba(255, 255, 255, 0.04);
  --text-primary:   #F5F5F5;
  --text-secondary: #888888;

  /* Sémantique */
  --success-bg:   rgba(34, 197, 94, 0.08);
  --success-border: rgba(34, 197, 94, 0.25);
  --warning-bg:   rgba(212, 175, 55, 0.08);
  --error-bg:     rgba(239, 68, 68, 0.08);
}
```

### Glassmorphism — classe utilitaire

```css
.glass {
  background:    var(--bg-glass);
  border:        1px solid var(--border-primary);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
```

---

## Phase 1 — Zustand Store

**Fichier :** `src/stores/useWizardStore.ts`

C'est la pièce centrale. Tout l'état du wizard vit ici.

```typescript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  Stack, ProjectConfig, Model, NamedField,
  Relation, LaravelConfig, ExpressConfig, NestConfig,
  ReactConfig, NextjsConfig, LaravelGenerateOptions
} from '@stack-init/schema';

// Étapes disponibles selon le stack — calculées dynamiquement
export type StepId =
  | 'stack'
  | 'usage'          // Next.js uniquement
  | 'architecture'   // React, Next.js, Express, NestJS
  | 'database'       // Express, NestJS, Next.js Full-Stack
  | 'models'         // Laravel, Express, NestJS, Next.js Full-Stack
  | 'routes'         // Express, NestJS
  | 'middlewares'    // Express
  | 'laravel-options'
  | 'nest-options'
  | 'react-options'
  | 'output';

interface WizardState {
  // Navigation
  steps:       StepId[];           // calculé selon le stack sélectionné
  currentStep: StepId;
  visitedSteps: Set<StepId>;

  // Config projet
  projectName:  string;
  stack:        Stack | null;
  nextjsUsage:  'frontend-only' | 'full-stack' | null;

  // Modèles (partagés entre tous les stacks qui ont des modèles)
  models: Model[];

  // Configs par stack
  laravelOptions: Partial<LaravelConfig>;
  expressOptions: Partial<ExpressConfig>;
  nestOptions:    Partial<NestConfig>;
  reactOptions:   Partial<ReactConfig>;
  nextjsOptions:  Partial<NextjsConfig>;

  // Actions — Navigation
  goToStep:  (step: StepId) => void;
  nextStep:  () => void;
  prevStep:  () => void;
  canGoNext: () => boolean;

  // Actions — Stack (déclenche le recalcul des étapes)
  setStack:      (stack: Stack) => void;
  setNextjsUsage:(usage: 'frontend-only' | 'full-stack') => void;
  setProjectName:(name: string) => void;

  // Actions — Modèles
  addModel:    (model: Model) => void;
  updateModel: (name: string, patch: Partial<Model>) => void;
  removeModel: (name: string) => void;
  reorderModels:(from: number, to: number) => void;

  // Actions — Champs
  addField:    (modelName: string, field: NamedField) => void;
  updateField: (modelName: string, fieldName: string, patch: Partial<NamedField>) => void;
  removeField: (modelName: string, fieldName: string) => void;
  reorderFields:(modelName: string, from: number, to: number) => void;

  // Actions — Relations
  addRelation:    (modelName: string, rel: Relation) => void;
  updateRelation: (modelName: string, index: number, patch: Partial<Relation>) => void;
  removeRelation: (modelName: string, index: number) => void;

  // Actions — Toggles generate (Laravel)
  setGenerate:    (modelName: string, key: keyof LaravelGenerateOptions, val: boolean) => void;
  setGenerateAll: (key: keyof LaravelGenerateOptions, val: boolean) => void;

  // Utilitaires
  getConfig:          () => ProjectConfig;
  getValidationErrors:() => string[];
  reset:              () => void;
}
```

### Calcul dynamique des étapes

```typescript
function computeSteps(stack: Stack | null, nextjsUsage: string | null): StepId[] {
  if (!stack) return ['stack'];

  const base: StepId[] = ['stack'];

  switch (stack) {
    case 'react':
      return [...base, 'architecture', 'react-options', 'output'];

    case 'nextjs':
      if (!nextjsUsage) return [...base, 'usage'];
      if (nextjsUsage === 'frontend-only')
        return [...base, 'usage', 'architecture', 'react-options', 'output'];
      return [...base, 'usage', 'database', 'architecture', 'models', 'react-options', 'output'];

    case 'laravel':
      return [...base, 'models', 'laravel-options', 'output'];

    case 'express':
      return [...base, 'architecture', 'database', 'models', 'routes', 'middlewares', 'output'];

    case 'nestjs':
      return [...base, 'architecture', 'database', 'models', 'nest-options', 'output'];

    case 'laravel+react':
    case 'laravel+nextjs':
      return [...base, 'models', 'laravel-options', 'react-options', 'output'];

    case 'express+react':
      return [...base, 'architecture', 'database', 'models', 'middlewares', 'react-options', 'output'];

    default:
      return [...base, 'output'];
  }
}
```

---

## Phase 2 — Layout Wizard

### `WizardShell.tsx`

Layout principal avec sidebar sticky et contenu scrollable.

```tsx
export function WizardShell() {
  const { steps, currentStep } = useWizardStore();

  return (
    <div className="si-wizard-shell">
      <WizardSidebar steps={steps} currentStep={currentStep} />
      <main className="si-wizard-main">
        <StepRenderer currentStep={currentStep} />
        <WizardFooter />
      </main>
    </div>
  );
}
```

**CSS :**
```css
.si-wizard-shell {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
}

.si-wizard-sidebar {
  width: 240px;
  min-height: 100vh;
  position: sticky;
  top: 0;
  padding: 32px 20px;
  border-right: 1px solid var(--border-primary);
  background: var(--bg-secondary);
}

.si-wizard-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 48px 64px;
}
```

### `WizardSidebar.tsx`

Affiche les étapes avec leur état (à venir / actif / complété). Badge sur les étapes avec données.

```tsx
const STEP_LABELS: Record<StepId, string> = {
  stack:           'Stack',
  usage:           'Utilisation',
  architecture:    'Architecture',
  database:        'Base de données',
  models:          'Modèles',
  routes:          'Routes',
  middlewares:     'Middlewares',
  'laravel-options': 'Configuration Laravel',
  'nest-options':  'Configuration NestJS',
  'react-options': 'Configuration React',
  output:          'Génération',
};

// Badge : nombre de modèles définis, nombre de middlewares...
function getStepBadge(step: StepId, store: WizardState): string | null {
  if (step === 'models'      && store.models.length > 0) return String(store.models.length);
  if (step === 'middlewares' && store.expressOptions.middlewares?.length)
    return String(store.expressOptions.middlewares.length);
  return null;
}
```

### `WizardFooter.tsx`

```tsx
export function WizardFooter() {
  const { steps, currentStep, nextStep, prevStep, canGoNext } = useWizardStore();
  const currentIndex = steps.indexOf(currentStep);

  return (
    <footer className="si-wizard-footer">
      <button onClick={prevStep} disabled={currentIndex === 0}>
        ← Retour
      </button>
      <ProgressDots steps={steps} current={currentStep} />
      <button onClick={nextStep} disabled={!canGoNext()} className="si-btn-primary">
        {currentStep === 'output' ? 'Générer' : 'Suivant →'}
      </button>
    </footer>
  );
}
```

---

## Phase 3 — Les Étapes du Wizard

### 3.1 `StackStep.tsx`

Présente les stacks en 3 catégories visuelles. Sélection par carte cliquable.

```
┌── 🎨 Frontend Pur ─────────────────────────┐
│  [React SPA]  [Next.js Frontend]            │
└─────────────────────────────────────────────┘

┌── ⚙️ Backend ───────────────────────────────┐
│  [Laravel]  [Express]  [NestJS]             │
│  [Django ↗]  [Rails ↗]  (bientôt)          │
└─────────────────────────────────────────────┘

┌── 🔀 Full-Stack ────────────────────────────┐
│  [Next.js Full-Stack]                       │
│  [Laravel + React]  [Laravel + Next.js]     │
│  [Express + React]                          │
└─────────────────────────────────────────────┘
```

Chaque carte affiche : logo du framework, nom, description courte (1 ligne), badge "ZIP" ou "YAML + CLI" ou "ZIP + YAML".

### 3.2 `UsageStep.tsx` (Next.js uniquement)

Deux grandes cartes côte à côte avec description détaillée :

```
┌─────────────────────────────────┐  ┌─────────────────────────────────┐
│  📱 Frontend Uniquement         │  │  🗄️ Full-Stack                  │
│                                 │  │                                 │
│  Next.js comme renderer React.  │  │  API Routes ou Server Actions   │
│  Mon API vient d'ailleurs       │  │  + base de données directe.     │
│  (Laravel, Express, etc.)       │  │  Tout dans un seul projet.      │
│                                 │  │                                 │
│  → Génère un ZIP (frontend)     │  │  → Génère un ZIP complet        │
│                                 │  │    (front + back + schema ORM)  │
└─────────────────────────────────┘  └─────────────────────────────────┘
```

### 3.3 `ArchitectureStep.tsx`

Affichage différent selon le stack :

**Pour React / Next.js Frontend :**

Cartes pour chaque pattern avec une preview visuelle de l'arborescence :

```
[Feature-First]             [Domain-Driven]
src/                        src/
├── features/               ├── domain/
│   ├── auth/               ├── application/
│   └── dashboard/          └── infrastructure/

[MVVM]                      [Minimal]
src/                        src/
├── models/                 ├── components/
├── viewmodels/             ├── pages/
└── views/                  └── hooks/
```

**Pour Express / NestJS :**

Mêmes cartes mais avec les patterns backend (`mvc`, `layered`, `feature-based`, `minimal`).

### 3.4 `DatabaseStep.tsx`

Deux parties : choix de l'ORM/ODM, puis choix du moteur.

```
ORM / ODM
  ○ Prisma         (recommandé — type-safe, migrations, studio)
  ○ TypeORM        (decorators, migrations, DataMapper/ActiveRecord)
  ○ Sequelize      (mature, JS/TS, modèles statiques)
  ○ Drizzle        (léger, SQL-first, performant)
  ○ Mongoose       (ODM MongoDB)

Base de données
  ○ PostgreSQL ○ MySQL ○ SQLite ○ MongoDB

[Note contextuel] : si Mongoose → MongoDB sélectionné automatiquement.
```

### 3.5 `ModelsStep.tsx` — L'étape centrale

C'est l'écran le plus complexe. Il doit gérer :

**Layout :**
```
┌─────────────────────────────────────────────────────────────────┐
│  [+ Nouveau modèle]                  [Vue liste] [Vue ERD]      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─── User ──────────────────────────────────────────────┐     │
│  │  name          string      [required] [index]          │ ⋮  │
│  │  email         string      [required] [unique]         │     │
│  │  role          enum        admin, editor, viewer       │     │
│  │  [+ Ajouter un champ]                                  │     │
│  │  Relations : → hasMany Post  → hasMany Comment         │     │
│  │  [migration ✓] [factory ✓] [tests ✓] [policy ○]       │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                 │
│  ┌─── Post ───────────────────────────────────────────────┐     │
│  │  ...                                                   │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

**Composant `FieldRow.tsx` :**
- Nom du champ (input texte, snake_case validé)
- Type (select avec `FIELD_TYPES` groupés par catégorie)
- Modificateurs inline : `nullable` / `unique` / `index` (toggle pills)
- Bouton expand → ouvre `FieldParamsPanel` pour les paramètres avancés (`length`, `precision`, `scale`, `values` pour enum, `references` pour foreignId)

**Composant `FieldParamsPanel.tsx` :**

S'affiche uniquement si le type sélectionné a des paramètres (`FIELD_TYPES_WITH_PARAMS` du schema). Exemples :
- `string` → input `length` (défaut 255)
- `decimal` → inputs `precision` et `scale`
- `enum` → input multi-tag pour les `values`
- `foreignId` → select `references` (liste des autres modèles)

**Composant `FieldTypeSelect.tsx` :**

Select groupé par catégorie avec chips colorées (palette du design system Gold & Dark, adaptée au thème sombre).

**Validation inline :**

- Nom en snake_case → erreur si camelCase ou PascalCase
- `foreignId` sans `references` → warning "Quel modèle cette clé référence-t-elle ?"
- `foreignId` qui référence un modèle non défini → erreur rouge avec suggestion

### 3.6 `RoutesStep.tsx` (Express, NestJS)

Pour chaque modèle, tableau de checkboxes des endpoints :

```
┌─────────┬────────┬──────┬────────┬────────┬──────────┬──────────┐
│ Modèle  │ GET /  │ GET  │ POST   │ PUT    │ DELETE   │ Swagger  │
│         │ (list) │ /:id │        │ /:id   │ /:id     │          │
├─────────┼────────┼──────┼────────┼────────┼──────────┼──────────┤
│ User    │   ✓    │  ✓   │   ✓    │   ✓    │    ✓     │    ✓     │
│ Post    │   ✓    │  ✓   │   ✓    │   ✓    │    ✓     │    ○     │
│ Comment │   ✓    │  ✓   │   ✓    │   ○    │    ○     │    ○     │
└─────────┴────────┴──────┴────────┴────────┴──────────┴──────────┘
[Tout activer]  [Tout désactiver]
```

### 3.7 `MiddlewaresStep.tsx` (Express)

Cartes de sélection pour chaque middleware avec description et dépendance npm affichée :

```
┌─────────────────────────┐  ┌─────────────────────────┐
│ ✓ Auth JWT              │  │ ✓ CORS                  │
│   jsonwebtoken, bcrypt  │  │   cors                  │
│   Protège les routes    │  │   Cross-Origin autorisé │
│   avec Bearer tokens    │  │   pour votre frontend   │
└─────────────────────────┘  └─────────────────────────┘

┌─────────────────────────┐  ┌─────────────────────────┐
│ ✓ Validation (Zod)      │  │ ○ Rate Limiting         │
│   zod                   │  │   express-rate-limit    │
│   Validation des body   │  │   Limite les requêtes   │
│   avec schemas typés    │  │   par IP                │
└─────────────────────────┘  └─────────────────────────┘
```

### 3.8 `LaravelOptionsStep.tsx`

Mini-stepper interne en 3 panneaux :

**Panneau A — Options globales :**
- Auth : sanctum / passport / breeze / none
- DB engine : mysql / postgresql / sqlite
- PHP version : 8.1 / 8.2 / 8.3
- Laravel version : 10 / 11 / 12
- Pattern : full / api-only / minimal
- Runner : makefile / bash / both

**Panneau B — Toggles par modèle (vue tableau) :**

```
┌──────────────┬──────────┬──────────┬────────┬─────────┬──────┐
│ Modèle       │Migration │ Factory  │ Tests  │ Policy  │ Swagger│
├──────────────┼──────────┼──────────┼────────┼─────────┼──────┤
│ User         │    ✓     │    ✓     │   ✓    │    ✓    │  ○   │
│ Post         │    ✓     │    ✓     │   ✓    │    ○    │  ○   │
│ Comment      │    ✓     │    ✓     │   ○    │    ○    │  ○   │
├──────────────┼──────────┼──────────┼────────┼─────────┼──────┤
│ Tous         │    ✓     │    ✓     │   ~    │    ~    │  ○   │
└──────────────┴──────────┴──────────┴────────┴─────────┴──────┘

~ = état partiel (certains modèles seulement)
```

Cliquer sur "Tous" dans une colonne uniformise tous les modèles.

**Panneau C — Options migration :**

Pour chaque modèle : `timestamps`, `softDeletes`, type de clé primaire (id / uuid / ulid).

### 3.9 `NestOptionsStep.tsx`

- Architecture : Modular / CQRS / Microservices (avec description)
- Auth : JWT Guards / API Key / Aucun
- Swagger : activer `@ApiProperty()` et `SwaggerModule`
- Validation globale : `ValidationPipe` + `class-validator`
- Serialization : `class-transformer` + `@Exclude()`
- Rate Throttling : `@nestjs/throttler`

### 3.10 `ReactStep.tsx`

Sélection des librairies par catégorie. Cartes avec logo + description courte.

**Catégories :**
- State : Zustand / Redux Toolkit / Jotai / Context natif
- Data Fetching : TanStack Query / SWR / Aucun
- Forms : React Hook Form / Formik / Aucun
- UI : shadcn/ui / MUI / Mantine / Ant Design / Chakra / Aucun
- HTTP : Axios / Ky / Fetch natif
- Testing : Vitest + Testing Library / Jest / Aucun
- CSS : Tailwind / CSS Modules / Styled Components / Aucun

**Pages à générer (si modèles définis) :**

Tableau par modèle, similaire aux toggles Laravel :
```
┌──────────┬──────┬─────────┬────────┬────────┐
│ Modèle   │ List │ Détail  │ Create │ Edit   │
├──────────┼──────┼─────────┼────────┼────────┤
│ User     │  ✓   │    ✓    │   ✓    │   ✓    │
│ Post     │  ✓   │    ✓    │   ✓    │   ○    │
└──────────┴──────┴─────────┴────────┴────────┘
```

### 3.11 `OutputStep.tsx`

L'étape finale. Récapitulatif + bouton de génération.

```
┌─────────────────────────────────────────────────────────────────┐
│  ✨ Prêt à générer                                              │
│  my-blog · Laravel + React · MySQL + Sanctum                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📄 stack-init.yaml           Backend Laravel                   │
│     3 modèles · 18 fichiers à générer via CLI                   │
│                                                                 │
│  📦 my-blog-react.zip         Frontend React                    │
│     Zustand · shadcn/ui · TanStack Query · 23 fichiers          │
│                                                                 │
│  📖 GETTING_STARTED.md        Guide d'installation              │
│                                                                 │
│  ┌── Fichiers backend (via CLI) ───────────────────────────┐   │
│  │  app/Models/User.php                                    │   │
│  │  app/Models/Post.php                                    │   │
│  │  database/migrations/...  (3)                          │   │
│  │  app/Http/Controllers/... (3)                          │   │
│  │  ... 12 autres                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                [  ✨ Générer et télécharger  ]                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

La liste de fichiers est calculée par `computeFileList(config)` de manière déterministe avant même de cliquer sur "Générer".

---

## Phase 4 — Vue ERD (XYFlow)

**Fichiers :** `src/components/erd/`

La vue ERD est disponible depuis `ModelsStep` via un toggle "Vue liste / Vue ERD".

### `ErdCanvas.tsx`

```tsx
import ReactFlow, { Background, Controls, MiniMap } from '@xyflow/react';

export function ErdCanvas() {
  const { models } = useWizardStore();
  const { nodes, edges, onNodesChange } = useErdStore();

  return (
    <div style={{ height: '600px', background: 'var(--bg-secondary)' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        nodeTypes={{ model: ErdModelNode }}
        edgeTypes={{ relation: ErdRelationEdge }}
        fitView
      >
        <Background color="var(--border-primary)" />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
```

### `ErdModelNode.tsx`

Chaque nœud affiche :
- Nom du modèle (PascalCase, header doré)
- Liste des champs avec leur type (chips colorées)
- Clés primaires et étrangères visuellement distinguées

### `useErdStore.ts`

Synchronisé avec `useWizardStore` — quand un modèle ou une relation change dans le wizard, les nœuds et edges XYFlow se mettent à jour automatiquement.

```typescript
function modelsToErdNodes(models: Model[]): Node[] {
  return models.map((model, i) => ({
    id:       model.name,
    type:     'model',
    position: { x: (i % 3) * 320, y: Math.floor(i / 3) * 280 },
    data:     { model },
  }));
}

function modelsToErdEdges(models: Model[]): Edge[] {
  return models.flatMap(model =>
    model.relations.map(rel => ({
      id:     `${model.name}-${rel.type}-${rel.model}`,
      source: model.name,
      target: rel.model,
      type:   'relation',
      data:   { relationType: rel.type },
      label:  rel.type,
    }))
  );
}
```

---

## Phase 5 — Générateurs Browser

### 5.1 `lib/generator/index.ts` — Routeur principal

```typescript
export async function generate(config: ProjectConfig): Promise<GenerationResult> {
  const results: DownloadFile[] = [];

  // Backend → YAML
  if (isCliStack(config.stack)) {
    const yaml = generateYaml(config);
    results.push({ filename: 'stack-init.yaml', content: yaml, type: 'text/yaml' });
  }

  // Frontend → ZIP
  if (config.stack === 'react') {
    const zip = await generateReactZip(config);
    results.push({ filename: `${config.name}-react.zip`, content: zip, type: 'application/zip' });
  }

  if (config.stack === 'nextjs' && config.nextjs?.usage === 'frontend-only') {
    const zip = await generateNextjsFrontendZip(config);
    results.push({ filename: `${config.name}-nextjs.zip`, content: zip, type: 'application/zip' });
  }

  if (config.stack === 'nextjs-fullstack' || config.stack === 'nextjs' && config.nextjs?.usage === 'full-stack') {
    const zip = await generateNextjsFullStackZip(config);
    results.push({ filename: `${config.name}.zip`, content: zip, type: 'application/zip' });
  }

  if (isCliStack(config.stack)) {
    const md = generateGettingStarted(config);
    results.push({ filename: 'GETTING_STARTED.md', content: md, type: 'text/markdown' });
  }

  // Déclenche les téléchargements avec délai
  results.forEach((file, i) => {
    setTimeout(() => triggerDownload(file), i * 300);
  });

  return { files: results };
}
```

### 5.2 `lib/generator/yaml.ts`

```typescript
import yaml from 'js-yaml';

export function generateYaml(config: ProjectConfig): string {
  const output = {
    name:  config.name,
    stack: config.stack,
    models: config.models.map(model => ({
      name:   model.name,
      fields: model.fields.map(field => {
        const f: Record<string, unknown> = { name: field.name, type: field.type };
        // Propriétés optionnelles : on les inclut seulement si définies
        if (field.nullable)   f.nullable   = true;
        if (field.unique)     f.unique     = true;
        if (field.default !== undefined) f.default = field.default;
        // Params spécifiques au type
        if (field.type === 'foreignId')  f.references = field.references;
        if (field.type === 'enum')       f.values = field.values;
        if (field.type === 'string' && field.length !== 255) f.length = field.length;
        if (field.type === 'decimal')  { f.precision = field.precision; f.scale = field.scale; }
        return f;
      }),
      relations: model.relations,
      migration: model.migration,
      generate:  model.generate,
    })),
    ...(config.laravel && { laravel: config.laravel }),
    ...(config.express && { express: config.express }),
    ...(config.nest    && { nest:    config.nest    }),
  };

  return yaml.dump(output, { lineWidth: 120, noRefs: true, quotingType: '"' });
}
```

### 5.3 `lib/generator/zip-react.ts`

```typescript
import JSZip from 'jszip';

export async function generateReactZip(config: ProjectConfig): Promise<Blob> {
  const zip  = new JSZip();
  const opts = config.react!;

  // package.json dynamique
  zip.file('package.json', JSON.stringify(buildPackageJson(config.name, opts), null, 2));

  // Fichiers de config
  zip.file('tsconfig.json',        TSCONFIG_TEMPLATE);
  zip.file('vite.config.ts',       buildViteConfig(opts));
  zip.file('index.html',           INDEX_HTML_TEMPLATE);
  zip.file('src/main.tsx',         buildMainTsx(opts));
  zip.file('src/App.tsx',          buildAppTsx(opts));

  // Config CSS
  if (opts.css === 'tailwind') {
    zip.file('tailwind.config.ts', TAILWIND_CONFIG);
    zip.file('postcss.config.js',  POSTCSS_CONFIG);
    zip.file('src/index.css',      TAILWIND_CSS_BASE);
  }

  // Types TypeScript par modèle
  for (const model of config.models) {
    const typesContent = buildTypeScriptInterface(model);
    zip.file(`src/types/${model.name}.ts`, typesContent);
  }

  // Structure selon l'architecture
  generateArchitectureStructure(zip, config);

  // Pages par modèle
  for (const model of config.models) {
    const pages = opts.pages?.[model.name] ?? {};
    if (pages.list)   zip.file(`src/pages/${model.name}ListPage.tsx`,   buildListPage(model, opts));
    if (pages.detail) zip.file(`src/pages/${model.name}DetailPage.tsx`, buildDetailPage(model, opts));
    if (pages.create) zip.file(`src/pages/${model.name}CreatePage.tsx`, buildCreatePage(model, opts));
    if (pages.edit)   zip.file(`src/pages/${model.name}EditPage.tsx`,   buildEditPage(model, opts));
  }

  // Config state (Zustand, Redux...)
  if (opts.state_lib === 'zustand') {
    zip.file('src/store/index.ts', buildZustandStore(config.models));
  }

  zip.file('.env.example',  ENV_EXAMPLE_TEMPLATE);
  zip.file('README.md',     buildReadme(config));

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

// Conversion des types DB → TypeScript
function toTsType(fieldType: string): string {
  const map: Record<string, string> = {
    string:    'string',
    text:      'string',
    longText:  'string',
    integer:   'number',
    bigInteger:'number',
    decimal:   'number',
    boolean:   'boolean',
    timestamp: 'string',   // ISO 8601
    date:      'string',
    json:      'unknown',
    uuid:      'string',
    enum:      '',          // géré séparément → union de literals
  };
  return map[fieldType] ?? 'unknown';
}
```

### 5.4 `lib/generator/zip-nextjs-fullstack.ts`

Cas le plus complet — génère dans un seul ZIP :

```
my-project/
├── prisma/
│   └── schema.prisma              ← généré depuis les modèles
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── users/
│   │   │   │   └── route.ts       ← si api-routes
│   │   │   └── posts/
│   │   │       └── route.ts
│   │   ├── users/
│   │   │   ├── page.tsx           ← liste
│   │   │   └── [id]/page.tsx      ← détail
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── prisma.ts              ← singleton PrismaClient
│   │   └── auth.ts                ← si auth configurée
│   └── types/
│       ├── User.ts
│       └── Post.ts
├── package.json
├── next.config.ts
├── tsconfig.json
└── .env.example                   ← DATABASE_URL pré-remplie
```

---

## Phase 6 — Landing Page

**Fichier :** `src/app/page.tsx`

Sections :
1. **Hero** — titre + sous-titre + CTA "Créer un projet" + animation/illustration du wizard
2. **Comment ça marche** — 3 étapes animées (choisir / configurer / télécharger)
3. **Stack Grid** — grille de tous les stacks supportés avec badge "ZIP" ou "CLI"
4. **Témoignages / Stats** — fichiers générés, temps économisé (estimation)
5. **Footer** — liens GitHub, documentation, changelog

---

## Phase 7 — Qualité & Déploiement

### 7.1 Tests

```
tests/
├── stores/
│   ├── useWizardStore.test.ts    ← computeSteps, actions, getConfig()
│   └── useErdStore.test.ts       ← sync avec wizard store
├── generators/
│   ├── yaml.test.ts              ← YAML généré valide (parsé et validé par schema)
│   ├── zip-react.test.ts         ← ZIP contient les fichiers attendus
│   └── zip-nextjs.test.ts
└── components/
    ├── ModelsStep.test.tsx
    └── OutputStep.test.tsx
```

### 7.2 Export statique

```typescript
// next.config.ts
const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
};
```

Le site peut être hébergé sur Vercel, Netlify, ou tout CDN — zéro serveur requis.

### 7.3 SEO

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  title:       'StackInit — Project Scaffolder',
  description: 'Générez votre projet Laravel, Express, NestJS ou React en quelques clics.',
  openGraph: {
    title:  'StackInit',
    images: ['/og-image.png'],
  },
};
```

---

## Récapitulatif des Priorités

| Priorité | Tâche | Effort estimé |
|---|---|---|
| **P0** | `useWizardStore.ts` complet avec computeSteps | 2 jours |
| **P0** | `WizardShell` + `WizardSidebar` + `WizardFooter` | 1 jour |
| **P0** | `StackStep` (3 catégories, cartes) | 1 jour |
| **P0** | `ModelsStep` (ModelCard, FieldRow, FieldTypeSelect, FieldParamsPanel) | 4-5 jours |
| **P0** | `LaravelOptionsStep` (tableaux de toggles) | 2 jours |
| **P0** | `ReactStep` (librairies + pages) | 2 jours |
| **P0** | `lib/generator/yaml.ts` | 1 jour |
| **P0** | `OutputStep` + `computeFileList` | 1 jour |
| **P1** | `ArchitectureStep` | 1 jour |
| **P1** | `UsageStep` (Next.js) | 0.5 jour |
| **P1** | `DatabaseStep` | 1 jour |
| **P1** | `RoutesStep` | 1 jour |
| **P1** | `MiddlewaresStep` | 1 jour |
| **P1** | `NestOptionsStep` | 1 jour |
| **P1** | `lib/generator/zip-react.ts` | 3 jours |
| **P1** | Vue ERD (XYFlow) | 2-3 jours |
| **P2** | `lib/generator/zip-nextjs-fullstack.ts` | 3-4 jours |
| **P2** | Landing page | 2 jours |
| **P2** | Tests (stores + générateurs) | 2 jours |
| **P3** | Export statique + déploiement Vercel | 0.5 jour |
| **P3** | SEO + og:image | 0.5 jour |
