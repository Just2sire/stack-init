# stack-init — Ce qu'on a construit et comment ça marche

## C'est quoi le projet en une phrase ?

Tu décris ta base de données dans un fichier YAML → tu lances une commande → tous tes modèles Laravel, migrations, controllers, tests... sont créés automatiquement. Côté React/Next.js, le même wizard génère un ZIP à télécharger directement.

---

## Le problème de départ

À chaque nouveau projet Laravel, tu fais toujours les mêmes choses à la main :
- Créer le modèle
- Écrire la migration avec les bons types
- Créer le controller
- Écrire les règles de validation dans les FormRequest
- Créer la Factory pour les tests
- Écrire les tests Pest
- etc.

C'est répétitif, long, et tu oublies toujours un fichier quelque part.

**stack-init fait tout ça d'un coup, en une commande.**

---

## L'inspiration : FlutterInit

On s'est inspiré de [flutterinit.com](https://flutterinit.com). C'est un site web où tu configures ton projet Flutter visuellement (architecture, state management, librairies...) et ça te génère un ZIP prêt à utiliser, sans installer quoi que ce soit — tout se passe dans le browser.

On reprend exactement la même idée, mais pour plusieurs stacks :
- **Laravel** → impossible à faire dans le browser (PHP ne tourne pas dans un navigateur), donc on génère un fichier `.yaml` + une commande CLI à lancer
- **React / Next.js** → exactement comme FlutterInit, ça marche dans le browser, on génère un ZIP directement

---

## Comment ça marche de bout en bout

### Pour Laravel

```
1. Tu vas sur le site web (wizard)
2. Tu choisis : stack Laravel, tes modèles, les champs de chaque modèle,
   les relations, ce que tu veux générer (migration ? policy ? tests ?)
3. Le site te génère un fichier stack-init.yaml à télécharger
4. Tu mets ce fichier à la racine de ton projet Laravel
5. Tu lances : npx stack-init generate
6. Tous tes fichiers PHP sont créés dans le bon dossier
7. Un Makefile est aussi généré → tu fais juste "make setup" pour tout lancer
```

### Pour React

```
1. Même wizard web
2. Tu choisis : stack React, tes modèles, les pages à générer,
   les librairies (Zustand, React Hook Form, shadcn/ui...)
3. Le site génère directement un ZIP dans ton browser
4. Tu télécharges et tu unzip → projet React prêt
```

---

## L'organisation du code (le monorepo)

Le projet est organisé en **monorepo** — un seul dépôt Git qui contient plusieurs sous-projets qui se parlent entre eux.

```
stack-init/
├── packages/
│   ├── schema/     ← les règles de validation partagées
│   └── cli/        ← la commande npx stack-init
└── apps/
    └── web/        ← le site web avec le wizard (pas encore codé)
```

**Pourquoi un monorepo ?** Parce que le schema (les règles qui définissent ce qu'est un modèle valide, ce qu'est un champ valide...) est utilisé à deux endroits :
- Dans le **web** pour valider ce que l'utilisateur remplit dans le wizard
- Dans le **CLI** pour valider le YAML avant de générer les fichiers

Si on avait deux repos séparés, on dupliquerait ces règles. Avec le monorepo, un seul endroit, les deux l'utilisent.

---

## packages/schema — La source de vérité

C'est le package le plus important du projet. Il définit exactement **ce qui est valide ou non** dans une configuration stack-init.

On utilise **Zod** pour ça. Zod c'est une librairie TypeScript qui permet de décrire la forme d'une donnée et de valider qu'une donnée correspond bien à cette forme.

### Les fichiers du schema

#### `field-types.ts` — Les types de champs

C'est ici qu'on définit tous les types de champs qu'on peut utiliser dans un modèle. Pas `string` en vague — les vrais types Blueprint Laravel :

