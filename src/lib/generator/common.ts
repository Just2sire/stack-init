import type { ProjectConfig, Model, ReactOptions } from '@stack-init/schema';

// "BlogPost" → "blog-posts"
export function slugify(name: string): string {
  const s = name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
  
  if (s.endsWith('s')) return s + 'es'; // address -> addresses
  if (s.endsWith('y')) return s.slice(0, -1) + 'ies'; // category -> categories
  return s + 's';
}

export function toTs(fieldType: string): string {
  const map: Record<string, string> = {
    // Texte
    string: 'string', char: 'string', tinyText: 'string', text: 'string',
    mediumText: 'string', longText: 'string', enum: 'string', set: 'string[]',
    uuid: 'string', ulid: 'string', ipAddress: 'string', macAddress: 'string',
    
    // Nombres
    tinyInteger: 'number', smallInteger: 'number', mediumInteger: 'number',
    integer: 'number', bigInteger: 'number',
    unsignedTinyInteger: 'number', unsignedSmallInteger: 'number',
    unsignedInteger: 'number', unsignedBigInteger: 'number',
    float: 'number', double: 'number', decimal: 'number', year: 'number',
    
    // Date & Temps
    date: 'Date', dateTime: 'Date', dateTimeTz: 'Date',
    time: 'string', timeTz: 'string',
    timestamp: 'Date', timestampTz: 'Date',
    
    // Bool & Binaire
    boolean: 'boolean', binary: 'Buffer',
    tinyBlob: 'Buffer', blob: 'Buffer', mediumBlob: 'Buffer', longBlob: 'Buffer',
    
    // Relations / Clés
    id: 'number', foreignId: 'number', foreignUuid: 'string', foreignUlid: 'string',
    
    // Spéciaux
    json: 'any', jsonb: 'any',
    geometry: 'any', geography: 'any', point: 'any', lineString: 'any', polygon: 'any', vector: 'number[]',
    rememberToken: 'string',
  };
  return map[fieldType] ?? 'any';
}

export function toPrismaType(type: string): string {
  const map: Record<string, string> = {
    // Texte
    string: 'String', char: 'String', tinyText: 'String', text: 'String',
    mediumText: 'String', longText: 'String', set: 'String',
    uuid: 'String', ulid: 'String', ipAddress: 'String', macAddress: 'String',
    rememberToken: 'String',
    // Enums — placeholder pour logique custom
    enum: 'ENUM',
    // Entiers signés
    tinyInteger: 'Int', smallInteger: 'Int', mediumInteger: 'Int', integer: 'Int',
    bigInteger: 'BigInt', year: 'Int',
    // Entiers non-signés
    unsignedTinyInteger: 'Int', unsignedSmallInteger: 'Int',
    unsignedInteger: 'Int', unsignedBigInteger: 'BigInt',
    // Flottants
    float: 'Float', double: 'Float', decimal: 'Decimal',
    // Booléen
    boolean: 'Boolean',
    // Dates
    date: 'DateTime', dateTime: 'DateTime', dateTimeTz: 'DateTime',
    timestamp: 'DateTime', timestampTz: 'DateTime',
    time: 'String', timeTz: 'String',
    // JSON
    json: 'Json', jsonb: 'Json',
    // Binaire
    binary: 'Bytes', tinyBlob: 'Bytes', blob: 'Bytes', mediumBlob: 'Bytes', longBlob: 'Bytes',
    // Géométrie — stocké en String (Prisma n'a pas de type natif)
    geometry: 'String', geography: 'String', point: 'String',
    lineString: 'String', polygon: 'String',
    // Vecteur — stocké en String (extension pgvector à configurer manuellement)
    vector: 'String',
    // Clés étrangères
    foreignId: 'Int', foreignUuid: 'String', foreignUlid: 'String',
  };
  return map[type] ?? 'String';
}

