import type { Model, NamedField, Relation } from '@stack-init/schema';

const DEFAULT_GENERATE = {
  migration: true, controller: true, resource: true, request: true,
  seeder: false, factory: true, policy: false, service: false,
  tests: true, routes: true, swagger: false, softDelete: false, repository: false,
};

// ── Singularization + PascalCase ─────────────────────────────────────────────

function singularize(word: string): string {
  const w = word.toLowerCase();
  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';
  if (w.endsWith('sses')) return w.slice(0, -2);
  if (w.endsWith('ses') || w.endsWith('xes') || w.endsWith('ches') || w.endsWith('shes')) return w.slice(0, -2);
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 2) return w.slice(0, -1);
  return w;
}

function toPascalCase(name: string): string {
  return name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}

function tableToModelName(tableName: string): string {
  return toPascalCase(singularize(tableName.toLowerCase()));
}

// ── Bracket extraction (handles nested parens) ────────────────────────────────

function extractBracketContent(s: string, openPos: number): string | null {
  let depth = 0;
  let start = -1;
  for (let i = openPos; i < s.length; i++) {
    if (s[i] === '(') {
      depth++;
      if (depth === 1) start = i + 1;
    } else if (s[i] === ')') {
      depth--;
      if (depth === 0) return s.slice(start, i);
    }
  }
  return null;
}

// ── Split comma-separated column defs (respects nested parens) ───────────────

function splitColumns(body: string): string[] {
  const cols: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of body) {
    if (char === '(') depth++;
    else if (char === ')') depth--;
    else if (char === ',' && depth === 0) {
      if (current.trim()) cols.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  if (current.trim()) cols.push(current.trim());
  return cols;
}

// ── SQL type → NamedField type mapping ───────────────────────────────────────

interface TypeInfo {
  type: string;
  values?: string[];
  length?: number;
  precision?: number;
  scale?: number;
}

function mapSqlType(sqlType: string, enumTypes: Record<string, string[]>): TypeInfo {
  // Strip params and array suffix for matching, but keep them for extraction
  const paramMatch = sqlType.match(/\((\d+)(?:,\s*(\d+))?\)/);
  const length = paramMatch ? parseInt(paramMatch[1]) : undefined;
  const scale = paramMatch?.[2] ? parseInt(paramMatch[2]) : undefined;

  const base = sqlType.replace(/\s*\([^)]*\)/, '').replace(/\[\]$/, '').toUpperCase().trim();
  const baseLower = sqlType.replace(/\s*\([^)]*\)/, '').replace(/\[\]$/, '').toLowerCase().trim();

  // Custom enum type
  if (enumTypes[baseLower]) return { type: 'enum', values: enumTypes[baseLower] };

  // PostgreSQL array → json
  if (sqlType.includes('[]')) return { type: 'json' };

  if (base.startsWith('VARCHAR') || base === 'CHARACTER VARYING') return { type: 'string', length };
  if (base.startsWith('CHAR')) return { type: 'char', length };
  if (['TEXT', 'TINYTEXT', 'MEDIUMTEXT', 'LONGTEXT', 'CLOB'].includes(base)) return { type: 'text' };
  if (['BIGINT', 'BIGSERIAL', 'INT8'].includes(base)) return { type: 'bigInteger' };
  if (['SMALLINT', 'SMALLSERIAL', 'INT2'].includes(base)) return { type: 'smallInteger' };
  if (['INTEGER', 'INT', 'INT4', 'SERIAL', 'MEDIUMINT'].includes(base)) return { type: 'integer' };
  if (['BOOLEAN', 'BOOL'].includes(base)) return { type: 'boolean' };
  if (base.startsWith('DECIMAL') || base.startsWith('NUMERIC')) {
    return { type: 'decimal', precision: length, scale };
  }
  if (['REAL', 'FLOAT4', 'FLOAT'].includes(base)) return { type: 'float' };
  if (['FLOAT8', 'DOUBLE PRECISION', 'DOUBLE'].includes(base)) return { type: 'double' };
  if (base === 'TIMESTAMPTZ' || base === 'TIMESTAMP WITH TIME ZONE') return { type: 'timestampTz' };
  if (base.startsWith('TIMESTAMP')) return { type: 'timestamp' };
  if (base === 'DATE') return { type: 'date' };
  if (base.startsWith('TIME')) return { type: 'timestamp' };
  if (base === 'UUID') return { type: 'uuid' };
  if (base === 'JSONB') return { type: 'jsonb' };
  if (base === 'JSON') return { type: 'json' };
  if (['BYTEA', 'BLOB', 'BINARY', 'VARBINARY', 'LONGBLOB', 'MEDIUMBLOB'].includes(base)) return { type: 'binary' };
  if (['INET', 'CIDR', 'MACADDR', 'MACADDR8'].includes(base)) return { type: 'string', length: 45 };

  // Unknown → fallback to string
  return { type: 'string' };
}

