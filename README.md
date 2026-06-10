# stack-init

Interface web wizard pour la configuration visuelle de stacks techniques et la génération de code. Construit avec Next.js 16 App Router.

---

## Vue d'ensemble

`stack-init` est une application Next.js qui guide l'utilisateur à travers un wizard multi-étapes pour configurer son stack technique. À la fin du wizard, il génère soit un fichier `stack-init.yaml` (pour les stacks backend, consommé par le CLI `stack-init-cli`), soit un ZIP complet (pour les stacks frontend/full-stack JavaScript).

L'ensemble de la logique de génération s'exécute côté client. Aucune donnée de configuration ne quitte la machine de l'utilisateur sauf pour les fonctionnalités IA et de persistance (Supabase).

---

## Stack technique

| Couche | Technologie | Usage |
|---|---|---|
| Framework | Next.js 16 (App Router) | Rendu SSR/SSG et routing |
| Langage | TypeScript (strict) | Typage complet bout en bout |
| Style | Tailwind CSS v4 + CSS natif | Thème dark/gold premium |
| État global | Zustand | État du wizard (steps, config, modèles) |
| Diagramme ERD | xyflow/react | Canvas drag-and-drop pour les relations |
| Templating | Handlebars | Génération dynamique de fichiers |
| Compression URL | lz-string | Partage de config par URL |
| Auth & persistance | Supabase | Comptes utilisateurs + historique de configs |
| IA | Google Generative AI | Parsing langage naturel → schéma |
| Composants UI | shadcn/ui + Radix UI | Bibliothèque de composants |
| Génération ZIP | JSZip | Génération 100% côté client |
| Icônes | Lucide React | Jeu d'icônes cohérent |

---

## Installation et démarrage

```bash
# Cloner le dépôt
git clone <repo-url> stack-init
cd stack-init

# Installer les dépendances
pnpm install

# Configurer les variables d'environnement
cp .env.local.example .env.local
# Remplir les clés Supabase et Google AI dans .env.local

# Lancer en développement
pnpm dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Variables d'environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Google Generative AI (pour l'assistant IA)
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
```

### Scripts disponibles

```bash
pnpm dev      # Démarre le serveur de développement (port 3000)
pnpm build    # Build de production
pnpm start    # Démarre le serveur de production
pnpm lint     # Analyse ESLint
```

---

## Structure des dossiers

