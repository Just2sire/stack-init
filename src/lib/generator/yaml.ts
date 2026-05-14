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

      const modelObj: Record<string, unknown> = { name: model.name, fields };

      if (model.relations.length > 0) {
        modelObj.relations = model.relations.map((r) => ({ type: r.type, model: r.model }));
      }

      modelObj.migration = {
        timestamps: model.migration?.timestamps ?? true,
        ...(model.migration?.softDeletes && { softDeletes: true }),
      };

      modelObj.generate = {
        migration:  model.generate.migration,
        controller: model.generate.controller,
        factory:    model.generate.factory,
        seeder:     model.generate.seeder,
        policy:     model.generate.policy,
        routes:     model.generate.routes,
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
}
