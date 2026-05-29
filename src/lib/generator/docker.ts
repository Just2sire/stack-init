import type { ProjectConfig } from '@stack-init/schema';

const MONOREPO_STACKS = new Set([
  'express+react', 'nestjs+react',
  'fastapi+react', 'fastapi+nextjs',
  'mern', 'pern', 'mevn', 'mean',
]);

export function generateDockerCompose(config: ProjectConfig): string {
  const { stack, name } = config;
  const isMonorepo = MONOREPO_STACKS.has(stack as string);
  const isExpress  = stack.includes('express') || stack === 'mern' || stack === 'pern' || stack === 'mevn' || stack === 'mean';
  const isNest     = stack.includes('nestjs');
  const isFastapi  = stack.includes('fastapi');
  const isDjango   = stack === 'django';

  const dbEngine   = config.express?.db_engine ?? config.nestjs?.db_engine ?? config.fastapi?.db_engine ?? 'postgresql';
  const isPostgres = dbEngine === 'postgresql' || isDjango;
  const isMysql    = dbEngine === 'mysql' && !isDjango;
  const isMongo    = (dbEngine === 'mongodb' || stack === 'mern' || stack === 'mevn' || stack === 'mean') && !isDjango;
  const dbService  = isPostgres ? 'postgres' : isMysql ? 'mysql' : 'mongo';

  const backendPort    = (isFastapi || isDjango) ? 8000 : 3000;
  const backendContext = isMonorepo ? './backend' : '.';
  const envFile        = isMonorepo ? 'backend/.env' : '.env';

  const svcs: string[] = [];

  if (isPostgres) {
    svcs.push(`  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${name}
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d ${name}"]
      interval: 10s
      timeout: 5s
      retries: 5`);
  } else if (isMysql) {
    svcs.push(`  mysql:
    image: mysql:8
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: ${name}
      MYSQL_USER: user
      MYSQL_PASSWORD: password
      MYSQL_ROOT_PASSWORD: rootpassword
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "user", "-ppassword"]
      interval: 10s
      timeout: 5s
      retries: 5`);
  } else if (isMongo) {
    svcs.push(`  mongo:
    image: mongo:7
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5`);
  }

  if (stack === 't3') {
    svcs.push(`  app:
    build:
      context: .
      target: production
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file:
      - .env
    networks:
      - app-network
    depends_on:
      ${dbService}:
        condition: service_healthy`);
  } else if (isExpress || isNest || isFastapi || isDjango) {
    svcs.push(`  backend:
    build:
      context: ${backendContext}
      target: production
    restart: unless-stopped
    ports:
      - "${backendPort}:${backendPort}"
    env_file:
      - ${envFile}
    networks:
      - app-network
    depends_on:
      ${dbService}:
        condition: service_healthy`);
  }

  if (isMonorepo) {
    svcs.push(`  frontend:
    build:
      context: ./frontend
      target: production
    restart: unless-stopped
    ports:
      - "80:80"
    networks:
      - app-network
    depends_on:
      - backend`);
  }

  const volumes = [
    isPostgres && 'postgres_data:',
    isMysql    && 'mysql_data:',
    isMongo    && 'mongo_data:',
  ].filter(Boolean);

  return [
    'version: "3.9"',
    '',
    'networks:',
    '  app-network:',
    '    driver: bridge',
    '',
    'services:',
    svcs.join('\n\n'),
    ...(volumes.length ? ['', 'volumes:', ...volumes.map(v => `  ${v}`)] : []),
    '',
  ].join('\n');
}