```
string    → VARCHAR(255) en base
char      → CHAR(n)
text      → TEXT
longText  → LONGTEXT
decimal   → DECIMAL(precision, scale) — pour les prix
enum      → ENUM('admin', 'editor', 'viewer')
foreignId → clé étrangère vers une autre table
timestamp → TIMESTAMP
boolean   → TINYINT(1)
... et 40+ autres types
```

Chaque type a ses propres paramètres. Par exemple :
- `string` accepte un paramètre `length` (défaut : 255)
- `decimal` accepte `precision` et `scale`
- `enum` exige un tableau `values`
- `foreignId` exige `references` (le nom de la table cible)

En TypeScript, ça donne ce qu'on appelle une **union discriminée** — c'est-à-dire que selon la valeur de `type`, TypeScript sait exactement quels autres champs sont disponibles ou obligatoires.

#### `models.schema.ts` — La structure d'un modèle

Un modèle c'est :
- Un **nom** en PascalCase (ex: `BlogPost`) — le schema rejette `blog_post` ou `blogPost`
- Des **champs** avec leur type (utilise les types de `field-types.ts`)
- Des **relations** (hasMany, belongsTo, belongsToMany, morphs...)
- Des **options de migration** (timestamps ? softDelete ? type de clé primaire ?)
- Des **options de génération** — les fameux toggles : est-ce qu'on génère la Policy ? La Factory ? Les Tests ? Le Swagger ?

C'est aussi dans ce fichier qu'on a la fonction `validateForeignKeys` qui vérifie que si tu mets un champ `user_id` de type `foreignId` qui pointe vers `users`, il doit exister un modèle `User` dans ta config. Sinon, erreur claire avant même de générer quoi que ce soit.

#### `laravel.schema.ts` — Les options globales Laravel

Des réglages qui s'appliquent à tout le projet :
- Pattern : `full` (tout générer), `api-only` (sans certains fichiers), `minimal`
- Auth : sanctum, passport, breeze...
- Version PHP : 8.1, 8.2, 8.3
- Version Laravel : 10, 11, 12
- Base de données : mysql, postgres, sqlite
- Runner : génère un Makefile, un script bash, ou les deux

#### `react.schema.ts` — Les options React

Pareil mais pour le côté React :
- Architecture : feature-based, layer-based, minimal
- State management : Zustand, Redux Toolkit, Jotai
- Formulaires : React Hook Form, Formik
- UI : shadcn/ui, MUI, Ant Design
- HTTP : Axios, Ky, fetch natif
- Pages à générer par modèle : liste, détail, création, édition

#### `project.schema.ts` — La config complète

Assemble tout ce qui précède en une config de projet :
```yaml
name: my-blog          ← kebab-case obligatoire
stack: laravel         ← ou react, laravel+react, nextjs...
models: [...]          ← les modèles définis avec models.schema.ts
laravel: {...}         ← options laravel.schema.ts
react: {...}           ← options react.schema.ts
```

Ce fichier fait aussi des **validations croisées** — des choses qu'on ne peut pas valider modèle par modèle :
- Si le stack est `laravel`, la config Laravel est obligatoire
- Si le stack est `react`, la config React est obligatoire
- Les clés étrangères pointent vers des modèles qui existent

La fonction `parseProjectConfig(raw)` prend n'importe quoi en entrée (le contenu du YAML parsé) et retourne soit `{ success: true, data }` soit `{ success: false, errors }` avec des messages lisibles.

#### `index.ts` — Le point d'entrée

Exporte tout ce qui précède en un seul endroit. Toute autre partie du projet fait `import { ... } from '@stack-init/schema'` et jamais depuis les sous-fichiers directement.

### Les tests du schema

On a 21 tests qui vérifient que :
- Un champ `string` valide sans paramètres est valide
- Un champ `enum` sans `values` est rejeté
- Un nom de modèle en snake_case est rejeté
- Un modèle sans champs est rejeté
- Une `foreignId` qui pointe vers un modèle inexistant est détectée
- Les valeurs par défaut sont bien appliquées (ex: `policy: false` par défaut)
- Les 50+ types sont tous parsables

---

## packages/cli — La commande `npx stack-init`

