export type Stack = 
  | 'laravel' 
  | 'react' 
  | 'laravel+react' 
  | 'express' 
  | 'nestjs' 
  | 'nextjs' 
  | 'express+react' 
  | 'laravel+nextjs';

export interface NamedField {
  default?: any;
  name: string;
  type: string;
  required?: boolean;
  nullable?: boolean;
  unique?: boolean;
  index?: boolean;
  values?: string[];       // enum / set
  references?: string;     // foreignId / foreignUuid — nom de la table cible
  length?: number;         // string / char
  precision?: number;      // decimal / float / double
  scale?: number;          // decimal / float / double
  dimensions?: number;     // vector
}

export interface Relation {
  type: 'hasOne' | 'hasMany' | 'belongsTo' | 'belongsToMany' | 'morphTo' | 'morphMany' | 'morphToMany' | 'morphedByMany';
  model: string;
  name?: string;
}

export interface LaravelGenerateOptions {
  migration: boolean;
  controller: boolean;
  resource: boolean;
  request: boolean;
  policy: boolean;
  factory: boolean;
  seeder: boolean;
  swagger: boolean;
  softDelete: boolean;
  repository: boolean;
  service: boolean;
  tests: boolean;
  routes: boolean;
}

export interface MigrationOptions {
  timestamps: boolean;
  softDeletes?: boolean;
  primary_key?: 'id' | 'uuid' | 'ulid' | 'custom' | string;
  engine?: string;
  charset?: string;
}

export interface ModelPages {
  list: boolean;
  detail: boolean;
  create: boolean;
  edit: boolean;
}

export interface Model {
  name: string;
  table?: string;
  fields: NamedField[];
  relations: Relation[];
  generate: LaravelGenerateOptions;
  migration: MigrationOptions;
  pages?: ModelPages;
}

export interface LaravelOptions {
  pattern: 'full' | 'api-only' | 'minimal';
  auth: 'none' | 'sanctum' | 'passport' | 'breeze' | 'jetstream';
  php_version: string;
  laravel_version: string;
  db_engine: string;
}

export interface ReactOptions {
  architecture?: string;
  state_lib: string;
  form_lib: string;
  ui_lib: string;
  http_lib: string;
  router: string;
  css: string;
}

export interface ExpressConfig {
  architecture: 'mvc' | 'layered' | 'minimal' | string;
  database: 'prisma' | 'sequelize' | 'typeorm' | 'mongoose' | 'none';
  db_engine: 'postgresql' | 'mysql' | 'sqlite' | 'mongodb';
  middlewares?: string[];
  orm?: string;
  auth?: string;
  validation?: string;
  swagger?: boolean;
  port?: number;
}

export interface NestConfig {
  architecture: 'modular' | 'cqrs' | 'layered' | string;
  database: 'prisma' | 'typeorm' | 'mongoose' | 'drizzle' | 'none';
  db_engine: 'postgresql' | 'mysql' | 'sqlite' | 'mongodb';
  swagger?: boolean;
  orm?: string;
  auth?: string;
  validation?: boolean;
  serialization?: boolean;
  throttling?: boolean;
  runner?: string;
}

export interface NextjsOptions {
  usage: 'frontend-only' | 'full-stack';
}

export interface ProjectConfig {
  name: string;
  stack: Stack;
  models: Model[];
  laravel: LaravelOptions;
  react: ReactOptions;
  express?: ExpressConfig;
  nest?: NestConfig;
}

export function isZipStack(stack: Stack | null): boolean {
  if (!stack) return false;
  return ['react', 'nextjs', 'express', 'nestjs', 'express+react'].includes(stack as any);
}

export function isCliStack(stack: Stack | null): boolean {
  if (!stack) return false;
  return ['laravel', 'nestjs', 'express', 'laravel+react', 'laravel+nextjs', 'express+react'].includes(stack as any);
}

export function isMixedStack(stack: Stack | null): boolean {
  if (!stack) return false;
  return ['laravel+react', 'laravel+nextjs', 'express+react'].includes(stack as any);
}