export function generateDockerfile(type: 'node' | 'fastapi' | 'laravel' | 'react-spa' | 'nextjs' | 't3' | 'django' | 'angular', config: ProjectConfig): string {
  const pythonVersion = config.fastapi?.python_version ?? '3.11';
  const phpVersion    = config.laravel?.php_version    ?? '8.4';

  switch (type) {
    case 'node':
      return `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main.js"]
`;

    case 'fastapi':
      return `FROM python:${pythonVersion}-slim AS builder
WORKDIR /app
RUN pip install --upgrade pip
COPY requirements.txt .
RUN pip install --no-cache-dir --target=/app/packages -r requirements.txt

FROM python:${pythonVersion}-slim AS production
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1 \\
    PYTHONPATH=/app/packages
COPY --from=builder /app/packages ./packages
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
`;

    case 'laravel':
      return `FROM composer:2 AS builder
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --optimize-autoloader

FROM php:${phpVersion}-fpm-alpine AS production
WORKDIR /var/www/html
RUN apk add --no-cache libpng-dev libzip-dev zip \\
    && docker-php-ext-install pdo pdo_mysql bcmath zip gd
COPY --from=builder /app/vendor ./vendor
COPY . .
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
EXPOSE 9000
CMD ["php-fpm"]
`;

    case 'react-spa':
      return `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;

    case 'nextjs':
      return `FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM base AS production
ENV NODE_ENV=production \\
    NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs \\
    && adduser --system --uid 1001 nextjs
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
`;

    case 't3':
      return `FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

FROM base AS production
ENV NODE_ENV=production \\
    NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs \\
    && adduser --system --uid 1001 nextjs
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
`;

    case 'angular':
      return `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS production
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;

    case 'django':
      return `FROM python:3.11-slim AS builder
WORKDIR /app
RUN pip install --upgrade pip
COPY requirements.txt .
RUN pip install --no-cache-dir --target=/app/packages -r requirements.txt

FROM python:3.11-slim AS production
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1 \\
    PYTHONPATH=/app/packages
COPY --from=builder /app/packages ./packages
COPY . .
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
`;
  }
}

export function generateNginxConf(): string {
  return `server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
`;
}

export function generateDockerIgnore(type: 'node' | 'fastapi' | 'laravel'): string {
  switch (type) {
    case 'node':
      return `node_modules
dist
.next
.env
*.log
coverage
.nyc_output
`;
    case 'fastapi':
      return `__pycache__
*.pyc
*.pyo
.venv
venv
.env
*.egg-info
dist
.pytest_cache
`;
    case 'laravel':
      return `vendor
node_modules
.env
storage/logs/*
storage/framework/cache/*
storage/framework/sessions/*
storage/framework/views/*
bootstrap/cache/*
public/hot
`;
  }
}

export function generateGithubCI(config: ProjectConfig): string {
  const { stack } = config;
  const isMonorepo     = MONOREPO_STACKS.has(stack as string);
  const isFastapi      = stack.includes('fastapi');
  const isDjango       = stack === 'django';
  const isPureUI       = stack === 'nextjs' || stack === 'react';
  const workdir        = isMonorepo ? 'backend' : '.';
  const pythonVersion  = config.fastapi?.python_version ?? '3.11';

  const header = `name: CI — ${config.name}

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:`;

  if (isDjango) {
    return `${header}
  lint-and-test:
    name: Lint & Test
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: ${config.name}_test
          POSTGRES_USER: user
          POSTGRES_PASSWORD: password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run migrations
        env:
          DATABASE_URL: postgresql://user:password@localhost:5432/${config.name}_test
          SECRET_KEY: ci-secret-key
          DEBUG: "True"
        run: python manage.py migrate
      - name: Run tests
        env:
          DATABASE_URL: postgresql://user:password@localhost:5432/${config.name}_test
          SECRET_KEY: ci-secret-key
          DEBUG: "True"
        run: python manage.py test
`;
  }

  if (isPureUI) {
    return `${header}
  build-and-test:
    name: Build & Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint --if-present
      - run: npm run typecheck --if-present
      - run: npm test --if-present
      - run: npm run build
`;
  }

  const cacheDepPath = isMonorepo
    ? `\n          cache-dependency-path: backend/package-lock.json`
    : '';

  if (isFastapi) {
    const backendJob = `  backend:
    name: Backend — FastAPI
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ${workdir}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '${pythonVersion}'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Install dev tools
        run: pip install ruff pytest
      - name: Lint (ruff)
        run: ruff check .
      - name: Test
        run: pytest --tb=short`;

    const frontendJob = isMonorepo ? `

  frontend:
    name: Frontend
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
      - run: npm run lint --if-present
      - run: npm run build` : '';

    return `${header}\n${backendJob}${frontendJob}\n`;
  }

  const backendJob = `  backend:
    name: Backend — Node.js
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
      - run: npm run lint --if-present
      - run: npm test --if-present`;

  const frontendJob = isMonorepo ? `

  frontend:
    name: Frontend
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
      - run: npm run lint --if-present
      - run: npm run build` : '';

  return `${header}\n${backendJob}${frontendJob}\n`;
}
