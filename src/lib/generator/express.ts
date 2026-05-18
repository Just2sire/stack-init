import JSZip from 'jszip';
import type { ProjectConfig } from '@stack-init/schema';
import { slugify, generatePrismaSchema, toTs } from './common';

export async function generateExpressProject(zip: JSZip, config: ProjectConfig) {
  const { models, name: projectName } = config;
  const opts = config.express || { architecture: 'mvc', database: 'prisma', db_engine: 'postgresql' } as any;
  const orm: string = opts.database || opts.orm || 'none';
  const architecture: string = opts.architecture || 'mvc';
  const useAuth = opts.auth === 'jwt';
  const useValidation = opts.validation === 'zod';
  const useSwagger = opts.swagger === true;
  const selectedMiddlewares: string[] = (opts.middlewares as string[] | undefined) ?? ['cors', 'morgan', 'error-handler'];

  const middlewareDeps: Record<string, Record<string, string>> = {
    cors:            { cors: '^2.8.5' },
    morgan:          { morgan: '^1.10.0' },
    helmet:          { helmet: '^8.0.0' },
    'rate-limit':    { 'express-rate-limit': '^7.0.0' },
    'cookie-parser': { 'cookie-parser': '^1.4.6' },
    compression:     { compression: '^1.7.4' },
    hpp:             { hpp: '^0.2.3' },
    'xss-clean':     { 'xss-clean': '^0.1.4' },
  };
  const middlewareDevDeps: Record<string, Record<string, string>> = {
    cors:            { '@types/cors': '^2.8.12' },
    morgan:          { '@types/morgan': '^1.9.0' },
    'cookie-parser': { '@types/cookie-parser': '^1.4.6' },
    compression:     { '@types/compression': '^1.7.5' },
    hpp:             { '@types/hpp': '^0.2.6' },
  };
  const extraDeps    = selectedMiddlewares.reduce((acc, m) => ({ ...acc, ...(middlewareDeps[m]    ?? {}) }), {} as Record<string, string>);
  const extraDevDeps = selectedMiddlewares.reduce((acc, m) => ({ ...acc, ...(middlewareDevDeps[m] ?? {}) }), {} as Record<string, string>);

  zip.file('package.json', JSON.stringify({
    name: projectName,
    version: '1.0.0',
    scripts: {
      dev: 'ts-node-dev --respawn src/index.ts',
      build: 'tsc',
      start: 'node dist/index.js',
      ...(orm === 'prisma'    && { 'prisma:generate': 'prisma generate', 'prisma:push': 'prisma db push' }),
      ...(orm === 'typeorm'   && { 'typeorm:migration:generate': 'ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:generate -n Migration', 'typeorm:migration:run': 'ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run' }),
    },
    dependencies: {
      express: '^5.1.0',
      dotenv: '^16.0.0',
      ...extraDeps,
      ...(orm === 'prisma'    && { '@prisma/client': '^6.8.0' }),
      ...(orm === 'mongoose'  && { mongoose: '^8.14.0' }),
      ...(orm === 'sequelize' && { sequelize: '^6.37.0', 'sequelize-typescript': '^2.1.6', 'reflect-metadata': '^0.2.2' }),
      ...(orm === 'typeorm'   && { typeorm: '^0.3.21', 'reflect-metadata': '^0.2.2' }),
      ...(opts.db_engine === 'postgresql' && (orm === 'sequelize' || orm === 'typeorm') && { pg: '^8.12.0', 'pg-hstore': '^2.3.4' }),
      ...(opts.db_engine === 'mysql'      && (orm === 'sequelize' || orm === 'typeorm') && { mysql2: '^3.10.0' }),
      ...(opts.db_engine === 'sqlite'     && (orm === 'sequelize' || orm === 'typeorm') && { 'better-sqlite3': '^11.0.0' }),
      ...(useAuth       && { jsonwebtoken: '^9.0.2', bcryptjs: '^2.4.3' }),
      ...(useValidation && { zod: '^3.24.0' }),
      ...(useSwagger    && { 'swagger-ui-express': '^5.0.0', 'swagger-jsdoc': '^6.2.8' }),
    },
    devDependencies: {
      typescript: '^5.8.3',
      '@types/express': '^5.0.0',
      '@types/node': '^22.15.3',
      'ts-node-dev': '^2.0.0',
      ...extraDevDeps,
      ...(orm === 'prisma'    && { prisma: '^6.8.0' }),
      ...(orm === 'sequelize' && { '@types/sequelize': '^4.28.20' }),
      ...(orm === 'typeorm'   && { 'tsconfig-paths': '^4.2.0' }),
      ...(opts.db_engine === 'sqlite' && (orm === 'sequelize' || orm === 'typeorm') && { '@types/better-sqlite3': '^7.6.11' }),
      ...(useAuth       && { '@types/jsonwebtoken': '^9.0.0', '@types/bcryptjs': '^2.4.6' }),
      ...(useSwagger    && { '@types/swagger-ui-express': '^4.1.6', '@types/swagger-jsdoc': '^6.0.4' }),
    },
  }, null, 2));

  zip.file('tsconfig.json', JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      module: 'commonjs',
      lib: ['esnext'],
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      forceConsistentCasingInFileNames: true,
      outDir: 'dist',
      rootDir: 'src',
      baseUrl: '.',
      paths: { '@/*': ['src/*'] },
    },
    include: ['src/**/*'],
  }, null, 2));

  zip.file('.gitignore', 'node_modules\ndist\n.env\n*.log');

  const defaultDbUrl = orm === 'mongoose'
    ? `mongodb://localhost:27017/${projectName}`
    : opts.db_engine === 'mysql'
    ? `mysql://user:password@localhost:3306/${projectName}`
    : opts.db_engine === 'sqlite'
    ? `file:./dev.db`
    : `postgresql://user:password@localhost:5432/${projectName}?schema=public`;

  zip.file('.env', `DATABASE_URL="${defaultDbUrl}"\nPORT=3000\nJWT_SECRET="stack-init-secret-change-me"`);

  // ── ORM setup files ──────────────────────────────────────────────────────────

  if (orm === 'sequelize') {
    const dialect = opts.db_engine === 'mysql' ? 'mysql' : opts.db_engine === 'sqlite' ? 'sqlite' : 'postgres';
    zip.file('src/lib/sequelize.ts', `import { Sequelize } from 'sequelize-typescript';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

export const sequelize = new Sequelize(process.env.DATABASE_URL!, {
  dialect: '${dialect}',
  models: [path.join(__dirname, '../models')],
  logging: false,
});
`);
  }

  if (orm === 'typeorm') {
    const driver = opts.db_engine === 'mysql' ? 'mysql' : opts.db_engine === 'sqlite' ? 'better-sqlite3' : 'postgres';
    const dbField = opts.db_engine === 'sqlite'
      ? `database: process.env.DATABASE_URL || 'dev.db',`
      : `url: process.env.DATABASE_URL,`;
    zip.file('src/lib/dataSource.ts', `import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: '${driver}',
  ${dbField}
  synchronize: process.env.NODE_ENV !== 'production',
  logging: false,
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../migrations/*{.ts,.js}'],
});
`);
  }

  // ── Middleware setup ─────────────────────────────────────────────────────────

  const mwImports: string[] = [];
  const mwUses: string[] = [];

  if (selectedMiddlewares.includes('cors'))          { mwImports.push(`import cors from 'cors';`);                  mwUses.push(`app.use(cors());`); }
  if (selectedMiddlewares.includes('morgan'))        { mwImports.push(`import morgan from 'morgan';`);              mwUses.push(`app.use(morgan('dev'));`); }
  if (selectedMiddlewares.includes('helmet'))        { mwImports.push(`import helmet from 'helmet';`);              mwUses.push(`app.use(helmet());`); }
  if (selectedMiddlewares.includes('rate-limit'))    { mwImports.push(`import rateLimit from 'express-rate-limit';`); mwUses.push(`app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));`); }
  if (selectedMiddlewares.includes('cookie-parser')) { mwImports.push(`import cookieParser from 'cookie-parser';`); mwUses.push(`app.use(cookieParser());`); }
  if (selectedMiddlewares.includes('compression'))   { mwImports.push(`import compression from 'compression';`);   mwUses.push(`app.use(compression());`); }
  if (selectedMiddlewares.includes('hpp'))           { mwImports.push(`import hpp from 'hpp';`);                   mwUses.push(`app.use(hpp());`); }
  if (selectedMiddlewares.includes('xss-clean'))     { mwImports.push(`import xss from 'xss-clean';`);             mwUses.push(`app.use(xss());`); }

  const swaggerSetup = useSwagger ? `
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
const swaggerSpec = swaggerJsdoc({ definition: { openapi: '3.0.0', info: { title: '${projectName} API', version: '1.0.0' } }, apis: ['./src/routes/*.ts'] });
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
` : '';

  const errorHandler = selectedMiddlewares.includes('error-handler') ? `
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error', ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) });
});` : '';

  const ormBootstrap = orm === 'mongoose'
    ? `mongoose.connect(process.env.DATABASE_URL!).then(() => console.log('✅ MongoDB connected')).catch(console.error);`
    : orm === 'sequelize'
    ? `sequelize.authenticate().then(() => console.log('✅ Sequelize connected')).catch(console.error);`
    : orm === 'typeorm'
    ? `AppDataSource.initialize().then(() => console.log('✅ TypeORM connected')).catch(console.error);`
    : '';

  const ormImports = orm === 'mongoose'
    ? `import mongoose from 'mongoose';`
    : orm === 'sequelize'
    ? `import { sequelize } from './lib/sequelize';`
    : orm === 'typeorm'
    ? `import 'reflect-metadata';\nimport { AppDataSource } from './lib/dataSource';`
    : '';

  // ── index.ts — architecture adapts import style ──────────────────────────────

  const routeImports = architecture === 'minimal'
    ? '' // routes inline
    : models.map(m => `import ${m.name.toLowerCase()}Routes from './routes/${slugify(m.name)}';`).join('\n');

  zip.file('src/index.ts', `import express from 'express';
${mwImports.join('\n')}
import dotenv from 'dotenv';
${ormImports}
${routeImports}

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

${mwUses.join('\n')}
app.use(express.json());
${swaggerSetup}
${ormBootstrap}

${architecture === 'minimal'
  ? models.map(m => {
      const slug = slugify(m.name);
      const mLow = m.name.toLowerCase();
      return `
// ── ${m.name} ────────────────────────────────────────────────
app.get('/api/${slug}', async (req, res) => { res.json([]); });
app.get('/api/${slug}/:id', async (req, res) => { res.json({ id: req.params.id }); });
app.post('/api/${slug}', async (req, res) => { res.status(201).json({ ...req.body, id: Date.now() }); });
app.put('/api/${slug}/:id', async (req, res) => { res.json({ id: req.params.id, ...req.body }); });
app.delete('/api/${slug}/:id', async (req, res) => { res.status(204).send(); });`;
    }).join('\n')
  : models.map(m => `app.use('/api/${slugify(m.name)}', ${m.name.toLowerCase()}Routes);`).join('\n')
}

app.get('/', (req, res) => { res.json({ message: 'Welcome to ${projectName} API' }); });
${errorHandler}
app.listen(port, () => {
  console.log(\`🚀 Server running at http://localhost:\${port}\`);
  ${useSwagger ? "console.log(`📖 Swagger: http://localhost:${port}/api-docs`);" : ''}
});
`);

  // ── Auth + Validation middlewares ────────────────────────────────────────────

  if (useAuth) {
    zip.file('src/middlewares/auth.ts', `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