```
stack-init/
├── src/
│   ├── app/                          Pages et API routes (Next.js App Router)
│   │   ├── page.tsx                  Landing page (~1280 lignes, showcase interactif)
│   │   ├── create/
│   │   │   └── page.tsx              Point d'entrée du wizard (charge config depuis URL)
│   │   ├── dashboard/
│   │   │   └── page.tsx              Dashboard des configurations sauvegardées
│   │   ├── auth/
│   │   │   ├── login/page.tsx        Page de connexion Supabase
│   │   │   ├── register/page.tsx     Page d'inscription
│   │   │   └── callback/page.tsx     Callback OAuth Supabase
│   │   ├── guides/
│   │   │   └── page.tsx              Documentation MDX
│   │   ├── sitemap.ts                Génération automatique du sitemap SEO
│   │   └── api/                      API Routes Next.js
│   │       ├── ai-assist/route.ts    Parsing IA : prompt → ProjectConfig
│   │       ├── analyze-github/route.ts  Analyse de repo GitHub → modèles
│   │       ├── parse-prompt/route.ts    Parsing texte → modèles
│   │       ├── recommend-stack/route.ts Recommandation de stack
│   │       ├── refine-config/route.ts   Affinement config par IA
│   │       └── configs/route.ts         CRUD configs utilisateur (Supabase)
│   │
│   ├── components/
│   │   ├── wizard/                   Enveloppe et navigation du wizard
│   │   │   ├── WizardShell.tsx       Container principal, orchestre les étapes
│   │   │   ├── WizardSidebar.tsx     Navigation latérale (liste des étapes)
│   │   │   └── SubStepPills.tsx      Indicateurs de sous-étapes (progress pills)
│   │   │
│   │   ├── steps/                    Une composante par étape du wizard
│   │   │   ├── StackStep.tsx         Choix du/des frameworks
│   │   │   ├── ArchitectureStep.tsx  Choix du pattern d'architecture
│   │   │   ├── DatabaseStep.tsx      Moteur BDD + ORM
│   │   │   ├── ModelsStep.tsx        Création des entités avec leurs champs
│   │   │   ├── RelationsStep.tsx     Définition des relations (1:1, 1:N, N:N)
│   │   │   ├── RoutesStep.tsx        Configuration des endpoints API
│   │   │   ├── MiddlewaresStep.tsx   Sélection des middlewares
│   │   │   ├── LaravelStep.tsx       Options spécifiques Laravel (auth, PHP version)
│   │   │   ├── NestStep.tsx          Options NestJS (modular/CQRS/layered)
│   │   │   ├── ReactStep.tsx         Config React (state lib, UI lib, routing)
│   │   │   ├── FastAPISetupStep.tsx  Options FastAPI (async, background tasks)
│   │   │   ├── IntegrationStep.tsx   Paramètres d'intégration multi-stack
│   │   │   └── OutputStep.tsx        Export final (ZIP ou YAML)
│   │   │
│   │   ├── canvas/
│   │   │   └── CanvasView.tsx        Canvas visuel pour la modélisation de données
│   │   │
│   │   ├── erd/                      Éditeur ERD interactif (Entity-Relationship Diagram)
│   │   │   ├── ERDDiagram.tsx        Diagramme avec nœuds et arêtes éditables
│   │   │   ├── ModelNode.tsx         Nœud représentant un modèle (lecture)
│   │   │   ├── EditableModelNode.tsx Nœud avec édition de champs inline
│   │   │   └── DeletableEdge.tsx     Arête de relation avec bouton de suppression
│   │   │
│   │   ├── modals/
│   │   │   ├── ImportModal.tsx       Import de config existante (YAML/SQL/JSON)
│   │   │   ├── ModulesModal.tsx      Sélecteur de modules préconstruits (Auth, Billing...)
│   │   │   └── AIAssistant.tsx       Interface chat pour l'assistant IA
│   │   │
│   │   ├── auth/
│   │   │   ├── NavAuthButton.tsx     Affichage état auth dans le header
│   │   │   └── SaveConfigButton.tsx  Bouton de sauvegarde config sur Supabase
│   │   │
│   │   ├── landing/
│   │   │   └── HeroIllustration.tsx  SVG animé de la section hero
│   │   │
│   │   └── ui/                       Composants shadcn/ui réutilisables
│   │       └── (button, card, input, select, dialog, tabs, switch, tooltip...)
│   │
│   ├── lib/
│   │   ├── generator/                Moteurs de génération de code par framework
│   │   │   ├── common.ts             Utilitaires partagés (conversion de types, naming)
│   │   │   ├── yaml.ts               Génération du fichier stack-init.yaml (pour le CLI)
│   │   │   ├── zip.ts                Génération ZIP JSZip pour projets frontend
│   │   │   ├── react.ts              Scaffold React + Vite (~28KB)
│   │   │   ├── nextjs.ts             Scaffold Next.js App Router (~62KB)
│   │   │   ├── express.ts            Scaffold Express + Prisma/TypeORM (~40KB)
│   │   │   ├── nest.ts               Scaffold NestJS modulaire (~30KB)
│   │   │   ├── fastapi.ts            Scaffold FastAPI async (~38KB)
│   │   │   ├── django.ts             Scaffold Django (~10KB)
│   │   │   ├── angular.ts            Scaffold Angular (~20KB)
│   │   │   ├── vue.ts                Scaffold Vue 3 Composition API (~15KB)
│   │   │   ├── t3.ts                 Scaffold T3 Stack (Next.js + tRPC + Prisma) (~24KB)
│   │   │   ├── docker.ts             Génération Docker & docker-compose (~13KB)
│   │   │   ├── integration.ts        Orchestration multi-stack (backend + frontend)
│   │   │   └── previews.ts           Aperçus de code pour la landing page
│   │   │
│   │   ├── presets.ts                Templates prêts à l'emploi (SaaS, e-commerce, blog)
│   │   ├── modules.ts                Modules optionnels (Auth, File Upload, Email, Cache...)
│   │   ├── parseSql.ts               Parser SQL DDL → modèles du wizard
│   │   ├── githubAnalyzer.ts         Analyse de repo GitHub → contexte de stack
│   │   ├── gemini.ts                 Génération JSON structurée via l'API Gemini
│   │   ├── sharing.ts                Compression/décompression config en URL (lz-string)
│   │   ├── guides-manifest.ts        Structure de navigation de la documentation
│   │   ├── utils.ts                  Fonctions utilitaires générales
│   │   ├── templates/
│   │   │   └── community.ts          Registre des templates communautaires
│   │   └── supabase/
│   │       ├── client.ts             Client Supabase côté navigateur
│   │       └── server.ts             Client Supabase côté serveur (Server Components)
│   │
│   ├── stores/
│   │   └── useWizardStore.ts         Store Zustand — état global du wizard
│   │
│   └── types/
│       ├── schema.ts                 Types TypeScript (ProjectConfig, Model, NamedField...)
│       └── combos.ts                 Constantes des combinaisons de stacks supportées
│
├── public/                           Assets statiques (icônes, fonts, images)
├── supabase/                         Schéma et migrations de la base de données
├── next.config.ts                    Config Next.js (support MDX, origines dev)
├── tailwind.config.ts                Config Tailwind CSS v4
├── postcss.config.mjs                Plugins PostCSS
├── components.json                   Config shadcn/ui
├── tsconfig.json                     TypeScript (strict mode, path aliases)
├── eslint.config.mjs                 Règles ESLint
└── package.json
```

