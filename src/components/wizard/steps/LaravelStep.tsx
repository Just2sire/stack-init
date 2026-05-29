"use client";

import { useWizardStore } from "@/stores/useWizardStore";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Settings2, Layers, Check, Globe, Shield, Lock, Database, Server } from "lucide-react";
import { SubStepPills } from "../SubStepPills";

const SUB_STEPS = [
  { label: "Framework Setup" },
  { label: "Global Generation Defaults" },
  { label: "Specific Model Overrides" },
];

const PATTERNS = [
  {
    id: 'api-only' as const,
    title: 'API Only',
    desc: 'REST API endpoints only — no Blade views. Ideal for decoupled frontends (React, Next.js…).',
    Icon: Globe,
  },
  {
    id: 'full' as const,
    title: 'Full Stack',
    desc: 'API JSON + Blade views (index/create/edit/show) + web routes. Traditional server-rendered apps.',
    Icon: Layers,
  },
  {
    id: 'minimal' as const,
    title: 'Minimal',
    desc: 'Closure routes in api.php — no controller classes. Direct model access, zero boilerplate.',
    Icon: Server,
  },
] as const;

const AUTH_OPTIONS = [
  { id: 'sanctum'   as const, label: 'Sanctum',   desc: 'Session + API token auth — recommended for SPAs' },
  { id: 'none'      as const, label: 'None',       desc: 'No authentication scaffolding' },
  { id: 'breeze'    as const, label: 'Breeze',     desc: 'Minimal Blade/Inertia auth starter kit' },
  { id: 'jetstream' as const, label: 'Jetstream',  desc: 'Teams + full auth UI (Livewire/Inertia)' },
  { id: 'passport'  as const, label: 'Passport',   desc: 'Full OAuth2 server for complex auth flows' },
] as const;

const DB_ENGINES = [
  { id: 'mysql'   as const, label: 'MySQL' },
  { id: 'pgsql'   as const, label: 'PostgreSQL' },
  { id: 'sqlite'  as const, label: 'SQLite' },
  { id: 'sqlsrv'  as const, label: 'SQL Server' },
] as const;

const PHP_VERSIONS  = ['8.1', '8.2', '8.3', '8.4'] as const;
const LARAVEL_VERSIONS = ['10', '11', '12'] as const;

