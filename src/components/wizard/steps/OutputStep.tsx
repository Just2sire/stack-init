"use client";

import { useState } from "react";
import { useWizardStore } from "@/stores/useWizardStore";
import { generate } from "@/lib/generator";
import { generateShareUrl } from "@/lib/sharing";
import { savePreset } from "@/lib/presets";
import { buildYamlContent } from "@/lib/generator/yaml";
import { generateDockerCompose } from "@/lib/generator/docker";
import { Download, Loader2, Sparkles, FileCode, Check, ChevronDown, ChevronUp, Database, Box, Layers as LayersIcon, RefreshCw, Edit3, Share2, ClipboardCheck, BookmarkPlus, Copy, FileText, Container } from "lucide-react";
import type { ProjectConfig, ModelPages } from "@stack-init/schema";

const DEFAULT_PAGES: ModelPages = { list: true, detail: true, create: true, edit: false };

function slugify(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/([^s])$/, '$1s');
}

function snakeCase(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase() + 's';
}

interface FileEntry { path: string; icon: string; }

function computeFileList(config: ProjectConfig): FileEntry[] {
  const files: FileEntry[] = [];
  const isLaravel = config.stack === 'laravel' || config.stack === 'laravel+react';
  const isReact   = config.stack === 'react'   || config.stack === 'laravel+react';
  const isExpress = config.stack === 'express' || config.stack === 'express+react';
  const isNest    = config.stack === 'nestjs';

  if (isLaravel) {
    files.push({ path: 'stack-init.yaml', icon: '📄' });

    for (const model of config.models) {
      const { generate: g, name } = model;
      const table = snakeCase(name);

      files.push({ path: `app/Models/${name}.php`, icon: '📄' });

      if (g.migration) {
        files.push({ path: `database/migrations/xxxx_create_${table}_table.php`, icon: '📄' });
      }
      if (g.controller) {
        files.push({ path: `app/Http/Controllers/Api/${name}Controller.php`, icon: '📄' });
        files.push({ path: `app/Http/Requests/Store${name}Request.php`, icon: '📄' });
        files.push({ path: `app/Http/Requests/Update${name}Request.php`, icon: '📄' });
        files.push({ path: `app/Http/Resources/${name}Resource.php`, icon: '📄' });
      }
      if (g.factory) {
        files.push({ path: `database/factories/${name}Factory.php`, icon: '📄' });
      }
      if (g.seeder) {
        files.push({ path: `database/seeders/${name}Seeder.php`, icon: '📄' });
      }
      if (g.policy) {
        files.push({ path: `app/Policies/${name}Policy.php`, icon: '📄' });
      }
      if (g.service) {
        files.push({ path: `app/Services/${name}Service.php`, icon: '📄' });
      }
      if (g.repository) {
        files.push({ path: `app/Repositories/${name}Repository.php`, icon: '📄' });
      }
      if (g.tests) {
        files.push({ path: `tests/Feature/${name}Test.php`, icon: '📄' });
      }
      if (g.routes) {
        files.push({ path: `routes/api.php  ← ${name} routes added`, icon: '📝' });
      }
    }
  }

  if (isExpress || isNest) {
    files.push({ path: 'package.json', icon: '📄' });
    files.push({ path: 'tsconfig.json', icon: '📄' });
    files.push({ path: 'src/app.ts', icon: '📄' });
    
    for (const model of config.models) {
      const slug = slugify(model.name);
      files.push({ path: `src/models/${model.name}.ts`, icon: '📄' });
      files.push({ path: `src/controllers/${model.name}Controller.ts`, icon: '📄' });
      files.push({ path: `src/services/${model.name}Service.ts`, icon: '📄' });
      files.push({ path: `src/repositories/${model.name}Repository.ts`, icon: '📄' });
    }
  }

  if (isReact) {
    files.push({ path: 'package.json', icon: '📄' });
    files.push({ path: 'tsconfig.json', icon: '📄' });
    files.push({ path: 'next.config.ts', icon: '📄' });
    files.push({ path: 'src/app/layout.tsx', icon: '📄' });
    files.push({ path: 'src/app/page.tsx', icon: '📄' });
    files.push({ path: 'src/app/globals.css', icon: '📄' });
    if (config.react?.css === 'tailwind') {
      files.push({ path: 'tailwind.config.ts', icon: '📄' });
      files.push({ path: 'postcss.config.mjs', icon: '📄' });
    }
    files.push({ path: 'README.md', icon: '📄' });

    for (const model of config.models) {
      const slug = slugify(model.name);
      const pages: ModelPages = { ...DEFAULT_PAGES, ...model.pages };

      files.push({ path: `src/types/${model.name}.ts`, icon: '📄' });
      if (pages.list)   files.push({ path: `src/app/${slug}/page.tsx`, icon: '📄' });
      if (pages.detail) files.push({ path: `src/app/${slug}/[id]/page.tsx`, icon: '📄' });
      if (pages.create) files.push({ path: `src/app/${slug}/create/page.tsx`, icon: '📄' });
      if (pages.edit)   files.push({ path: `src/app/${slug}/[id]/edit/page.tsx`, icon: '📄' });
    }
  }

  return files;
}

