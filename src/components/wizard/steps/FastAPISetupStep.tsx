"use client";

import { useWizardStore } from "@/stores/useWizardStore";
import { SubStepPills } from "../SubStepPills";
import { Terminal, Settings, Shield, Box, Globe, Zap, Wifi, Activity, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function FastAPISetupStep() {
  const t = useTranslations("steps");
  const { fastapiOptions, setFastAPIOptions, currentSubStep, setCurrentSubStep } = useWizardStore();

  const SUB_STEPS = [
    { label: t("fastapiSetup.substep.core") },
    { label: t("fastapiSetup.substep.middlewares") },
  ];

  const toggleFeature = (key: keyof typeof fastapiOptions) =>
    setFastAPIOptions({ [key]: !fastapiOptions[key] } as any);

  const isBeanie = fastapiOptions.orm === 'beanie';

  const features = [
    ...(!isBeanie ? [{ key: 'migrations', label: 'Alembic Migrations', desc: t("fastapiSetup.features.migrations.desc"), icon: <Box size={18} /> }] : []),
    { key: 'async_mode',       label: 'Async Mode',           desc: t("fastapiSetup.features.async_mode.desc"),        icon: <Terminal size={18} /> },
    { key: 'cors',             label: 'CORS Middleware',       desc: t("fastapiSetup.features.cors.desc"),              icon: <Globe size={18} /> },
    { key: 'swagger',          label: 'Swagger / OpenAPI',     desc: t("fastapiSetup.features.swagger.desc"),           icon: <Settings size={18} /> },
    { key: 'rate_limiting',    label: 'Rate Limiting',         desc: t("fastapiSetup.features.rate_limiting.desc"),     icon: <Shield size={18} /> },
    { key: 'background_tasks', label: 'Background Tasks',      desc: t("fastapiSetup.features.background_tasks.desc"), icon: <Zap size={18} /> },
    { key: 'websockets',       label: 'WebSockets',            desc: t("fastapiSetup.features.websockets.desc"),        icon: <Wifi size={18} /> },
  ];

  const pythonVersions = [
    { value: "3.12", label: "Python 3.12", desc: t("fastapiSetup.version.3_12.desc") },
    { value: "3.11", label: "Python 3.11", desc: t("fastapiSetup.version.3_11.desc") },
    { value: "3.10", label: "Python 3.10", desc: t("fastapiSetup.version.3_10.desc") },
  ] as const;

  const ormOptions = [
    { value: "sqlmodel",      label: "SQLModel",        desc: t("fastapiSetup.orm.sqlmodel.desc") },
    { value: "sqlalchemy",    label: "SQLAlchemy",      desc: t("fastapiSetup.orm.sqlalchemy.desc") },
    { value: "tortoise-orm",  label: "Tortoise-ORM",    desc: t("fastapiSetup.orm.tortoise_orm.desc") },
    { value: "beanie",        label: "Beanie (MongoDB)", desc: t("fastapiSetup.orm.beanie.desc") },
  ] as const;

  const handleOrmChange = (value: string) => {
    const patch: Record<string, unknown> = { orm: value };
    if (value === 'beanie') {
      patch.migrations = false;
      patch.async_mode = true;
    }
    setFastAPIOptions(patch as any);
  };

  const authOptions = [
    { value: "none",    label: "No Auth",         desc: t("fastapiSetup.auth.none.desc") },
    { value: "jwt",     label: "JWT Token",        desc: t("fastapiSetup.auth.jwt.desc") },
    { value: "oauth2",  label: "OAuth2 Bearer",    desc: t("fastapiSetup.auth.oauth2.desc") },
    { value: "api-key", label: "API Key Header",   desc: t("fastapiSetup.auth.api_key.desc") },
  ] as const;

  const architectures = [
    { value: "flat",           label: "Flat (Single folder)", desc: t("fastapiSetup.arch.flat.desc") },
    { value: "layered",        label: "Layered (N-Tier)",     desc: t("fastapiSetup.arch.layered.desc") },
    { value: "feature-based",  label: "Feature-based",        desc: t("fastapiSetup.arch.feature_based.desc") },
    { value: "domain",         label: "Domain-driven (DDD)",  desc: t("fastapiSetup.arch.domain.desc") },
  ] as const;

  const taskRunners = [
    { value: "makefile", label: "GNU Makefile",  desc: t("fastapiSetup.runner.makefile.desc") },
    { value: "bash",     label: "Bash Scripts",  desc: t("fastapiSetup.runner.bash.desc") },
    { value: "none",     label: "None",          desc: t("fastapiSetup.runner.none.desc") },
  ] as const;

  return (
    <div className="si-step-panel">
      <div>
        <span className="si-section-label">Backend</span>
        <h2 className="si-title" style={{ marginBottom: 4 }}>{t("fastapiSetup.title")}</h2>
        <p className="si-subtitle">{t("fastapiSetup.subtitle")}</p>
      </div>

      <div style={{ marginTop: 24, marginBottom: 12 }}>
        <SubStepPills steps={SUB_STEPS} current={currentSubStep} onSelect={setCurrentSubStep} />
      </div>

      {/* Sub-step 0 — Core configuration */}
      {currentSubStep === 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24, maxWidth: 840 }}>

          {/* Python Version Selection */}
          <div>
            <span className="si-section-label" style={{ display: "block", marginBottom: 10 }}>Python Runtime Version</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {pythonVersions.map((v) => {
                const isSelected = fastapiOptions.python_version === v.value;
                return (
                  <button
                    key={v.value}
                    onClick={() => setFastAPIOptions({ python_version: v.value as any })}
                    className={cn("si-toggle-card text-left items-center w-full transition-all duration-200", isSelected && "on")}
                    style={{
                      background: isSelected ? "var(--gold-subtle)" : "var(--bg3)",
                      borderColor: isSelected ? "var(--gold)" : "var(--border-subtle)",
                      padding: "10px 14px",
                    }}
                  >
                    <div className={cn("si-toggle shrink-0 mr-3", isSelected && "on")}>
                      <div className="si-toggle-knob" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? "var(--gold)" : "var(--text)" }}>{v.label}</div>
                      <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 1 }}>{v.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ORM / Database Driver Selection */}
          <div>
            <span className="si-section-label" style={{ display: "block", marginBottom: 10 }}>ORM & Database Driver</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {ormOptions.map((v) => {
                const isSelected = fastapiOptions.orm === v.value;
                return (
                  <button
                    key={v.value}
                    onClick={() => handleOrmChange(v.value)}
                    className={cn("si-toggle-card text-left items-center w-full transition-all duration-200", isSelected && "on")}
                    style={{
                      background: isSelected ? "var(--gold-subtle)" : "var(--bg3)",
                      borderColor: isSelected ? "var(--gold)" : "var(--border-subtle)",
                      padding: "12px 16px",
                    }}
                  >
                    <div className={cn("si-toggle shrink-0 mr-3", isSelected && "on")}>
                      <div className="si-toggle-knob" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? "var(--gold)" : "var(--text)" }}>{v.label}</div>
                      <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 1 }}>{v.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Authentication Selection */}
          <div>
            <span className="si-section-label" style={{ display: "block", marginBottom: 10 }}>Security & Authentication</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {authOptions.map((v) => {
                const isSelected = fastapiOptions.auth === v.value;
                return (
                  <button
                    key={v.value}
                    onClick={() => setFastAPIOptions({ auth: v.value as any })}
                    className={cn("si-toggle-card text-left items-center w-full transition-all duration-200", isSelected && "on")}
                    style={{
                      background: isSelected ? "var(--gold-subtle)" : "var(--bg3)",
                      borderColor: isSelected ? "var(--gold)" : "var(--border-subtle)",
                      padding: "12px 16px",
                    }}
                  >
                    <div className={cn("si-toggle shrink-0 mr-3", isSelected && "on")}>
                      <div className="si-toggle-knob" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? "var(--gold)" : "var(--text)" }}>{v.label}</div>
                      <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 1 }}>{v.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Architecture Layout Selection */}
          <div>
            <span className="si-section-label" style={{ display: "block", marginBottom: 10 }}>Architecture Layout</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
              {architectures.map((v) => {
                const isSelected = fastapiOptions.architecture === v.value;
                return (
                  <button
                    key={v.value}
                    onClick={() => setFastAPIOptions({ architecture: v.value as any })}
                    className={cn("si-toggle-card text-left items-center w-full transition-all duration-200", isSelected && "on")}
                    style={{
                      background: isSelected ? "var(--gold-subtle)" : "var(--bg3)",
                      borderColor: isSelected ? "var(--gold)" : "var(--border-subtle)",
                      padding: "12px 16px",
                    }}
                  >
                    <div className={cn("si-toggle shrink-0 mr-3", isSelected && "on")}>
                      <div className="si-toggle-knob" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? "var(--gold)" : "var(--text)" }}>{v.label}</div>
                      <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 1 }}>{v.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Task Runner Selection */}
          <div>
            <span className="si-section-label" style={{ display: "block", marginBottom: 10 }}>Task Runner Automation</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {taskRunners.map((v) => {
                const isSelected = fastapiOptions.runner === v.value;
                return (
                  <button
                    key={v.value}
                    onClick={() => setFastAPIOptions({ runner: v.value as any })}
                    className={cn("si-toggle-card text-left items-center w-full transition-all duration-200", isSelected && "on")}
                    style={{
                      background: isSelected ? "var(--gold-subtle)" : "var(--bg3)",
                      borderColor: isSelected ? "var(--gold)" : "var(--border-subtle)",
                      padding: "10px 14px",
                    }}
                  >
                    <div className={cn("si-toggle shrink-0 mr-3", isSelected && "on")}>
                      <div className="si-toggle-knob" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? "var(--gold)" : "var(--text)" }}>{v.label}</div>
                      <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 1 }}>{v.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Sub-step 1 — Features & Tooling */}
      {currentSubStep === 1 && (
        <div style={{ maxWidth: 840 }} className="space-y-6">
          <span className="si-section-label" style={{ display: "block" }}>{t("fastapiSetup.middlewaresSection")}</span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map(({ key, label, desc, icon }) => {
              const isOn = !!(fastapiOptions as any)[key];
              return (
                <button
                  key={key}
                  onClick={() => toggleFeature(key as keyof typeof fastapiOptions)}
                  className={cn("si-toggle-card text-left w-full transition-all duration-200", isOn && "on")}
                  style={{
                    background: isOn ? "var(--gold-subtle)" : "var(--bg3)",
                    borderColor: isOn ? "var(--gold)" : "var(--border-subtle)",
                    display: "flex",
                    alignItems: "center"
                  }}
                >
                  <div className={cn("si-toggle shrink-0 mr-4", isOn && "on")}>
                    <div className="si-toggle-knob" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={isOn ? "text-gold" : "text-text3"}>{icon}</div>
                    <div>
                      <div className="font-bold text-sm" style={{ color: isOn ? "var(--gold)" : "var(--text)" }}>{label}</div>
                      <p className="text-[11px] text-text3 mt-0.5">{desc}</p>
                    </div>
                  </div>
                  {isOn && (
                    <div className="w-4 h-4 rounded-full bg-gold flex items-center justify-center shrink-0 ml-auto">
                      <Check size={10} strokeWidth={3} className="text-bg" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="si-info-card">
            <div className="flex gap-3">
              <Activity className="text-gold shrink-0" size={20} />
              <div>
                <p className="text-xs font-bold text-gold uppercase tracking-wider mb-1">{t("fastapiSetup.productionReady")}</p>
                <p className="text-sm text-text2" style={{ lineHeight: 1.5 }}>
                  We follow official FastAPI production standards. All modules, models, dependency injections, and async DB handlers are generated inside a standard <code className="text-gold">app/</code> structure.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