export function LaravelStep() {
  const {
    models, setGenerate, setGenerateAll,
    laravelOptions, setLaravelOptions,
    currentSubStep, setCurrentSubStep,
  } = useWizardStore();
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const options = [
    { key: "migration",  label: "Migration",    desc: "Database table definition" },
    { key: "controller", label: "Controller",   desc: "HTTP request handler" },
    { key: "resource",   label: "Resource",     desc: "API JSON resource transformation" },
    { key: "request",    label: "Request",      desc: "Form request validation rules" },
    { key: "seeder",     label: "Seeder",       desc: "Seed database with test data" },
    { key: "factory",    label: "Factory",      desc: "Generate fake model instances" },
    { key: "policy",     label: "Policy",       desc: "Authorization rules" },
    { key: "service",    label: "Service",      desc: "Business logic layer" },
    { key: "repository", label: "Repository",   desc: "Data access abstraction" },
    { key: "tests",      label: "Tests",        desc: "Feature and unit tests" },
    { key: "routes",     label: "Routes",       desc: "API / web route registration" },
    { key: "swagger",    label: "Swagger",            desc: "L5-Swagger OpenAPI documentation" },
    { key: "softDelete", label: "Soft Deletes",        desc: "Use SoftDeletes trait" },
    { key: "observer",   label: "Observer",            desc: "ModelObserver (created/updated/deleted hooks)" },
    { key: "events",     label: "Events & Listeners",  desc: "Queue events on model changes" },
    { key: "actions",    label: "Action Classes",      desc: "Create/Update/Delete action objects" },
    { key: "collection", label: "Resource Collection", desc: "Collection class with pagination meta" },
  ] as const;

  const activeModel = activeTab ? models.find(m => m.name === activeTab) : null;

  const getAllState = (key: string): "on" | "off" | "partial" => {
    if (models.length === 0) return "off";
    const all  = models.every(m =>  m.generate[key as keyof typeof m.generate]);
    const none = models.every(m => !m.generate[key as keyof typeof m.generate]);
    if (all)  return "on";
    if (none) return "off";
    return "partial";
  };

  if (models.length === 0 && currentSubStep > 0) {
    return (
      <div className="si-step-panel">
        <span className="si-section-label">Configuration</span>
        <h1 className="si-title" style={{ marginBottom: 8 }}>Laravel Setup</h1>
        <div style={{ textAlign: "center", padding: "60px 20px", border: "1px dashed var(--border-medium)", borderRadius: 16, color: "var(--text3)" }}>
          <span style={{ fontSize: 36, display: "block", marginBottom: 12, opacity: 0.3 }}>⚙</span>
          <p style={{ fontSize: 14 }}>No models to configure</p>
          <p style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}>Go back and define your models first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="si-step-panel">
      <div>
        <span className="si-section-label">Backend</span>
        <h1 className="si-title" style={{ marginBottom: 4 }}>Laravel Setup</h1>
        <p className="si-subtitle">Configure your PHP framework settings and code generation options.</p>
      </div>

      <div style={{ marginTop: 24, marginBottom: 12 }}>
        <SubStepPills steps={SUB_STEPS} current={currentSubStep} onSelect={setCurrentSubStep} />
      </div>

      {/* Sub-step 0 — Framework Setup */}
      {currentSubStep === 0 && (
        <div className="space-y-8" style={{ maxWidth: 840 }}>

          {/* Pattern */}
          <div>
            <span className="si-section-label" style={{ display: "block", marginBottom: 10 }}>Application Pattern</span>
            <div className="space-y-3">
              {PATTERNS.map(({ id, title, desc, Icon }) => {
                const isSelected = laravelOptions.pattern === id;
                return (
                  <button
                    key={id}
                    onClick={() => setLaravelOptions({ pattern: id })}
                    className={[
                      "si-toggle-card w-full text-left flex-row items-center gap-4 transition-all duration-200",
                      isSelected ? "on" : "",
                    ].join(" ")}
                    style={{
                      background: isSelected ? "var(--gold-subtle)" : "var(--bg3)",
                      borderColor: isSelected ? "var(--gold)" : "var(--border-subtle)",
                      padding: 16,
                    }}
                  >
                    <div className={[
                      "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                      isSelected ? "bg-gold text-bg" : "bg-bg4 text-gold-dim",
                    ].join(" ")}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm mb-0.5" style={{ color: isSelected ? "var(--gold)" : "var(--text)" }}>{title}</div>
                      <p className="text-[11px] text-text3 leading-normal">{desc}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={3} className="text-bg" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Auth Package */}
          <div>
            <span className="si-section-label" style={{ display: "block", marginBottom: 10 }}>Authentication Package</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {AUTH_OPTIONS.map(({ id, label, desc }) => {
                const isSelected = laravelOptions.auth === id;
                return (
                  <button
                    key={id}
                    onClick={() => setLaravelOptions({ auth: id })}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 16px",
                      borderRadius: 10,
                      border: `1.5px solid ${isSelected ? "var(--gold)" : "var(--border-subtle)"}`,
                      background: isSelected ? "var(--gold-subtle)" : "var(--bg3)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      textAlign: "left",
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: isSelected ? "var(--gold)" : "var(--bg4)",
                    }}>
                      <Shield size={14} style={{ color: isSelected ? "var(--bg)" : "var(--gold-dim)" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: isSelected ? "var(--gold)" : "var(--text)", display: "block" }}>{label}</span>
                      <span style={{ fontSize: 11, color: "var(--text3)" }}>{desc}</span>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-gold flex items-center justify-center shrink-0">
                        <Check size={10} strokeWidth={3} className="text-bg" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Versions row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <span className="si-section-label" style={{ display: "block", marginBottom: 10 }}>PHP Version</span>
              <div style={{ display: "flex", gap: 8 }}>
                {PHP_VERSIONS.map((v) => {
                  const isSelected = laravelOptions.php_version === v;
                  return (
                    <button
                      key={v}
                      onClick={() => setLaravelOptions({ php_version: v })}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 8,
                        border: `1.5px solid ${isSelected ? "var(--gold)" : "var(--border)"}`,
                        background: isSelected ? "var(--gold-subtle)" : "var(--bg3)",
                        color: isSelected ? "var(--gold)" : "var(--text2)",
                        fontSize: 12,
                        fontWeight: isSelected ? 700 : 500,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="si-section-label" style={{ display: "block", marginBottom: 10 }}>Laravel Version</span>
              <div style={{ display: "flex", gap: 8 }}>
                {LARAVEL_VERSIONS.map((v) => {
                  const isSelected = laravelOptions.laravel_version === v;
                  return (
                    <button
                      key={v}
                      onClick={() => setLaravelOptions({ laravel_version: v })}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 8,
                        border: `1.5px solid ${isSelected ? "var(--gold)" : "var(--border)"}`,
                        background: isSelected ? "var(--gold-subtle)" : "var(--bg3)",
                        color: isSelected ? "var(--gold)" : "var(--text2)",
                        fontSize: 12,
                        fontWeight: isSelected ? 700 : 500,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Database Engine */}
          <div>
            <span className="si-section-label" style={{ display: "block", marginBottom: 10 }}>Database Engine</span>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {DB_ENGINES.map(({ id, label }) => {
                const isSelected = laravelOptions.db_engine === id;
                return (
                  <button
                    key={id}
                    onClick={() => setLaravelOptions({ db_engine: id })}
                    style={{
                      padding: "8px 18px",
                      borderRadius: 10,
                      border: `1.5px solid ${isSelected ? "var(--gold)" : "var(--border)"}`,
                      background: isSelected ? "var(--gold-subtle)" : "var(--bg3)",
                      color: isSelected ? "var(--gold)" : "var(--text2)",
                      fontSize: 12,
                      fontWeight: isSelected ? 700 : 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* PHP Code Options */}
          <div>
            <span className="si-section-label" style={{ display: "block", marginBottom: 10 }}>PHP Code Options</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <ToggleCard
                label="Strict Types"
                description="Add declare(strict_types=1) to all generated PHP files"
                checked={laravelOptions.use_strict_types ?? true}
                onChange={(val) => setLaravelOptions({ use_strict_types: val })}
              />
              <ToggleCard
                label="Readonly Properties (PHP 8.1+)"
                description="Add readonly modifier to constructor-promoted properties in Service/Repository"
                checked={laravelOptions.use_readonly ?? false}
                onChange={(val) => setLaravelOptions({ use_readonly: val })}
              />
              <ToggleCard
                label="Redis / Queue Worker"
                description="Add Redis service and queue:work container to docker-compose.yml"
                checked={laravelOptions.use_redis ?? false}
                onChange={(val) => setLaravelOptions({ use_redis: val })}
              />
            </div>
          </div>

        </div>
      )}

      {/* Sub-step 1 — Global Defaults */}
      {currentSubStep === 1 && (
        <div className="space-y-6">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, maxWidth: 840 }}>
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

          <div className="si-info-card" style={{ maxWidth: 840 }}>
            <div className="flex gap-3">
              <Settings2 className="text-gold shrink-0 animate-pulse" size={18} />
              <p className="text-sm text-text2" style={{ lineHeight: 1.5 }}>
                <span className="font-bold text-gold" style={{ textShadow: "0 0 10px rgba(245,200,66,0.3)" }}>Gold Active</span> represents full coverage (activated on all models).{" "}
                <span className="font-bold text-[#FBBF24] ml-1">Amber Partial</span> means it is enabled on some models and disabled on others. Click any option card to globally toggle for all models.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sub-step 2 — Model Overrides */}
      {currentSubStep === 2 && (
        <div className="space-y-6">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} role="tablist" aria-label="Models configuration overrides">
            {models.map((m) => {
              const allOn  = options.every(o => m.generate[o.key]);
              const noneOn = options.every(o => !m.generate[o.key]);
              const isActiveTab = activeTab === m.name;

              return (
                <button
                  key={m.name}
                  role="tab"
                  aria-selected={isActiveTab}
                  onClick={() => setActiveTab(isActiveTab ? null : m.name)}
                  style={{
                    padding: "7px 16px", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all 0.2s",
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: isActiveTab ? "var(--gold-subtle)" : "var(--bg3)",
                    border: `1px solid ${isActiveTab ? "var(--gold)" : "var(--border-subtle)"}`,
                    color: isActiveTab ? "var(--gold)" : "var(--text3)",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 12 }}>{m.name}</span>
                  <span
                    style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: allOn ? "var(--green)" : noneOn ? "var(--text3)" : "#FBBF24",
                      display: "inline-block",
                      boxShadow: allOn ? "0 0 6px var(--green)" : noneOn ? "none" : "0 0 6px #FBBF24",
                    }}
                    title={allOn ? "All generated" : noneOn ? "None generated" : "Partially configured"}
                  />
                </button>
              );
            })}
          </div>

          {activeModel ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, maxWidth: 840 }}>
              {options.map((opt) => (
                <ToggleCard
                  key={opt.key}
                  label={opt.label}
                  description={opt.desc}
                  checked={activeModel.generate[opt.key] ?? false}
                  onChange={(val) => setGenerate(activeModel.name, opt.key, val)}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                maxWidth: 840,
                padding: "48px 24px",
                border: "1px dashed var(--border-subtle)",
                borderRadius: 16,
                textAlign: "center",
                background: "var(--bg2)",
                color: "var(--text3)",
              }}
            >
              <Layers size={24} className="mx-auto text-gold mb-3 opacity-60" />
              <p className="font-bold text-sm text-text">No model override selected</p>
              <p className="text-[11px] text-text3 mt-1">Select one of the model buttons above to configure generated files on a per-model basis.</p>
            </div>
          )}
        </div>
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
  const isOn      = checked && !partial;
  const isPartial = partial;

  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn("si-toggle-card w-full text-left transition-all duration-200", isOn && "on", isPartial && "partial")}
      style={{
        background: isOn ? "var(--gold-subtle)" : isPartial ? "rgba(245,200,66,0.03)" : "var(--bg3)",
        borderColor: isOn ? "var(--gold)" : isPartial ? "#FBBF24" : "var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        padding: "14px 18px",
      }}
    >
      <div
        className={cn("si-toggle shrink-0 mr-4", isOn && "on", isPartial && "partial")}
        style={{ borderColor: isOn ? "var(--gold)" : isPartial ? "#FBBF24" : "var(--border-medium)" }}
      >
        <div className="si-toggle-knob" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: isOn ? "var(--gold)" : isPartial ? "#FBBF24" : "var(--text)" }}>
          {label}
        </span>
        <span style={{ display: "block", fontSize: 11, marginTop: 2, color: isOn ? "var(--gold-dim)" : isPartial ? "rgba(251,191,36,0.7)" : "var(--text3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {description}
        </span>
      </div>
      {isOn && (
        <div className="w-4 h-4 rounded-full bg-gold flex items-center justify-center shrink-0 ml-2">
          <Check size={10} strokeWidth={3} className="text-bg" />
        </div>
      )}
    </button>
  );
}
