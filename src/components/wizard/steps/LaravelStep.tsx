"use client";

import { useWizardStore } from "@/stores/useWizardStore";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Settings2, Info } from "lucide-react";

export function LaravelStep() {
  const { models, setGenerate, setGenerateAll } = useWizardStore();
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const options = [
    { key: "migration", label: "Migration", desc: "Database table definition" },
    { key: "controller", label: "Controller", desc: "HTTP request handler" },
    { key: "resource", label: "Resource", desc: "API JSON resource transformation" },
    { key: "request", label: "Request", desc: "Form request validation rules" },
    { key: "seeder", label: "Seeder", desc: "Seed database with test data" },
    { key: "factory", label: "Factory", desc: "Generate fake model instances" },
    { key: "policy", label: "Policy", desc: "Authorization rules" },
    { key: "service", label: "Service", desc: "Business logic layer" },
    { key: "repository", label: "Repository", desc: "Data access abstraction" },
    { key: "tests", label: "Tests", desc: "Feature and unit tests" },
    { key: "routes", label: "Routes", desc: "API / web route registration" },
    { key: "swagger", label: "Swagger", desc: "L5-Swagger documentation" },
    { key: "softDelete", label: "Soft Deletes", desc: "Use SoftDeletes trait" },
  ] as const;

  const activeModel = activeTab ? models.find(m => m.name === activeTab) : null;

  /** Get toggle state for "all models" view */
  const getAllState = (key: string): "on" | "off" | "partial" => {
    if (models.length === 0) return "off";
    const all = models.every(m => m.generate[key as keyof typeof m.generate]);
    const none = models.every(m => !m.generate[key as keyof typeof m.generate]);
    if (all) return "on";
    if (none) return "off";
    return "partial";
  };

  return (
    <div className="si-step-panel">
      <div className="si-section-label">Configuration</div>
      <h1 className="si-title" style={{ marginBottom: 8 }}>
        {activeModel ? `Configure ${activeModel.name}` : "Laravel setup"}
      </h1>
      <p className="si-subtitle" style={{ marginBottom: 32 }}>
        {activeModel
          ? `Toggle which files to generate for the ${activeModel.name} model.`
          : "Configure what should be generated for each model, or set global defaults."}
      </p>

      {/* Model tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveTab(null)}
          style={{
            padding: "7px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
            background: !activeTab ? "var(--gold-subtle)" : "transparent",
            border: `1px solid ${!activeTab ? "var(--gold-border)" : "var(--border-subtle)"}`,
            color: !activeTab ? "var(--gold)" : "var(--text3)",
          }}
        >
          All models
        </button>
        {models.map((m) => {
          const allOn  = options.every(o => m.generate[o.key]);
          const noneOn = options.every(o => !m.generate[o.key]);
          return (
            <button
              key={m.name}
              onClick={() => setActiveTab(m.name)}
              style={{
                padding: "7px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
                display: "inline-flex", alignItems: "center", gap: 6,
                background: activeTab === m.name ? "var(--gold-subtle)" : "transparent",
                border: `1px solid ${activeTab === m.name ? "var(--gold-border)" : "var(--border-subtle)"}`,
                color: activeTab === m.name ? "var(--gold)" : "var(--text3)",
              }}
            >
              {m.name}
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: allOn ? "var(--green)" : noneOn ? "var(--text3)" : "#FBBF24", display: "inline-block" }} />
            </button>
          );
        })}
      </div>

      {models.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", border: "1px dashed var(--border-medium)", borderRadius: 16, color: "var(--text3)" }}>
          <span style={{ fontSize: 36, display: "block", marginBottom: 12, opacity: 0.3 }}>⚙</span>
          <p style={{ fontSize: 14 }}>No models to configure</p>
          <p style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}>Go back and define your models first</p>
        </div>
      ) : activeModel ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, maxWidth: 720 }}>
          {options.map((opt) => (
            <ToggleCard
              key={opt.key}
              label={opt.label}
              description={opt.desc}
              checked={activeModel.generate[opt.key]}
              onChange={(val) => setGenerate(activeModel.name, opt.key, val)}
            />
          ))}
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, maxWidth: 720, marginBottom: 20 }}>
            {options.map((opt) => {
              const state = getAllState(opt.key);
              return (
                <ToggleCard
                  key={opt.key}
                  label={opt.label}
                  description={opt.desc}
                  checked={state === "on"}
                  partial={state === "partial"}
                  onChange={(val) => setGenerateAll(opt.key, val)}
                />
              );
            })}
          </div>
          <div className="si-info-card" style={{ maxWidth: 720 }}>
            <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
              <span style={{ color: "var(--gold)" }}>●</span> Gold = all models.
              <span style={{ color: "#FBBF24", margin: "0 6px" }}>●</span> Amber = some models.
              Click to toggle all.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function ToggleCard({
  label,
  description,
  checked,
  partial,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  partial?: boolean;
  onChange: (val: boolean) => void;
}) {
  const isOn = checked && !partial;
  const isPartial = partial;

  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn("si-toggle-card", isOn && "on", isPartial && "partial")}
      style={{ width: "100%", textAlign: "left" }}
    >
      <div className={cn("si-toggle", isOn && "on", isPartial && "partial")}>
        <div className="si-toggle-knob" />
      </div>
      <div style={{ flex: 1 }}>
        <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: isOn ? "var(--gold)" : isPartial ? "#FBBF24" : "var(--text)" }}>
          {label}
        </span>
        <span style={{ display: "block", fontSize: 11, marginTop: 2, color: isOn ? "var(--gold-dim)" : isPartial ? "rgba(251,191,36,0.7)" : "var(--text3)" }}>
          {description}
        </span>
      </div>
    </button>
  );
}
