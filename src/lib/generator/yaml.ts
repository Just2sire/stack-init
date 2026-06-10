import yaml from 'js-yaml';
import type { ProjectConfig } from '@stack-init/schema';
import { isCliStack, isMixedStack } from '@stack-init/schema';

export function buildYamlContent(config: ProjectConfig): string {
  const output: Record<string, unknown> = {
    name: config.name,
    stack: config.stack,
    generated_at: new Date().toISOString(),
    ...(config.nextjsUsage && { nextjsUsage: config.nextjsUsage }),
    models: config.models.map((model) => {
      const fields = model.fields.map((f: any) => {
        const fieldObj: Record<string, unknown> = {
          name: f.name,
          type: f.type,
        };

        if (f.nullable)              fieldObj.nullable    = true;
        if (f.unique)                fieldObj.unique      = true;
        if (f.index)                 fieldObj.index       = true;
        if (f.default !== undefined) fieldObj.default     = f.default;
        if (f.comment)               fieldObj.comment     = f.comment;
        if (f.unsigned)              fieldObj.unsigned    = true;
        if (f.constrained === false) fieldObj.constrained = false;

        if (f.values?.length)        fieldObj.values      = f.values;
        if (f.references)            fieldObj.references  = f.references;
        if (f.length != null)        fieldObj.length      = f.length;
        if (f.precision != null)     fieldObj.precision   = f.precision;
        if (f.scale != null)         fieldObj.scale       = f.scale;
        if (f.dimensions != null)    fieldObj.dimensions  = f.dimensions;
        if (f.on_delete)             fieldObj.on_delete   = f.on_delete;
        if (f.on_update)             fieldObj.on_update   = f.on_update;

        return fieldObj;
      });

      const modelObj: Record<string, unknown> = {
        name: model.name,
        table: model.table,
        fields: fields,
        relations: model.relations.map(r => {
          const rel: Record<string, unknown> = {
            type: r.type,
            model: r.model,
          };
          if (r.name)         rel.name         = r.name;
          if (r.foreign_key)  rel.foreign_key  = r.foreign_key;
          if (r.local_key)    rel.local_key    = r.local_key;
          if (r.pivot_table)  rel.pivot_table  = r.pivot_table;
          if (r.through)      rel.through      = r.through;
          if (r.with_trashed) rel.with_trashed = r.with_trashed;
          return rel;
        }),
        migration: {
          primary_key:    model.migration?.primary_key || 'id',
          timestamps:     model.migration?.timestamps ?? true,
          softDeletes:    model.migration?.softDeletes ?? false,
          ...(model.migration?.timestampsTz  && { timestampsTz:  true }),
          ...(model.migration?.softDeletesTz && { softDeletesTz: true }),
          ...(model.migration?.engine        && { engine:        model.migration.engine }),
          ...(model.migration?.charset       && { charset:       model.migration.charset }),
          ...(model.migration?.collation     && { collation:     model.migration.collation }),
        },
        generate: model.generate,
      };

      return modelObj;
    }),
  };

  if ((config as any).services?.length) output.services = (config as any).services;
  if (config.laravel) output.laravel = config.laravel;
  if (config.react)   output.react   = config.react;
  if (config.express) output.express = config.express;
  if (config.nestjs)  output.nestjs  = config.nestjs;
  if (config.fastapi) output.fastapi = config.fastapi;

  return yaml.dump(output, {
    lineWidth: 120,
    quotingType: '"',
    forceQuotes: false,
    noRefs: true,
  });
}

