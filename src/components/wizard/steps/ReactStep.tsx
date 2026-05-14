"use client";

import { useWizardStore } from "@/stores/useWizardStore";
import { cn } from "@/lib/utils";
import { Monitor, FileCode, Layout, Pencil } from "lucide-react";

const PAGE_TYPES = [
  { key: "list"   as const, label: "List page",   desc: "Index with data table",   icon: Layout,   defaultEnabled: true  },
  { key: "detail" as const, label: "Detail page",  desc: "Show individual resource", icon: FileCode, defaultEnabled: true  },
  { key: "create" as const, label: "Create page",  desc: "Form to create resource",  icon: Pencil,   defaultEnabled: true  },
  { key: "edit"   as const, label: "Edit page",    desc: "Form to edit resource",    icon: Monitor,  defaultEnabled: false },
];

const LIBRARY_CONFIG = [
  {
    category: "State Management",
    key: "state_lib" as const,
    options: [
      { value: "zustand",       label: "Zustand" },
      { value: "redux-toolkit", label: "Redux Toolkit" },
      { value: "jotai",         label: "Jotai" },
      { value: "none",          label: "None" },
    ],
  },
  {
    category: "Forms",
    key: "form_lib" as const,
    options: [
      { value: "react-hook-form", label: "React Hook Form" },
      { value: "formik",          label: "Formik" },
      { value: "none",            label: "None" },
    ],
  },
  {
    category: "HTTP Client",
    key: "http_lib" as const,
    options: [
      { value: "axios", label: "Axios" },
      { value: "ky",    label: "ky" },
      { value: "fetch", label: "Fetch API" },
    ],
  },
  {
    category: "UI Framework",
    key: "ui_lib" as const,
    options: [
      { value: "shadcn", label: "shadcn/ui" },
      { value: "mui",    label: "MUI" },
      { value: "antd",   label: "Ant Design" },
      { value: "none",   label: "None" },
    ],
  },
];

export function ReactStep() {
  const { models, reactOptions, setReactOptions, setModelPages } = useWizardStore();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="si-title mb-2">React setup</h1>
      <p className="si-subtitle mb-10">
        Configure your Next.js front-end — pages to generate and libraries to include.
      </p>

      {/* Pages per model */}
      <div className="mb-10">
        <label className="si-section-label">Pages per model</label>

        {models.length === 0 ? (
          <p className="text-[13px] text-[#5c6078] italic py-4">
            Add models in the previous step to configure their pages.
          </p>
        ) : (
          <div className="flex flex-col gap-8">
            {models.map((model) => (
              <div key={model.name}>
                <p className="text-[12px] font-medium text-[#8b8fa3] mb-3 uppercase tracking-wider font-mono">
                  {model.name}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {PAGE_TYPES.map((p) => {
                    const Icon = p.icon;
                    const enabled = model.pages?.[p.key] ?? p.defaultEnabled;
                    return (
                      <button
                        key={p.key}
                        onClick={() => setModelPages(model.name, { [p.key]: !enabled })}
                        className={cn(
                          "si-toggle-card flex-col items-start gap-3 p-5 text-left",
                          enabled && "on"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-[8px] flex items-center justify-center",
                          enabled ? "bg-[#6C63FF]/12 text-[#a59bff]" : "bg-white/[0.04] text-[#5c6078]"
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className={cn(
                            "block text-[13px] font-medium",
                            enabled ? "text-[#a59bff]" : "text-[#c5c8d8]"
                          )}>
                            {p.label}
                          </span>
                          <span className="block text-[11px] text-[#5c6078] mt-0.5">{p.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Libraries */}
      <div>
        <label className="si-section-label">Libraries</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {LIBRARY_CONFIG.map((lib) => (
            <div key={lib.category} className="si-card p-5">
              <p className="text-[12px] font-medium text-[#8b8fa3] mb-3 uppercase tracking-wider">
                {lib.category}
              </p>
              <div className="flex flex-wrap gap-2">
                {lib.options.map((opt) => {
                  const selected = reactOptions[lib.key] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setReactOptions({ [lib.key]: opt.value })}
                      className={cn(
                        "px-4 py-2 rounded-[10px] text-[13px] font-medium transition-all duration-200 border",
                        selected
                          ? "bg-[#6C63FF]/10 text-[#a59bff] border-[#6C63FF]/25"
                          : "bg-white/[0.02] text-[#5c6078] border-white/[0.06] hover:border-white/[0.12] hover:text-[#8b8fa3]"
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
