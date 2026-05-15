import JSZip from 'jszip';
import type { ProjectConfig, ReactOptions, ModelPages, Model } from '@stack-init/schema';

// "BlogPost" → "blog-posts"
function slugify(name: string): string {
  const s = name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
  
  if (s.endsWith('s')) return s + 'es'; // address -> addresses
  if (s.endsWith('y')) return s.slice(0, -1) + 'ies'; // category -> categories
  return s + 's';
}

function toTs(fieldType: string): string {
  const map: Record<string, string> = {
    string: 'string', char: 'string', text: 'string',
    longText: 'string', tinyText: 'string', mediumText: 'string',
    integer: 'number', bigInteger: 'number', smallInteger: 'number',
    unsignedInteger: 'number', unsignedBigInteger: 'number',
    decimal: 'number', float: 'number', double: 'number',
    boolean: 'boolean',
    timestamp: 'string', timestampTz: 'string', date: 'string', dateTime: 'string',
    json: 'unknown', jsonb: 'unknown',
    uuid: 'string', ulid: 'string',
    enum: 'string', set: 'string',
    foreignId: 'number', foreignUuid: 'string',
    binary: 'string', rememberToken: 'string',
  };
  return map[fieldType] ?? 'unknown';
}

function buildDeps(opts: ReactOptions): Record<string, string> {
  const deps: Record<string, string> = {
    next: '^15.0.0',
    react: '^19.0.0',
    'react-dom': '^19.0.0',
  };
  if (opts.state_lib === 'zustand')        { deps.zustand = '^5.0.0'; }
  if (opts.state_lib === 'redux-toolkit')  { deps['@reduxjs/toolkit'] = '^2.0.0'; deps['react-redux'] = '^9.0.0'; }
  if (opts.state_lib === 'jotai')          { deps.jotai = '^2.0.0'; }
  if (opts.form_lib === 'react-hook-form') { deps['react-hook-form'] = '^7.0.0'; }
  if (opts.form_lib === 'formik')          { deps.formik = '^2.0.0'; }
  if (opts.http_lib === 'axios')           { deps.axios = '^1.0.0'; }
  if (opts.http_lib === 'ky')              { deps.ky = '^1.0.0'; }
  if (opts.ui_lib === 'shadcn')            {
    deps['@radix-ui/react-slot'] = '^1.0.0';
    deps['class-variance-authority'] = '^0.7.0';
    deps.clsx = '^2.0.0';
    deps['tailwind-merge'] = '^3.0.0';
  }
  if (opts.ui_lib === 'mui')               {
    deps['@mui/material'] = '^6.0.0';
    deps['@emotion/react'] = '^11.0.0';
    deps['@emotion/styled'] = '^11.0.0';
  }
  if (opts.ui_lib === 'antd')              { deps.antd = '^5.0.0'; }
  if (opts.css === 'tailwind')             {
    deps.tailwindcss = '^4.0.0';
    deps['@tailwindcss/postcss'] = '^4.0.0';
  }
  return deps;
}

const DEFAULT_PAGES: ModelPages = { list: true, detail: true, create: true, edit: false };