export function buildDeps(opts: ReactOptions): Record<string, string> {
  const deps: Record<string, string> = {
    next: '^15.3.1',
    react: '^19.1.0',
    'react-dom': '^19.1.0',
  };
  if (opts.state_lib === 'zustand')        { deps.zustand = '^5.0.3'; }
  if (opts.state_lib === 'redux-toolkit')  { deps['@reduxjs/toolkit'] = '^2.5.0'; deps['react-redux'] = '^9.2.0'; }
  if (opts.state_lib === 'jotai')          { deps.jotai = '^2.11.0'; }
  if (opts.form_lib === 'react-hook-form') { deps['react-hook-form'] = '^7.54.2'; }
  if (opts.form_lib === 'formik')          { deps.formik = '^2.0.0'; }
  if (opts.form_lib === 'zod')             { deps['react-hook-form'] = '^7.54.2'; deps.zod = '^3.23.4'; deps['@hookform/resolvers'] = '^3.9.0'; }
  if (opts.http_lib === 'axios')           { deps.axios = '^1.8.4'; }
  if (opts.http_lib === 'ky')              { deps.ky = '^1.7.2'; }
  if (opts.data_fetching === 'tanstack-query') { deps['@tanstack/react-query'] = '^5.65.0'; }
  if (opts.data_fetching === 'swr')            { deps.swr = '^2.2.5'; }
  if (opts.ui_lib === 'shadcn')            {
    deps['@radix-ui/react-slot'] = '^1.2.0';
    deps['class-variance-authority'] = '^0.7.0';
    deps.clsx = '^2.0.0';
    deps['tailwind-merge'] = '^3.2.0';
    deps['lucide-react'] = '^0.511.0';
  }
  if (opts.ui_lib === 'mui')               {
    deps['@mui/material'] = '^6.4.11';
    deps['@emotion/react'] = '^11.14.0';
    deps['@emotion/styled'] = '^11.14.0';
    deps['@mui/icons-material'] = '^6.4.11';
  }
  if (opts.ui_lib === 'antd')              { deps.antd = '^5.24.3'; deps['@ant-design/icons'] = '^5.6.1'; }
  if (opts.css === 'tailwind')             {
    deps.tailwindcss = '^4.1.4';
    deps['@tailwindcss/postcss'] = '^4.1.4';
  }
  return deps;
}

