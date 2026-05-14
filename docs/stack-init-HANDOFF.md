# stack-init — Document de référence complet

> Handoff complet pour reprendre le projet dans Claude Code CLI.
> Ce fichier contient tout : vision, décisions, code existant, ce qui reste à faire.

---

## 1. Vision du projet

### Le problème

À chaque nouveau projet Laravel, on répète toujours les mêmes choses à la main : créer le modèle, écrire la migration avec les bons types, créer le controller, les FormRequests avec les règles de validation, la Factory avec Faker, les tests Pest. C'est répétitif, long, et on oublie toujours un fichier.

### La solution

**stack-init** : tu décris ta base de données dans un fichier YAML → tu lances une commande → tous tes fichiers sont créés automatiquement.

L'inspiration directe est [flutterinit.com](https://flutterinit.com) — un wizard web visuel qui génère des projets Flutter complets. On reprend exactement le même concept mais pour plusieurs stacks.

### Les deux modes de distribution

Selon le stack choisi, la sortie est différente :

**Stacks JS/TS (React, Next.js)** → génération 100% browser, exactement comme FlutterInit. Handlebars.js + JSZip → fichier `.zip` téléchargeable directement. Zéro serveur.

**Stacks non-JS (Laravel, Django, Rails, NestJS)** → le browser ne peut pas exécuter du PHP ou du Python. Donc le wizard génère un fichier `stack-init.yaml` + affiche la commande CLI. L'utilisateur lance `npx stack-init generate` dans son projet.

**Stacks mixtes (Laravel + React)** → les deux en même temps. ZIP pour React côté browser, YAML pour Laravel côté CLI.

---

## 2. Architecture globale

### Monorepo (Bun workspaces + Turborepo)

```
stack-init/
├── package.json              ← workspaces root
├── turbo.json
├── tsconfig.base.json
│
├── packages/
│   ├── schema/               ← @stack-init/schema  (FAIT ✓)
│   └── cli/                  ← stack-init npm       (FAIT ✓)
│
└── apps/
    └── web/                  ← stackinit.dev        (À FAIRE)
```

### Règle de dépendances

```
apps/web     → importe @stack-init/schema
packages/cli → importe @stack-init/schema
apps/web     → N'importe JAMAIS packages/cli  (browser ≠ Node)
packages/cli → N'importe JAMAIS apps/web
```

`@stack-init/schema` est le seul endroit où les types sont définis. Personne ne redéfinit rien ailleurs.

---

## 3. packages/schema — FAIT ✓

**Package** : `@stack-init/schema`
**Technologie** : TypeScript + Zod
**Tests** : 21 tests Vitest — tous verts

### Ce que c'est

La source de vérité de tout le projet. Définit en Zod ce qui est valide ou non dans une configuration stack-init. Les types TypeScript sont inférés automatiquement (`z.infer<typeof ...>`), donc zéro duplication.

### Fichiers

#### `src/field-types.ts`

Définit tous les types de champs Blueprint Laravel réels (pas un vague `string` — les vrais types avec leurs paramètres).

Implémenté comme une **union discriminée** sur le champ `type`. TypeScript sait donc exactement quels paramètres sont disponibles selon le type choisi.

Types implémentés (55 au total) :

**Texte** : `string` (+ `length`), `char` (+ `length`), `tinyText`, `text`, `mediumText`, `longText`, `enum` (+ `values[]`), `set` (+ `values[]`), `json`, `jsonb`, `uuid`, `ulid`, `ipAddress`, `macAddress`

**Nombres** : `tinyInteger`, `smallInteger`, `mediumInteger`, `integer`, `bigInteger`, `unsignedTinyInteger`, `unsignedSmallInteger`, `unsignedInteger`, `unsignedBigInteger`, `float` (+ `precision`, `scale`), `double` (+ `precision`, `scale`), `decimal` (+ `precision`, `scale`), `year`

**Date & temps** : `date`, `dateTime` (+ `precision`), `dateTimeTz` (+ `precision`), `time` (+ `precision`), `timeTz` (+ `precision`), `timestamp` (+ `precision`), `timestampTz` (+ `precision`)

**Bool & binaire** : `boolean`, `binary`, `tinyBlob`, `blob`, `mediumBlob`, `longBlob`