export async function generateZip(config: ProjectConfig): Promise<void> {
  const zip = new JSZip();
  const { stack, name: projectName } = config;

  if (stack === 'express') {
    await generateExpressProject(zip, config);
  } else if (stack === 'nestjs') {
    await generateNestProject(zip, config);
  } else {
    await generateNextjsProject(zip, config);
  }

  // Common README for all projects
  zip.file('README.md', generateCommonReadme(config));

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName || 'project'}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateCommonReadme(config: ProjectConfig): string {
  const { name, stack, models, react, express, nest } = config;
  const today = new Date().toLocaleDateString();
  
  let stackTable = `| Couche | Choix |\n|--------|-------|\n`;
  if (stack.includes('laravel')) stackTable += `| Backend | Laravel 11 |\n`;
  if (stack.includes('express')) stackTable += `| Backend | Express (Node.js) |\n| Architecture | ${express?.architecture || 'MVC'} |\n| ORM | ${express?.orm || 'Prisma'} |\n`;
  if (stack.includes('nestjs')) stackTable += `| Backend | NestJS 11 |\n| Architecture | ${nest?.architecture || 'Layered'} |\n`;
  if (react) {
    stackTable += `| Frontend | Next.js 15 / React 19 |\n| UI Lib | ${react.ui_lib} |\n| State | ${react.state_lib} |\n`;
  }

  const modelList = models.map(m => {
    const fields = m.fields.map(f => `    - \`${f.name}\`: ${f.type}${f.nullable ? ' (optional)' : ''}`).join('\n');
    return `- **${m.name}**\n${fields}`;
  }).join('\n');

  return `# ${name}

Généré avec **Stack-Init** le ${today}.

## Architecture & Stack

${stackTable}

## Modèles de Données

${modelList}

## Installation

\`\`\`bash
# Installer les dépendances
npm install

# Configurer la base de données (si Prisma est utilisé)
# Editez le fichier .env avec votre DATABASE_URL
npx prisma generate
npx prisma db push

# Lancer en mode développement
npm run dev
\`\`\`

## Structure du Projet

${stack === 'express' ? `
\`\`\`
src/
├── controllers/    # Logique métier par ressource
├── routes/         # Définition des endpoints API
├── lib/            # Clients (Prisma, etc.)
└── index.ts        # Point d'entrée
\`\`\`` : stack === 'nestjs' ? `
\`\`\`
src/
├── [module]/       # Dossiers par ressource (Controller, Service, Module)
├── app.module.ts   # Orchestration globale
└── main.ts         # Bootstrapping
\`\`\`` : `
\`\`\`
src/
├── app/            # Routes Next.js et API Routes
├── components/     # Composants UI (si sélectionné)
├── lib/            # Utilitaires et clients
└── types/          # Interfaces TypeScript
\`\`\``}

---
Généré par [Stack-Init](https://stackinit.dev) - Scaffold faster, ship sooner.
`;
}

async function generateExpressProject(zip: JSZip, config: ProjectConfig) {
  const { models, name: projectName } = config;
  const opts = config.express || { architecture: 'mvc', orm: 'prisma', db_engine: 'postgresql' } as any;

  zip.file('package.json', JSON.stringify({
    name: projectName,
    version: '1.0.0',
    scripts: { 
      dev: 'ts-node-dev --respawn src/index.ts', 
      build: 'tsc', 
      start: 'node dist/index.js',
      "prisma:generate": "prisma generate",
      "prisma:push": "prisma db push"
    },
    dependencies: {
      express: '^4.18.0',
      cors: '^2.8.5',
      dotenv: '^16.0.0',
      ...(opts.orm === 'prisma' && { '@prisma/client': 'latest' }),
    },
    devDependencies: {
      typescript: '^5.0.0',
      '@types/express': '^4.17.0',
      '@types/node': '^20.0.0',
      '@types/cors': '^2.8.12',
      'ts-node-dev': '^2.0.0',
      ...(opts.orm === 'prisma' && { prisma: 'latest' }),
    }
  }, null, 2));

  zip.file('tsconfig.json', JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      module: 'commonjs',
      lib: ['esnext'],
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      outDir: 'dist',
      rootDir: 'src'
    },
    include: ['src/**/*']
  }, null, 2));

  zip.file('.gitignore', 'node_modules\ndist\n.env\n*.log');

  zip.file('.env', `DATABASE_URL="postgresql://user:password@localhost:5432/${projectName}?schema=public"\nPORT=3000`);

  zip.file('src/index.ts', `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
${models.map(m => `import ${m.name.toLowerCase()}Routes from './routes/${slugify(m.name)}';`).join('\n')}

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
${models.map(m => `app.use('/api/${slugify(m.name)}', ${m.name.toLowerCase()}Routes);`).join('\n')}

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to ${projectName} API', version: '1.0.0' });
});