C'est le programme qu'on lance dans le terminal. Il lit le `stack-init.yaml`, le valide, et génère les fichiers PHP.

### Les fichiers du CLI

#### `src/index.ts` — Le point d'entrée

C'est le fichier qui est exécuté quand tu lances `npx stack-init`. Il utilise **Commander.js** pour définir les commandes et leurs options :

```bash
stack-init generate                        # génère tout
stack-init generate --dry-run              # affiche ce qui serait généré sans écrire
stack-init generate --config mon-fichier.yaml  # utilise un autre fichier
stack-init generate --output /mon/projet   # écrit dans un autre dossier
```

#### `src/commands/generate.ts` — La commande principale

Quand tu lances `stack-init generate`, voilà ce qui se passe dans l'ordre :

1. **Lecture du YAML** — on ouvre `stack-init.yaml` avec `js-yaml` qui le convertit en objet JavaScript
2. **Validation Zod** — on passe cet objet dans `parseProjectConfig()`. Si c'est invalide, on affiche les erreurs et on arrête
3. **Génération Laravel** — si le stack inclut Laravel, on instancie `LaravelGenerator` et on appelle `generate(config)`
4. **Écriture des fichiers** — on écrit chaque fichier généré dans le bon dossier
5. **Runner** — si configuré, on génère le Makefile ou le script bash
6. **Résumé** — on affiche la liste des fichiers créés avec ✓

#### `src/utils/naming.ts` — Les conversions de noms

Plein de fonctions utilitaires pour convertir les noms :

```typescript
pascalCase('blog_post')     → 'BlogPost'
camelCase('BlogPost')       → 'blogPost'
snakeCase('BlogPost')       → 'blog_post'
pluralize('Comment')        → 'comments'
modelToTableName('BlogPost') → 'blog_posts'   // nom de table SQL
modelToRouteName('BlogPost') → 'blog-posts'   // URL de l'API
modelToVarName('BlogPost')   → 'blogPost'     // nom de variable PHP
migrationTimestamp()         → '2026_05_14_120000'  // timestamp de migration
```

Ces fonctions sont utilisées partout dans les générateurs pour ne jamais avoir à écrire ces conversions en dur.

#### `src/utils/field-helpers.ts` — Les conversions de champs

Trois fonctions principales, chacune prend un champ (avec son type, ses paramètres...) et retourne quelque chose de spécifique :

**`fieldToMigrationLine(field)`** — génère la ligne de migration PHP :
```
{ type: 'foreignId', name: 'user_id', references: 'users' }
→ "$table->foreignId('user_id')->constrained('users')->cascadeOnDelete();"

{ type: 'decimal', name: 'price', precision: 10, scale: 2 }
→ "$table->decimal('price', 10, 2);"

{ type: 'enum', name: 'role', values: ['admin', 'viewer'] }
→ "$table->enum('role', ['admin', 'viewer']);"
```

**`fieldToCast(field)`** — dit quel cast Eloquent mettre dans `$casts` :
```
boolean   → 'boolean'
decimal   → 'decimal:2'
timestamp → 'timestamp'
json      → 'array'
```

**`fieldToValidationRule(field)`** — génère les règles Laravel Request :
```
{ type: 'string', nullable: false }   → ['required', 'string', 'max:255']
{ type: 'foreignId', references: 'users' } → ['required', 'exists:users,id']
{ type: 'enum', values: ['a','b'] }   → ['required', 'in:a,b']
```

**`fieldToFaker(field)`** — génère la valeur Faker pour la Factory. C'est intelligent : il regarde d'abord le **nom** du champ avant de regarder le type. Donc `email` donne `fake()->unique()->safeEmail()` même si le type est `string`, et `body` donne `fake()->paragraphs(3, true)` même si le type est `text`.

#### `src/generators/laravel/handlebars.ts` — Configuration de Handlebars

**Handlebars** c'est un moteur de templates. On écrit des fichiers `.hbs` qui ressemblent à du PHP mais avec des variables entre `{{ }}`. Le moteur remplace ces variables par les vraies valeurs.

