"use client";

import { useWizardStore } from "@/stores/useWizardStore";
import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";

export function WizardSidebar() {
  const { currentStep, stack } = useWizardStore();

  const isLaravel = stack === "laravel" || stack === "laravel+react";
  const isReact = stack === "react" || stack === "laravel+react";

  const allSteps = [
    { label: "Stack & Project", index: 0, show: true },
    { label: "Models & Fields", index: 1, show: true },
    { label: "Relations", index: 2, show: true },
    { label: "Laravel Setup", index: 3, show: isLaravel },
    { label: "React Setup", index: isLaravel ? 4 : 3, show: isReact },
    { label: "Output", index: isLaravel && isReact ? 5 : 4, show: true },
  ];

  const visibleSteps = allSteps.filter((s) => s.show);

  return (
    <div className="si-wizard-sidebar">
      {/* Logo */}
      <div className="si-wiz-logo" style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
      </div>

      {/* Steps */}
      <nav style={{ padding: "8px 0", flex: 1 }}>
        {visibleSteps.map((step, idx) => {
          const isActive = currentStep === step.index;
          const isCompleted = currentStep > step.index;

          return (
            <div
              key={step.label}
              className={cn(
                "si-step-item",
                isActive && "active",
                isCompleted && "done",
              )}
            >
              <div className="si-step-dot">{isCompleted ? "✓" : idx + 1}</div>
              {step.label}
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
        Define your stack, design your models,
        <br />
        and generate everything in one go.
      </div>
    </div>
  );
}