function computeEnvExample(config: ProjectConfig): string {
  const stack = config.stack;
  const isLaravel = stack.includes('laravel');
  const isExpress = stack.includes('express') || stack === 'mern' || stack === 'pern' || stack === 'mevn' || stack === 'mean';
  const isNest    = stack.includes('nestjs');
  const isFastapi = stack.includes('fastapi');
  const lines: string[] = [];

  if (isLaravel) {
    const db = config.laravel?.db_engine ?? 'mysql';
    lines.push(`APP_NAME="${config.name}"`, `APP_ENV=local`, `APP_KEY=`, `APP_DEBUG=true`, `APP_URL=http://localhost:8000`, ``);
    lines.push(`DB_CONNECTION=${db}`, `DB_HOST=127.0.0.1`, `DB_PORT=${db === 'pgsql' ? '5432' : '3306'}`, `DB_DATABASE=${config.name}`, `DB_USERNAME=root`, `DB_PASSWORD=`);
  } else if (isExpress) {
    const orm = config.express?.orm ?? 'prisma';
    const db  = config.express?.db_engine ?? 'postgresql';
    const auth = config.express?.auth ?? 'none';
    const dbUrl = orm === 'mongoose' ? `mongodb://localhost:27017/${config.name}` : db === 'mysql' ? `mysql://user:password@localhost:3306/${config.name}` : db === 'sqlite' ? `file:./dev.db` : `postgresql://user:password@localhost:5432/${config.name}`;
    lines.push(`NODE_ENV=development`, `PORT=${config.express?.port ?? 3000}`, ``);
    lines.push(orm === 'mongoose' ? `MONGODB_URI="${dbUrl}"` : `DATABASE_URL="${dbUrl}"`);
    if (auth !== 'none') lines.push(``, `JWT_SECRET="change-me-in-production"`, `JWT_EXPIRES_IN="7d"`);
  } else if (isNest) {
    const orm = config.nest?.orm ?? 'typeorm';
    const db  = config.nest?.db_engine ?? 'postgresql';
    const auth = config.nest?.auth ?? 'none';
    const dbUrl = orm === 'mongoose' ? `mongodb://localhost:27017/${config.name}` : db === 'mysql' ? `mysql://user:password@localhost:3306/${config.name}` : db === 'sqlite' ? `file:./dev.db` : `postgresql://user:password@localhost:5432/${config.name}`;
    lines.push(`NODE_ENV=development`, `PORT=3000`, ``);
    lines.push(orm === 'mongoose' ? `MONGODB_URI="${dbUrl}"` : `DATABASE_URL="${dbUrl}"`);
    if (auth !== 'none') lines.push(``, `JWT_SECRET="change-me-in-production"`, `JWT_EXPIRES_IN="7d"`);
  } else if (isFastapi) {
    const db  = config.fastapi?.db_engine ?? 'postgresql';
    const auth = config.fastapi?.auth ?? 'none';
    const dbUrl = db === 'mysql' ? `mysql+pymysql://user:password@localhost:3306/${config.name}` : db === 'sqlite' ? `sqlite:///./dev.db` : `postgresql://user:password@localhost:5432/${config.name}`;
    lines.push(`DATABASE_URL="${dbUrl}"`);
    if (auth !== 'none') lines.push(`SECRET_KEY="change-me-in-production"`, `ACCESS_TOKEN_EXPIRE_MINUTES="30"`);
  }

  return lines.join('\n');
}


