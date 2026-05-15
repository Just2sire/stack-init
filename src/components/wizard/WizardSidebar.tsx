"use client";

import { useWizardStore, StepId } from "@/stores/useWizardStore";
import { cn } from "@/lib/utils";
import { Layers, Check } from "lucide-react";
import Link from "next/link";

const STEP_LABELS: Record<StepId, string> = {
  stack:           "Stack & Project",
  usage:           "Next.js Usage",
  architecture:    "Architecture",
  database:        "Database",
  models:          "Models & Fields",
  relations:       "Relations",
  routes:          "Routes",
  middlewares:     "Middlewares",
  "laravel-setup": "Laravel Setup",
  "nest-setup":    "NestJS Setup",
  "react-setup":   "React Setup",
  output:          "Output",
};

export function WizardSidebar() {
  const { steps, currentStepId, setStep, models } = useWizardStore();
  const currentIndex = steps.indexOf(currentStepId);

  // Badge : nombre de modèles définis
  const getStepBadge = (step: StepId): string | null => {
    if (step === 'models' && models.length > 0) return String(models.length);
    return null;
  };

  return (
    <div className="si-wizard-sidebar">
      {/* Logo */}
      <Link href="/" className="si-wiz-logo" style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textDecoration: "none" }}>
        <div style={{ position: "relative", width: 28, height: 28 }}>
          <div style={{
            position: "absolute", top: 4, left: 4, width: 24, height: 24, borderRadius: 6,
            background: "var(--gold-border)", border: "1px solid var(--gold-border)",
          }} />
          <div style={{
            position: "absolute", top: 0, left: 0, width: 24, height: 24, borderRadius: 6,
            background: "var(--gold)", color: "var(--bg)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 2,
            boxShadow: "2px 2px 10px rgba(0,0,0,0.3)",
          }}>
            <Layers className="w-4 h-4" strokeWidth={3} />
          </div>
        </div>
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
          const label = STEP_LABELS[id];
          const badge = getStepBadge(id);

          return (
            <div
              key={id}
              onClick={() => (isCompleted || isActive) && setStep(id)}
              className={cn(
                "si-step-item",
                isActive && "active",
                isCompleted && "done",
                (isCompleted || isActive) && "cursor-pointer"
              )}
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
      </div>
    </div>
  );
}

