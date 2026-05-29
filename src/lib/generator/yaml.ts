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
    return `# ${config.name} — Getting Started

> Generated with Stack-Init on ${today}

## What was generated
- \`${config.name}.stack-init.yaml\` — the complete project config

## Next steps

### 1. Use the CLI
The CLI transforms this YAML file into a full project (Laravel, NestJS, Express, etc.) with all selected options.

\`\`\`bash
npx stack-init-cli generate --config ${config.name}.stack-init.yaml
\`\`\`

## Configured models
${modelLines}

---
Scaffold faster, ship sooner with [Stack-Init](https://stackinit.dev)
`;
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

  // Installation
  lines.push('## Installation');
  lines.push('');
  lines.push('### Option A — script (recommended)');
  lines.push('');
  lines.push('```bash');
  lines.push('bash setup.sh        # Linux / macOS / WSL');
  lines.push('.\\setup.ps1         # Windows PowerShell');
  lines.push('setup.bat            # Windows CMD');
  lines.push('```');
  lines.push('');
  lines.push('### Option B — step by step');
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
  }
  if (stack.includes('fastapi')) {
    const dir = mixed ? 'backend/' : '';
    lines.push('```bash');
    if (dir) lines.push(`cd ${dir}`);
    lines.push('pip install -r requirements.txt');
    lines.push('# Copy .env.example → .env and set DATABASE_URL');
    if (dir) lines.push('cd ..');
    lines.push('```');
    lines.push('');
  }
  if (stack.includes('express') || stack.includes('nestjs')) {
    const dir = mixed ? 'backend/' : '';
    lines.push('```bash');
    if (dir) lines.push(`cd ${dir}`);
    lines.push('npm install');
    lines.push('# Copy .env.example → .env and set DATABASE_URL / PORT');
    if (dir) lines.push('cd ..');
    lines.push('```');
    lines.push('');
  }
  if (mixed && (stack.includes('react') || stack.includes('nextjs'))) {
    lines.push('```bash');
    lines.push('cd frontend');
    lines.push('npm install');
    lines.push('# Copy .env.example → .env.local and set NEXT_PUBLIC_API_URL if needed');
    lines.push('cd ..');
    lines.push('```');
    lines.push('');
  }
  if (!mixed && (stack === 'nextjs' || stack === 'react')) {
    lines.push('```bash');
    lines.push('npm install');
    lines.push('# Copy .env.example → .env.local');
    lines.push('```');
    lines.push('');
  }

  // Run
  lines.push('## Run the project');
  lines.push('');
  if (mixed) {
    lines.push('```bash');
    lines.push('bash dev.sh        # Linux / macOS / WSL — starts backend + frontend');
    lines.push('.\\dev.ps1         # Windows PowerShell');
    lines.push('```');
    lines.push('');
    lines.push('Or manually:');
    lines.push('');
    lines.push('```bash');
    if (stack.includes('laravel')) {
      lines.push('php artisan serve         # → http://localhost:8000');
    } else if (stack.includes('fastapi')) {
      lines.push('cd backend && uvicorn main:app --reload   # → http://localhost:8000');
    } else {
      lines.push('cd backend && npm run dev  # → http://localhost:3000');
    }
    lines.push('cd frontend && npm run dev  # → http://localhost:5173');
    lines.push('```');
  } else if (stack.includes('laravel')) {
    lines.push('```bash');
    lines.push('php artisan serve');
    lines.push('```');
    lines.push('');
    lines.push('→ http://localhost:8000/api');
  } else if (stack.includes('fastapi')) {
    lines.push('```bash');
    lines.push('uvicorn main:app --reload');
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
  if (mixed && (stack.includes('react') || stack.includes('nextjs'))) {
    lines.push('| `NEXT_PUBLIC_API_URL` | Backend API URL |');
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
