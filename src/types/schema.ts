export type Stack = 'laravel' | 'react' | 'laravel+react';

export interface NamedField {
  name: string;
  type: string;
  required?: boolean;
  nullable?: boolean;
  unique?: boolean;
  values?: string[];       // enum / set
  references?: string;     // foreignId / foreignUuid — nom de la table cible
  length?: number;         // string / char
  precision?: number;      // decimal / float / double
  scale?: number;          // decimal / float / double
}

export interface Relation {
  type: string;
  model: string;
  name?: string;
}

export interface LaravelGenerateOptions {
  migration: boolean;
  controller: boolean;
  seeder: boolean;
  factory: boolean;
  policy: boolean;
  routes: boolean;
}

export interface MigrationOptions {
  timestamps: boolean;
  softDeletes?: boolean;
}

export interface ModelPages {
  list: boolean;
  detail: boolean;
  create: boolean;
  edit: boolean;
}

export interface Model {
  name: string;
  fields: NamedField[];
  relations: Relation[];
  generate: LaravelGenerateOptions;
  migration?: MigrationOptions;
  pages?: ModelPages;
}

export interface LaravelOptions {
  pattern: 'full' | 'api-only' | 'minimal';
  auth: 'none' | 'sanctum' | 'passport';
  php_version: string;
  laravel_version: string;
  db_engine: string;
}

export interface ReactOptions {
  state_lib: string;
  form_lib: string;
  ui_lib: string;
  http_lib: string;
  router: string;
  css: string;
}

export interface ProjectConfig {
  name: string;
  stack: Stack;
  models: Model[];
  laravel: LaravelOptions;
  react: ReactOptions;
}

export function isZipStack(stack: Stack | null): boolean {
  return stack === 'react' || stack === 'laravel+react';
}

export function isCliStack(stack: Stack | null): boolean {
  return stack === 'laravel' || stack === 'laravel+react';
}

export function isMixedStack(stack: Stack | null): boolean {
  return stack === 'laravel+react';
}