app.listen(port, () => {
  console.log(\`🚀 Server running at http://localhost:\${port}\`);
});
`);

  for (const model of models) {
    const slug = slugify(model.name);
    const mLow = model.name.toLowerCase();

    zip.file(`src/routes/${slug}.ts`, `import { Router } from 'express';
import * as controller from '../controllers/${model.name}Controller';

const router = Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

export default router;
`);

    zip.file(`src/controllers/${model.name}Controller.ts`, `import { Request, Response } from 'express';
${opts.orm === 'prisma' ? "import { prisma } from '../lib/prisma';" : ""}

export const getAll = async (req: Request, res: Response) => {
  try {
    ${opts.orm === 'prisma' 
      ? `const items = await prisma.${mLow}.findMany();\n    res.json(items);`
      : `res.json([]); // TODO: Implement fetch`}
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ${mLow}s' });
  }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    ${opts.orm === 'prisma'
      ? `const item = await prisma.${mLow}.findUnique({ where: { id: Number(id) } });\n    if (!item) return res.status(404).json({ error: '${model.name} not found' });\n    res.json(item);`
      : `res.json({ id }); // TODO: Implement fetch one`}
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ${mLow}' });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    ${opts.orm === 'prisma'
      ? `const item = await prisma.${mLow}.create({ data: req.body });\n    res.status(201).json(item);`
      : `res.status(201).json({ ...req.body, id: Date.now() }); // TODO: Implement create`}
  } catch (error) {
    res.status(400).json({ error: 'Failed to create ${mLow}' });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    ${opts.orm === 'prisma'
      ? `const item = await prisma.${mLow}.update({ where: { id: Number(id) }, data: req.body });\n    res.json(item);`
      : `res.json({ id, ...req.body }); // TODO: Implement update`}
  } catch (error) {
    res.status(400).json({ error: 'Failed to update ${mLow}' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    ${opts.orm === 'prisma'
      ? `await prisma.${mLow}.delete({ where: { id: Number(id) } });\n    res.status(204).send();`
      : `res.status(204).send(); // TODO: Implement delete`}
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete ${mLow}' });
  }
};
`);
  }

  if (opts.orm === 'prisma') {
    zip.file('prisma/schema.prisma', generatePrismaSchema(config));
    zip.file('src/lib/prisma.ts', `import { PrismaClient } from '@prisma/client';\nexport const prisma = new PrismaClient();\n`);
  }
}

async function generateNestProject(zip: JSZip, config: ProjectConfig) {
  const { models, name: projectName } = config;
  const isPrisma = config.nest?.database === 'prisma';
  
  zip.file('package.json', JSON.stringify({
    name: projectName,
    version: '0.0.1',
    scripts: { 
      start: 'nest start', 
      'start:dev': 'nest start --watch', 
      build: 'nest build',
      "prisma:generate": "prisma generate",
      "prisma:push": "prisma db push"
    },
    dependencies: {
      '@nestjs/common': '^10.0.0',
      '@nestjs/core': '^10.0.0',
      '@nestjs/platform-express': '^10.0.0',
      'reflect-metadata': '^0.1.13',
      'rxjs': '^7.8.1',
      ...(isPrisma && { '@prisma/client': 'latest' }),
    },
    devDependencies: {
      '@nestjs/cli': '^10.0.0',
      'typescript': '^5.0.0',
      ...(isPrisma && { prisma: 'latest' }),
    }
  }, null, 2));

  zip.file('.env', `DATABASE_URL="postgresql://user:password@localhost:5432/${projectName}?schema=public"`);

  zip.file('src/main.ts', `import { NestFactory } from '@nestjs/core';\nimport { AppModule } from './app.module';\n\nasync function bootstrap() {\n  const app = await NestFactory.create(AppModule);\n  app.enableCors();\n  await app.listen(3000);\n}\nbootstrap();\n`);

  zip.file('src/app.module.ts', `import { Module } from '@nestjs/common';
${models.map(m => `import { ${m.name}Module } from './${slugify(m.name)}/${slugify(m.name)}.module';`).join('\n')}

@Module({
  imports: [${models.map(m => `${m.name}Module`).join(', ')}],
})
export class AppModule {}
`);

  for (const model of models) {
    const slug = slugify(model.name);
    const mLow = model.name.toLowerCase();

    zip.file(`src/${slug}/${slug}.module.ts`, `import { Module } from '@nestjs/common';
import { ${model.name}Controller } from './${slug}.controller';
import { ${model.name}Service } from './${slug}.service';
${isPrisma ? "import { PrismaService } from '../prisma.service';" : ""}

@Module({
  controllers: [${model.name}Controller],
  providers: [${model.name}Service ${isPrisma ? ', PrismaService' : ''}],
})
export class ${model.name}Module {}
`);

    zip.file(`src/${slug}/${slug}.controller.ts`, `import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ${model.name}Service } from './${slug}.service';

@Controller('${slug}')
export class ${model.name}Controller {
  constructor(private readonly service: ${model.name}Service) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Post()
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.service.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
`);

    zip.file(`src/${slug}/${slug}.service.ts`, `import { Injectable } from '@nestjs/common';
${isPrisma ? "import { PrismaService } from '../prisma.service';" : ""}

@Injectable()
export class ${model.name}Service {
  ${isPrisma ? "constructor(private prisma: PrismaService) {}" : ""}

  async findAll() {
    ${isPrisma ? `return this.prisma.${mLow}.findMany();` : "return [];"}
  }

  async findOne(id: number) {
    ${isPrisma ? `return this.prisma.${mLow}.findUnique({ where: { id } });` : "return { id };"}
  }

  async create(data: any) {
    ${isPrisma ? `return this.prisma.${mLow}.create({ data });` : "return { id: Date.now(), ...data };"}
  }

  async update(id: number, data: any) {
    ${isPrisma ? `return this.prisma.${mLow}.update({ where: { id }, data });` : "return { id, ...data };"}
  }

  async remove(id: number) {
    ${isPrisma ? `return this.prisma.${mLow}.delete({ where: { id } });` : "return { id };"}
  }
}
`);
  }

  if (isPrisma) {
    zip.file('prisma/schema.prisma', generatePrismaSchema(config));
    zip.file('src/prisma.service.ts', `import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
`);
  }
}

async function generateNextjsProject(zip: JSZip, config: ProjectConfig) {
  const { react: opts, models, name: projectName, stack } = config;
  const isFullStack = stack === 'nextjs' && (config as any).nextjsUsage === 'full-stack';

  // package.json
  const dependencies = buildDeps(opts);
  if (isFullStack) {
    dependencies['@prisma/client'] = 'latest';
  }

  zip.file('package.json', JSON.stringify({
    name: projectName,
    version: '0.1.0',
    private: true,
    scripts: { 
      dev: 'next dev', 
      build: 'next build', 
      start: 'next start',
      ...(isFullStack && { "prisma:generate": "prisma generate", "prisma:studio": "prisma studio" })
    },
    dependencies,
    devDependencies: {
      typescript: '^5.0.0',
      '@types/node': '^20.0.0',
      '@types/react': '^19.0.0',
      '@types/react-dom': '^19.0.0',
      ...(isFullStack && { prisma: 'latest' })
    },
  }, null, 2));

  // Prisma Schema (if fullstack)
  if (isFullStack) {
    zip.file('prisma/schema.prisma', generatePrismaSchema(config));
    zip.file('src/lib/prisma.ts', `import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
`);
  }

  // tsconfig.json
  zip.file('tsconfig.json', JSON.stringify({
    compilerOptions: {
      target: 'ES2017',
      lib: ['dom', 'dom.iterable', 'esnext'],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'bundler',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'react-jsx',
      incremental: true,
      paths: { '@/*': ['./src/*'] },
    },
    include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'],
    exclude: ['node_modules'],
  }, null, 2));

  // next.config.ts
  zip.file('next.config.ts', `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {};

export default nextConfig;
`);

  // tailwind
  if (opts.css === 'tailwind') {
    zip.file('tailwind.config.ts', `import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
};

export default config;
`);
    zip.file('postcss.config.mjs', `const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
`);
    zip.file('src/app/globals.css', `@import "tailwindcss";
`);
  } else {
    zip.file('src/app/globals.css', `* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; }
