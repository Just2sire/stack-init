export type Stack =
  | 'laravel'
  | 'react'
  | 'laravel+react'
  | 'express'
  | 'nestjs'
  | 'nestjs+react'
  | 'nextjs'
  | 'express+react'
  | 'laravel+nextjs'
  | 'fastapi'
  | 'fastapi+react'
  | 'fastapi+nextjs'
  | 'mern'
  | 'pern'
  | 't3'
  | 'mevn'
  | 'mean';

export type ServiceId = 'auth' | 'file-upload' | 'email' | 'cache' | 'websockets' | 'queue';

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
  comment?: string;
  unsigned?: boolean;
  on_delete?: string;
  on_update?: string;
  constrained?: boolean;
}

export interface Relation {
  type: 'hasOne' | 'hasMany' | 'belongsTo' | 'belongsToMany' | 'morphTo' | 'morphMany' | 'morphToMany' | 'morphedByMany';
  model: string;
  name?: string;
  foreign_key?: string;
  local_key?: string;
  pivot_table?: string;
  through?: string;
  with_trashed?: boolean;
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
  softDeletesTz?: boolean;
  timestampsTz?: boolean;
  primary_key?: 'id' | 'uuid' | 'ulid' | 'custom' | string;
  engine?: string;
  charset?: string;
  collation?: string;
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

export interface FastAPIConfig {
  architecture: 'flat' | 'layered' | 'feature-based' | 'domain';
  orm: 'sqlalchemy' | 'sqlmodel' | 'tortoise-orm' | 'beanie' | 'none';
  db_engine: 'postgresql' | 'mysql' | 'sqlite' | 'mongodb';
  auth: 'jwt' | 'oauth2' | 'api-key' | 'none';
  migrations: boolean;
  cors: boolean;
  swagger: boolean;
  rate_limiting: boolean;
  background_tasks: boolean;
  websockets: boolean;
  runner: 'makefile' | 'bash' | 'none';
  python_version: '3.10' | '3.11' | '3.12';
  async_mode: boolean;
}

export interface ProjectConfig {
  name: string;
  stack: Stack;
  models: Model[];
  services?: ServiceId[];
  backendUrl?: string;
  nextjsUsage?: 'frontend-only' | 'full-stack';
  laravel?: LaravelOptions;
  react?: ReactOptions;
  express?: ExpressConfig;
  nest?: NestConfig;
  fastapi?: FastAPIConfig;
}

export function isZipStack(stack: Stack | null): boolean {
  if (!stack) return false;
  const zipStacks: string[] = [
    'react', 'nextjs',
    'express', 'nestjs', 'nestjs+react', 'express+react',
    'laravel+react', 'laravel+nextjs',
    'fastapi', 'fastapi+react', 'fastapi+nextjs',
    'mern', 'pern', 't3', 'mevn', 'mean',
  ];
  return zipStacks.includes(stack as any);
}

export function isCliStack(stack: Stack | null): boolean {
  if (!stack) return false;
  const cliStacks: string[] = ['laravel', 'nestjs', 'nestjs+react', 'express', 'fastapi', 'laravel+react', 'laravel+nextjs', 'express+react', 'fastapi+react', 'fastapi+nextjs', 'mern', 'pern', 't3', 'mevn', 'mean'];
  return cliStacks.includes(stack as any);
}

export function isMixedStack(stack: Stack | null): boolean {
  if (!stack) return false;
  const mixedStacks: string[] = ['laravel+react', 'laravel+nextjs', 'express+react', 'nestjs+react', 'fastapi+react', 'fastapi+nextjs', 'mern', 'pern', 't3', 'mevn', 'mean'];
  return mixedStacks.includes(stack as any);
}