---

## Fonctionnement du wizard

### Les 10 étapes

Le wizard guide l'utilisateur de manière séquentielle. Chaque étape lit et écrit dans le store Zustand partagé.

| # | Étape | Description |
|---|---|---|
| 1 | **Stack** | Sélection du ou des frameworks (backend + frontend optionnel) |
| 2 | **Architecture** | Choix du pattern : MVC, Repository, CQRS, Layered, Hexagonal |
| 3 | **Base de données** | Moteur (PostgreSQL, MySQL, SQLite, MongoDB) + ORM |
| 4 | **Modèles** | Création des entités avec leurs champs et types de données |
| 5 | **Relations** | Liens entre modèles : 1:1, 1:N, N:N avec clés étrangères |
| 6 | **Routes** | Configuration des endpoints API REST |
| 7 | **Middlewares** | CORS, authentification JWT, rate limiting, logging |
| 8 | **Options framework** | Paramètres spécifiques au stack choisi (Laravel/NestJS/FastAPI/React) |
| 9 | **Intégration** | Config de l'intégration backend ↔ frontend pour les combos |
| 10 | **Output** | Prévisualisation et téléchargement (ZIP ou YAML) |

### Flux de génération selon le stack

**Backend PHP/Python (Laravel, FastAPI, Django) :**
Le wizard génère un fichier `stack-init.yaml` que l'utilisateur passe ensuite au CLI `stack-init-cli` pour la génération réelle sur son serveur.

**Frontend JavaScript (React, Next.js, Vue, Angular, T3) :**
Le wizard génère un ZIP complet côté navigateur via JSZip. Le ZIP contient l'arborescence complète du projet prête à dézipper.

