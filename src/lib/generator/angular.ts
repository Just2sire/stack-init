import JSZip from 'jszip';
import type { ProjectConfig } from '@stack-init/schema';

function kebab(s: string): string {
  return s.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
}

function pascal(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function camel(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function plural(s: string): string {
  if (s.endsWith('s')) return s;
  if (s.endsWith('y')) return s.slice(0, -1) + 'ies';
  return s + 's';
}

function toTsType(type: string): string {
  if (['string', 'char', 'text', 'uuid'].includes(type)) return 'string';
  if (['integer', 'bigInteger', 'foreignId'].includes(type)) return 'number';
  if (type === 'boolean') return 'boolean';
  if (['float', 'double', 'decimal'].includes(type)) return 'number';
  if (['date', 'dateTime', 'timestamp'].includes(type)) return 'string';
  return 'string';
}

export async function generateAngularProject(folder: JSZip, config: ProjectConfig): Promise<void> {
  const { models, name: projectName } = config;

  folder.file('package.json', JSON.stringify({
    name: 'frontend',
    version: '0.0.0',
    private: true,
    scripts: {
      ng: 'ng',
      start: 'ng serve',
      build: 'ng build',
      test: 'ng test',
    },
    dependencies: {
      '@angular/animations': '^18.0.0',
      '@angular/common': '^18.0.0',
      '@angular/compiler': '^18.0.0',
      '@angular/core': '^18.0.0',
      '@angular/forms': '^18.0.0',
      '@angular/platform-browser': '^18.0.0',
      '@angular/platform-browser-dynamic': '^18.0.0',
      '@angular/router': '^18.0.0',
      rxjs: '~7.8.0',
      tslib: '^2.3.0',
      'zone.js': '~0.14.3',
    },
    devDependencies: {
      '@angular-devkit/build-angular': '^18.0.0',
      '@angular/cli': '^18.0.0',
      '@angular/compiler-cli': '^18.0.0',
      typescript: '~5.4.2',
    },
  }, null, 2));

  const angularJson = {
    $schema: './node_modules/@angular/cli/lib/config/schema.json',
    version: 1,
    newProjectRoot: 'projects',
    projects: {
      frontend: {
        projectType: 'application',
        schematics: {},
        root: '',
        sourceRoot: 'src',
        prefix: 'app',
        architect: {
          build: {
            builder: '@angular-devkit/build-angular:application',
            options: {
              outputPath: 'dist/frontend',
              index: 'src/index.html',
              browser: 'src/main.ts',
              polyfills: ['zone.js'],
              tsConfig: 'tsconfig.app.json',
              assets: ['src/favicon.ico', 'src/assets'],
              styles: ['src/styles.css'],
              scripts: [],
            },
            configurations: {
              production: {
                budgets: [
                  { type: 'initial', maximumWarning: '500kb', maximumError: '1mb' },
                  { type: 'anyComponentStyle', maximumWarning: '2kb', maximumError: '4kb' },
                ],
                outputHashing: 'all',
                fileReplacements: [
                  { replace: 'src/environments/environment.ts', with: 'src/environments/environment.prod.ts' },
                ],
              },
              development: {
                optimization: false,
                extractLicenses: false,
                sourceMap: true,
              },
            },
            defaultConfiguration: 'production',
          },
          serve: {
            builder: '@angular-devkit/build-angular:dev-server',
            configurations: {
              production: { buildTarget: 'frontend:build:production' },
              development: { buildTarget: 'frontend:build:development' },
            },
            defaultConfiguration: 'development',
          },
          test: {
            builder: '@angular-devkit/build-angular:karma',
            options: {
              polyfills: ['zone.js', 'zone.js/testing'],
              tsConfig: 'tsconfig.spec.json',
              assets: ['src/favicon.ico', 'src/assets'],
              styles: ['src/styles.css'],
              scripts: [],
            },
          },
        },
      },
    },
  };

  folder.file('angular.json', JSON.stringify(angularJson, null, 2));

  folder.file('tsconfig.json', JSON.stringify({
    compileOnSave: false,
    compilerOptions: {
      outDir: './dist/out-tsc',
      strict: true,
      noImplicitOverride: true,
      noPropertyAccessFromIndexSignature: true,
      noImplicitReturns: true,
      noFallthroughCasesInSwitch: true,
      skipLibCheck: true,
      isolatedModules: true,
      experimentalDecorators: true,
      moduleResolution: 'bundler',
      importHelpers: true,
      target: 'ES2022',
      module: 'ES2022',
      lib: ['ES2022', 'dom'],
      useDefineForClassFields: false,
    },
    angularCompilerOptions: {
      enableI18nLegacyMessageIdFormat: false,
      strictInjectionParameters: true,
      strictInputAccessModifiers: true,
      strictTemplates: true,
    },
  }, null, 2));

  folder.file('tsconfig.app.json', JSON.stringify({
    extends: './tsconfig.json',
    compilerOptions: {
      outDir: './dist/out-tsc',
      types: [],
    },
    files: ['src/main.ts'],
    include: ['src/**/*.d.ts'],
  }, null, 2));

  folder.file('tsconfig.spec.json', JSON.stringify({
    extends: './tsconfig.json',
    compilerOptions: {
      outDir: './dist/out-tsc',
      types: ['jasmine'],
    },
    include: [
      'src/**/*.spec.ts',
      'src/**/*.d.ts',
    ],
  }, null, 2));

  folder.file('.gitignore', `# See http://help.github.com/ignore-files/ for more about ignoring files.

# Compiled output
/dist
/tmp
/out-tsc
/bazel-out

# Node
/node_modules
npm-debug.log
yarn-error.log

# IDEs and editors
.idea/
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# Angular cache
.angular/

# misc
/.sass-cache
/connect.lock
/coverage
/libpeerconnection.log
testem.log
/typings

# System files
.DS_Store
Thumbs.db

# Environment files
.env
*.local
`);

  folder.file('.editorconfig', `# Editor configuration, see https://editorconfig.org
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.ts]
quote_type = single

[*.md]
max_line_length = off
trim_trailing_whitespace = false
`);

  folder.file('src/index.html', `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${projectName}</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
</head>
<body>
  <app-root></app-root>
</body>
</html>
`);

  folder.file('src/main.ts', `import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
`);

  folder.file('src/styles.css', `* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #333;
  background-color: #fafafa;
}

a {
  color: #1976d2;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
`);

  folder.file('src/assets/.gitkeep', '');

  folder.file('src/environments/environment.ts', `export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
};
`);

  folder.file('src/environments/environment.prod.ts', `export const environment = {
  production: true,
  apiUrl: '/api',
};
`);

  const firstModelPlural = models.length > 0 ? plural(kebab(models[0].name)) : '';

  const routeEntries = models.map(m => {
    const mKebabPlural = plural(kebab(m.name));
    const mPascal = pascal(m.name);
    return `  {
    path: '${mKebabPlural}',
    loadComponent: () => import('./components/${mKebabPlural}/${mKebabPlural}-list.component').then(m => m.${mPascal}ListComponent),
  },
  {
    path: '${mKebabPlural}/new',
    loadComponent: () => import('./components/${mKebabPlural}/${mKebabPlural}-form.component').then(m => m.${mPascal}FormComponent),
  },
  {
    path: '${mKebabPlural}/:id',
    loadComponent: () => import('./components/${mKebabPlural}/${mKebabPlural}-form.component').then(m => m.${mPascal}FormComponent),
  },`;
  }).join('\n');

  const redirectEntry = firstModelPlural
    ? `  { path: '', redirectTo: '${firstModelPlural}', pathMatch: 'full' },\n`
    : `  { path: '', redirectTo: '/', pathMatch: 'full' },\n`;

  folder.file('src/app/app.routes.ts', `import { Routes } from '@angular/router';

export const routes: Routes = [
${redirectEntry}${routeEntries}
];
`);

  folder.file('src/app/app.config.ts', `import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
  ],
};
`);

  const navLinks = models.map(m => {
    const mKebabPlural = plural(kebab(m.name));
    const mPascal = pascal(m.name);
    return `      <a routerLink="/${mKebabPlural}" routerLinkActive="active">${plural(mPascal)}</a>`;
  }).join('\n');

  folder.file('src/app/app.component.ts', `import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = '${projectName}';
}
`);

  folder.file('src/app/app.component.html', `<nav>
  <span class="app-title">{{ title }}</span>
${navLinks}
</nav>
<main>
  <router-outlet></router-outlet>
</main>
`);

  folder.file('src/app/app.component.css', `nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #1976d2;
  color: white;
}

.app-title {
  font-weight: bold;
  margin-right: auto;
}

nav a {
  color: white;
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

nav a:hover,
nav a.active {
  background-color: rgba(255, 255, 255, 0.2);
}

main {
  padding: 2rem;
}
`);

  for (const model of models) {
    const mName = model.name;
    const mPascal = pascal(mName);
    const mCamel = camel(mName);
    const mKebab = kebab(mName);
    const mKebabPlural = plural(mKebab);
    const mCamelPlural = plural(mCamel);

    const interfaceFields = model.fields.map(f => {
      const tsType = toTsType(f.type);
      const optional = f.nullable ? '?' : '';
      return `  ${f.name}${optional}: ${tsType};`;
    }).join('\n');

    folder.file(`src/app/models/${mKebab}.model.ts`, `export interface ${mPascal} {
  id: number;
${interfaceFields}
  createdAt?: string;
  updatedAt?: string;
}
`);

    folder.file(`src/app/services/${mKebab}.service.ts`, `import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ${mPascal} } from '../models/${mKebab}.model';

@Injectable({ providedIn: 'root' })
export class ${mPascal}Service {
  private url = \`\${environment.apiUrl}/${mKebabPlural}\`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<${mPascal}[]> {
    return this.http.get<${mPascal}[]>(this.url);
  }

  getById(id: number): Observable<${mPascal}> {
    return this.http.get<${mPascal}>(\`\${this.url}/\${id}\`);
  }

  create(data: Partial<${mPascal}>): Observable<${mPascal}> {
    return this.http.post<${mPascal}>(this.url, data);
  }

  update(id: number, data: Partial<${mPascal}>): Observable<${mPascal}> {
    return this.http.put<${mPascal}>(\`\${this.url}/\${id}\`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(\`\${this.url}/\${id}\`);
  }
}
`);

    const tableHeaders = model.fields.map(f => `        <th>${f.name}</th>`).join('\n');
    const tableCells = model.fields.map(f => `        <td>{{ item.${f.name} }}</td>`).join('\n');

    folder.file(`src/app/components/${mKebabPlural}/${mKebabPlural}-list.component.ts`, `import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ${mPascal} } from '../../models/${mKebab}.model';
import { ${mPascal}Service } from '../../services/${mKebab}.service';

@Component({
  selector: 'app-${mKebabPlural}-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: \`
    <div class="list-container">
      <div class="list-header">
        <h1>${plural(mPascal)}</h1>
        <a routerLink="/${mKebabPlural}/new" class="btn btn-primary">New ${mPascal}</a>
      </div>
      <div *ngIf="error" style="background:#fef2f2;color:#dc2626;padding:12px 16px;border-radius:6px;margin-bottom:16px">
        {{ error }} <button (click)="error = null; load()">Retry</button>
      </div>
      <div *ngIf="loading" class="loading">Loading...</div>
      <table *ngIf="!loading" class="data-table">
        <thead>
          <tr>
            <th>ID</th>
${tableHeaders}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of items">
            <td>{{ item.id }}</td>
${tableCells}
            <td>
              <a [routerLink]="['/${mKebabPlural}', item.id]" class="btn btn-sm">Edit</a>
              <button (click)="delete(item.id)" class="btn btn-sm btn-danger">Delete</button>
            </td>
          </tr>
          <tr *ngIf="items.length === 0">
            <td [attr.colspan]="${model.fields.length + 2}" class="empty">No ${mKebabPlural} found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  \`,
  styles: [\`
    .list-container { max-width: 900px; }
    .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 0.75rem; border: 1px solid #ddd; text-align: left; }
    .data-table th { background-color: #f5f5f5; font-weight: 600; }
    .data-table tr:hover { background-color: #fafafa; }
    .loading { padding: 2rem; text-align: center; color: #666; }
    .empty { text-align: center; color: #999; padding: 2rem; }
    .btn { display: inline-block; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; border: 1px solid #ccc; background: #fff; color: #333; text-decoration: none; font-size: 0.875rem; margin-right: 0.25rem; }
    .btn-primary { background-color: #1976d2; color: white; border-color: #1976d2; }
    .btn-danger { color: #d32f2f; border-color: #d32f2f; }
    .btn-sm { padding: 0.25rem 0.5rem; }
  \`],
})
export class ${mPascal}ListComponent implements OnInit {
  items: ${mPascal}[] = [];
  loading = false;
  error: string | null = null;

  constructor(private ${mCamelPlural}Service: ${mPascal}Service) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.${mCamelPlural}Service.getAll().subscribe({
      next: (data) => { this.items = data; this.loading = false; },
      error: (err) => { this.error = err.message ?? 'Failed to load'; this.loading = false; },
    });
  }

  delete(id: number): void {
    if (!confirm('Delete this ${mPascal}?')) return;
    this.${mCamelPlural}Service.delete(id).subscribe(() => this.load());
  }
}
`);

    const formControls = model.fields.map(f => {
      const defaultVal = toTsType(f.type) === 'number' ? '0' : toTsType(f.type) === 'boolean' ? 'false' : "''";
      return `      ${f.name}: [${defaultVal}],`;
    }).join('\n');

    const angularDateTimeTypes = new Set(['dateTime', 'timestamp', 'dateTimeTz', 'timestampTz']);
    const formInputs = (model.fields as any[]).map(f => {
      const tsType = toTsType(f.type);
      if (tsType === 'boolean') {
        return `      <label class="checkbox-label">
        <input type="checkbox" formControlName="${f.name}" />
        ${f.name}
      </label>`;
      }
      if (tsType === 'number') {
        return `      <div class="form-group">
        <label>${f.name}</label>
        <input type="number" formControlName="${f.name}" class="form-control" />
      </div>`;
      }
      if (f.type === 'date') {
        return `      <div class="form-group">
        <label>${f.name}</label>
        <input type="date" formControlName="${f.name}" class="form-control" />
      </div>`;
      }
      if (angularDateTimeTypes.has(f.type)) {
        return `      <div class="form-group">
        <label>${f.name}</label>
        <input type="datetime-local" formControlName="${f.name}" class="form-control" />
      </div>`;
      }
      if (f.type === 'enum' && Array.isArray(f.values) && f.values.length) {
        const opts = (f.values as string[]).map(v => `          <option [value]="'${v}'">${v}</option>`).join('\n');
        return `      <div class="form-group">
        <label>${f.name}</label>
        <select formControlName="${f.name}" class="form-control">
${opts}
        </select>
      </div>`;
      }
      if (f.type === 'text' || f.type === 'mediumText' || f.type === 'longText') {
        return `      <div class="form-group">
        <label>${f.name}</label>
        <textarea formControlName="${f.name}" class="form-control" rows="4"></textarea>
      </div>`;
      }
      return `      <div class="form-group">
        <label>${f.name}</label>
        <input type="text" formControlName="${f.name}" class="form-control" />
      </div>`;
    }).join('\n');

    folder.file(`src/app/components/${mKebabPlural}/${mKebabPlural}-form.component.ts`, `import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ${mPascal}Service } from '../../services/${mKebab}.service';

@Component({
  selector: 'app-${mKebabPlural}-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: \`
    <div class="form-container">
      <h1>{{ isEdit ? 'Edit' : 'New' }} ${mPascal}</h1>
      <form [formGroup]="form" (ngSubmit)="submit()">
${formInputs}
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving">
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
          <a routerLink="/${mKebabPlural}" class="btn">Cancel</a>
        </div>
      </form>
    </div>
  \`,
  styles: [\`
    .form-container { max-width: 500px; }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; margin-bottom: 0.25rem; font-weight: 500; }
    .form-control { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
    .checkbox-label { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
    .form-actions { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
    .btn { display: inline-block; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; border: 1px solid #ccc; background: #fff; color: #333; text-decoration: none; font-size: 1rem; }
    .btn-primary { background-color: #1976d2; color: white; border-color: #1976d2; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
  \`],
})
export class ${mPascal}FormComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  saving = false;
  private id?: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: ${mPascal}Service,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
${formControls}
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.id = Number(idParam);
      this.service.getById(this.id).subscribe((data) => this.form.patchValue(data));
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const payload = this.form.value;
    const request$ = this.isEdit
      ? this.service.update(this.id!, payload)
      : this.service.create(payload);

    request$.subscribe({
      next: () => this.router.navigate(['/${mKebabPlural}']),
      error: () => { this.saving = false; },
    });
  }
}
`);
  }
}
