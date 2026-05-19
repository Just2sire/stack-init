"use client";

import { useWizardStore, StepId } from "@/stores/useWizardStore";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const SERVICE_ICONS: Record<string, string> = {
  'auth':        '🔐',
  'file-upload': '📁',
  'email':       '📧',
  'cache':       '⚡',
  'websockets':  '🔌',
  'queue':       '📬',
};

const STEP_LABELS: Record<StepId, string> = {
  stack:           "Stack & Project",
  usage:           "Next.js Usage",
  architecture:    "Architecture",
  database:        "Database",
  services:        "Services",
  models:          "Models & Fields",
  relations:       "Relations",
  routes:          "Routes",
  middlewares:     "Middlewares",
  "laravel-setup": "Laravel Setup",
  "nest-setup":    "NestJS Setup",
  "fastapi-setup": "FastAPI Setup",
  "react-setup":   "React Setup",
  integration:     "Integration",
  output:          "Output",
};

export function WizardSidebar() {
  const { steps, currentStepId, setStep, models, stack, enabledServices } = useWizardStore();
  const currentIndex = steps.indexOf(currentStepId);

  const baseFiles = 8;
  const perModel = 4;
  const authFiles = enabledServices.includes('auth') ? 4 : 0;
  const envDockerCI = 3;
  const estimatedFiles = baseFiles + (models.length * perModel) + authFiles + envDockerCI;

  // Badge : nombre de modèles définis
  const getStepBadge = (step: StepId): string | null => {
    if (step === 'models' && models.length > 0) return String(models.length);
    return null;
  };

  return (
    <div className="si-wizard-sidebar">
      {/* Logo */}
      <Link href="/" className="si-wiz-logo" style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textDecoration: "none" }}>
        <Image src="/favicon.svg" alt="StackInit" width={28} height={28} />
        <span style={{
          fontFamily: "var(--font-syne), 'Syne', sans-serif",
          fontSize: 18, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em",
        }}>
          Stack<span style={{ color: "var(--gold)" }}>Init</span>
        </span>
      </Link>

      {/* Steps */}
      <nav style={{ padding: "8px 0", flex: 1 }}>
        {steps.map((id, idx) => {
          const stepIndex = steps.indexOf(id);
          const isActive = currentStepId === id;
          const isCompleted = currentIndex > stepIndex;
          const isClickable = isCompleted || isActive || !!stack;
          const label = STEP_LABELS[id];
          const badge = getStepBadge(id);

          return (
            <div
              key={id}
              onClick={() => isClickable && setStep(id)}
              className={cn(
                "si-step-item",
                isActive && "active",
                isCompleted && "done",
                isClickable && "cursor-pointer"
              )}
              style={{ opacity: !isCompleted && !isActive && !!stack ? 0.55 : undefined }}
            >
              <div className="si-step-dot">
                {isCompleted ? <Check size={14} /> : idx + 1}
              </div>
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400 }}>
                  {label}
                </span>
                {badge && (
                  <span className="si-badge si-badge-gold" style={{ fontSize: 10, padding: "1px 6px" }}>
                    {badge}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid var(--border-subtle)",
          fontSize: 11,
          color: "var(--text3)",
          lineHeight: 1.5,
        }}
      >
        <div style={{ fontWeight: 600, color: "var(--text2)", marginBottom: 4, textTransform: "uppercase" }}>
          Project
        </div>
        {useWizardStore.getState().projectName || "unnamed-project"}
        <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 4 }}>
          ~{estimatedFiles} files will be generated
        </div>
        {enabledServices.length > 0 && (
          <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
            {enabledServices.map(s => <span key={s} title={s}>{SERVICE_ICONS[s] ?? s}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}

