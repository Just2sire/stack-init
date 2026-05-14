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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col items-center text-center py-8">
        <div className="w-16 h-16 rounded-full bg-[#6C63FF]/10 flex items-center justify-center mb-6 border border-[#6C63FF]/20">
          <Sparkles className="w-7 h-7 text-[#a59bff]" />
        </div>

        <h1 className="si-title mb-3">Ready to generate</h1>
        <p className="si-subtitle max-w-lg mx-auto mb-10">
          Your project configuration is complete. Click below to generate and download your scaffolded codebase.
        </p>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || isDone}
          className="si-btn-primary text-[16px] py-4 px-10 inline-flex items-center gap-3 mb-12"
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
          <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="si-card overflow-hidden text-left">
              <div className="si-card-header justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-[#a59bff]" />
                  <span className="text-[13px] font-medium text-white">Generated files</span>
                </div>
                <span className="si-badge si-badge-teal">{fileList.length} files</span>
              </div>
              <div className="si-card-body text-[13px] font-mono text-[#8b8fa3] space-y-1 max-h-64 overflow-y-auto">
                {fileList.map((f) => (
                  <p key={f.path}>{f.icon} {f.path}</p>
                ))}
              </div>
            </div>

            {isLaravel && (
              <div className="mt-4 rounded-[10px] bg-white/[0.02] border border-white/[0.06] p-4">
                <p className="text-[11px] font-medium text-[#a59bff] mb-2 uppercase tracking-wider">Quick start</p>
                <div className="font-mono text-[13px] text-[#c5c8d8] leading-[1.8] bg-white/[0.02] rounded-[8px] p-3 border border-white/[0.04] space-y-1">
                  <p className="text-[#5c6078] text-[11px] mb-1"># 1. Generate Laravel files from the YAML</p>
                  <p><span className="text-[#5c6078]">$</span> cp stack-init.yaml ./my-laravel-project/</p>
                  <p><span className="text-[#5c6078]">$</span> cd my-laravel-project</p>
                  <p><span className="text-[#5c6078]">$</span> npx stack-init generate</p>
                  <p className="text-[#5c6078] text-[11px] mt-3 mb-1"># 2. Run migrations &amp; seed</p>
                  <p><span className="text-[#5c6078]">$</span> php artisan migrate</p>
                  <p><span className="text-[#5c6078]">$</span> php artisan db:seed</p>
                  <p className="text-[#5c6078] text-[11px] mt-3 mb-1"># 3. Start the dev server</p>
                  <p><span className="text-[#5c6078]">$</span> php artisan serve</p>
                  <p className="text-[#5c6078] text-[11px] mt-1 ml-4">→ http://localhost:8000</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
