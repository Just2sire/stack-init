"use client";

import { useWizardStore } from "@/stores/useWizardStore";
import Link from "next/link";
import { Layers } from "lucide-react";
import { WizardSidebar } from "./WizardSidebar";
import { StackStep } from "./steps/StackStep";
import { RelationsStep } from "./steps/RelationsStep";
import { LaravelStep } from "./steps/LaravelStep";
import { ModelsStep } from "./steps/ModelsStep";
import { OutputStep } from "./steps/OutputStep";
import { ReactStep } from "./steps/ReactStep";
import { ArchitectDrawer } from "./ArchitectDrawer";

export function WizardShell() {
  const { currentStep, nextStep, prevStep, canProceed, stack } = useWizardStore();

  const isLaravel = stack === "laravel" || stack === "laravel+react";
  const isReact   = stack === "react"   || stack === "laravel+react";
  const totalSteps = isLaravel && isReact ? 6 : !stack ? 6 : 5;

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <StackStep />;
      case 1: return <ModelsStep />;
      case 2: return <RelationsStep />;
      case 3: return isLaravel ? <LaravelStep /> : isReact ? <ReactStep /> : <OutputStep />;
      case 4: return isLaravel && isReact ? <ReactStep /> : <OutputStep />;
      case 5: return <OutputStep />;
      default: return null;
    }
  };

  const isLastStep = () => {
    if (!stack) return false;
    if (stack === "laravel"       && currentStep === 4) return true;
    if (stack === "react"         && currentStep === 4) return true;
    if (stack === "laravel+react" && currentStep === 5) return true;
    return false;
  };

  const visibleSteps = [
    { label: "Stack & Project",  index: 0, show: true, desc: "Choose your tech stack" },
    { label: "Models & Fields",  index: 1, show: true, desc: "Define your data structure" },
    { label: "Relations",        index: 2, show: true, desc: "Connect your models" },
    { label: "Laravel Setup",    index: 3, show: isLaravel, desc: "Configure your backend" },
    { label: "React Setup",      index: isLaravel ? 4 : 3, show: isReact, desc: "Configure your frontend" },
    { label: "Output",           index: (isLaravel && isReact) ? 5 : 4, show: true, desc: "Generate and download" },
  ].filter(s => s.show);

  const currentStepInfo = visibleSteps.find(s => s.index === currentStep) || { label: "Configuration", desc: "Set up your project" };

  return (
    <div className="si-wizard-layout">
      <WizardSidebar />

      <div className="si-wizard-main">
        {/* Header */}
        <div className="si-wiz-header" style={{ height: 72, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 20, height: 1, background: "var(--gold)" }} />
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ 
                  fontFamily: "var(--font-syne)", 
                  fontSize: 13, 
                  fontWeight: 800, 
                  color: "var(--gold)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em"
                }}>
                  Step {currentStep + 1}
                </span>
                <span style={{ color: "var(--text3)", fontSize: 16, fontWeight: 300 }}>/</span>
                <span style={{ 
                  fontSize: 14, 
                  fontWeight: 600, 
                  color: "var(--text2)",
                  letterSpacing: "-0.01em"
                }}>
                  {currentStepInfo.desc}
                </span>
              </div>
            </div>
          </div>
          <ArchitectDrawer />
        </div>

        {/* Body */}
        <div className="si-wiz-body">
          <div className="si-step-panel">{renderStep()}</div>
        </div>

        {/* Footer */}
        <div className="si-wizard-footer">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="si-btn-secondary"
          >
            ← Back
          </button>

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={[
                  "si-progress-dot",
                  i === currentStep ? "active" : "",
                  i < currentStep  ? "done"   : "",
                ].join(" ")}
              />
            ))}
          </div>

          {!isLastStep() ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="si-btn-primary"
            >
              Continue →
            </button>
          ) : (
            <div style={{ width: 120 }} />
          )}
        </div>
      </div>
    </div>
  );
}