Ce fichier configure des **helpers** Handlebars — des fonctions qu'on peut appeler dans les templates :
- `{{eq a b}}` — teste si a === b
- `{{camelCase "BlogPost"}}` → `blogPost`
- `{{camelCasePlural "Comment"}}` → `comments`
- `{{migrationLine field}}` — appelle `fieldToMigrationLine()` et insère le résultat

#### `src/generators/laravel/index.ts` — Le générateur principal

C'est le chef d'orchestre. La classe `LaravelGenerator` a deux méthodes importantes :

**`generate(config)`** — boucle sur chaque modèle et appelle `generateModel()` pour chacun.

**`generateModel(model, config, index)`** — pour un modèle donné, vérifie les toggles et construit la liste des fichiers à créer :
```
migration activé ?     → database/migrations/xxxx_create_posts_table.php
resource activé ?      → app/Http/Resources/PostResource.php
request activé ?       → app/Http/Requests/StorePostRequest.php
                       → app/Http/Requests/UpdatePostRequest.php
policy activé ?        → app/Policies/PostPolicy.php
factory activé ?       → database/factories/PostFactory.php
tests activé ?         → tests/Feature/PostTest.php
```

**`buildContext(model, config)`** — prépare toutes les données dont les templates ont besoin. C'est là qu'on calcule :
- `fillable` : les champs qu'Eloquent peut mass-assigner (en excluant `id`, `rememberToken`...)
- `casts` : le tableau `$casts` avec les bons types
- `hiddenFields` : `password`, `token`... à cacher dans les réponses JSON
- `validationRules` : les règles pour StoreRequest et UpdateRequest (pour Update, on ajoute `sometimes` devant chaque règle)
- `fakerFields` : les valeurs Faker pour la Factory
- `resourceFields` : les champs à exposer dans la Resource (on exclut les foreignId, on préfère exposer les relations)

**`render(templatePath, context)`** — lit le fichier `.hbs`, compile le template, le rend avec le contexte. Les templates compilés sont mis en cache pour ne pas relire le disque à chaque modèle.

#### `src/generators/runner/makefile.ts` — Le Makefile final

Génère le fichier `Makefile` ou `run.sh` qu'on lance après la génération pour initialiser la base de données. Par exemple :

```makefile
setup: install migrate seed
install:
    composer install --no-interaction
    cp .env.example .env
    php artisan key:generate
migrate:
    php artisan migrate --force
seed:
    php artisan db:seed
test:
    ./vendor/bin/pest
```

### Les templates Handlebars

Ce sont des fichiers `.php.hbs` — du PHP avec des variables Handlebars. Le moteur les remplit avec le contexte buildé par `buildContext()`.

**`templates/laravel/base/Model.php.hbs`** — le modèle Eloquent. Génère :
- `use HasFactory` si factory activé
- `use SoftDeletes` si softDelete activé
- `$fillable` avec les bons champs
- `$casts` si nécessaire
- `$hidden` pour password/token
- Les méthodes de relation (`hasMany`, `belongsTo`...)

**`templates/laravel/overlays/migration/migration.php.hbs`** — la migration. Utilise le helper `{{migrationLine field}}` pour chaque champ → appelle `fieldToMigrationLine()`.

**`templates/laravel/overlays/request/StoreRequest.php.hbs`** — le FormRequest avec les règles de validation auto-générées.

**`templates/laravel/overlays/factory/Factory.php.hbs`** — la Factory avec les valeurs Faker.

**`templates/laravel/overlays/tests/Test.php.hbs`** — les tests Pest avec les 5 scénarios : index, show, store (valide + invalide), update, destroy. Gère le soft delete si activé.

---

## Le fichier stack-init.yaml — Ce que l'utilisateur écrit

C'est la seule chose que l'utilisateur doit fournir. Voici l'exemple qu'on a utilisé pour tester :

