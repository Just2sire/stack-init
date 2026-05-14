"use client";

import { useWizardStore } from "@/stores/useWizardStore";
import { cn } from "@/lib/utils";
import { Code2, Layers, ServerCog } from "lucide-react";

export function StackStep() {
  const { stack, setStack, projectName, setProjectName } = useWizardStore();

  const stacks = [
    { id: "laravel", title: "Laravel", desc: "API REST or Blade backend with Eloquent, migrations, and artisan CLI.", icon: ServerCog },
    { id: "react", title: "React", desc: "Next.js front-end with TypeScript, routing, and component architecture.", icon: Code2 },
    { id: "laravel+react", title: "Laravel + React", desc: "Full-stack — a Laravel API paired with a Next.js SPA. Best of both worlds.", icon: Layers },
  ] as const;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="si-title mb-2">Project setup</h1>
      <p className="si-subtitle mb-10">
        Choose your tech stack and name your project to get started.
      </p>

      {/* Project Name */}
      <div className="mb-10">
        <label className="si-section-label">Project name</label>
        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="my-awesome-project"
          className="si-input max-w-md font-mono text-[13px]"
        />
      </div>

      {/* Stack Selection */}
      <div className="mb-10">
        <label className="si-section-label">Select stack</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {stacks.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setStack(s.id)}
                className={cn("si-stack-card text-left", stack === s.id && "selected")}
              >
                <div className={cn(
                  "w-10 h-10 rounded-[10px] flex items-center justify-center mb-4 transition-all duration-200",
                  stack === s.id
                    ? "bg-[#6C63FF]/15 text-[#a59bff]"
                    : "bg-white/[0.04] text-[#5c6078]"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  "block text-[15px] font-medium mb-1.5 tracking-tight",
                  stack === s.id ? "text-white" : "text-[#c5c8d8]"
                )}>
                  {s.title}
                </span>
                <span className="block text-[13px] text-[#5c6078] leading-relaxed">
                  {s.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Info card */}
      <div className="si-info-card">
        <p className="text-[11px] font-medium text-[#a59bff] mb-1 uppercase tracking-wider">Note</p>
        <p className="text-[13px] text-[#8b8fa3] leading-relaxed">
          React & Next.js → ZIP téléchargeable. Laravel → <code className="font-mono bg-white/[0.05] px-1.5 py-0.5 rounded text-[#c5c8d8] text-[12px]">stack-init.yaml</code> + commande CLI.
        </p>
      </div>
    </div>
  );
}
