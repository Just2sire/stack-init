import yaml from 'js-yaml';
import type { ProjectConfig } from '@stack-init/schema';
import { isCliStack } from '@stack-init/schema';

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
  if (config.nest)    output.nest    = config.nest;
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

  if (isZip) {
    return `# ${config.name} — Getting Started

> Generated with Stack-Init on ${today}

## What was generated
- \`${config.name}.zip\` — the complete project (includes \`stack-init.yaml\`)

## Next steps

### 1. Use the generated project
Unzip \`${config.name}.zip\` and follow the \`README.md\` instructions inside.

### 2. Regenerate with the CLI
The \`stack-init.yaml\` file inside the ZIP lets you regenerate or share the project config.

\`\`\`bash
npx @stack-init/cli generate stack-init.yaml
\`\`\`

## Configured models
${modelLines}

---
Scaffold faster, ship sooner with [Stack-Init](https://stackinit.dev)
`;
  }

  return `# ${config.name} — Getting Started

> Generated with Stack-Init on ${today}

## What was generated
- \`${config.name}.stack-init.yaml\` — the complete project config

## Next steps

### 1. Use the CLI
The CLI transforms this YAML file into a full project (Laravel, NestJS, Express, etc.) with all selected options.

\`\`\`bash
npx @stack-init/cli generate ${config.name}.stack-init.yaml
\`\`\`

## Configured models
${modelLines}

---
Scaffold faster, ship sooner with [Stack-Init](https://stackinit.dev)
`;
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
