import yaml from 'js-yaml';
import type { ProjectConfig } from '@stack-init/schema';
import { isCliStack } from '@stack-init/schema';

export function generateYaml(config: ProjectConfig): void {
  const output: Record<string, unknown> = {
    name: config.name,
    stack: config.stack,
    models: config.models.map((model) => {
      const fields = model.fields.map((f) => {
        const fieldObj: Record<string, unknown> = { name: f.name, type: f.type };
        if (f.nullable)               fieldObj.nullable   = true;
        if (f.unique)                 fieldObj.unique     = true;
        if (f.values?.length)         fieldObj.values     = f.values;
        if (f.references)             fieldObj.references = f.references;
        if (f.length != null)         fieldObj.length     = f.length;
        if (f.precision != null)      fieldObj.precision  = f.precision;
        if (f.scale != null)          fieldObj.scale      = f.scale;
        return fieldObj;
      });

      const modelObj: Record<string, unknown> = { name: model.name };
      if (model.table) modelObj.table = model.table;
      modelObj.fields = fields;

      if (model.relations.length > 0) {
        modelObj.relations = model.relations.map((r) => ({ type: r.type, model: r.model }));
      }

      const migrationObj: Record<string, unknown> = {
        primary_key:  model.migration.primary_key || "id",
        timestamps:   model.migration?.timestamps ?? true,
        softDeletes:  model.migration?.softDeletes ?? false,
      };

      if (model.migration.engine)  migrationObj.engine  = model.migration.engine;
      if (model.migration.charset) migrationObj.charset = model.migration.charset;

      modelObj.migration = migrationObj;

      modelObj.generate = {
        migration:  model.generate.migration,
        controller: model.generate.controller,
        resource:   model.generate.resource,
        request:    model.generate.request,
        factory:    model.generate.factory,
        seeder:     model.generate.seeder,
        policy:     model.generate.policy,
        service:    model.generate.service,
        repository: model.generate.repository,
        tests:      model.generate.tests,
        routes:     model.generate.routes,
        swagger:    model.generate.swagger,
        softDelete: model.generate.softDelete,
      };

      return modelObj;
    }),
  };

  if (isCliStack(config.stack)) {
    output.laravel = {
      pattern:         config.laravel.pattern,
      auth:            config.laravel.auth,
      php_version:     config.laravel.php_version,
      laravel_version: config.laravel.laravel_version,
      db_engine:       config.laravel.db_engine,
    };
  }

  const yamlStr = yaml.dump(output, {
    lineWidth: 120,
    quotingType: '"',
    forceQuotes: false,
    noRefs: true,
  });

  const blob = new Blob([yamlStr], { type: 'text/yaml' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'stack-init.yaml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // Second download: GETTING_STARTED.md
  const today = new Date().toISOString().split('T')[0];
  const modelLines = config.models
    .map((m) => `- \`${m.name}\` — ${m.fields.length} field(s)`)
    .join('\n');

  const gettingStarted = `# ${config.name} — Getting Started

> Généré avec Stack-Init le ${today}

## Ce qui a été généré
- \`stack-init.yaml\` — la config de ton projet

## Prochaines étapes

### 1. Installer le CLI
\`\`\`bash
npm install -g stack-init   # ou npx stack-init
\`\`\`

### 2. Générer les fichiers Laravel
\`\`\`bash
cp stack-init.yaml ./mon-projet-laravel/
cd mon-projet-laravel
npx stack-init generate
\`\`\`

### 3. Lancer les migrations
\`\`\`bash
php artisan migrate
php artisan db:seed          # si les seeders sont activés
\`\`\`

### 4. Démarrer le serveur
\`\`\`bash
php artisan serve            # http://localhost:8000
\`\`\`

## Modèles générés
${modelLines}
`;

  setTimeout(() => {
    const mdBlob = new Blob([gettingStarted], { type: 'text/markdown' });
    const mdUrl  = URL.createObjectURL(mdBlob);
    const mdLink = document.createElement('a');
    mdLink.href     = mdUrl;
    mdLink.download = 'GETTING_STARTED.md';
    document.body.appendChild(mdLink);
    mdLink.click();
    document.body.removeChild(mdLink);
    URL.revokeObjectURL(mdUrl);
  }, 300);
}