```yaml
name: my-blog
stack: laravel

models:
  - name: User
    fields:
      - { name: name,              type: string }
      - { name: email,             type: string, unique: true }
      - { name: role,              type: enum, values: [admin, editor, viewer] }
      - { name: email_verified_at, type: timestamp, nullable: true }
    relations:
      - { type: hasMany, model: Post }
      - { type: hasMany, model: Comment }
    generate:
      migration: true
      policy: true      ← activé uniquement sur User
      factory: true
      tests: true

  - name: Post
    fields:
      - { name: title,        type: string }
      - { name: body,         type: longText }
      - { name: published_at, type: timestamp, nullable: true }
      - { name: user_id,      type: foreignId, references: users }
    migration:
      softDeletes: true   ← deleted_at sur la table posts
    generate:
      migration: true
      policy: false     ← désactivé sur Post
      tests: true

laravel:
  auth: sanctum
  runner: makefile
  db_engine: mysql
```

---

## Ce que génère concrètement la commande

Pour ce YAML avec 3 modèles, `npx stack-init generate` crée **25 fichiers** :

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

app/Policies/UserPolicy.php               ← uniquement User

database/factories/UserFactory.php
database/factories/PostFactory.php
database/factories/CommentFactory.php

tests/Feature/UserTest.php
tests/Feature/PostTest.php

Makefile
```

Exemple de migration générée pour Post :
```php
Schema::create('posts', function (Blueprint $table) {
    $table->id();
    $table->string('title');
    $table->longText('body');
    $table->timestamp('published_at')->nullable();
    $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
    $table->timestamps();
    $table->softDeletes();
});
```

Exemple de règles de validation générées pour StorePostRequest :
```php
return [
    'title'        => ['required', 'string', 'max:255'],
    'body'         => ['required', 'string'],
    'published_at' => ['nullable', 'date'],
    'user_id'      => ['required', 'exists:users,id'],
];
```

---

## Les technologies utilisées et pourquoi

| Techno | Où | Pourquoi |
|---|---|---|
| **TypeScript** | partout | Typage fort, autocomplétion, erreurs à la compilation |
| **Zod** | packages/schema | Validation de données + inférence de types TypeScript automatique |
| **Handlebars.js** | packages/cli | Moteur de templates — sépare la logique des templates PHP |
| **Commander.js** | packages/cli | Parse les arguments de la commande CLI |
| **js-yaml** | packages/cli | Lit le fichier stack-init.yaml |
| **picocolors** | packages/cli | Affichage coloré dans le terminal (✓ en vert, erreurs en rouge) |
| **Vitest** | packages/schema | Tests unitaires (21 tests) |

---

## Ce qui reste à faire

On a posé les fondations. Ce qui n'est pas encore codé :

**1. apps/web — Le wizard**
Le site web avec le wizard visuel (Next.js, Zustand, shadcn/ui). C'est lui qui permet de configurer son projet sans écrire le YAML à la main, et qui génère le ZIP React côté browser.

**2. Générateur React (ZIP)**
La logique côté browser qui prend la config React et génère un ZIP avec les composants, les pages, la config des librairies choisies — exactement comme FlutterInit.

**3. Commande `stack-init add model`**
Permettre d'ajouter un seul modèle à un projet existant, sans tout regénérer.

**4. Routes Laravel**
Générer ou mettre à jour `routes/api.php` avec les routes de chaque modèle.

**5. Autres stacks**
Django, NestJS, Rails... — même logique, templates différents.

---

## Pour reprendre le projet

```bash
# Cloner et installer
git clone ...
cd stack-init
npm install    # ou bun install

# Compiler le schema
cd packages/schema && npx tsc

# Compiler le CLI
cd ../cli && npx tsc -b

# Tester avec un vrai projet
echo "name: my-blog
stack: laravel
models:
  - name: Post
    fields:
      - { name: title, type: string }
      - { name: body,  type: text }
laravel:
  runner: makefile" > stack-init.yaml

node packages/cli/dist/index.js generate --dry-run

# Lancer les tests du schema
cd packages/schema && npx vitest run
```
