"use client";

import { useWizardStore } from "@/stores/useWizardStore";
import { SubStepPills } from "../SubStepPills";
import { cn } from "@/lib/utils";
import { Monitor, FileCode, Layout, Pencil } from "lucide-react";

const PAGE_TYPES = [
  { key: "list"   as const, label: "List page",   desc: "Index with data table",    icon: Layout,   defaultEnabled: true  },
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

const SUB_STEPS = [
  { label: "Libraries" },
  { label: "Pages per model" },
];

export function ReactStep() {
  const { models, reactOptions, setReactOptions, setModelPages, currentSubStep, setCurrentSubStep } = useWizardStore();

  return (
    <div className="si-step-panel">
      <div className="si-section-label">Frontend</div>
      <h1 className="si-title" style={{ marginBottom: 8 }}>React setup</h1>
      <p className="si-subtitle" style={{ marginBottom: 28 }}>
        Configure your React front-end — libraries and pages to generate.
      </p>

      <SubStepPills steps={SUB_STEPS} current={currentSubStep} onSelect={setCurrentSubStep} />

      {/* Sub-step 0 — Libraries */}
      {currentSubStep === 0 && (
        <div>
          <div className="si-section-label">Libraries</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, maxWidth: 720 }}>
            {LIBRARY_CONFIG.map((lib) => (
              <div key={lib.category} className="si-card" style={{ padding: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text3)", marginBottom: 12 }}>
                  {lib.category}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {lib.options.map((opt) => {
                    const selected = reactOptions[lib.key] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setReactOptions({ [lib.key]: opt.value })}
                        className="si-opt-chip"
                        style={selected ? { background: "var(--gold-subtle)", borderColor: "var(--gold)", color: "var(--gold)" } : {}}
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
      )}

      {/* Sub-step 1 — Pages per model */}
      {currentSubStep === 1 && (
        <div>
          <div className="si-section-label">Pages per model</div>

          {models.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--text3)", fontStyle: "italic", padding: "16px 0" }}>
              Add models in the previous step to configure their pages.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {models.map((model) => (
                <div key={model.name}>
                  <p style={{ fontSize: 12, fontFamily: "var(--font-jetbrains-mono)", color: "var(--gold)", marginBottom: 12, fontWeight: 700 }}>
                    {model.name}
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                    {PAGE_TYPES.map((p) => {
                      const Icon = p.icon;
                      const enabled = model.pages?.[p.key] ?? p.defaultEnabled;
                      return (
                        <button
                          key={p.key}
                          onClick={() => setModelPages(model.name, { [p.key]: !enabled })}
                          className={cn("si-toggle-card", enabled && "on")}
                          style={{ flexDirection: "column", alignItems: "flex-start", gap: 10, padding: 16 }}
                        >
                          <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", background: enabled ? "var(--gold-subtle)" : "var(--bg4)", color: enabled ? "var(--gold)" : "var(--text3)" }}>
                            <Icon style={{ width: 16, height: 16 }} />
                          </div>
                          <div>
                            <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: enabled ? "var(--gold)" : "var(--text)" }}>{p.label}</span>
                            <span style={{ display: "block", fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{p.desc}</span>
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
      )}
    </div>
  );
}