**Combo full-stack (ex: Laravel + React) :**
Les deux moteurs tournent en parallèle. L'output contient le YAML pour le backend ET le ZIP frontend, accompagnés d'un `GETTING_STARTED.md` personnalisé.

---

## État global (Zustand)

`src/stores/useWizardStore.ts` centralise tout l'état du wizard :

```typescript
interface WizardStore {
  // Navigation
  currentStep: number
  currentSubStep: number

  // Configuration de projet
  config: ProjectConfig
  models: Model[]
  relations: Relation[]

  // Actions sur les modèles
  addModel: (model: Model) => void
  updateModel: (id: string, patch: Partial<Model>) => void
  removeModel: (id: string) => void

  // Actions sur la config
  setConfig: (patch: Partial<ProjectConfig>) => void

  // Navigation
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void

  // Partage
  exportToUrl: () => string
  importFromUrl: (url: string) => void
}
```

---

## Types centraux

Définis dans `src/types/schema.ts` et partagés avec `@stack-init/schema` (package du monorepo CLI) :

```typescript
interface ProjectConfig {
  name: string
  version: string
  stack: StackType          // 'laravel' | 'express' | 'nestjs' | 'fastapi' | 'django'
  frontend?: FrontendType   // 'react' | 'nextjs' | 'vue' | 'angular'
  database: DatabaseConfig
  models: Model[]
  relations: Relation[]
  middlewares: string[]
  architecture: ArchitectureType
  // Options spécifiques par framework
  laravel?: LaravelOptions
  nest?: NestOptions
  fastapi?: FastAPIOptions
  react?: ReactOptions
  vue?: VueOptions
}

interface Model {
  id: string
  name: string              // PascalCase (ex: "BlogPost")
  fields: NamedField[]
  generate: {
    migration: boolean
    factory: boolean
    policy: boolean
    seeder: boolean
    resource: boolean
    controller: boolean
    service: boolean
    repository: boolean
    test: boolean
  }
}

interface NamedField {
  name: string              // snake_case (ex: "published_at")
  type: FieldType           // 40+ types supportés
  nullable: boolean
  unique: boolean
  default?: string
  precision?: number        // Pour les types decimal
  scale?: number
  enumValues?: string[]     // Pour le type enum
}
```

---

## Moteurs de génération

Chaque fichier de `src/lib/generator/` est responsable d'un framework ou d'une couche. Ils prennent un `ProjectConfig` en entrée et retournent soit des fichiers texte, soit un objet JSZip.

### `yaml.ts` — Génération du manifeste YAML

Sérialise le `ProjectConfig` complet en YAML structuré pour le CLI. Gère les cas particuliers (champs enum, relations polymorphiques, types spéciaux).

### `zip.ts` — Génération ZIP frontend

Crée une archive JSZip avec l'arborescence complète du projet frontend. Intègre les dépendances choisies dans `package.json`, génère les pages et composants selon les modèles.

### `react.ts` / `nextjs.ts` / `vue.ts` — Scaffolds frontend

Génèrent les pages de liste, de détail et de formulaire pour chaque modèle. Convertissent les types BDD en interfaces TypeScript. Intègrent la bibliothèque de composants choisie (shadcn, MUI, Ant Design...).

### `express.ts` / `nest.ts` / `fastapi.ts` / `django.ts` — Prévisualisations backend

Ces générateurs produisent des **aperçus de code** pour la prévisualisation dans l'UI (step Output). La génération complète sur disque est déléguée au CLI.

### `docker.ts` — Infrastructure

Génère des `Dockerfile` multi-stage et `docker-compose.yml` adaptés au stack choisi.

### `integration.ts` — Orchestration

Pour les combos full-stack, génère le `Makefile` global, la structure de dossiers `backend/` + `frontend/`, et le `GETTING_STARTED.md`.

---

## Fonctionnalités supplémentaires

### Éditeur ERD visuel