export function generateCommonReadme(config: ProjectConfig): string {
  const { name, stack, models, react, express, nestjs, fastapi } = config;
  const today = new Date().toLocaleDateString('en-GB');

  // ── Stack table ──
  let stackTable = `| Layer | Choice |\n|-------|--------|\n`;
  if (stack.includes('laravel')) stackTable += `| Backend | Laravel 11 |\n`;
  if (stack.includes('express')) stackTable += `| Backend | Express 5 (Node.js) |\n| Architecture | ${express?.architecture || 'MVC'} |\n| ORM | ${express?.orm || 'Prisma'} |\n`;
  if (stack.includes('nestjs'))  stackTable += `| Backend | NestJS 11 |\n| Architecture | ${nestjs?.architecture || 'Modular'} |\n| ORM | ${nestjs?.orm || 'TypeORM'} |\n`;
  if (stack.includes('fastapi')) stackTable += `| Backend | FastAPI (Python) |\n| ORM | ${fastapi?.orm || 'SQLModel'} |\n`;
  if (react) stackTable += `| Frontend | Next.js 15 / React 19 |\n| UI Lib | ${react.ui_lib || 'none'} |\n| State | ${react.state_lib || 'none'} |\n| Forms | ${react.form_lib || 'none'} |\n`;

  // ── Data models ──
  const modelList = models.map(m => {
    const fields = m.fields.map(f => `    - \`${f.name}\`: ${f.type}${f.nullable ? ' (optional)' : ''}`).join('\n');
    return `- **${m.name}**\n${fields}`;
  }).join('\n');

  // ── DB engine / ORM detection ──
  const dbEngine = express?.db_engine || nestjs?.db_engine || (fastapi as any)?.db_engine || 'postgresql';
  const orm = express?.orm || nestjs?.orm || fastapi?.orm || 'prisma';

  const dbUrlExample = dbEngine === 'mysql'
    ? `mysql://user:password@localhost:3306/${name}`
    : dbEngine === 'sqlite' ? `file:./dev.db`
    : dbEngine === 'mongodb' ? `mongodb://localhost:27017/${name}`
    : `postgresql://user:password@localhost:5432/${name}`;

  const dockerCmd = dbEngine === 'postgresql'
    ? `docker run --name ${name}-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:17`
    : dbEngine === 'mysql'
    ? `docker run --name ${name}-db -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=${name} -p 3306:3306 -d mysql:9`
    : dbEngine === 'mongodb'
    ? `docker run --name ${name}-db -p 27017:27017 -d mongo:8`
    : null;

  // ── ORM init command ──
  const ormInitStep = orm === 'drizzle'
    ? '```bash\nnpm run db:generate\nnpm run db:migrate\n```'
    : orm === 'typeorm'
    ? '```bash\nnpm run typeorm:migration:run\n```'
    : orm === 'mongoose' || dbEngine === 'mongodb'
    ? '_MongoDB — no migration step needed, collections are auto-created._'
    : orm === 'none'
    ? '_No ORM configured._'
    : '```bash\nnpx prisma generate\nnpx prisma db push\n```';

  // ── Available scripts (Node.js) ──
  const isNest = stack.includes('nestjs');
  const isNextFullStack = stack === 'nextjs' && config.nextjsUsage === 'full-stack';
  const devCmd = isNest ? '`npm run start:dev`' : '`npm run dev`';
  let scriptsRows = `| Command | Description |\n|---------|-------------|\n`;
  scriptsRows += `| ${devCmd} | Start dev server with hot reload |\n`;
  scriptsRows += `| \`npm run build\` | Compile for production |\n`;
  scriptsRows += `| \`npm start\` | Run production build |\n`;
  if (orm === 'prisma' || isNextFullStack) {
    scriptsRows += `| \`npm run prisma:generate\` | Regenerate Prisma client |\n`;
    scriptsRows += `| \`npm run prisma:push\` | Push schema to database |\n`;
  }
  if (orm === 'drizzle') {
    scriptsRows += `| \`npm run db:generate\` | Generate Drizzle migrations |\n`;
    scriptsRows += `| \`npm run db:migrate\` | Apply Drizzle migrations |\n`;
  }
  if (isNextFullStack) {
    scriptsRows += `| \`npm run db:seed\` | Seed sample data |\n`;
    scriptsRows += `| \`npm run prisma:studio\` | Open Prisma Studio GUI |\n`;
  }

  // ── Environment variables table ──
  let envRows = `| Variable | Description | Example |\n|----------|-------------|--------|\n`;
  if (dbEngine !== 'none') envRows += `| \`DATABASE_URL\` | Database connection string | \`${dbUrlExample}\` |\n`;
  if (stack.includes('express') || stack.includes('nestjs')) {
    envRows += `| \`JWT_SECRET\` | JWT signing secret | \`change-me\` |\n`;
    envRows += `| \`PORT\` | Server port | \`3000\` |\n`;
  }
  if (stack.includes('fastapi')) {
    envRows += `| \`SECRET_KEY\` | JWT / session signing secret | \`change-me\` |\n`;
    envRows += `| \`API_KEY\` | API key for api-key auth | \`change-me\` |\n`;
  }

  // ── Project structure ──
  const projectStructure = stack.includes('fastapi') ? `\`\`\`
app/
├── routers/        # FastAPI routers per resource
├── models/         # ORM models + Pydantic schemas
├── database.py     # DB connection setup
└── main.py         # FastAPI app entrypoint
\`\`\`` : stack.includes('express') ? `\`\`\`
src/
├── controllers/    # Business logic per resource
├── routes/         # API endpoint definitions
├── lib/            # Clients (Prisma, etc.)
└── index.ts        # Entry point
\`\`\`` : stack.includes('nestjs') ? `\`\`\`
src/
├── [module]/       # Folders per resource (Controller, Service, Module)
├── app.module.ts   # Global orchestration
└── main.ts         # Bootstrap
\`\`\`` : `\`\`\`
src/
├── app/            # Next.js routes and API Routes
├── components/     # UI components
├── lib/            # Utilities and clients
└── types/          # TypeScript interfaces
\`\`\``;

  // ── Mixed stack detection ──
  const isMixed = react && (stack.includes('express') || stack.includes('nestjs') || stack.includes('fastapi'));
  const isFastAPIStack = stack.includes('fastapi');
  const frontendPort = isFastAPIStack ? 3000 : 3001;
  const backendPort  = isFastAPIStack ? 8000 : 3000;

  const sections: string[] = [];

  sections.push(`# ${name}\n\nGenerated by **Stack-Init** on ${today}.`);

  // ── Dev scripts notice (mixed stacks only) ──
  if (isMixed) {
    sections.push(
`## One-command setup

This is a **full-stack project** with a \`backend/\` and a \`frontend/\` folder.
Use the included scripts to install all dependencies and start both services at once:

| Platform | Command |
|----------|---------|
| macOS / Linux | \`chmod +x dev.sh && ./dev.sh\` |
| Windows | Double-click \`dev.bat\` or run it in a terminal |

Once started:
- **Backend** → http://localhost:${backendPort}${isFastAPIStack ? ' · Swagger: http://localhost:' + backendPort + '/docs' : ''}
- **Frontend** → http://localhost:${frontendPort}

> The scripts install dependencies on first run, then start both services.
> Subsequent runs skip reinstallation and go straight to starting the servers.`
    );
  }

  // ── FastAPI-specific quick start ──
  if (stack.includes('fastapi')) {
    const fastapiPrereqs = `## Prerequisites\n\n- Python >= 3.12\n- ${dbEngine === 'sqlite' ? 'SQLite (built-in)' : dbEngine + ' running locally or via Docker'}`;
    sections.push(fastapiPrereqs);

    let fastapiStart = `## Quick Start\n\n`;
    fastapiStart += `### 1. Create virtual environment\n\`\`\`bash\npython -m venv .venv\nsource .venv/bin/activate  # Windows: .venv\\Scripts\\activate\n\`\`\`\n\n`;
    fastapiStart += `### 2. Install dependencies\n\`\`\`bash\npip install -r requirements.txt\n\`\`\`\n\n`;
    fastapiStart += `### 3. Set up environment\n\`\`\`bash\ncp .env.example .env\n# Edit .env — set DATABASE_URL and other secrets\n\`\`\`\n\n`;
    if (dockerCmd) {
      fastapiStart += `### 4. Start database (Docker — optional)\n\`\`\`bash\n${dockerCmd}\n\`\`\`\n\n`;
      fastapiStart += `### 5. Initialize database\n\`\`\`bash\nalembic upgrade head\n\`\`\`\n\n`;
      fastapiStart += `### 6. Run development server\n\`\`\`bash\nuvicorn app.main:app --reload\n\`\`\``;
    } else {
      fastapiStart += `### 4. Run development server\n\`\`\`bash\nuvicorn app.main:app --reload\n\`\`\``;
    }
    sections.push(fastapiStart);

    sections.push(`## API Documentation\n\n- Swagger UI: http://localhost:8000/docs\n- ReDoc: http://localhost:8000/redoc`);
  }

  // ── Node.js quick start (express / nestjs / nextjs / mixed) ──
  if (stack.includes('express') || stack.includes('nestjs') || stack.includes('nextjs') || react) {
    if (!stack.includes('fastapi')) {
      sections.push(`## Prerequisites\n\n- Node.js >= 22\n- ${dbEngine === 'sqlite' ? 'SQLite (built-in)' : dbEngine + ' running locally or via Docker'}`);
    }

    let nodeStart = `## Quick Start\n\n`;
    nodeStart += `### 1. Install dependencies\n\`\`\`bash\nnpm install\n\`\`\`\n\n`;
    nodeStart += `### 2. Set up environment\n\`\`\`bash\ncp .env.example .env\n# Edit .env — set DATABASE_URL and other secrets\n\`\`\`\n\n`;
    if (dockerCmd && !stack.includes('fastapi')) {
      nodeStart += `### 3. Start database (Docker — optional)\n\`\`\`bash\n${dockerCmd}\n\`\`\`\n\n`;
      nodeStart += `### 4. Initialize database\n${ormInitStep}\n\n`;
      if (isNextFullStack) {
        nodeStart += `### 5. Seed sample data (optional)\n\`\`\`bash\nnpm run db:seed\n\`\`\`\n\n`;
        nodeStart += `### 6. Run development server\n\`\`\`bash\n${isNest ? 'npm run start:dev' : 'npm run dev'}\n\`\`\``;
      } else {
        nodeStart += `### 5. Run development server\n\`\`\`bash\n${isNest ? 'npm run start:dev' : 'npm run dev'}\n\`\`\``;
      }
    } else {
      nodeStart += `### 3. Initialize database\n${ormInitStep}\n\n`;
      nodeStart += `### 4. Run development server\n\`\`\`bash\n${isNest ? 'npm run start:dev' : 'npm run dev'}\n\`\`\``;
    }
    sections.push(nodeStart);

    sections.push(`## Available Scripts\n\n${scriptsRows}`);

    if (stack.includes('nestjs') && stack.includes('express') === false) {
      sections.push(`## API Documentation\n\n- Swagger UI: http://localhost:3000/api/docs`);
    }
  }

  sections.push(`## Environment Variables\n\n${envRows}`);
  sections.push(`## Architecture & Stack\n\n${stackTable}`);
  sections.push(`## Data Models\n\n${modelList}`);
  sections.push(`## Project Structure\n\n${projectStructure}`);
  sections.push(`---\nGenerated by [Stack-Init](https://stackinit.dev) — Scaffold faster, ship sooner.`);

  return sections.join('\n\n');
}