`);
  }

  if (useValidation) {
    zip.file('src/middlewares/validate.ts', `import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

export const validate = (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await schema.parseAsync({ body: req.body, query: req.query, params: req.params });
    return next();
  } catch (error: any) {
    return res.status(400).json(error.errors);
  }
};
`);
  }

  // ── Per-model files ──────────────────────────────────────────────────────────

  if (architecture === 'minimal') return; // routes inline — no separate files needed

  for (const model of models) {
    const slug  = slugify(model.name);
    const mLow  = model.name.toLowerCase();
    const gen   = model.generate ?? {};

    // Zod schema
    if (useValidation) {
      const zodFields = model.fields.map(f => {
        let line = `  ${f.name}: z.`;
        switch (f.type) {
          case 'integer': case 'bigInteger': case 'float': case 'double': case 'decimal': line += 'number()'; break;
          case 'boolean': line += 'boolean()'; break;
          default: line += 'string()';
        }
        if (f.nullable) line += '.optional()';
        return line + ',';
      }).join('\n');

      zip.file(`src/validations/${model.name}Schema.ts`, `import { z } from 'zod';

export const create${model.name}Schema = z.object({
  body: z.object({
${zodFields}
  }),
});

export const update${model.name}Schema = z.object({
  body: z.object({
${zodFields.replace(/number\(\)/g, 'number().optional()').replace(/string\(\)/g, 'string().optional()').replace(/boolean\(\)/g, 'boolean().optional()')}
  }),
});
`);
    }

    // Routes
    if (gen.routes !== false) {
      const validationImports = useValidation
        ? `import { validate } from '../middlewares/validate';\nimport { create${model.name}Schema, update${model.name}Schema } from '../validations/${model.name}Schema';`
        : '';
      const validationArgs = (s: string) => useValidation ? `, validate(${s})` : '';
      const authArg = useAuth ? 'authMiddleware, ' : '';

      zip.file(`src/routes/${slug}.ts`, `import { Router } from 'express';