Le canvas xyflow permet de :
- Glisser-déposer les modèles pour les organiser
- Créer des champs directement sur le nœud (édition inline)
- Visualiser les relations avec des arêtes étiquetées
- Supprimer des relations en cliquant sur leur arête

### Assistant IA

Trois modes d'import via l'API `/api/ai-assist` :

1. **Prompt langage naturel** — "Je veux un SaaS de gestion de projets avec des users, des teams et des tasks"
2. **Import SQL** — Coller un `CREATE TABLE` dump, `parseSql.ts` reconstruit les modèles
3. **Analyse GitHub** — Entrer une URL de repo, le serveur scanne les migrations/modèles existants

### Partage par URL

La config complète est sérialisée en JSON, compressée avec `lz-string` et encodée en base64 dans le query string. L'URL résultante peut être partagée — quand quelqu'un l'ouvre, `create/page.tsx` décode et recharge la config dans le store.

### Templates et presets

- **Presets** (`lib/presets.ts`) : SaaS, e-commerce, blog — pré-remplissent l'intégralité du wizard en un clic
- **Modules optionnels** (`lib/modules.ts`) : Auth, Billing, File Upload, Email, Cache, WebSockets, Queue — injectés dans la config sans modifier le flux du wizard

---

## API Routes

| Route | Méthode | Description |
|---|---|---|
| `/api/ai-assist` | POST | Parse un prompt langage naturel → `ProjectConfig` partiel |
| `/api/analyze-github` | POST | Scanne un repo GitHub → détecte les modèles et le stack |
| `/api/parse-prompt` | POST | Extrait les modèles depuis un texte descriptif |
| `/api/recommend-stack` | POST | Recommande un stack selon les besoins décrits |
| `/api/refine-config` | POST | Affine une config existante via un prompt correctif |
| `/api/configs` | GET | Liste les configs sauvegardées de l'utilisateur (Supabase) |
| `/api/configs` | POST | Sauvegarde une nouvelle config |
| `/api/configs` | DELETE | Supprime une config par ID |

---

## Stacks supportés

### Backends

| Stack | Langage | Versions |
|---|---|---|
| Laravel | PHP | 10, 11, 12 (PHP 8.1–8.4) |
| Express | Node.js | LTS |
| NestJS | Node.js | LTS |
| FastAPI | Python | 3.10–3.12 |
| Django | Python | 4.x, 5.x |

### Frontends

| Stack | Bundler | Description |
|---|---|---|
| React | Vite | SPA avec Zustand/Redux/Jotai, React Router |
| Next.js | Turbopack | App Router, SSR, API Routes |
| Vue 3 | Vite | Composition API, Pinia |
| Angular | Angular CLI | Modules, Services, HTTP Client |
| T3 Stack | Next.js | tRPC + Prisma + NextAuth |

### Combos full-stack

| Combo | Backend | Frontend |
|---|---|---|
| `laravel+react` | Laravel | React Vite |
| `laravel+nextjs` | Laravel | Next.js |
| `express+react` | Express | React Vite |
| `nestjs+react` | NestJS | React Vite |
| `fastapi+react` | FastAPI | React Vite |
| `fastapi+nextjs` | FastAPI | Next.js |
| `mern` | Express + MongoDB | React |
| `pern` | Express + PostgreSQL | React |
| `mevn` | Express + MongoDB | Vue 3 |
| `mean` | Express + MongoDB | Angular |
| `t3` | Next.js + tRPC | Next.js |

---

## Design system

Le projet suit une charte **Dark Gold Premium** :

- **Couleurs** : Noir profond (`#000`) avec accents Or (`#D4AF37`) et Ambre
- **Surfaces** : Glassmorphism (verre dépoli) avec bordures subtiles semi-transparentes
- **Typographie** : Inter / Outfit pour une lisibilité maximale
- **Micro-animations** : Transitions fluides sur les étapes du wizard et le canvas ERD
