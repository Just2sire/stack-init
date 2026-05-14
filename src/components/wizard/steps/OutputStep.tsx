"use client";

import { useState } from "react";
import { useWizardStore } from "@/stores/useWizardStore";
import { generate } from "@/lib/generator";
import { Download, Loader2, Sparkles, FileCode, Check } from "lucide-react";
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
      if (g.routes) {
        files.push({ path: `routes/api.php  ← ${name} routes added`, icon: '📝' });
      }
    }
  }

  if (isReact) {
    files.push({ path: 'package.json', icon: '📄' });
    files.push({ path: 'tsconfig.json', icon: '📄' });
    files.push({ path: 'next.config.ts', icon: '📄' });
    files.push({ path: 'src/app/layout.tsx', icon: '📄' });
    files.push({ path: 'src/app/page.tsx', icon: '📄' });
    files.push({ path: 'src/app/globals.css', icon: '📄' });
    if (config.react.css === 'tailwind') {
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

export function OutputStep() {
  const { getConfig, stack } = useWizardStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);

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

  const isLaravel = stack === "laravel" || stack === "laravel+react";

  const fileList = isDone ? computeFileList(getConfig()) : [];

  return (
    <div className="si-step-panel">
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "24px 0 40px" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--gold-subtle)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <Sparkles style={{ width: 28, height: 28, color: "var(--gold)" }} />
        </div>

        <div className="si-section-label" style={{ justifyContent: "center" }}>Output</div>
        <h1 className="si-title" style={{ marginBottom: 12 }}>Ready to generate</h1>
        <p className="si-subtitle" style={{ maxWidth: 480, marginBottom: 40 }}>
          Your project configuration is complete. Click below to generate and download your scaffolded codebase.
        </p>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || isDone}
          className="si-btn-primary"
          style={{ fontSize: 16, padding: "14px 40px", gap: 10, marginBottom: 48 }}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : isDone ? (
            <>
              <Check className="w-5 h-5" />
              Generated!
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Generate project
            </>
          )}
        </button>

        {isDone && (
          <div style={{ width: "100%", maxWidth: 660 }}>
            <div className="si-card" style={{ textAlign: "left", marginBottom: 16 }}>
              <div className="si-card-header">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FileCode style={{ width: 16, height: 16, color: "var(--gold)" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Generated files</span>
                </div>
                <span className="si-badge si-badge-gold">{fileList.length} files</span>
              </div>
              <div className="si-card-body" style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 12, color: "var(--text2)", maxHeight: 240, overflowY: "auto" }}>
                {fileList.map((f) => (
                  <p key={f.path} style={{ padding: "3px 0" }}>{f.icon} {f.path}</p>
                ))}
              </div>
            </div>

            {isLaravel && (
              <div style={{ borderRadius: 12, background: "var(--bg4)", border: "1px solid var(--border-subtle)", padding: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>Quick start</p>
                <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 13, color: "var(--text2)", lineHeight: 2, background: "var(--bg)", borderRadius: 8, padding: 16, border: "1px solid var(--border-subtle)" }}>
                  <p style={{ color: "var(--text3)", fontSize: 11, marginBottom: 4 }}># 1. Copy YAML to your project and generate</p>
                  <p><span style={{ color: "var(--text3)" }}>$ </span>cp stack-init.yaml ./my-laravel-project/</p>
                  <p><span style={{ color: "var(--text3)" }}>$ </span>cd my-laravel-project &amp;&amp; npx stack-init generate</p>
                  <p style={{ color: "var(--text3)", fontSize: 11, marginTop: 8, marginBottom: 4 }}># 2. Run migrations &amp; start</p>
                  <p><span style={{ color: "var(--text3)" }}>$ </span>php artisan migrate &amp;&amp; php artisan serve</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