import * as controller from '../controllers/${model.name}Controller';
${validationImports}
${useAuth ? "import { authMiddleware } from '../middlewares/auth';" : ''}

const router = Router();

/**
 * @openapi
 * /api/${slug}:
 *   get:
 *     summary: Retrieve all ${model.name}s
 *   post:
 *     summary: Create a ${model.name}
 */
router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', ${authArg}${validationArgs(`create${model.name}Schema`)}controller.create);
router.put('/:id', ${authArg}${validationArgs(`update${model.name}Schema`)}controller.update);
router.delete('/:id', ${authArg}controller.remove);

export default router;
`);
    }

    // Service (layered architecture)
    if (architecture === 'layered' && gen.controller !== false) {
      zip.file(`src/services/${model.name}Service.ts`, generateExpressService(model.name, mLow, orm));
    }

    // Controller
    if (gen.controller !== false) {
      zip.file(`src/controllers/${model.name}Controller.ts`, generateExpressController(model.name, mLow, orm, architecture));
    }

    // ORM-specific model files
    if (orm === 'mongoose') {
      const mongooseFields = model.fields.map(f => {
        let type = 'String';
        switch (f.type) {
          case 'integer': case 'float': case 'double': case 'decimal': case 'bigInteger': type = 'Number'; break;
          case 'boolean': type = 'Boolean'; break;
          case 'date': case 'dateTime': case 'timestamp': type = 'Date'; break;
          case 'json': case 'jsonb': type = 'Schema.Types.Mixed'; break;
        }
        return `  ${f.name}: { type: ${type}, required: ${!f.nullable}${f.unique ? ', unique: true' : ''} },`;
      }).join('\n');

      zip.file(`src/models/${model.name}.ts`, `import mongoose, { Schema, Document } from 'mongoose';