export function OutputStep() {
  const { getConfig, stack, reset, setStep, models, projectName } = useWizardStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [expanded, setExpanded] = useState<string | null>("summary");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetIcon, setPresetIcon] = useState('📦');
  const [presetDesc, setPresetDesc] = useState('');
  const [savedToast, setSavedToast] = useState(false);
  const [previewTab, setPreviewTab] = useState<'env' | 'docker' | 'yaml'>('env');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const config = getConfig();
      await generate(config);
      setIsDone(true);
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = () => {
    const url = generateShareUrl(getConfig());
    navigator.clipboard.writeText(url);
    setIsShared(true);
    setTimeout(() => setIsShared(false), 2000);
  };

  const handleSavePreset = () => {
    const name = presetName.trim() || projectName || 'My Preset';
    savePreset(getConfig(), name, { icon: presetIcon, description: presetDesc.trim() || undefined });
    setShowSaveModal(false);
    setPresetName('');
    setPresetDesc('');
    setPresetIcon('📦');
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const isLaravel = stack === "laravel" || stack === "laravel+react";
  const fileList = isDone ? computeFileList(getConfig()) : [];
  const config = getConfig();

  const SummaryItem = ({ id, title, icon, children }: { id: string; title: string; icon: any; children: any }) => {
    const isExpanded = expanded === id;
    return (
      <div className="si-card mb-3 overflow-hidden" style={{ borderColor: isExpanded ? "var(--gold-border)" : undefined }}>
        <div 
          onClick={() => setExpanded(isExpanded ? null : id)}
          className="si-card-header" 
          style={{ cursor: "pointer", background: isExpanded ? "var(--bg4)" : "transparent" }}
        >
          <div className="flex items-center gap-3">
            <div className="text-gold">{icon}</div>
            <span className="font-bold text-sm text-text">{title}</span>
          </div>
          {isExpanded ? <ChevronUp size={16} className="text-text3" /> : <ChevronDown size={16} className="text-text3" />}
        </div>
        {isExpanded && <div className="si-card-body border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-200">{children}</div>}
      </div>
    );
  };

  if (isDone) {
    return (
      <div className="si-step-panel flex flex-col items-center py-10">
        <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-6 animate-in zoom-in duration-500">
          <Check className="text-gold w-8 h-8" strokeWidth={3} />
        </div>
        <h1 className="si-title mb-2">Project Generated!</h1>
        <p className="si-subtitle mb-10">Your project is ready. Check the files below.</p>

        <div className="w-full max-w-[700px] space-y-6">
          <div className="si-card">
            <div className="si-card-header">
              <div className="flex items-center gap-2">
                <FileCode className="text-gold" size={16} />
                <span className="font-bold text-sm">Generated Files</span>
              </div>
              <span className="si-badge si-badge-gold">{fileList.length} files</span>
            </div>
            <div className="si-card-body max-h-[300px] overflow-y-auto font-mono text-[11px] text-text2 space-y-1">
              {fileList.map((f) => (
                <div key={f.path} className="flex gap-3 py-1 border-b border-white/[0.03] last:border-0">
                  <span className="opacity-50">{f.icon}</span>
                  <span>{f.path}</span>
                </div>
              ))}
            </div>
          </div>

          {isLaravel && (
            <div className="bg-bg4 border border-white/5 rounded-xl p-6">
              <p className="text-[10px] font-bold text-gold uppercase tracking-widest mb-4">CLI Instructions</p>
              <div className="bg-bg rounded-lg p-4 font-mono text-xs text-text2 border border-white/5 leading-relaxed">
                <p className="opacity-40 mb-2"># 1. Run generation in your project</p>
                <p className="text-text"><span className="opacity-40">$</span> npx stack-init generate</p>
                <p className="opacity-40 mt-4 mb-2"># 2. Setup database & start</p>
                <p className="text-text"><span className="opacity-40">$</span> php artisan migrate</p>
                <p className="text-text"><span className="opacity-40">$</span> php artisan serve</p>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-6">
            <button 
              onClick={() => { setIsDone(false); setStep('stack'); }} 
              className="si-btn-secondary flex-1 flex items-center justify-center gap-2 py-3"
            >
              <Edit3 size={16} />
              Modify Config
            </button>
            <button 
              onClick={() => reset()} 
              className="si-btn-ghost flex-1 flex items-center justify-center gap-2 py-3 border border-white/10"
            >
              <RefreshCw size={16} />
              Start New Project
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="si-step-panel">
      <div className="flex flex-col items-center text-center py-6 mb-10">
        <div className="w-16 h-16 rounded-full bg-gold-subtle border border-gold-border flex items-center justify-center mb-6">
          <Sparkles className="text-gold w-7 h-7" />
        </div>
        <div className="si-section-label justify-center">Final Step</div>
        <h1 className="si-title mb-2">Review & Generate</h1>
        <p className="si-subtitle max-w-[480px]">
          Review your project structure before we scaffold the codebase.
        </p>
      </div>

      <div className="max-w-[700px] mx-auto mb-12">
        <SummaryItem id="summary" title="Project Summary" icon={<Box size={18} />}>
          <div className="grid grid-cols-2 gap-y-4 text-sm">
            <div>
              <p className="text-[10px] text-text3 uppercase font-bold tracking-widest mb-1">Project Name</p>
              <p className="font-mono text-gold">{projectName || "my-project"}</p>
            </div>
            <div>
              <p className="text-[10px] text-text3 uppercase font-bold tracking-widest mb-1">Stack</p>
              <p className="text-text">{stack?.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-[10px] text-text3 uppercase font-bold tracking-widest mb-1">Database</p>
              <p className="text-text">
                {isLaravel ? config.laravel?.db_engine : (config.express?.db_engine || config.nest?.db_engine || config.fastapi?.db_engine || "SQLite")}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-text3 uppercase font-bold tracking-widest mb-1">ORM / Driver</p>
              <p className="text-text">
                {isLaravel ? "Eloquent" : (config.express?.database || config.nest?.database || config.fastapi?.orm || "None")}
              </p>
            </div>
          </div>
        </SummaryItem>

        <SummaryItem id="models" title={`Models & Schema (${models.length})`} icon={<LayersIcon size={18} />}>
          <div className="space-y-3">
            {models.map(m => (
              <div key={m.name} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-gold text-xs font-bold">{m.name}</span>
                  <span className="text-[10px] text-text3">{m.fields.length} fields</span>
                </div>
                <div className="flex gap-2">
                  {m.relations.length > 0 && <span className="si-badge si-badge-gray !text-[9px]">{m.relations.length} rel</span>}
                  {m.generate.controller && <span className="si-badge si-badge-gold !text-[9px]">API</span>}
                </div>
              </div>
            ))}
            {models.length === 0 && <p className="text-xs text-text3 italic">No models defined yet.</p>}
          </div>
        </SummaryItem>

        <SummaryItem id="tech" title="Technical Options" icon={<Terminal size={18} />}>
          <div className="space-y-4">
            {isLaravel && config.laravel && (
              <div>
                <p className="text-[10px] text-text3 uppercase font-bold tracking-widest mb-2">Laravel Config</p>
                <div className="flex flex-wrap gap-2">
                  <span className="si-badge si-badge-gray">PHP {config.laravel.php_version}</span>
                  <span className="si-badge si-badge-gray">Auth: {config.laravel.auth}</span>
                  <span className="si-badge si-badge-gray">Pattern: {config.laravel.pattern}</span>
                </div>
              </div>
            )}
            {config.fastapi && (
              <div>
                <p className="text-[10px] text-text3 uppercase font-bold tracking-widest mb-2">FastAPI Config</p>
                <div className="flex flex-wrap gap-2">
                  <span className="si-badge si-badge-gray">Python {config.fastapi.python_version}</span>
                  <span className="si-badge si-badge-gray">Auth: {config.fastapi.auth}</span>
                  <span className="si-badge si-badge-gray">ORM: {config.fastapi.orm}</span>
                </div>
              </div>
            )}
            {config.express && config.express.middlewares && config.express.middlewares.length > 0 && (
              <div>
                <p className="text-[10px] text-text3 uppercase font-bold tracking-widest mb-2">Middlewares</p>
                <div className="flex flex-wrap gap-2">
                  {config.express.middlewares.map(m => <span key={m} className="si-badge si-badge-gray">{m}</span>)}
                </div>
              </div>
            )}
            {config.react && (
              <div>
                <p className="text-[10px] text-text3 uppercase font-bold tracking-widest mb-2">Frontend Stack</p>
                <div className="flex flex-wrap gap-2">
                  <span className="si-badge si-badge-gray">{config.react.ui_lib}</span>
                  <span className="si-badge si-badge-gray">{config.react.state_lib}</span>
                  <span className="si-badge si-badge-gray">{config.react.http_lib}</span>
                </div>
              </div>
            )}
          </div>
        </SummaryItem>
      </div>

      {/* Preview tabs — env / docker / yaml */}
      <div className="max-w-[700px] mx-auto mb-10">
        <div className="si-card overflow-hidden">
          <div className="si-card-header" style={{ paddingBottom: 0 }}>
            <div className="flex items-center gap-3">
              <FileText className="text-gold" size={16} />
              <span className="font-bold text-sm">Preview Generated Files</span>
            </div>
          </div>
          <div className="flex gap-1 px-4 pt-3 border-b border-white/5">
            {([
              { id: 'env',    label: '.env.example', icon: '🔑' },
              { id: 'docker', label: 'docker-compose.yml', icon: '🐳' },
              { id: 'yaml',   label: 'stack-init.yaml', icon: '📄' },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setPreviewTab(tab.id)}
                className={`px-3 py-2 text-[11px] font-medium rounded-t-md border-b-2 transition-all ${
                  previewTab === tab.id
                    ? 'border-gold text-gold bg-gold/5'
                    : 'border-transparent text-text3 hover:text-text hover:border-white/20'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <pre className="si-card-body font-mono text-[11px] text-text2 overflow-x-auto max-h-[200px] overflow-y-auto leading-relaxed whitespace-pre-wrap">
              {previewTab === 'env'    && (computeEnvExample(config) || '# No environment variables for this stack')}
              {previewTab === 'docker' && generateDockerCompose(config)}
              {previewTab === 'yaml'   && buildYamlContent(config)}
            </pre>
            <button
              onClick={() => {
                const content = previewTab === 'env' ? computeEnvExample(config) : previewTab === 'docker' ? generateDockerCompose(config) : buildYamlContent(config);
                navigator.clipboard.writeText(content);
                setCopiedTab(previewTab);
                setTimeout(() => setCopiedTab(null), 2000);
              }}
              className="absolute top-3 right-3 si-btn-ghost py-1 px-2 text-[10px] gap-1"
            >
              {copiedTab === previewTab ? <Check size={10} className="text-gold" /> : <Copy size={10} />}
              {copiedTab === previewTab ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="si-btn-primary px-16 py-4 text-lg font-bold gap-3 shadow-xl shadow-gold/10"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Generating your project...
            </>
          ) : (
            <>
              <Download className="w-6 h-6" />
              Generate {projectName || "Project"}
            </>
          )}
        </button>

        <div className="flex gap-3">
          <button
            onClick={handleShare}
            className="si-btn-ghost text-xs gap-2 py-2"
          >
            {isShared ? <ClipboardCheck size={14} className="text-gold" /> : <Share2 size={14} />}
            {isShared ? "Link copied!" : "Share config link"}
          </button>
          <button
            onClick={() => {
              const yamlContent = buildYamlContent(config);
              navigator.clipboard.writeText(yamlContent);
              setCopiedTab('yaml-btn');
              setTimeout(() => setCopiedTab(null), 2000);
            }}
            className="si-btn-ghost text-xs gap-2 py-2"
          >
            {copiedTab === 'yaml-btn' ? <Check size={14} className="text-gold" /> : <Copy size={14} />}
            {copiedTab === 'yaml-btn' ? "YAML copied!" : "Copy YAML"}
          </button>
          <button
            onClick={() => setShowSaveModal(true)}
            className="si-btn-ghost text-xs gap-2 py-2"
          >
            {savedToast ? <Check size={14} className="text-gold" /> : <BookmarkPlus size={14} />}
            {savedToast ? "Preset saved!" : "Save as Preset"}
          </button>
        </div>

        <p className="text-[10px] text-text3 flex items-center gap-2">
          <ShieldCheck size={12} className="text-gold" />
          By clicking generate, a ZIP or YAML file will be prepared for you.
        </p>
      </div>

      {/* Save as Preset modal */}
      {showSaveModal && (
        <>
          <div
            onClick={() => setShowSaveModal(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 49 }}
          />
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 50,
              background: "var(--bg2)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 16,
              padding: 28,
              width: 380,
              boxShadow: "0 16px 60px rgba(0,0,0,0.5)",
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 4, fontFamily: "var(--font-syne)" }}>
              Save as Preset
            </h3>
            <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 20 }}>
              Save your current configuration to reuse in future projects.
            </p>

            <div style={{ marginBottom: 14 }}>
              <label className="si-section-label">Preset Name</label>
              <input
                autoFocus
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                placeholder={projectName || 'My Preset'}
                className="si-input"
                style={{ marginTop: 6 }}
              />
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              <div style={{ flex: "0 0 80px" }}>
                <label className="si-section-label">Icon</label>
                <input
                  value={presetIcon}
                  onChange={(e) => setPresetIcon(e.target.value)}
                  className="si-input"
                  style={{ marginTop: 6, textAlign: "center", fontSize: 20 }}
                  maxLength={2}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="si-section-label">Description (optional)</label>
                <input
                  value={presetDesc}
                  onChange={(e) => setPresetDesc(e.target.value)}
                  placeholder="Short description..."
                  className="si-input"
                  style={{ marginTop: 6 }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleSavePreset} className="si-btn-primary" style={{ flex: 1 }}>
                Save Preset
              </button>
              <button onClick={() => setShowSaveModal(false)} className="si-btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { ShieldCheck, Terminal } from "lucide-react";
