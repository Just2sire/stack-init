import type { ProjectConfig } from '@stack-init/schema';

const MONOREPO_STACKS = new Set([
  'express+react', 'nestjs+react',
  'fastapi+react', 'fastapi+nextjs',
  'mern', 'pern', 'mevn', 'mean',
]);

export function generateDockerCompose(config: ProjectConfig): string {
  const { stack, name } = config;
  const isMonorepo = MONOREPO_STACKS.has(stack as string);
  const isExpress  = stack.includes('express') || stack === 'mern' || stack === 'pern';
  const isNest     = stack.includes('nestjs');
  const isFastapi  = stack.includes('fastapi');

  const dbEngine   = config.express?.db_engine ?? config.nest?.db_engine ?? config.fastapi?.db_engine ?? 'postgresql';
  const isPostgres = dbEngine === 'postgresql';
  const isMysql    = dbEngine === 'mysql';
  const isMongo    = dbEngine === 'mongodb';
  const dbService  = isPostgres ? 'postgres' : isMysql ? 'mysql' : 'mongo';

  const backendPort    = isFastapi ? 8000 : 3000;
  const backendContext = isMonorepo ? './backend' : '.';
  const envFile        = isMonorepo ? 'backend/.env' : '.env';

  const svcs: string[] = [];

  if (isPostgres) {
    svcs.push(`  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${name}
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data`);
  } else if (isMysql) {
    svcs.push(`  mysql:
    image: mysql:8
    environment:
      MYSQL_DATABASE: ${name}
      MYSQL_USER: user
      MYSQL_PASSWORD: password
      MYSQL_ROOT_PASSWORD: rootpassword
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql`);
  } else if (isMongo) {
    svcs.push(`  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db`);
  }

  if (isExpress || isNest || isFastapi) {
    svcs.push(`  backend:
    build:
      context: ${backendContext}
    ports:
      - "${backendPort}:${backendPort}"
    env_file:
      - ${envFile}
    depends_on:
      - ${dbService}`);
  }

  if (isMonorepo) {
    svcs.push(`  frontend:
    build:
      context: ./frontend
    ports:
      - "3001:3001"
    env_file:
      - frontend/.env`);
  }

  const volumes = [
    isPostgres && 'postgres_data:',
    isMysql    && 'mysql_data:',
    isMongo    && 'mongo_data:',
  ].filter(Boolean);

  return [
    'version: "3.9"',
    '',
    'services:',
    svcs.join('\n\n'),
    ...(volumes.length ? ['', 'volumes:', ...volumes.map(v => `  ${v}`)] : []),
  ].join('\n');
}

export function generateGithubCI(config: ProjectConfig): string {
  const { stack } = config;
  const isMonorepo = MONOREPO_STACKS.has(stack as string);
  const isFastapi  = stack.includes('fastapi');
  const isNest     = stack.includes('nestjs');
  const isPureUI   = stack === 'nextjs' || stack === 'react';
  const workdir    = isMonorepo ? 'backend' : '.';

  const header = `name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:`;

  if (isPureUI) {
    return `${header}
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
`;
  }

  const cacheDepPath = isMonorepo
    ? `\n          cache-dependency-path: backend/package-lock.json`
    : '';

  if (isFastapi) {
    const backendJob = `  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ${workdir}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Lint
        run: |
          pip install ruff
          ruff check .
      - name: Type check
        run: |
          pip install mypy
          mypy app --ignore-missing-imports`;

    const frontendJob = isMonorepo ? `

  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm run build` : '';

    return `${header}\n${backendJob}${frontendJob}\n`;
  }

  const backendJob = `  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ${workdir}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'${cacheDepPath}
      - run: npm ci
      - name: Type check
        run: npx tsc --noEmit
      - name: Build
        run: npm run build`;

  const frontendJob = isMonorepo ? `

  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      - run: npm ci
      - run: npm run build` : '';

  return `${header}\n${backendJob}${frontendJob}\n`;
}