export function generatePrismaSchema(config: ProjectConfig): string {
  const { models, stack } = config;
  let dbEngine = 'postgresql';
  
  if (stack === 'nestjs') dbEngine = config.nestjs?.db_engine || 'postgresql';
  else if (stack === 'express') dbEngine = (config as any).express?.db_engine || 'postgresql';
  else if (stack === 'nextjs') dbEngine = 'postgresql';

  let schema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${dbEngine === 'mongodb' ? 'mongodb' : dbEngine}"
  url      = env("DATABASE_URL")
}

`;

  // Collect enums
  const enums = new Map<string, string[]>();
  for (const model of models) {
    for (const field of model.fields) {
      if (field.type === 'enum' && field.values) {
        const enumName = `${model.name}${field.name.charAt(0).toUpperCase()}${field.name.slice(1)}`;
        enums.set(enumName, field.values);
      }
    }
  }

  // Write enums
  for (const [name, values] of enums) {
    schema += `enum ${name} {\n${values.map(v => `  ${v}`).join('\n')}\n}\n\n`;
  }

  // Map model names to their PK type
  const modelPkTypes = new Map<string, string>();
  for (const model of models) {
    modelPkTypes.set(model.name, model.migration?.primary_key === 'uuid' ? 'String' : 'Int');
  }

  for (const model of models) {
    schema += `model ${model.name} {\n`;
    
    // Primary Key
    const pkType = model.migration?.primary_key || 'id';
    if (pkType === 'uuid') {
      schema += `  id String @id @default(uuid())\n`;
    } else if (pkType === 'ulid') {
      schema += `  id String @id @default(cuid())\n`; // CUID as ULID proxy in Prisma
    } else {
      schema += `  id Int @id @default(autoincrement())\n`;
    }
    
    // Scalar fields
    for (const field of model.fields) {
      if (field.name === 'id') continue;
      
      let typeStr = toPrismaType(field.type);
      if (field.type === 'enum') {
        typeStr = `${model.name}${field.name.charAt(0).toUpperCase()}${field.name.slice(1)}`;
      }

      let line = `  ${field.name} ${typeStr}`;
      if (field.nullable) line += '?';
      
      // Modifiers
      if (field.unique) line += ' @unique';
      if (field.default !== undefined) {
        if (typeof field.default === 'string') line += ` @default("${field.default}")`;
        else line += ` @default(${field.default})`;
      }
      
      schema += `${line}\n`;
    }

    // Relations
    for (const rel of model.relations || []) {
      const targetModel = rel.model;
      const relName = rel.model.toLowerCase();
      const targetPkType = modelPkTypes.get(targetModel) || 'Int';

      if (rel.type === 'belongsTo' || rel.type === 'hasOne') {
        const fkField = rel.foreign_key || `${relName}Id`;
        const localKey = rel.local_key || 'id';

        // Add the relation field
        schema += `  ${relName} ${targetModel}${rel.type === 'belongsTo' ? '' : '?'} @relation(fields: [${fkField}], references: [${localKey}])\n`;

        // Add the scalar FK field if not already present
        const alreadyHasFk = model.fields.some(f => f.name === fkField);
        if (!alreadyHasFk) {
          schema += `  ${fkField} ${targetPkType}${rel.type === 'belongsTo' ? '' : '?'}\n`;
        }
      } else if (rel.type === 'hasMany' || rel.type === 'belongsToMany') {
        schema += `  ${slugify(targetModel)} ${targetModel}[]\n`;
      }
    }

    // Indices
    for (const field of model.fields) {
      if (field.index && !field.unique) {
        schema += `  @@index([${field.name}])\n`;
      }
    }

    // Timestamps
    if (model.migration?.timestamps) {
      schema += `  createdAt DateTime @default(now())\n`;
      schema += `  updatedAt DateTime @updatedAt\n`;
    }

    // Soft Delete
    if (model.migration?.softDeletes || model.generate?.softDelete) {
      schema += `  deletedAt DateTime?\n`;
    }

    // Table mapping
    if (model.table) {
      schema += `  @@map("${model.table}")\n`;
    }

    schema += `}\n\n`;
  }

  return schema;
}