export function buildGettingStarted(config: ProjectConfig, isZip: boolean): string {
  const today = new Date().toISOString().split('T')[0];
  const modelLines = config.models
    .map((m) => `- \`${m.name}\` — ${m.fields.length} field(s)`)
    .join('\n');

  if (!isZip) {
    // ── Non-ZIP path (Laravel CLI-only stacks) — descriptive step-by-step guide ──
    const laravel  = config.laravel as any;
    const dbEngine = laravel?.db_engine  ?? 'mysql';
    const auth     = laravel?.auth       ?? 'none';
    const pattern  = laravel?.pattern    ?? 'api-only';
    const plugins: string[] = laravel?.laravel_plugins ?? [];

    const dbConnection = dbEngine === 'postgresql' ? 'pgsql' : dbEngine === 'sqlite' ? 'sqlite' : 'mysql';
    const dbLabel      = dbEngine === 'postgresql' ? 'PostgreSQL' : dbEngine === 'sqlite' ? 'SQLite' : 'MySQL';

    // Per-model generated artefacts summary
    const generatedLines = config.models.map((m: any) => {
      const g = m.generate ?? {};
      const parts: string[] = ['Modèle'];
      if (g.migration)   parts.push('Migration');
      if (g.controller)  parts.push('Contrôleur');
      if (g.resource)    parts.push('Resource');
      if (g.request)     parts.push('Requests');
      if (g.policy)      parts.push('Policy');
      if (g.factory)     parts.push('Factory');
      if (g.seeder)      parts.push('Seeder');
      if (g.service)     parts.push('Service');
      if (g.repository)  parts.push('Repository');
      if (g.tests)       parts.push('Tests');
      if (g.observer)    parts.push('Observer');
      if (g.events)      parts.push('Events/Listeners');
      if (g.actions)     parts.push('Actions');
      return `- \`${m.name}\` → ${parts.join(', ')}`;
    }).join('\n');

    const lines: string[] = [];

    lines.push(`# ${config.name} — Getting Started`);
    lines.push('');
    lines.push(`> Généré avec Stack-Init le ${today}`);
    lines.push('');

    // ── What was downloaded ──────────────────────────────────────────────────
    lines.push('## Fichiers téléchargés');
    lines.push('');
    lines.push(`- \`${config.name}.stack-init.yaml\` — configuration complète du projet (YAML)`);
    lines.push('- `GETTING_STARTED.md` — ce guide pas-à-pas');
    lines.push('');
    lines.push('> Le fichier YAML est la source de vérité : il contient tous vos modèles, champs, relations et options.');
    lines.push('> Le CLI `stack-init-cli` le lit et génère l\'intégralité du code PHP.');
    lines.push('');

    // ── Prerequisites ────────────────────────────────────────────────────────
    lines.push('## Prérequis');
    lines.push('');
    lines.push('| Outil | Version minimale | Vérification |');
    lines.push('|---|---|---|');
    lines.push('| PHP | 8.4+ | `php -v` |');
    lines.push('| Composer | 2+ | `composer --version` |');
    lines.push('| Node.js | 18+ (pour le CLI) | `node -v` |');
    lines.push(`| ${dbLabel} | dernière stable | service actif |`);
    lines.push('');

    // ── Step 1: Create Laravel project ───────────────────────────────────────
    lines.push('## Étape 1 — Créer un projet Laravel');
    lines.push('');
    lines.push('Si vous n\'avez pas encore de projet Laravel, créez-en un maintenant :');
    lines.push('');
    lines.push('```bash');
    lines.push(`composer create-project laravel/laravel ${config.name}`);
    lines.push(`cd ${config.name}`);
    lines.push('```');
    lines.push('');
    lines.push('> Si vous avez déjà un projet existant, passez directement à l\'étape 2.');
    lines.push('');

    // ── Step 2: Place the YAML ───────────────────────────────────────────────
    lines.push('## Étape 2 — Placer le fichier de configuration');
    lines.push('');
    lines.push(`Copiez \`${config.name}.stack-init.yaml\` dans la **racine de votre projet Laravel**,`);
    lines.push('c\'est-à-dire le dossier qui contient le fichier `artisan` :');
    lines.push('');
    lines.push('```');
    lines.push(`${config.name}/`);
    lines.push('├── artisan              ← racine du projet Laravel');
    lines.push(`├── ${config.name}.stack-init.yaml  ← placer ici  ✓`);
    lines.push('├── app/');
    lines.push('├── routes/');
    lines.push('└── ...');
    lines.push('```');
    lines.push('');

    // ── Step 3: Run the CLI ──────────────────────────────────────────────────
    lines.push('## Étape 3 — Lancer le générateur stack-init');
    lines.push('');
    lines.push('Depuis la racine du projet Laravel (là où se trouve `artisan`) :');
    lines.push('');
    lines.push('```bash');
    lines.push('npm install -g stack-init-cli');
    lines.push(`stack-init generate --config ${config.name}.stack-init.yaml`);
    lines.push('```');
    lines.push('');
    lines.push('> Le CLI détecte automatiquement la présence de `artisan` et utilise');
    lines.push('> `php artisan make:*` pour créer certains fichiers selon les conventions Laravel.');
    lines.push('');

    // ── Step 4: Environment ──────────────────────────────────────────────────
    lines.push('## Étape 4 — Configurer l\'environnement');
    lines.push('');
    lines.push('```bash');
    lines.push('cp .env.example .env');
    lines.push('```');
    lines.push('');
    lines.push('Éditez `.env` avec vos paramètres :');
    lines.push('');
    lines.push('```env');
    lines.push(`DB_CONNECTION=${dbConnection}`);
    if (dbEngine === 'sqlite') {
      lines.push('DB_DATABASE=database/database.sqlite');
    } else {
      lines.push('DB_HOST=127.0.0.1');
      lines.push(`DB_PORT=${dbEngine === 'postgresql' ? '5432' : '3306'}`);
      lines.push(`DB_DATABASE=${config.name.replace(/-/g, '_')}`);
      lines.push('DB_USERNAME=root');
      lines.push('DB_PASSWORD=');
    }
    lines.push('APP_URL=http://localhost:8000');
    lines.push('```');
    lines.push('');
    if (dbEngine === 'sqlite') {
      lines.push('Créer le fichier SQLite :');
      lines.push('```bash');
      lines.push('touch database/database.sqlite');
      lines.push('```');
      lines.push('');
    }

    // ── Step 5: Install PHP deps ─────────────────────────────────────────────
    lines.push('## Étape 5 — Installer les dépendances PHP');
    lines.push('');
    lines.push('```bash');
    lines.push('composer install');
    lines.push('```');
    lines.push('');

    // Auth-specific composer packages
    if (auth === 'passport') {
      lines.push('**Authentification — Laravel Passport :**');
      lines.push('```bash');
      lines.push('composer require laravel/passport');
      lines.push('```');
      lines.push('');
    } else if (auth === 'breeze') {
      lines.push('**Authentification — Laravel Breeze :**');
      lines.push('```bash');
      lines.push('composer require laravel/breeze');
      lines.push('php artisan breeze:install api');
      lines.push('```');
      lines.push('');
    } else if (auth === 'jetstream') {
      lines.push('**Authentification — Laravel Jetstream :**');
      lines.push('```bash');
      lines.push('composer require laravel/jetstream');
      lines.push('php artisan jetstream:install inertia');
      lines.push('```');
      lines.push('');
    }

    // Plugin-specific packages
    const pluginLines: string[] = [];
    if (plugins.includes('socialite'))          pluginLines.push('composer require laravel/socialite');
    if (plugins.includes('spatie-permissions')) pluginLines.push('composer require spatie/laravel-permission');
    if (plugins.includes('spatie-media'))       pluginLines.push('composer require spatie/laravel-medialibrary');
    if (plugins.includes('spatie-activity'))    pluginLines.push('composer require spatie/laravel-activitylog');
    if (plugins.includes('horizon'))            pluginLines.push('composer require laravel/horizon && php artisan horizon:install');
    if (plugins.includes('2fa'))                pluginLines.push('composer require pragmarx/google2fa-laravel');
    if (pluginLines.length > 0) {
      lines.push('**Packages plugins :**');
      lines.push('```bash');
      pluginLines.forEach(l => lines.push(l));
      lines.push('```');
      lines.push('');
    }

    // ── Step 6: Database init ────────────────────────────────────────────────
    lines.push('## Étape 6 — Initialiser la base de données');
    lines.push('');
    lines.push('```bash');
    lines.push('php artisan key:generate');
    if (auth === 'passport') {
      lines.push('php artisan migrate --force');
      lines.push('php artisan passport:install');
    } else {
      lines.push('php artisan migrate --force');
    }
    lines.push('php artisan db:seed');
    lines.push('```');
    lines.push('');

    // ── Step 7: Serve ────────────────────────────────────────────────────────
    lines.push('## Étape 7 — Lancer le serveur');
    lines.push('');
    lines.push('```bash');
    lines.push('php artisan serve');
    lines.push('```');
    lines.push('');
    lines.push('→ **http://localhost:8000/api**');
    lines.push('');

    // ── Generated artefacts ──────────────────────────────────────────────────
    lines.push('## Ce qui sera généré');
    lines.push('');
    if (pattern === 'minimal') {
      lines.push('> Pattern **minimal** : les routes sont des closures inline dans `routes/api.php` (pas de contrôleurs séparés).');
      lines.push('');
    } else if (pattern === 'full') {
      lines.push('> Pattern **full** : contrôleurs API + vues Blade incluses.');
      lines.push('');
    }
    lines.push(generatedLines);
    lines.push('');

    // ── Key env vars table ───────────────────────────────────────────────────
    lines.push('## Variables d\'environnement clés');
    lines.push('');
    lines.push('| Variable | Description |');
    lines.push('|---|---|');
    lines.push(`| \`DB_CONNECTION\` | \`${dbConnection}\` |`);
    lines.push(`| \`DB_DATABASE\` | Nom de la base de données |`);
    lines.push('| `APP_URL` | URL de l\'application |');
    if (auth !== 'none' && auth !== 'breeze' && auth !== 'jetstream') {
      lines.push('| `SANCTUM_STATEFUL_DOMAINS` | `localhost` en dev |');
    }
    if (auth === 'passport') {
      lines.push('| `PASSPORT_CLIENT_ID` | ID du client OAuth (après `passport:install`) |');
      lines.push('| `PASSPORT_CLIENT_SECRET` | Secret du client OAuth |');
    }
    lines.push('');

    // ── Useful commands ──────────────────────────────────────────────────────
    lines.push('## Commandes Artisan utiles');
    lines.push('');
    lines.push('```bash');
    lines.push('php artisan route:list               # lister toutes les routes API');
    lines.push('php artisan app:pattern              # ajouter un modèle post-scaffold (interactif)');
    lines.push('php artisan migrate:fresh --seed     # réinitialiser la base de données');
    lines.push('php artisan optimize:clear           # vider tous les caches');
    if (plugins.includes('horizon')) {
      lines.push('php artisan horizon                  # lancer Horizon (file de jobs)');
    }
    lines.push('```');
    lines.push('');

    // ── Models ───────────────────────────────────────────────────────────────
    lines.push('## Modèles configurés');
    lines.push('');
    lines.push(modelLines);
    lines.push('');

    lines.push('---');
    lines.push('Scaffold faster, ship sooner avec [Stack-Init](https://stackinit.dev)');
    lines.push('');

    return lines.join('\n');
  }

  // ── isZip=true — comprehensive guide included inside the ZIP ──────────────
  const stack = config.stack as string;
  const mixed = isMixedStack(config.stack);
  const lines: string[] = [];

  lines.push(`# Getting Started — ${config.name}`);
  lines.push('');
  lines.push(`> Generated with Stack-Init on ${today}`);
  lines.push('');

  // Prerequisites
  lines.push('## Prerequisites');
  lines.push('');
  if (stack.includes('laravel')) {
    lines.push('- **PHP** 8.4+  →  `php -v`');
    lines.push('- **Composer** 2+  →  `composer --version`');
    lines.push('- **MySQL / PostgreSQL / SQLite** (per your `.env`)');
  }
  if (stack.includes('fastapi')) {
    lines.push('- **Python** 3.12+  →  `python --version`');
    lines.push('- **pip** or **Poetry**');
  }
  if (stack.includes('express') || stack.includes('nestjs') || stack.includes('nextjs') || stack.includes('react')) {
    lines.push('- **Node.js** 22 LTS  →  `node -v`');
    lines.push('- **npm** 10+  →  `npm -v`');
  }
  lines.push('');

  if (mixed) {
    // ── Mixed stack: dev.sh covers install + start ─────────────────────────
    lines.push('## Quick start');
    lines.push('');
    lines.push('The included `dev.sh` / `dev.bat` script handles **everything**:');
    lines.push('it installs dependencies on first run, then starts backend and frontend in parallel.');
    lines.push('');
    lines.push('```bash');
    lines.push('bash dev.sh        # Linux / macOS / WSL');
    lines.push('dev.bat            # Windows CMD');
    lines.push('```');
    lines.push('');
    lines.push('> `dev.sh` checks whether dependencies are installed and runs the install step automatically if needed.');
    lines.push('> You only need to configure your `.env` files before the first run (see **Key environment variables** below).');
    lines.push('');
    lines.push('### Or manually');
    lines.push('');
    lines.push('#### Install dependencies');
    lines.push('');
    lines.push('```bash');
    if (stack.includes('fastapi')) {
      lines.push('cd backend && pip install -r requirements.txt && cd ..');
    } else if (stack.includes('laravel')) {
      lines.push('composer install --no-interaction');
    } else {
      lines.push('cd backend && npm install && cd ..');
    }
    lines.push('cd frontend && npm install && cd ..');
    lines.push('```');
    lines.push('');
    lines.push('#### Run the project');
    lines.push('');
    lines.push('```bash');
    if (stack.includes('laravel')) {
      lines.push('php artisan serve                              # → http://localhost:8000');
    } else if (stack.includes('fastapi')) {
      lines.push('cd backend && uvicorn app.main:app --reload    # → http://localhost:8000');
    } else {
      lines.push('cd backend && npm run dev                      # → http://localhost:3000');
    }
    lines.push('cd frontend && npm run dev                       # → http://localhost:5173');
    lines.push('```');
    lines.push('');
  } else {
    // ── Single stack: no setup.sh in ZIP — show manual steps only ──────────
    lines.push('## Installation');
    lines.push('');

    if (stack.includes('laravel')) {
      lines.push('```bash');
      lines.push('composer install --no-interaction');
      lines.push('cp .env.example .env');
      lines.push('# Edit .env: DB_DATABASE, DB_USERNAME, DB_PASSWORD, APP_URL');
      lines.push('php artisan key:generate');
      lines.push('php artisan migrate --force');
      lines.push('php artisan db:seed');
      lines.push('```');
      lines.push('');
    } else if (stack.includes('fastapi')) {
      lines.push('```bash');
      lines.push('pip install -r requirements.txt');
      lines.push('# Copy .env.example → .env and set DATABASE_URL');
      lines.push('```');
      lines.push('');
    } else if (stack.includes('express') || stack.includes('nestjs')) {
      lines.push('```bash');
      lines.push('npm install');
      lines.push('# Copy .env.example → .env and set DATABASE_URL / PORT');
      lines.push('```');
      lines.push('');
    } else if (stack === 'nextjs' || stack === 'react') {
      lines.push('```bash');
      lines.push('npm install');
      lines.push('# Copy .env.example → .env.local');
      lines.push('```');
      lines.push('');
    }

    lines.push('## Run the project');
    lines.push('');
    if (stack.includes('laravel')) {
      lines.push('```bash');
      lines.push('php artisan serve');
      lines.push('```');
      lines.push('');
      lines.push('→ http://localhost:8000/api');
    } else if (stack.includes('fastapi')) {
      lines.push('```bash');
      lines.push('uvicorn app.main:app --reload');
      lines.push('```');
      lines.push('');
      lines.push('→ http://localhost:8000/docs (Swagger UI)');
    } else if (stack.includes('express') || stack.includes('nestjs')) {
      lines.push('```bash');
      lines.push('npm run dev');
      lines.push('```');
      lines.push('');
      lines.push('→ http://localhost:3000');
    } else if (stack.includes('nextjs') || stack.includes('react')) {
      lines.push('```bash');
      lines.push('npm run dev');
      lines.push('```');
      lines.push('');
      lines.push('→ http://localhost:3000');
    }
    lines.push('');
  }

  // Env vars
  lines.push('## Key environment variables');
  lines.push('');
  lines.push('| Variable | Description |');
  lines.push('|---|---|');
  if (stack.includes('laravel')) {
    lines.push('| `DB_CONNECTION` | mysql / pgsql / sqlite |');
    lines.push('| `DB_HOST` | Database host |');
    lines.push('| `DB_DATABASE` | Database name |');
    lines.push('| `DB_USERNAME` | Database user |');
    lines.push('| `DB_PASSWORD` | Database password |');
    lines.push('| `APP_URL` | Application URL |');
  }
  if (stack.includes('fastapi') || stack.includes('express') || stack.includes('nestjs')) {
    lines.push('| `DATABASE_URL` | Database connection URL |');
    lines.push('| `PORT` | Listening port (default: 3000 / 8000) |');
    lines.push('| `JWT_SECRET` | JWT secret key (if auth enabled) |');
  }
  if (mixed && stack.includes('nextjs')) {
    lines.push('| `NEXT_PUBLIC_API_URL` | Backend API URL |');
  } else if (mixed && stack.includes('react')) {
    lines.push('| `REACT_APP_API_URL` | Backend API URL |');
  }
  lines.push('');

  // Models
  lines.push('## Configured models');
  lines.push('');
  lines.push(modelLines);
  lines.push('');

  // Regenerate
  lines.push('## Regenerate with the CLI');
  lines.push('');
  lines.push('The `stack-init.yaml` included in the ZIP lets you regenerate or share the config:');
  lines.push('');
  lines.push('```bash');
  lines.push('npx stack-init-cli generate');
  lines.push('```');
  lines.push('');
  lines.push('---');
  lines.push('Scaffold faster, ship sooner with [Stack-Init](https://stackinit.dev)');
  lines.push('');

  return lines.join('\n');
}

function downloadBlob(content: string, mimeType: string, filename: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Only used for CLI-only stacks (Laravel) that have no ZIP
export function generateYaml(config: ProjectConfig): void {
  downloadBlob(buildYamlContent(config), 'text/yaml', `${config.name}.stack-init.yaml`);

  setTimeout(() => {
    downloadBlob(buildGettingStarted(config, false), 'text/markdown', 'GETTING_STARTED.md');
  }, 300);
}