**Relations** : `id`, `foreignId` (+ `references`, `on_delete`, `constrained`), `foreignUuid`, `foreignUlid`, `morphs`, `uuidMorphs`

**Spéciaux** : `geometry`, `geography`, `point`, `lineString`, `polygon`, `vector` (+ `dimensions`), `rememberToken`

Modificateurs communs (sur presque tous les types) : `nullable`, `unique`, `index`, `default`, `comment`, `unsigned`.

Exports utilitaires :
- `FIELD_TYPES` — liste exhaustive des types (pour les dropdowns du wizard)
- `FIELD_TYPES_WITH_PARAMS` — map type → params supplémentaires (pour afficher les inputs dans le wizard)
- `FIELD_TYPE_CATEGORIES` — regroupement par catégorie (Texte, Nombres, Date...)

#### `src/models.schema.ts`

Définit la structure d'un modèle complet.

**`NamedFieldSchema`** = nom (snake_case obligatoire, regex validée) + FieldSchema. C'est la définition d'un champ dans un modèle.

**`RelationTypeSchema`** = enum des 10 types de relations Eloquent : `hasOne`, `hasMany`, `belongsTo`, `belongsToMany`, `hasOneThrough`, `hasManyThrough`, `morphOne`, `morphMany`, `morphTo`, `morphToMany`.

**`RelationSchema`** = type + model cible + options (pivot_table, foreign_key, local_key, through, with_trashed).

**`LaravelGenerateOptionsSchema`** = les toggles par modèle. Ce sont exactement les boutons du wizard :
- `migration` (défaut: true)
- `controller` (défaut: true)
- `resource` (défaut: true)
- `request` (défaut: true) — génère StoreXRequest + UpdateXRequest
- `policy` (défaut: false)
- `factory` (défaut: true)
- `seeder` (défaut: false)
- `swagger` (défaut: false)
- `softDelete` (défaut: false)
- `repository` (défaut: false)
- `service` (défaut: false)
- `tests` (défaut: true)

**`MigrationOptionsSchema`** = options de la table SQL : `timestamps`, `timestampsTz`, `softDeletes`, `softDeletesTz`, `primary_key` (id/uuid/ulid/custom), `engine`, `charset`, `collation`.

**`ModelSchema`** = nom (PascalCase obligatoire) + table (optionnel) + fields + relations + migration + generate.

**`validateForeignKeys(models)`** = validation croisée entre modèles. Si un champ `user_id` de type `foreignId` référence `users`, il vérifie qu'un modèle `User` existe dans la config. Retourne `{ valid, errors[] }`.

#### `src/laravel.schema.ts`