export interface I${model.name} extends Document {
${model.fields.map(f => `  ${f.name}: ${toTs(f.type)};`).join('\n')}
}

const ${model.name}Schema = new Schema({
${mongooseFields}
}, { timestamps: ${!!model.migration?.timestamps} });

export const ${model.name} = mongoose.model<I${model.name}>('${model.name}', ${model.name}Schema);
`);
    }

    if (orm === 'sequelize') {
      const seqFields = model.fields.map(f => {
        let dType = 'DataTypes.STRING';
        switch (f.type) {
          case 'integer': case 'tinyInteger': case 'smallInteger': dType = 'DataTypes.INTEGER'; break;
          case 'bigInteger': dType = 'DataTypes.BIGINT'; break;
          case 'float': case 'double': dType = 'DataTypes.FLOAT'; break;
          case 'decimal': dType = 'DataTypes.DECIMAL'; break;
          case 'boolean': dType = 'DataTypes.BOOLEAN'; break;
          case 'date': case 'dateTime': case 'timestamp': dType = 'DataTypes.DATE'; break;
          case 'text': case 'longText': dType = 'DataTypes.TEXT'; break;
          case 'json': case 'jsonb': dType = 'DataTypes.JSON'; break;
          case 'uuid': dType = 'DataTypes.UUID'; break;
        }
        return `  @Column({ type: ${dType}, allowNull: ${!!f.nullable}${f.unique ? ', unique: true' : ''} })\n  ${f.name}!: ${toTs(f.type)};`;
      }).join('\n\n');

      zip.file(`src/models/${model.name}.ts`, `import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table({ tableName: '${model.table || mLow}s' })
