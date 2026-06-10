"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useWizardStore } from "@/stores/useWizardStore";
import { ComboId } from "@/types/combos";
import { AIAssistant } from "@/components/wizard/AIAssistant";
import { COMMUNITY_TEMPLATES } from "@/lib/templates/community";
import { loadPresets, deletePreset, importPresetFile, exportPresetFile } from "@/lib/presets";
import type { Preset } from "@/types/presets";
import type { ProjectConfig } from "@/types/schema";
import { Sparkles, Loader2 } from "lucide-react";

const SINGLE_STACKS = [
  {
    id: "laravel" as const,
    icon: <img src="/icons/laravel.svg" alt="Laravel" style={{ width: 28, height: 28 }} />,
    title: "Laravel",
    badge: "PHP",
    desc: "Robust backend with Eloquent & artisan CLI.",
    badgeColor: "#ff4d6d",
  },
  {
    id: "fastapi" as const,
    icon: <img src="/icons/fastapi.svg" alt="FastAPI" style={{ width: 28, height: 28 }} />,
    title: "FastAPI",
    badge: "Python",
    desc: "High-performance Python API framework.",
    badgeColor: "#009688",
  },
  {
    id: "nestjs" as const,
    icon: <img src="/icons/nestjs.svg" alt="NestJS" style={{ width: 28, height: 28 }} />,
    title: "NestJS",
    badge: "Node",
    desc: "Progressive Node.js framework.",
    badgeColor: "#ea2845",
  },
  {
    id: "express" as const,
    icon: <img src="/icons/expressjs.svg" alt="Express" style={{ width: 28, height: 28 }} />,
    title: "Express",
    badge: "Node",
    desc: "Minimal, flexible Node.js web framework.",
    badgeColor: "#ffffff",
  },
  {
    id: "nextjs" as const,
    icon: <img src="/icons/nextdotjs.svg" alt="Next.js" style={{ width: 28, height: 28 }} />,
    title: "Next.js",
    badge: "Full",
    desc: "React Framework — frontend or full-stack.",
    badgeColor: "#000000",
  },
  {
    id: "react" as const,
    icon: <img src="/icons/react.svg" alt="React" style={{ width: 28, height: 28 }} />,
    title: "React SPA",
    badge: "Front",
    desc: "Vite-based Single Page Application.",
    badgeColor: "#61dafb",
  },
  {
    id: "t3" as const,
    icon: (
      <div style={{ width: 28, height: 28, borderRadius: 6, background: "linear-gradient(135deg,#6d28d9,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontWeight: 900, fontSize: 11, color: "#fff", letterSpacing: "-0.03em" }}>T3</span>
      </div>
    ),
    title: "T3 Stack",
    badge: "Full",
    desc: "Next.js · tRPC · Prisma · Tailwind.",
    badgeColor: "#6d28d9",
  },
  {
    id: "django" as const,
    icon: <img src="/icons/django.svg" alt="Django" style={{ width: 28, height: 28 }} />,
    title: "Django",
    badge: "Python",
    desc: "Django REST Framework + PostgreSQL.",
    badgeColor: "#092e20",
  },
];

const COMBO_STACKS = [
  { id: 'mern', title: 'MERN', desc: 'MongoDB · Express · React · Node', icon: '/icons/expressjs.svg', useCombo: true },
  { id: 'pern', title: 'PERN', desc: 'PostgreSQL · Express · React · Node', icon: '/icons/prisma.svg', useCombo: true },
  { id: 'mevn', title: 'MEVN', desc: 'MongoDB · Express · Vue 3 · Node', icon: '/icons/expressjs.svg', useCombo: true },
  { id: 'mean', title: 'MEAN', desc: 'MongoDB · Express · Angular · Node', icon: '/icons/expressjs.svg', useCombo: true },
  { id: 'fastapi-react', title: 'FastAPI + React', desc: 'Python · PostgreSQL · React', icon: '/icons/fastapi.svg', useCombo: true },
  { id: 'laravel+react', title: 'Laravel + React', desc: 'PHP · Laravel API · React SPA', icon: '/icons/laravel.svg', useCombo: false },
] as const;

const COMBO_STACK_IDS = ['mern', 'pern', 'mevn', 'mean', 'fastapi+react', 'laravel+react'];

function isComboActive(comboId: string, stack: string | null | undefined): boolean {
  if (!stack) return false;
  if (comboId === 'fastapi-react') return stack === 'fastapi+react';
  return stack === comboId;
}

export function StackStep() {
  const t = useTranslations("steps");
  const { stack, setStack, loadCombo, applyTemplate, projectName, setProjectName, importConfig } = useWizardStore();
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [presets, setPresets] = useState<Preset[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [aiDescription, setAiDescription]   = useState('');
  const [aiLoading, setAiLoading]           = useState(false);
  const [aiError, setAiError]               = useState<string | null>(null);
  const [aiApplied, setAiApplied]           = useState(false);
  const [aiReasoning, setAiReasoning]       = useState<string | null>(null);

  async function handleAIRecommend() {
    const desc = aiDescription.trim();
    if (!desc) return;
    setAiLoading(true);
    setAiError(null);
    setAiApplied(false);
    setAiReasoning(null);
    try {
      const res = await fetch('/api/recommend-stack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: desc }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error ?? 'AI error');
        return;
      }
      importConfig(data.config as ProjectConfig);
      setAiReasoning(data.reasoning ?? null);
      setAiApplied(true);
    } catch {
      setAiError('Network error. Try again.');
    } finally {
      setAiLoading(false);
    }
  }

  useEffect(() => {
    setPresets(loadPresets());
  }, []);

  const handleLoadPreset = (preset: Preset) => {
    importConfig(preset.config);
    setActiveTemplate(null);
  };

  const handleDeletePreset = (id: string) => {
    deletePreset(id);
    setPresets(loadPresets());
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    importPresetFile(file).then(() => setPresets(loadPresets()));
    e.target.value = '';
  };

  return (
    <div className="si-step-panel">
      <div className="si-section-label">{t("stack.sectionLabel")}</div>
      <h1 className="si-title" style={{ marginBottom: 8 }}>{t("stack.title")}</h1>
      <p className="si-subtitle" style={{ marginBottom: 40 }}>
        {t("stack.subtitle")}
      </p>

      {/* Project Name */}
      <div style={{ marginBottom: 48 }}>
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text2)",
            marginBottom: 6,
            letterSpacing: "0.04em",
          }}
        >
          {t("stack.projectNameLabel")}
        </label>
        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder={t("stack.projectNamePlaceholder")}
          className="si-input"
          style={{ maxWidth: 420, fontFamily: "var(--font-jetbrains-mono)", fontSize: 14 }}
        />
      </div>

      {/* Quick Start Templates */}
      <div style={{ marginBottom: 40 }}>
        <div className="si-section-label">{t("stack.quickStart")}</div>
        <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 4, marginBottom: 16 }}>
          {t("stack.quickStartDesc")}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {COMMUNITY_TEMPLATES.map((tmpl) => {
            const isActive = activeTemplate === tmpl.id;
            return (
              <div
                key={tmpl.id}
                onClick={() => {
                  setActiveTemplate(tmpl.id);
                  applyTemplate(tmpl.models as any);
                }}
                style={{
                  position: "relative",
                  width: 148,
                  padding: "16px 14px",
                  borderRadius: 12,
                  border: `1.5px solid ${isActive ? "var(--gold)" : "var(--border-subtle)"}`,
                  background: isActive ? "var(--gold-subtle)" : "var(--bg3)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--gold-border)";
                    (e.currentTarget as HTMLElement).style.background = "var(--bg4)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
                    (e.currentTarget as HTMLElement).style.background = "var(--bg3)";
                  }
                }}
              >
                {isActive && (
                  <span
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      fontSize: 9,
                      fontWeight: 800,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      background: "var(--gold)",
                      color: "var(--bg)",
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}
                  >
                    {t("stack.applied")}
                  </span>
                )}
                <div style={{ fontSize: 24, marginBottom: 8 }}>{(tmpl as any).icon ?? "📦"}</div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: isActive ? "var(--gold)" : "var(--text)",
                    marginBottom: 4,
                  }}
                >
                  {tmpl.name}
                </div>
                <div style={{ fontSize: 11, color: "var(--text3)", lineHeight: 1.5 }}>
                  {(tmpl as any).description ?? tmpl.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* My Presets */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div className="si-section-label" style={{ marginBottom: 0 }}>{t("stack.myPresets")}</div>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              fontSize: 11,
              color: "var(--text3)",
              background: "none",
              border: "1px solid var(--border-subtle)",
              borderRadius: 6,
              padding: "4px 10px",
              cursor: "pointer",
            }}
          >
            {t("stack.importJson")}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            style={{ display: "none" }}
          />
        </div>

        {presets.length === 0 ? (
          <p style={{ fontSize: 12, color: "var(--text3)", fontStyle: "italic" }}>
            {t("stack.noPresets")}
          </p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {presets.map((p) => (
              <div
                key={p.id}
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--border-subtle)",
                  background: "var(--bg3)",
                  minWidth: 160,
                  maxWidth: 220,
                  position: "relative",
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 6 }}>{p.icon ?? "📦"}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{p.name}</div>
                {p.description && (
                  <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 6, lineHeight: 1.4 }}>{p.description}</div>
                )}
                <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: 10 }}>
                  {p.config.stack?.toUpperCase()} · {new Date(p.createdAt).toLocaleDateString()}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => handleLoadPreset(p)}
                    style={{
                      flex: 1,
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--gold)",
                      background: "var(--gold-subtle)",
                      border: "1px solid var(--gold-border)",
                      borderRadius: 6,
                      padding: "4px 0",
                      cursor: "pointer",
                    }}
                  >
                    {t("stack.load")}
                  </button>
                  <button
                    onClick={() => exportPresetFile(p)}
                    style={{ fontSize: 11, background: "var(--bg4)", border: "1px solid var(--border-subtle)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "var(--text3)" }}
                    title={t("stack.exportTitle")}
                  >
                    {t("stack.export")}
                  </button>
                  <button
                    onClick={() => handleDeletePreset(p.id)}
                    style={{ fontSize: 11, background: "none", border: "1px solid var(--border-subtle)", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "var(--text3)" }}
                    title={t("stack.deletePreset")}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Stack Recommender — full wizard pre-fill */}
      <div style={{ maxWidth: 760, marginBottom: 40, padding: 20, borderRadius: 14, border: "1px solid rgba(245,200,66,0.2)", background: "rgba(245,200,66,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <Sparkles size={15} style={{ color: "var(--gold)" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>{t("stack.aiTitle")}</span>
          <span style={{ fontSize: 11, color: "var(--text3)" }}>{t("stack.aiSubtitle")}</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={aiDescription}
            onChange={(e) => { setAiDescription(e.target.value); setAiError(null); setAiApplied(false); }}
            onKeyDown={(e) => e.key === 'Enter' && handleAIRecommend()}
            placeholder='e.g. "SaaS with teams, subscriptions, real-time chat and PDF invoices"'
            className="si-input flex-1"
            style={{ fontSize: 13 }}
            disabled={aiLoading}
          />
          <button
            onClick={handleAIRecommend}
            disabled={aiLoading || !aiDescription.trim()}
            className="si-btn-primary"
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 18px", flexShrink: 0, fontSize: 13 }}
          >
            {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {aiLoading ? t("stack.aiThinking") : t("stack.aiBuildButton")}
          </button>
        </div>
        {aiError && <p style={{ fontSize: 12, color: "var(--red)", marginTop: 8 }}>{aiError}</p>}
        {aiApplied && (
          <div style={{ marginTop: 10 }}>
            <p style={{ fontSize: 12, color: "#4dff91", fontWeight: 600, marginBottom: 4 }}>{t("stack.aiSuccess")}</p>
            {aiReasoning && <p style={{ fontSize: 12, color: "var(--text3)", lineHeight: 1.5 }}>{aiReasoning}</p>}
          </div>
        )}
      </div>

      {/* Divider */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 32,
          maxWidth: 760,
        }}
      >
        <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
        <span
          style={{
            fontSize: 11,
            color: "var(--text3)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            whiteSpace: "nowrap",
          }}
        >
          {t("stack.orBuildFromScratch")}
        </span>
        <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
      </div>

      {/* Two-column manual selection */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 32,
          maxWidth: 760,
          marginBottom: 40,
        }}
      >
        {/* Single Stacks */}
        <div>
          <div className="si-section-label" style={{ marginBottom: 12 }}>{t("stack.singleStack")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {SINGLE_STACKS.map((s) => {
              const isSelected = stack === s.id;
              const isUnfocused = !!stack && !isSelected && COMBO_STACK_IDS.includes(stack as string);
              return (
                <button
                  key={s.id}
                  onClick={() => setStack(s.id)}
                  className="si-stack-card"
                  style={{
                    opacity: isUnfocused ? 0.4 : 1,
                    textAlign: "left",
                    padding: "14px 16px",
                    background: isSelected ? "var(--gold-subtle)" : "var(--bg3)",
                    borderColor: isSelected ? "var(--gold)" : undefined,
                    position: "relative",
                  }}
                >
                  {isSelected && (
                    <span
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        background: "var(--gold)",
                        color: "var(--bg)",
                        padding: "2px 6px",
                        borderRadius: 4,
                      }}
                    >
                      {s.badge}
                    </span>
                  )}
                  <div style={{ marginBottom: 10, minHeight: 28 }}>{s.icon}</div>
                  <span
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 700,
                      marginBottom: 4,
                      color: isSelected ? "var(--gold)" : "var(--text)",
                    }}
                  >
                    {s.title}
                  </span>
                  <span style={{ display: "block", fontSize: 11, color: "var(--text2)", lineHeight: 1.5 }}>
                    {s.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Combo Stacks */}
        <div>
          <div className="si-section-label" style={{ marginBottom: 12 }}>{t("stack.comboStacks")}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {COMBO_STACKS.map((c) => {
              const isSelected = isComboActive(c.id, stack);
              return (
                <button
                  key={c.id}
                  onClick={() =>
                    c.useCombo
                      ? loadCombo(c.id as ComboId)
                      : setStack(c.id as any)
                  }
                  className={["si-stack-card", isSelected ? "selected" : ""].join(" ")}
                  style={{ padding: "14px 18px", textAlign: "left" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <img src={c.icon} alt={c.title} style={{ width: 22, height: 22 }} />
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: isSelected ? "var(--gold)" : "var(--text)",
                        }}
                      >
                        {c.title}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{c.desc}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Stack Recommender */}
      {/* <div style={{ maxWidth: 760, marginBottom: 24 }}>
        <AIAssistant step="stack" placeholder='Describe your project — "SaaS with teams, subscriptions and real-time chat"' />
      </div> */}

      {/* Info card */}
      <div className="si-info-card" style={{ maxWidth: 760 }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--gold)",
            marginBottom: 4,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {t("stack.noteLabel")}
        </p>
        <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
          {t.rich("stack.noteText", {
            code: (chunks) => (
              <code
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  background: "rgba(255,255,255,0.06)",
                  padding: "1px 6px",
                  borderRadius: 4,
                  color: "var(--text)",
                  fontSize: 12,
                }}
              >
                {chunks}
              </code>
            ),
          })}
        </p>
      </div>
    </div>
  );
}