Options globales du projet Laravel (s'appliquent à tout le projet) :
- `pattern` : `full` | `api-only` | `minimal`
- `auth` : `none` | `sanctum` | `passport` | `breeze` | `jetstream`
- `runner` : `makefile` | `bash` | `both` | `none`
- `php_version` : `8.1` | `8.2` | `8.3`
- `laravel_version` : `10` | `11` | `12`
- `use_strict_types` : boolean (défaut: true)
- `use_readonly` : boolean (défaut: false)
- `use_enum_backed` : boolean (défaut: true)
- `route_prefix` : string (défaut: `api`)
- `db_engine` : `mysql` | `pgsql` | `sqlite` | `sqlsrv`

#### `src/react.schema.ts`

Options du projet React généré en ZIP :
- `architecture` : `feature-based` | `layer-based` | `minimal`
- `state_lib` : `zustand` | `redux-toolkit` | `jotai` | `none`
- `form_lib` : `react-hook-form` | `formik` | `none`
- `ui_lib` : `shadcn` | `mui` | `antd` | `chakra` | `none`
- `http_lib` : `axios` | `ky` | `fetch`
- `data_fetching` : `tanstack-query` | `swr` | `none`
- `router` : `react-router-v6` | `tanstack-router` | `none`
- `css` : `tailwind` | `css-modules` | `styled-components` | `none`
- `typescript` : boolean
- `bundler` : `vite` | `next` | `create-react-app`
- `testing` : `vitest` | `jest` | `none`
- `pages` : record `{ [modelName]: { list, detail, create, edit } }` — pages à générer par modèle

#### `src/project.schema.ts`

La config projet complète qui assemble tout. Implémente des **validations croisées** via `superRefine` :
- Si stack Laravel → config Laravel obligatoire
- Si stack React → config React obligatoire
- Appelle `validateForeignKeys` pour vérifier la cohérence entre modèles

**`parseProjectConfig(raw)`** = fonction utilitaire principale. Prend n'importe quoi en entrée (le YAML parsé), retourne `{ success: true, data }` ou `{ success: false, errors: string[] }`.

Stacks supportés : `laravel`, `laravel+react`, `laravel+nextjs`, `nextjs`, `react`, `nestjs`, `django`, `rails`.

Helpers exportés : `isZipStack()`, `isCliStack()`, `isMixedStack()`.

#### `src/index.ts`

Exporte tout via `export * from '...'`. C'est le seul fichier qu'on importe depuis l'extérieur du package.

---

## 4. packages/cli — FAIT ✓

**Package** : `stack-init` (publié sur npm)
**Technologie** : TypeScript, CommonJS (compilé), Commander.js
**Commande** : `npx stack-init generate`

### Commandes disponibles

```bash
stack-init generate                              # génère tout
stack-init generate --dry-run                    # affiche sans écrire
stack-init generate --config mon-fichier.yaml    # fichier custom
stack-init generate --output /chemin/projet      # dossier de sortie custom
```

### Flux d'exécution de `generate`

```
1. Lit stack-init.yaml (js-yaml)
2. Valide avec parseProjectConfig() (Zod)
   → Erreurs claires si invalide, exit 1
3. Pour chaque modèle, instancie LaravelGenerator
4. buildContext() prépare les données pour Handlebars
5. render() charge le template .hbs et le compile (avec cache)
6. writeFiles() écrit sur disque (ou affiche en dry-run)
7. Génère Makefile et/ou run.sh
8. Affiche le résumé coloré (picocolors)
```

### Fichiers source

#### `src/index.ts`

Point d'entrée Commander.js. Définit les commandes et leurs options.

#### `src/commands/generate.ts`

Orchestration de la commande `generate`. Lit le YAML, valide, appelle les générateurs, écrit les fichiers.

#### `src/utils/naming.ts`

Utilitaires de conversion de noms :
- `pascalCase('blog_post')` → `'BlogPost'`
- `camelCase('BlogPost')` → `'blogPost'`
- `snakeCase('BlogPost')` → `'blog_post'`
- `kebabCase('BlogPost')` → `'blog-post'`
- `pluralize('Comment')` → `'comments'`
- `modelToTableName('BlogPost')` → `'blog_posts'`
- `modelToRouteName('BlogPost')` → `'blog-posts'`
- `modelToVarName('BlogPost')` → `'blogPost'`
- `migrationTimestamp(offsetSeconds)` → `'2026_05_14_120000'`

#### `src/utils/field-helpers.ts`

Trois fonctions principales qui prennent un `NamedField` et retournent la traduction PHP/Laravel :

**`fieldToMigrationLine(field)`** → la ligne `$table->xxx()` complète avec modificateurs.
Exemples :
```
{ type: 'foreignId', name: 'user_id', references: 'users' }
→ "$table->foreignId('user_id')->constrained('users')->cascadeOnDelete();"

{ type: 'decimal', name: 'price', precision: 10, scale: 2 }
→ "$table->decimal('price', 10, 2);"

{ type: 'enum', name: 'role', values: ['admin', 'viewer'] }
→ "$table->enum('role', ['admin', 'viewer']);"

{ type: 'string', name: 'name', nullable: true, default: 'anonyme' }
→ "$table->string('name')->nullable()->default('anonyme');"
```

**`fieldToCast(field)`** → le cast Eloquent (`'boolean'`, `'datetime'`, `'decimal:2'`, `'array'`, etc.) ou `null` si pas de cast.

**`fieldToValidationRule(field)`** → tableau de règles Laravel Request.
Exemples :
```
string nullable  → ['nullable', 'string', 'max:255']
integer required → ['required', 'integer']
foreignId        → ['required', 'exists:users,id']
enum             → ['required', 'in:admin,editor,viewer']
boolean          → ['required', 'boolean']
```

**`fieldToFaker(field)`** → valeur Faker PHP. Regarde d'abord le **nom** du champ (heuristiques : `email` → `fake()->unique()->safeEmail()`, `body` → `fake()->paragraphs(3, true)`, etc.), puis le type.

#### `src/generators/laravel/handlebars.ts`

Configure l'instance Handlebars avec les helpers :
- `{{eq a b}}` / `{{neq}}` / `{{and}}` / `{{or}}` / `{{not}}`
- `{{camelCase "BlogPost"}}` → `blogPost`
- `{{camelCasePlural "Comment"}}` → `comments`
- `{{pluralize "Post"}}` → `Posts`
- `{{migrationLine field}}` → appelle `fieldToMigrationLine()` et retourne SafeString

#### `src/generators/laravel/index.ts`

La classe `LaravelGenerator`. Méthodes clés :

**`generate(config)`** — boucle sur les modèles, appelle `generateModel()` pour chacun.

**`generateModel(model, config, index)`** — selon les toggles activés dans `model.generate`, pousse des `GeneratedFile` dans la liste :
```
model.generate.migration  → database/migrations/TIMESTAMP_create_TABLE_table.php
model.generate.controller → app/Http/Controllers/Api/NAMEController.php  (toujours)
model.generate.resource   → app/Http/Resources/NAMEResource.php
model.generate.request    → app/Http/Requests/StoreNAMERequest.php
                          → app/Http/Requests/UpdateNAMERequest.php
model.generate.policy     → app/Policies/NAMEPolicy.php
model.generate.factory    → database/factories/NAMEFactory.php
model.generate.service    → app/Services/NAMEService.php
model.generate.tests      → tests/Feature/NAMETest.php
```

**`buildContext(model, config)`** — prépare l'objet de contexte Handlebars :
- `fillable` : champs filtrés (exclut `id`, `rememberToken`, `morphs`)
- `casts` : map nom → cast Eloquent (via `fieldToCast`)
- `hiddenFields` : champs `password`, `token`, `secret`...
- `resourceFields` : champs exposés dans la Resource (exclut les FK)
- `validationRules` : règles Store + Update (Update ajoute `sometimes`)
- `fakerFields` : valeurs Faker par champ (via `fieldToFaker`)
- `hasUserRelation` : boolean pour les tests

**`render(templatePath, context)`** — lit le `.hbs`, compile (avec cache Map), rend avec le contexte.

#### `src/generators/runner/makefile.ts`

Génère le `Makefile` ou `run.sh` final. Le Makefile inclut les targets : `setup`, `install`, `migrate`, `seed`, `fresh`, `routes`, `test`, et optionnellement `sanctum` et `swagger` selon la config.

### Templates Handlebars (`templates/laravel/`)

```
base/
  Model.php.hbs       ← Model Eloquent (fillable, casts, hidden, relations, SoftDeletes)
  Controller.php.hbs  ← Controller CRUD complet (avec/sans resource/request/service/swagger)

overlays/
  migration/
    migration.php.hbs ← Migration complète (utilise {{migrationLine}})
  resource/
    Resource.php.hbs  ← JsonResource avec tous les champs
  request/
    StoreRequest.php.hbs   ← FormRequest avec règles auto-générées
    UpdateRequest.php.hbs  ← Idem + sometimes
  policy/
    Policy.php.hbs    ← Policy avec viewAny/view/create/update/delete (+ restore/forceDelete si softDelete)
  factory/
    Factory.php.hbs   ← Factory avec valeurs Faker
  service/
    Service.php.hbs   ← Service layer (paginate/create/update/delete)
  tests/
    Test.php.hbs      ← Tests Pest (index, show, store valide, store invalide, update, destroy)
```

### Le fichier `stack-init.yaml` (format utilisateur)

```yaml
name: my-blog           # kebab-case ou snake_case
stack: laravel          # ou react, laravel+react, nextjs, nestjs, django, rails

models:
  - name: User          # PascalCase obligatoire
    fields:
      - { name: name,              type: string }
      - { name: email,             type: string, unique: true }
      - { name: role,              type: enum, values: [admin, editor, viewer] }
      - { name: email_verified_at, type: timestamp, nullable: true }
    relations:
      - { type: hasMany, model: Post }
      - { type: hasMany, model: Comment }
    migration:
      timestamps: true
    generate:
      migration: true
      policy: true        # activé uniquement sur User
      factory: true
      tests: true
      swagger: true

  - name: Post
    fields:
      - { name: title,        type: string }
      - { name: body,         type: longText }
      - { name: published_at, type: timestamp, nullable: true }
      - { name: user_id,      type: foreignId, references: users }
    relations:
      - { type: belongsTo, model: User }
      - { type: hasMany,   model: Comment }
    migration:
      timestamps: true
      softDeletes: true   # deleted_at
    generate:
      migration: true
      policy: false       # désactivé sur Post
      factory: true
      tests: true

  - name: Comment
    fields:
      - { name: body,     type: text }
      - { name: user_id,  type: foreignId, references: users }
      - { name: post_id,  type: foreignId, references: posts }
    relations:
      - { type: belongsTo, model: User }
      - { type: belongsTo, model: Post }
    generate:
      migration: true
      factory: true
      tests: false        # désactivé sur Comment

laravel:
  pattern: api-only
  auth: sanctum
  runner: makefile
  db_engine: mysql
  php_version: "8.2"
  laravel_version: "11"
```

### Ce que génère ce YAML (25 fichiers)

```
app/Models/User.php
app/Models/Post.php
app/Models/Comment.php

database/migrations/2026_05_14_000001_create_users_table.php
database/migrations/2026_05_14_000002_create_posts_table.php
database/migrations/2026_05_14_000003_create_comments_table.php

app/Http/Controllers/Api/UserController.php
app/Http/Controllers/Api/PostController.php
app/Http/Controllers/Api/CommentController.php

app/Http/Resources/UserResource.php
app/Http/Resources/PostResource.php
app/Http/Resources/CommentResource.php

app/Http/Requests/StoreUserRequest.php    + UpdateUserRequest.php
app/Http/Requests/StorePostRequest.php    + UpdatePostRequest.php
app/Http/Requests/StoreCommentRequest.php + UpdateCommentRequest.php

app/Policies/UserPolicy.php              ← uniquement User

database/factories/UserFactory.php
database/factories/PostFactory.php
database/factories/CommentFactory.php

tests/Feature/UserTest.php
tests/Feature/PostTest.php               ← Comment n'a pas de tests

Makefile
```

---

## 5. apps/web — À FAIRE

### Stack technique

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**
- **shadcn/ui** (composants dans `src/components/ui/`)
- **Zustand 5** (état global du wizard)
- **Handlebars.js** (génération templates React côté browser)
- **JSZip** (création du ZIP côté browser)
- **js-yaml** (sérialisation de la config en YAML)
- **react-hook-form** + `@hookform/resolvers` + Zod (formulaires du wizard)
- **lucide-react** (icônes)

### Routing

Deux routes seulement :
```
/        → app/page.tsx        landing page
/create  → app/create/page.tsx  wizard
```

Pas d'API routes. Tout se passe côté client. Le site peut être exporté statique (`output: 'export'`).

### Structure complète

```
apps/web/
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── components.json                         ← config shadcn
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx                         ← landing
    │   └── create/
    │       └── page.tsx                     ← wizard
    ├── components/
    │   ├── wizard/
    │   │   ├── WizardShell.tsx              ← layout général (sidebar + main)
    │   │   ├── WizardSidebar.tsx            ← liste des étapes avec états
    │   │   ├── WizardOutput.tsx             ← dernière étape, génération
    │   │   └── steps/
    │   │       ├── StackStep.tsx
    │   │       ├── ModelsStep.tsx
    │   │       ├── RelationsStep.tsx
    │   │       ├── LaravelStep.tsx
    │   │       ├── ReactStep.tsx
    │   │       └── OutputStep.tsx
    │   ├── ui/                              ← composants shadcn
    │   └── landing/
    ├── stores/
    │   └── useWizardStore.ts                ← Zustand
    ├── lib/
    │   ├── generator/
    │   │   ├── index.ts                     ← point de décision ZIP vs YAML
    │   │   ├── zip.ts                       ← Handlebars + JSZip
    │   │   └── yaml.ts                      ← js-yaml dump
    │   └── templates/
    │       └── react/
    │           ├── base/
    │           └── overlays/
    └── types/
        └── wizard.ts
```

### Zustand store (structure)

```typescript
interface WizardStore {
  // Navigation
  currentStep: number
  setStep: (n: number) => void
  nextStep: () => void
  prevStep: () => void

  // Config (types depuis @stack-init/schema)
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

  // Toggles generate (par modèle ou tous)
  setGenerate: (modelName: string, key: keyof LaravelGenerateOptions, val: boolean) => void
  setGenerateAll: (key: keyof LaravelGenerateOptions, val: boolean) => void

  // Utilitaires
  canProceed: () => boolean        // valide l'étape courante
  getConfig: () => ProjectConfig   // config complète prête pour le générateur
  reset: () => void
}
```

### Point d'entrée du générateur

```typescript
// lib/generator/index.ts
export async function generate(config: ProjectConfig): Promise<void> {
  if (isZipStack(config.stack))   return generateZip(config)
  if (isCliStack(config.stack))   return generateYaml(config)
  // stack mixte → les deux en parallèle
  await Promise.all([generateZip(config), generateYaml(config)])
}
```

### Étapes du wizard

| # | Composant | Ce que l'utilisateur fait | Conditionnel |
|---|---|---|---|
| 1 | `StackStep` | Choisit le ou les stacks | Non |
| 2 | `ModelsStep` | Définit modèles + champs | Non |
| 3 | `RelationsStep` | Vérifie/ajuste les relations | Non |
| 4 | `LaravelStep` | Toggles par modèle | Si Laravel sélectionné |
| 5 | `ReactStep` | Pages + librairies | Si React/Next.js sélectionné |
| 6 | `OutputStep` | Génère et télécharge | Non |

### Comportement clé de LaravelStep

Cette étape a deux niveaux de contrôle :

**Vue "Tous les modèles"** : les toggle cards affichent un état global.
- Toggle indigo = activé sur TOUS les modèles
- Toggle ambre = activé sur CERTAINS modèles (état `partial`)
- Toggle gris = désactivé sur tous

Cliquer en vue globale → uniformise tous les modèles.

**Vue modèle spécifique** : toggle simple on/off pour ce modèle uniquement.

Les tabs montrent un dot coloré pour signaler l'état :
- Dot vert = tous les toggles identiques
- Dot ambre = config mixte
- Dot gris = rien d'activé

---

## 6. Design system

### Couleur accent

```css
--accent:        #6C63FF;   /* indigo */
--accent-hover:  #5851E6;
--accent-subtle: rgba(108, 99, 255, 0.08);
--accent-border: rgba(108, 99, 255, 0.25);
--accent-text:   #3C3489;
```

### Couleurs sémantiques

| État | Fond | Bordure | Texte |
|---|---|---|---|
| Success | `#E1F5EE` | `#9FE1CB` | `#085041` |
| Warning / partial | `#FAEEDA` | `#FAC775` | `#633806` |
| Error | `#FCEBEB` | `#F7C1C1` | `#791F1F` |
| Info / accent | `#EEEDFE` | `#AFA9EC` | `#3C3489` |

### Palette des types de champs

Chaque type a une couleur fixe partout dans le UI (chips, badges) :

| Types | Fond | Texte |
|---|---|---|
| `string`, `char`, `tinyText` | `#E1F5EE` | `#085041` |
| `text`, `mediumText`, `longText` | `#F1EFE8` | `#444441` |
| `integer`, `bigInteger`, `smallInteger` | `#E6F1FB` | `#0C447C` |
| `decimal`, `float`, `double` | `#EAF3DE` | `#27500A` |
| `boolean` | `#FAEEDA` | `#633806` |
| `timestamp`, `date`, `dateTime` | `#FBEAF0` | `#72243E` |
| `foreignId`, `foreignUuid` | `#EEEDFE` | `#3C3489` |
| `enum`, `set` | `#FAECE7` | `#712B13` |

### Border radius

| Valeur | Usage |
|---|---|
| 6px | Badge, pill, chip de type |
| 10px | Bouton, input, select |
| 14px | Card, panel, model card |
| 18px | Modal, frame |

### Composants — états des toggles

**Toggle card** : composant central de l'étape Laravel.
- État off : `border: 0.5px solid var(--border-tertiary); background: var(--bg-primary)`
- État on : `border-color: var(--accent-border); background: var(--accent-subtle)`
- État partial : `border-color: rgba(186,117,23,.3); background: rgba(250,238,218,.13)` (ambre)

**Toggle knob** :
- Off : position left 3px, background gris
- On : position left 19px, track indigo
- Partial : position left 19px, track ambre

### Layout wizard

```
┌────────────┬──────────────────────────────┐
│ Sidebar    │ Main content                 │
│ 220px      │ flex: 1                      │
│            │                              │
│ Logo       │ Titre (22px/500)             │
│            │ Sous-titre (14px/secondary)  │
│ ○ Stack    │                              │
│ ● Modèles  │ [contenu de l'étape]         │
│ ○ Relations│                              │
│ ○ Laravel  │                              │
│ ○ React    │ [footer: retour|dots|next]   │
│ ○ Résultat │                              │
└────────────┴──────────────────────────────┘
```

La sidebar est sticky. Le main content est `display: flex; flex-direction: column; min-height: 100vh`. Le footer utilise `margin-top: auto`.

### Icônes (Tabler outline)

| Usage | Icône |
|---|---|
| Logo | `ti-stack-2` |
| Modèle | `ti-table` |
| Champ | `ti-columns` |
| Relation | `ti-arrows-exchange` |
| Ajouter | `ti-plus` |
| Supprimer | `ti-trash` |
| Éditer | `ti-edit` |
| Done | `ti-check` |
| Télécharger | `ti-download` |
| Copier | `ti-copy` |
| Laravel | `ti-brand-php` |
| React | `ti-brand-react` |
| Next.js | `ti-brand-nextjs` |
| CLI | `ti-terminal-2` |
| Warning | `ti-alert-triangle` |
| Générer | `ti-sparkles` |

### Convention de nommage CSS

Préfixe `si-` pour tous les composants stack-init. Les composants shadcn restent non-préfixés.

```
si-wizard-shell
si-wizard-sidebar
si-wizard-main
si-wizard-footer
si-step-item, si-step-item--active, si-step-item--done
si-step-dot
si-model-card
si-model-card__header
si-model-card__body
si-field-row
si-toggle-card, si-toggle-card--on, si-toggle-card--partial
si-type-chip, si-type-chip--string, si-type-chip--foreignid, ...
```

---

## 7. Dépendances

### packages/schema

```json
{
  "dependencies": { "zod": "^3.23.0" },
  "devDependencies": { "typescript": "^5.4.0", "vitest": "^1.6.0" }
}
```

### packages/cli

```json
{
  "dependencies": {
    "@stack-init/schema": "*",
    "commander": "^12.0.0",
    "handlebars": "^4.7.8",
    "js-yaml": "^4.1.0",
    "picocolors": "^1.0.1",
    "ora": "^8.0.1"
  }
}
```

### apps/web

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@stack-init/schema": "file:../../packages/schema",
    "zustand": "^5.0.0",
    "handlebars": "^4.7.8",
    "jszip": "^3.10.0",
    "js-yaml": "^4.1.0",
    "react-hook-form": "^7.0.0",
    "@hookform/resolvers": "^3.0.0",
    "lucide-react": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "class-variance-authority": "latest"
  }
}
```

---

## 8. Commandes pour démarrer

### Reprendre depuis le début

```bash
# Cloner le projet
cd stack-init

