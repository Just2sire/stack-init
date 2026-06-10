"use client";

import { useWizardStore } from "@/stores/useWizardStore";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { 
  Settings2, Layers, Check, Globe, Shield, 
  Server, Database, Code, Zap, TestTube 
} from "lucide-react";
import { SubStepPills } from "../SubStepPills";
import { useTranslations } from "next-intl";

const SUB_STEPS_KEYS = ["frameworkSetup", "generationSettings"] as const;

const PATTERNS = [
  { id: 'api-only' as const, title: 'API Only',    Icon: Globe   },
  { id: 'full'    as const, title: 'Full Stack',   Icon: Layers  },
  { id: 'minimal' as const, title: 'Minimal',      Icon: Server  },
] as const;

const AUTH_OPTIONS = [
  { id: 'sanctum'   as const, label: 'Sanctum'   },
  { id: 'none'      as const, label: 'None'       },
  { id: 'breeze'    as const, label: 'Breeze'     },
  { id: 'jetstream' as const, label: 'Jetstream'  },
  { id: 'passport'  as const, label: 'Passport'   },
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
  const t = useTranslations("steps");
  const {
    models, setGenerate, setGenerateAll,
    laravelOptions, setLaravelOptions,
    currentSubStep, setCurrentSubStep,
  } = useWizardStore();

  // "global" or model name
  const [selectedTarget, setSelectedTarget] = useState<string>("global");

  const SUB_STEPS = SUB_STEPS_KEYS.map((key) => ({ label: t(`laravelSetup.subStep.${key}`) }));

  const categories = [
    {
      id: "database",
      label: "Database",
      icon: Database,
      options: [
        { key: "migration",  label: "Migration",           desc: t("laravelSetup.gen.migration") },
        { key: "seeder",     label: "Seeder",               desc: t("laravelSetup.gen.seeder") },
        { key: "factory",    label: "Factory",              desc: t("laravelSetup.gen.factory") },
        { key: "softDelete", label: "Soft Deletes",         desc: t("laravelSetup.gen.softDelete") },
      ]
    },
    {
      id: "api",
      label: "API & Routes",
      icon: Globe,
      options: [
        { key: "controller", label: "Controller",           desc: t("laravelSetup.gen.controller") },
        { key: "resource",   label: "Resource",             desc: t("laravelSetup.gen.resource") },
        { key: "collection", label: "Resource Collection",  desc: t("laravelSetup.gen.collection") },
        { key: "request",    label: "Request",              desc: t("laravelSetup.gen.request") },
        { key: "routes",     label: "Routes",               desc: t("laravelSetup.gen.routes") },
        { key: "swagger",    label: "Swagger",              desc: t("laravelSetup.gen.swagger") },
      ]
    },
    {
      id: "logic",
      label: "Business Logic",
      icon: Code,
      options: [
        { key: "service",    label: "Service",              desc: t("laravelSetup.gen.service") },
        { key: "repository", label: "Repository",           desc: t("laravelSetup.gen.repository") },
        { key: "policy",     label: "Policy",               desc: t("laravelSetup.gen.policy") },
        { key: "observer",   label: "Observer",             desc: t("laravelSetup.gen.observer") },
        { key: "events",     label: "Events & Listeners",   desc: t("laravelSetup.gen.events") },
        { key: "actions",    label: "Action Classes",       desc: t("laravelSetup.gen.actions") },
      ]
    },
    {
      id: "dev",
      label: "Development",
      icon: TestTube,
      options: [
        { key: "tests",      label: "Tests",                desc: t("laravelSetup.gen.tests") },
      ]
    }
  ] as const;

  const activeModel = selectedTarget !== "global" ? models.find(m => m.name === selectedTarget) : null;

  const getOptionState = (key: string): "on" | "off" | "partial" => {
    if (selectedTarget === "global") {
      if (models.length === 0) return "off";
      const all  = models.every(m =>  m.generate[key as keyof typeof m.generate]);
      const none = models.every(m => !m.generate[key as keyof typeof m.generate]);
      if (all)  return "on";
      if (none) return "off";
      return "partial";
    } else {
      return activeModel?.generate[key as keyof typeof activeModel.generate] ? "on" : "off";
    }
  };

  const handleToggle = (key: string, currentVal: boolean) => {
    if (selectedTarget === "global") {
      setGenerateAll(key as any, !currentVal);
    } else if (activeModel) {
      setGenerate(activeModel.name, key as any, !currentVal);
    }
  };

  if (models.length === 0 && currentSubStep > 0) {
    return (
      <div className="si-step-panel">
        <span className="si-section-label">Configuration</span>
        <h1 className="si-title" style={{ marginBottom: 8 }}>{t("laravelSetup.title")}</h1>
        <div style={{ textAlign: "center", padding: "60px 20px", border: "1px dashed var(--border-medium)", borderRadius: 16, color: "var(--text3)" }}>
          <span style={{ fontSize: 36, display: "block", marginBottom: 12, opacity: 0.3 }}>⚙</span>
          <p style={{ fontSize: 14 }}>{t("laravelSetup.noModels")}</p>
          <p style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}>{t("laravelSetup.goBackModels")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="si-step-panel">
      <div>
        <span className="si-section-label">Backend</span>
        <h1 className="si-title" style={{ marginBottom: 4 }}>{t("laravelSetup.title")}</h1>
        <p className="si-subtitle">{t("laravelSetup.subtitle")}</p>
      </div>

      <div style={{ marginTop: 24, marginBottom: 12 }}>
        <SubStepPills steps={SUB_STEPS} current={currentSubStep} onSelect={setCurrentSubStep} />
      </div>

      {/* Sub-step 0 — Framework Setup */}
      {currentSubStep === 0 && (
        <div className="space-y-8" style={{ maxWidth: 840 }}>
          {/* ... Framework Setup UI (same as before but cleaned up) ... */}
          {/* Pattern */}
          <div>
            <span className="si-section-label" style={{ display: "block", marginBottom: 10 }}>{t("laravelSetup.patternSection")}</span>
            <div className="space-y-3">
              {PATTERNS.map(({ id, title, Icon }) => {
                const isSelected = laravelOptions.pattern === id;
                return (
                  <button
                    key={id}
                    onClick={() => setLaravelOptions({ pattern: id })}
                    className={cn(
                      "si-toggle-card w-full text-left flex-row items-center gap-4 transition-all duration-200",
                      isSelected && "on",
                    )}
                    style={{
                      background: isSelected ? "var(--gold-subtle)" : "var(--bg3)",
                      borderColor: isSelected ? "var(--gold)" : "var(--border-subtle)",
                      padding: 16,
                    }}
                  >
                    <div className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                      isSelected ? "bg-gold text-bg" : "bg-bg4 text-gold-dim",
                    )}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm mb-0.5" style={{ color: isSelected ? "var(--gold)" : "var(--text)" }}>{title}</div>
                      <p className="text-[11px] text-text3 leading-normal">{t(`laravelSetup.pattern.${id}.desc`)}</p>
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
            <span className="si-section-label" style={{ display: "block", marginBottom: 10 }}>{t("laravelSetup.authSection")}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {AUTH_OPTIONS.map(({ id, label }) => {
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
                    }} className="flex items-center justify-center">
                      <Shield size={14} style={{ color: isSelected ? "var(--bg)" : "var(--gold-dim)" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: isSelected ? "var(--gold)" : "var(--text)", display: "block" }}>{label}</span>
                      <span style={{ fontSize: 11, color: "var(--text3)" }}>{t(`laravelSetup.auth.${id}.desc`)}</span>
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <span className="si-section-label" style={{ display: "block", marginBottom: 10 }}>{t("laravelSetup.phpVersionSection")}</span>
              <div style={{ display: "flex", gap: 8 }}>
                {PHP_VERSIONS.map((v) => {
                  const isSelected = laravelOptions.php_version === v;
                  return (
                    <button key={v} onClick={() => setLaravelOptions({ php_version: v })}
                      className={cn("px-3.5 py-1.5 rounded-lg border-1.5 text-xs transition-all", 
                        isSelected ? "border-gold bg-gold-subtle text-gold font-bold" : "border-border bg-bg3 text-text2 font-medium"
                      )}
                    >{v}</button>
                  );
                })}
              </div>
            </div>
            <div>
              <span className="si-section-label" style={{ display: "block", marginBottom: 10 }}>{t("laravelSetup.laravelVersionSection")}</span>
              <div style={{ display: "flex", gap: 8 }}>
                {LARAVEL_VERSIONS.map((v) => {
                  const isSelected = laravelOptions.laravel_version === v;
                  return (
                    <button key={v} onClick={() => setLaravelOptions({ laravel_version: v })}
                      className={cn("px-3.5 py-1.5 rounded-lg border-1.5 text-xs transition-all", 
                        isSelected ? "border-gold bg-gold-subtle text-gold font-bold" : "border-border bg-bg3 text-text2 font-medium"
                      )}
                    >{v}</button>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <span className="si-section-label" style={{ display: "block", marginBottom: 10 }}>{t("laravelSetup.engineSection")}</span>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {DB_ENGINES.map(({ id, label }) => {
                const isSelected = laravelOptions.db_engine === id;
                return (
                  <button key={id} onClick={() => setLaravelOptions({ db_engine: id })}
                    className={cn("px-4 py-2 rounded-xl border-1.5 text-xs transition-all flex items-center gap-2", 
                      isSelected ? "border-gold bg-gold-subtle text-gold font-bold" : "border-border bg-bg3 text-text2 font-medium"
                    )}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <span className="si-section-label" style={{ display: "block", marginBottom: 10 }}>{t("laravelSetup.codeOptions")}</span>
            <div className="space-y-2">
              <ToggleCard
                label={t("laravelSetup.strictTypes")}
                description={t("laravelSetup.strictTypesDesc")}
                checked={laravelOptions.use_strict_types ?? true}
                onChange={(val) => setLaravelOptions({ use_strict_types: val })}
              />
              <ToggleCard
                label={t("laravelSetup.readonly")}
                description={t("laravelSetup.readonlyDesc")}
                checked={laravelOptions.use_readonly ?? false}
                onChange={(val) => setLaravelOptions({ use_readonly: val })}
              />
              <ToggleCard
                label={t("laravelSetup.redis")}
                description={t("laravelSetup.redisDesc")}
                checked={laravelOptions.use_redis ?? false}
                onChange={(val) => setLaravelOptions({ use_redis: val })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Sub-step 1 — Generation Settings (Merged Master-Detail) */}
      {currentSubStep === 1 && (
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          
          {/* Sidebar */}
          <div style={{ width: 220, flexShrink: 0, position: "sticky", top: 20 }}>
            <span className="si-section-label" style={{ display: "block", marginBottom: 12 }}>Scope</span>
            <div className="space-y-1.5">
              <button
                onClick={() => setSelectedTarget("global")}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left border-1.5",
                  selectedTarget === "global" 
                    ? "bg-gold-subtle border-gold text-gold shadow-[0_0_20px_rgba(245,200,66,0.1)]" 
                    : "bg-bg3 border-transparent text-text3 hover:bg-bg4 hover:text-text2"
                )}
              >
                <Settings2 size={16} />
                <span className="text-[13px] font-bold">Global Settings</span>
              </button>

              <div style={{ margin: "16px 0 8px 12px", borderLeft: "1px solid var(--border-subtle)", height: 12 }} />
              
              <span className="si-section-label" style={{ display: "block", marginBottom: 8, marginLeft: 4 }}>Models Overrides</span>
              {models.map(m => {
                const isActive = selectedTarget === m.name;
                return (
                  <button
                    key={m.name}
                    onClick={() => setSelectedTarget(m.name)}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl transition-all text-left border-1.5",
                      isActive 
                        ? "bg-gold-subtle border-gold text-gold" 
                        : "bg-bg3 border-transparent text-text3 hover:bg-bg4 hover:text-text2"
                    )}
                  >
                    <span className="text-[12px] font-medium font-mono truncate">{m.name}</span>
                    <div className="flex items-center gap-1.5">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        Object.values(m.generate).every(v => v) ? "bg-green shadow-[0_0_8px_var(--green)]" :
                        Object.values(m.generate).every(v => !v) ? "bg-text3" : "bg-amber-400 shadow-[0_0_8px_#fbbf24]"
                      )} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-text mb-1">
                  {selectedTarget === "global" ? "Global Generation Defaults" : `${selectedTarget} Specific Overrides`}
                </h2>
                <p className="text-xs text-text3">
                  {selectedTarget === "global" 
                    ? "Apply settings to all models in your project." 
                    : `Customize generation specifically for the ${selectedTarget} model.`}
                </p>
              </div>
              {selectedTarget === "global" && (
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gold" />
                    <span className="text-[10px] text-text3 uppercase font-bold tracking-wider">{t("laravelSetup.goldActive")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-[10px] text-text3 uppercase font-bold tracking-wider">{t("laravelSetup.amberPartial")}</span>
                  </div>
                </div>
              )}
            </div>

            {categories.map(cat => (
              <div key={cat.id} className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <cat.icon size={14} className="text-gold opacity-70" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-text2">{cat.label}</span>
                  <div className="h-px bg-border-subtle flex-1 ml-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {cat.options.map(opt => {
                    const state = getOptionState(opt.key);
                    return (
                      <ToggleCard
                        key={opt.key}
                        label={opt.label}
                        description={opt.desc}
                        checked={state === "on" || state === "partial"}
                        partial={state === "partial"}
                        onChange={() => handleToggle(opt.key, state === "on")}
                        dense
                      />
                    );
                  })}
                </div>
              </div>
            ))}

            {selectedTarget === "global" && (
              <div className="si-info-card bg-gold/5 border-gold/20">
                <div className="flex gap-3">
                  <Settings2 className="text-gold shrink-0 animate-pulse" size={18} />
                  <p className="text-[11px] text-text2 leading-relaxed">
                    <span className="font-bold text-gold uppercase tracking-tighter">Tip:</span> Modifying a global setting will override any specific model customizations for that option. Use partial (amber) indicators to identify mixed configurations.
                  </p>
                </div>
              </div>
            )}
          </div>
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
  dense = false,
}: {
  label: string;
  description: string;
  checked: boolean;
  partial?: boolean;
  onChange: (val: boolean) => void;
  dense?: boolean;
}) {
  const isOn      = checked && !partial;
  const isPartial = partial;

  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "si-toggle-card w-full text-left transition-all duration-200 flex items-center",
        isOn && "on", 
        isPartial && "partial",
        dense ? "p-3 px-4 rounded-xl" : "p-4 px-[18px] rounded-2xl"
      )}
      style={{
        background: isOn ? "var(--gold-subtle)" : isPartial ? "rgba(245,200,66,0.03)" : "var(--bg3)",
        borderColor: isOn ? "var(--gold)" : isPartial ? "#FBBF24" : "var(--border-subtle)",
      }}
    >
      <div
        className={cn("si-toggle shrink-0 mr-4", isOn && "on", isPartial && "partial")}
        style={{ 
          borderColor: isOn ? "var(--gold)" : isPartial ? "#FBBF24" : "var(--border-medium)",
          transform: dense ? "scale(0.85)" : "none"
        }}
      >
        <div className="si-toggle-knob" />
      </div>
      <div className="flex-1 min-w-0">
        <span className={cn(
          "block font-bold leading-none",
          dense ? "text-xs mb-1" : "text-[13px] mb-0.5",
          isOn ? "text-gold" : isPartial ? "text-[#FBBF24]" : "text-text"
        )}>
          {label}
        </span>
        <span className={cn(
          "block text-[10px] leading-tight truncate",
          isOn ? "text-gold-dim" : isPartial ? "rgba(251,191,36,0.7)" : "text-text3"
        )}>
          {description}
        </span>
      </div>
      {isOn && !dense && (
        <div className="w-4 h-4 rounded-full bg-gold flex items-center justify-center shrink-0 ml-2 shadow-[0_0_10px_rgba(245,200,66,0.4)]">
          <Check size={10} strokeWidth={3} className="text-bg" />
        </div>
      )}
    </button>
  );
}