// ── Parse default value ───────────────────────────────────────────────────────

const SKIP_DEFAULTS = new Set([
  'NOW()', 'CURRENT_TIMESTAMP', 'CURRENT_DATE', 'CURRENT_TIME',
  'UUID_GENERATE_V4()', 'GEN_RANDOM_UUID()', 'CURRENT_USER',
  'NEXTVAL', 'LOCALTIMESTAMP',
]);

function parseDefault(raw: string): any {
  let dv = raw.trim();
  if ((dv.startsWith("'") && dv.endsWith("'")) || (dv.startsWith('"') && dv.endsWith('"'))) {
    dv = dv.slice(1, -1);
  }
  const upper = dv.toUpperCase();
  if (SKIP_DEFAULTS.has(upper) || upper.startsWith('NEXTVAL(')) return undefined;
  if (upper === 'TRUE') return true;
  if (upper === 'FALSE') return false;
  if (dv !== '' && !isNaN(Number(dv))) return Number(dv);
  return dv || undefined;
}

// ── Main parser ───────────────────────────────────────────────────────────────

export function parseSqlToModels(sql: string): Model[] {
  // Strip SQL comments and normalize whitespace
  const cleaned = sql
    .replace(/--[^\n]*/g, ' ')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\r\n/g, '\n');

  // Extract CREATE TYPE ... AS ENUM (...)
  const enumTypes: Record<string, string[]> = {};
  const enumRegex = /CREATE TYPE\s+(\w+)\s+AS ENUM\s*\(([^)]+)\)/gi;
  let enumMatch: RegExpExecArray | null;
  while ((enumMatch = enumRegex.exec(cleaned)) !== null) {
    const typeName = enumMatch[1].toLowerCase();
    const values = enumMatch[2]
      .split(',')
      .map(v => v.trim().replace(/^['"]|['"]$/g, '').toLowerCase());
    enumTypes[typeName] = values;
  }

  // Find all CREATE TABLE blocks using bracket matching
  const tableBlocks: { name: string; body: string }[] = [];
  const tableStart = /CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)\s*\(/gi;
  let m: RegExpExecArray | null;
  while ((m = tableStart.exec(cleaned)) !== null) {
    const tableName = m[1].toLowerCase();
    const parenPos = m.index + m[0].length - 1;
    const body = extractBracketContent(cleaned, parenPos);
    if (body !== null) tableBlocks.push({ name: tableName, body });
  }

  const models: Model[] = [];

  for (const { name: tableName, body } of tableBlocks) {
    const modelName = tableToModelName(tableName);
    const fields: NamedField[] = [];
    let primaryKeyType: string = 'id';
    let hasTimestamps = false;

    const columnDefs = splitColumns(body);

    for (const colDef of columnDefs) {
      const trimmed = colDef.trim().replace(/\s+/g, ' ');
      if (!trimmed) continue;

      const upper = trimmed.toUpperCase();

      // Skip table-level constraints
      if (upper.startsWith('PRIMARY KEY') || upper.startsWith('UNIQUE') ||
          upper.startsWith('FOREIGN KEY') || upper.startsWith('CHECK') ||
          upper.startsWith('CONSTRAINT') || upper.startsWith('INDEX')) continue;

      // Parse: colName sqlType [rest...]
      const colMatch = trimmed.match(/^(\w+)\s+([\w]+(?:\([^)]*\))?(?:\[\])?)(.*)$/i);
      if (!colMatch) continue;

      const colName = colMatch[1].toLowerCase();
      const sqlTypeRaw = colMatch[2].trim();
      const rest = colMatch[3].trim();

      // Skip standard auto-managed fields
      if (colName === 'id') {
        const t = sqlTypeRaw.toUpperCase();
        if (t === 'UUID') primaryKeyType = 'uuid';
        else if (t === 'ULID') primaryKeyType = 'ulid';
        continue;
      }
      if (colName === 'created_at' || colName === 'updated_at') {
        hasTimestamps = true;
        continue;
      }
      if (colName === 'deleted_at') {
        // softDeletes handled separately
        continue;
      }

      // Skip GENERATED ALWAYS / GENERATED BY DEFAULT columns
      const restUpper = rest.toUpperCase();
      if (restUpper.includes('GENERATED ALWAYS') || restUpper.includes('GENERATED BY DEFAULT')) continue;

      const isNullable = !restUpper.includes('NOT NULL');
      const isUnique = restUpper.includes('UNIQUE');

      // Check if this column is also the primary key
      if (restUpper.includes('PRIMARY KEY')) {
        const t = sqlTypeRaw.toUpperCase();
        if (t === 'UUID') primaryKeyType = 'uuid';
        else if (t === 'ULID') primaryKeyType = 'ulid';
      }

      // Default value
      let defaultVal: any = undefined;
      const defaultMatch = rest.match(/DEFAULT\s+('[^']*'|"[^"]*"|\S+)/i);
      if (defaultMatch) defaultVal = parseDefault(defaultMatch[1]);

      // Foreign key (REFERENCES)
      const referencesMatch = rest.match(/REFERENCES\s+(\w+)\s*(?:\(\s*\w+\s*\))?/i);
      const onDeleteMatch = rest.match(/ON DELETE\s+(CASCADE|SET NULL|RESTRICT|NO ACTION|SET DEFAULT)/i);

      if (referencesMatch) {
        const refTable = referencesMatch[1].toLowerCase();
        const fkType = sqlTypeRaw.toUpperCase() === 'UUID' ? 'foreignUuid' : 'foreignId';
        const field: NamedField = {
          name: colName,
          type: fkType,
          nullable: isNullable,
          references: refTable,
          ...(onDeleteMatch && { on_delete: onDeleteMatch[1].toLowerCase() }),
          ...(defaultVal !== undefined && { default: defaultVal }),
        };
        fields.push(field);
        continue;
      }

      // Regular field
      const typeInfo = mapSqlType(sqlTypeRaw, enumTypes);
      const field: NamedField = {
        name: colName,
        type: typeInfo.type,
        nullable: isNullable,
        ...(isUnique && { unique: true }),
        ...(typeInfo.values && { values: typeInfo.values }),
        ...(typeInfo.length && { length: typeInfo.length }),
        ...(typeInfo.precision && { precision: typeInfo.precision }),
        ...(typeInfo.scale !== undefined && typeInfo.scale !== null && { scale: typeInfo.scale }),
        ...(defaultVal !== undefined && { default: defaultVal }),
      };
      fields.push(field);
    }

    models.push({
      name: modelName,
      table: tableName,
      fields,
      relations: [],
      generate: { ...DEFAULT_GENERATE },
      migration: {
        primary_key: primaryKeyType as any,
        timestamps: hasTimestamps,
        softDeletes: false,
      },
    });
  }

  // Second pass: compute relations from foreignId/foreignUuid fields
  for (const model of models) {
    for (const field of model.fields) {
      if (!['foreignId', 'foreignUuid', 'foreignUlid'].includes(field.type)) continue;
      if (!field.references) continue;

      const targetModel = models.find(m =>
        (m.table || `${m.name.toLowerCase()}s`) === field.references
      );
      if (!targetModel) continue;

      // belongsTo on current model
      if (!model.relations.some(r => r.model === targetModel.name && r.type === 'belongsTo')) {
        model.relations.push({ type: 'belongsTo', model: targetModel.name });
      }
      // hasMany on target model (only if no relation of any type already points to this model)
      if (!targetModel.relations.some(r => r.model === model.name)) {
        targetModel.relations.push({ type: 'hasMany', model: model.name });
      }
    }
  }

  return models;
}