# Installer les dépendances
npm install   # dans chaque package

# Compiler le schema (prérequis pour le CLI)
cd packages/schema && npx tsc

# Compiler le CLI
cd packages/cli && npx tsc -b

# Tester le schema
cd packages/schema && npx vitest run

# Tester le CLI avec le YAML de démo
node packages/cli/dist/index.js generate \
  --config stack-init.yaml \
  --output /tmp/test-output \
  --dry-run
```

### Créer le projet web (apps/web)

```bash
# Dans le monorepo
npx create-next-app@latest apps/web \
  --typescript --tailwind --app --src-dir --no-eslint \
  --import-alias "@/*"

cd apps/web

# Dépendances
npm install zustand handlebars jszip js-yaml \
  react-hook-form @hookform/resolvers \
  lucide-react clsx tailwind-merge class-variance-authority

# shadcn/ui
npx shadcn@latest init
# Style: default, Base color: neutral, CSS variables: yes

npx shadcn@latest add \
  button input label select checkbox switch badge \
  dialog sheet tooltip separator tabs card

# Lier le schema local dans package.json :
# "@stack-init/schema": "file:../../packages/schema"

# Créer la structure
mkdir -p src/stores src/lib/generator \
  src/lib/templates/react/base \
  src/lib/templates/react/overlays \
  src/components/wizard/steps \
  src/components/landing src/types