`);
  }

  // src/app/layout.tsx
  zip.file('src/app/layout.tsx', `import type { Metadata } from 'next';
${opts.css === 'tailwind' ? "import './globals.css';" : ''}

export const metadata: Metadata = {
  title: '${projectName}',
  description: 'Generated by Stack-Init',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`);

  // src/app/page.tsx
  const modelLinks = models
    .map((m) => {
      const slug = slugify(m.name);
      return `      <li><a href="/${slug}">${m.name}</a></li>`;
    })
    .join('\n');

  zip.file('src/app/page.tsx', `export default function Home() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>${projectName}</h1>
      <p>Generated by <a href="https://stackinit.dev">Stack-Init</a>. Start building!</p>
      <ul style={{ marginTop: '1rem' }}>
${modelLinks}
      </ul>
    </main>
  );
}
`);

  // Per-model TypeScript interfaces + pages
  for (const model of models) {
    const slug = slugify(model.name);
    const pages: ModelPages = { ...DEFAULT_PAGES, ...model.pages };

    // API Routes (if fullstack)
    if (isFullStack) {
      zip.file(`src/app/api/${slug}/route.ts`, generateApiRoute(model));
      zip.file(`src/app/api/${slug}/[id]/route.ts`, generateApiIdRoute(model));
    }

    // src/types/[ModelName].ts
    const fieldLines = model.fields
      .map((f) => `  ${f.name}${f.nullable ? '?' : ''}: ${f.values?.length ? f.values.map(v => `'${v}'`).join(' | ') : toTs(f.type)};`)
      .join('\n');
    zip.file(`src/types/${model.name}.ts`, `export interface ${model.name} {
  id: number;
${fieldLines}
  created_at: string;
  updated_at: string;
}
`);
  }
}

function generatePrismaSchema(config: ProjectConfig): string {
  const { models, stack } = config;
  let dbEngine = 'postgresql';
  
  if (stack === 'nestjs') dbEngine = config.nest?.db_engine || 'postgresql';
  else if (stack === 'express') dbEngine = (config as any).express?.db_engine || 'postgresql';
  else if (stack === 'nextjs') dbEngine = 'postgresql'; // Default for nextjs fullstack in this wizard

  let schema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${dbEngine === 'mongodb' ? 'mongodb' : dbEngine}"
  url      = env("DATABASE_URL")
}

`;

  for (const model of models) {
    schema += `model ${model.name} {\n`;
    schema += `  id ${model.migration?.primary_key === 'uuid' ? 'String @id @default(uuid())' : 'Int @id @default(autoincrement())'}\n`;
    
    for (const field of model.fields) {
      if (field.name === 'id') continue;
      let line = `  ${field.name} ${toPrismaType(field.type)}`;
      if (field.nullable) line += '?';
      if (field.unique) line += ' @unique';
      schema += `${line}\n`;
    }

    if (model.migration?.timestamps) {
      schema += `  created_at DateTime @default(now())\n`;
      schema += `  updated_at DateTime @updatedAt\n`;
    }
    schema += `}\n\n`;
  }

  return schema;
}

function toPrismaType(type: string): string {
  const map: Record<string, string> = {
    string: 'String', text: 'String', integer: 'Int', decimal: 'Decimal', boolean: 'Boolean',
    timestamp: 'DateTime', date: 'DateTime', uuid: 'String', json: 'Json'
  };
  return map[type] ?? 'String';
}

function generateApiRoute(model: Model): string {
  return `import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const items = await prisma.${model.name.toLowerCase()}.findMany();
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const data = await req.json();
  const item = await prisma.${model.name.toLowerCase()}.create({ data });
  return NextResponse.json(item);
}
`;
}

function generateApiIdRoute(model: Model): string {
  return `import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.${model.name.toLowerCase()}.findUnique({ where: { id } });
  return NextResponse.json(item);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  const item = await prisma.${model.name.toLowerCase()}.update({ where: { id }, data });
  return NextResponse.json(item);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.${model.name.toLowerCase()}.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
`;
}
