import type { Model, NamedField, Relation } from "@stack-init/schema";

export function generateModelPreview(model: Model): string {
  const fields = model.fields;
  const relations = model.relations;
  
  let code = `<?php\n\nnamespace App\\Models;\n\nuse Illuminate\\Database\\Eloquent\\Model;\n`;
  if (model.migration.softDeletes) {
    code += `use Illuminate\\Database\\Eloquent\\SoftDeletes;\n`;
  }
  code += `\nclass ${model.name} extends Model\n{\n`;
  
  if (model.migration.softDeletes) {
    code += `    use SoftDeletes;\n\n`;
  }

  if (model.table) {
    code += `    protected $table = '${model.table}';\n\n`;
  }

  const fillable = fields.filter(f => f.name !== (model.migration.primary_key || 'id')).map(f => `'${f.name}'`).join(', ');
  code += `    protected $fillable = [\n        ${fillable}\n    ];\n`;

  relations.forEach(rel => {
    code += `\n    public function ${getRelationMethodName(rel)}()\n    {\n`;
    code += `        return $this->${rel.type}(${rel.model}::class);\n    }\n`;
  });

  code += `}`;
  return code;
}

export function generateMigrationPreview(model: Model): string {
  const tableName = model.table || `${model.name.toLowerCase()}s`;
  let code = `Schema::create('${tableName}', function (Blueprint $table) {\n`;
  
  if (model.migration.primary_key === 'id') {
    code += `    $table->id();\n`;
  } else if (model.migration.primary_key === 'uuid') {
    code += `    $table->uuid('id')->primary();\n`;
  } else if (model.migration.primary_key === 'ulid') {
    code += `    $table->ulid('id')->primary();\n`;
  }

  model.fields.forEach(field => {
    if (field.name === (model.migration.primary_key || 'id')) return;
    let line = `    $table->${field.type}('${field.name}')`;
    if (field.nullable) line += '->nullable()';
    if (field.unique) line += '->unique()';
    if (field.references) line += `->constrained('${field.references}')`;
    code += line + ';\n';
  });

  if (model.migration.timestamps) {
    code += `    $table->timestamps();\n`;
  }
  if (model.migration.softDeletes) {
    code += `    $table->softDeletes();\n`;
  }
  
  code += `});`;
  return code;
}

function getRelationMethodName(rel: Relation): string {
    const name = rel.model.toLowerCase();
    return rel.type.includes('Many') ? `${name}s` : name;
}