```

---

## 9. Ce qui reste à faire (dans l'ordre)

### Priorité 1 — apps/web (wizard)

1. `useWizardStore.ts` — le store Zustand complet
2. `WizardShell.tsx` + `WizardSidebar.tsx` — layout
3. `StackStep.tsx` — étape 1 (simple)
4. `ModelsStep.tsx` — étape 2 (la plus complexe, le plus important)
5. `RelationsStep.tsx` — étape 3
6. `LaravelStep.tsx` — étape 4 (tabs + toggle cards + état partial)
7. `ReactStep.tsx` — étape 5 (pages par modèle + libs)
8. `lib/generator/yaml.ts` — sérialisation YAML
9. `OutputStep.tsx` — étape 6
10. `lib/generator/zip.ts` — génération ZIP React (Handlebars + JSZip)
11. Landing page (`app/page.tsx`)

### Priorité 2 — CLI améliorations

- Commande `stack-init add model <Name>` — ajouter un modèle à un projet existant
- Génération des routes dans `routes/api.php`
- Seeder global `DatabaseSeeder.php` mis à jour
- Commande `stack-init rollback` — annuler la dernière génération

### Priorité 3 — Autres stacks

- Templates Django (models.py, serializers.py, viewsets DRF, URLs, migrations)
- Templates NestJS (modules, entités TypeORM, DTOs, controllers, Swagger)
- Templates Rails (scaffold étendu, RSpec, serializers)

### Priorité 4 — Publication

- `npx stack-init@latest` fonctionnel sur npm
- Landing page déployée sur Vercel (ou autre)
- README complet avec GIF de démo
- Documentation des types de champs

---

## 10. Décisions techniques prises

| Décision | Choix | Raison |
|---|---|---|
| Langage CLI | TypeScript CommonJS | Compatibilité maximale Node.js, pas de problèmes ESM |
| Templating | Handlebars.js | Même lib utilisable browser + Node, templates lisibles |
| Validation | Zod | Inférence TypeScript automatique, messages d'erreur clairs |
| State wizard | Zustand | Léger, sans Provider, API simple |
| Composants web | shadcn/ui | On possède le code, personnalisable à 100% |
| CSS | Tailwind CSS 4 | Zero config, natif |
| Génération ZIP | JSZip (browser) | Zéro serveur, exactement comme FlutterInit |
| Distribution CLI | npm (npx) | Installation sans friction |
| Monorepo | Bun workspaces + Turborepo | Builds parallèles, partage de code simplifié |
| Export web | Static (`output: 'export'`) | Hébergement gratuit partout, zéro serveur |

---

## 11. Points d'attention pour la suite

**Le schema est la source de vérité absolue.** Toute modification des types de champs, des options de génération, ou des stacks supportés doit partir de `packages/schema`. Jamais redéfinir des types dans le web ou le CLI.

**Les templates `.hbs` sont du PHP commenté.** Ne pas mettre de logique complexe dans les templates — la logique va dans `buildContext()`. Les templates doivent rester lisibles comme du PHP normal.

**L'état `partial` des toggles** est spécifique à la vue "Tous les modèles" de `LaravelStep`. En vue modèle individuel, c'est toujours on/off binaire. Le store doit traiter ça correctement.

**La validation croisée des FK** est déjà implémentée dans `validateForeignKeys()`. Le wizard doit afficher ces erreurs inline, pas juste à la génération.

**Les types de champs avec paramètres** (`string` + length, `decimal` + precision/scale, `enum` + values, `foreignId` + references...) doivent faire apparaître des inputs supplémentaires dans le formulaire d'ajout de champ. La constante `FIELD_TYPES_WITH_PARAMS` du schema dit exactement quels paramètres afficher selon le type.