export class ${model.name} extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id!: number;

${seqFields}
${model.migration?.timestamps ? `
  @CreatedAt
  created_at!: Date;

  @UpdatedAt
  updated_at!: Date;` : ''}
}
`);
    }

    if (orm === 'typeorm') {
      const typeormFields = model.fields.map(f => {
        let colType = 'varchar';
        switch (f.type) {
          case 'integer': case 'tinyInteger': case 'smallInteger': colType = 'int'; break;
          case 'bigInteger': colType = 'bigint'; break;
          case 'float': case 'double': colType = 'float'; break;
          case 'decimal': colType = 'decimal'; break;
          case 'boolean': colType = 'boolean'; break;
          case 'date': colType = 'date'; break;
          case 'dateTime': case 'timestamp': colType = 'timestamp'; break;
          case 'text': case 'longText': colType = 'text'; break;
          case 'json': case 'jsonb': colType = 'json'; break;
          case 'uuid': colType = 'uuid'; break;
        }
        const opts2 = [`type: '${colType}'`, f.nullable ? 'nullable: true' : 'nullable: false', f.unique ? 'unique: true' : ''].filter(Boolean).join(', ');
        return `  @Column({ ${opts2} })\n  ${f.name}${f.nullable ? '?' : '!'}: ${toTs(f.type)};`;
      }).join('\n\n');

      zip.file(`src/entities/${model.name}.entity.ts`, `import { Entity, PrimaryGeneratedColumn, Column${model.migration?.timestamps ? ', CreateDateColumn, UpdateDateColumn' : ''} } from 'typeorm';

@Entity('${model.table || mLow}s')
export class ${model.name} {
  @PrimaryGeneratedColumn()
  id!: number;

${typeormFields}
${model.migration?.timestamps ? `
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;` : ''}
}
`);
    }
  }

  // ── ORM schema / datasource files ────────────────────────────────────────────

  if (orm === 'prisma') {
    zip.file('prisma/schema.prisma', generatePrismaSchema(config));
    zip.file('src/lib/prisma.ts', `import { PrismaClient } from '@prisma/client';\nexport const prisma = new PrismaClient();\n`);
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateExpressService(modelName: string, mLow: string, orm: string): string {
  return `import { prisma } from '../lib/prisma';

export const ${modelName}Service = {
  findAll: async () => {
    ${orm === 'prisma' ? `return prisma.${mLow}.findMany();` : 'return [];'}
  },
  findOne: async (id: number) => {
    ${orm === 'prisma' ? `return prisma.${mLow}.findUnique({ where: { id } });` : 'return null;'}
  },
  create: async (data: any) => {
    ${orm === 'prisma' ? `return prisma.${mLow}.create({ data });` : 'return { id: Date.now(), ...data };'}
  },
  update: async (id: number, data: any) => {
    ${orm === 'prisma' ? `return prisma.${mLow}.update({ where: { id }, data });` : 'return { id, ...data };'}
  },
  remove: async (id: number) => {
    ${orm === 'prisma' ? `return prisma.${mLow}.delete({ where: { id } });` : 'return { id };'}
  },
};
`;
}

function generateExpressController(modelName: string, mLow: string, orm: string, architecture: string): string {
  const useService = architecture === 'layered';
  const serviceImport = useService ? `import { ${modelName}Service } from '../services/${modelName}Service';` : '';
  const prismaImport  = !useService && orm === 'prisma'   ? `import { prisma } from '../lib/prisma';`           : '';
  const mongoImport   = !useService && orm === 'mongoose'  ? `import { ${modelName} } from '../models/${modelName}';` : '';
  const seqImport     = !useService && orm === 'sequelize' ? `import { ${modelName} } from '../models/${modelName}';` : '';
  const typeImport    = !useService && orm === 'typeorm'   ? `import { AppDataSource } from '../lib/dataSource';\nimport { ${modelName} } from '../entities/${modelName}.entity';` : '';

  const repo = orm === 'typeorm' && !useService ? `const repo = AppDataSource.getRepository(${modelName});` : '';

  const getAll = useService
    ? `return ${modelName}Service.findAll();`
    : orm === 'prisma'    ? `return prisma.${mLow}.findMany();`
    : orm === 'mongoose'  ? `return ${modelName}.find();`
    : orm === 'sequelize' ? `return ${modelName}.findAll();`
    : orm === 'typeorm'   ? `${repo}\n    return repo.find();`
    : `return [];`;

  const getOne = useService
    ? `return ${modelName}Service.findOne(Number(id));`
    : orm === 'prisma'    ? `return prisma.${mLow}.findUnique({ where: { id: Number(id) } });`
    : orm === 'mongoose'  ? `return ${modelName}.findById(id);`
    : orm === 'sequelize' ? `return ${modelName}.findByPk(Number(id));`
    : orm === 'typeorm'   ? `${repo}\n    return repo.findOne({ where: { id: Number(id) } });`
    : `return null;`;

  const create = useService
    ? `return ${modelName}Service.create(req.body);`
    : orm === 'prisma'    ? `return prisma.${mLow}.create({ data: req.body });`
    : orm === 'mongoose'  ? `return ${modelName}.create(req.body);`
    : orm === 'sequelize' ? `return ${modelName}.create(req.body);`
    : orm === 'typeorm'   ? `${repo}\n    return repo.save(repo.create(req.body));`
    : `return { ...req.body, id: Date.now() };`;

  const update = useService
    ? `return ${modelName}Service.update(Number(id), req.body);`
    : orm === 'prisma'    ? `return prisma.${mLow}.update({ where: { id: Number(id) }, data: req.body });`
    : orm === 'mongoose'  ? `return ${modelName}.findByIdAndUpdate(id, req.body, { new: true });`
    : orm === 'sequelize' ? `await ${modelName}.update(req.body, { where: { id: Number(id) } });\n    return ${modelName}.findByPk(Number(id));`
    : orm === 'typeorm'   ? `${repo}\n    await repo.update(Number(id), req.body);\n    return repo.findOne({ where: { id: Number(id) } });`
    : `return { id, ...req.body };`;

  const remove = useService
    ? `await ${modelName}Service.remove(Number(id));`
    : orm === 'prisma'    ? `await prisma.${mLow}.delete({ where: { id: Number(id) } });`
    : orm === 'mongoose'  ? `await ${modelName}.findByIdAndDelete(id);`
    : orm === 'sequelize' ? `await ${modelName}.destroy({ where: { id: Number(id) } });`
    : orm === 'typeorm'   ? `${repo}\n    await repo.delete(Number(id));`
    : '';

  return `import { Request, Response } from 'express';
${serviceImport}${prismaImport}${mongoImport}${seqImport}${typeImport}

export const getAll = async (req: Request, res: Response) => {
  try {
    const items = await (async () => { ${getAll} })();
    res.json(items);
  } catch { res.status(500).json({ error: 'Failed to fetch ${mLow}s' }); }
};

export const getOne = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await (async () => { ${getOne} })();
    if (!item) return res.status(404).json({ error: '${modelName} not found' });
    res.json(item);
  } catch { res.status(500).json({ error: 'Failed to fetch ${mLow}' }); }
};

export const create = async (req: Request, res: Response) => {
  try {
    const item = await (async () => { ${create} })();
    res.status(201).json(item);
  } catch { res.status(400).json({ error: 'Failed to create ${mLow}' }); }
};

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await (async () => { ${update} })();
    res.json(item);
  } catch { res.status(400).json({ error: 'Failed to update ${mLow}' }); }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await (async () => { ${remove} })();
    res.status(204).send();
  } catch { res.status(500).json({ error: 'Failed to delete ${mLow}' }); }
};
`;
}
