"use client";

import { StepId, useWizardStore } from "@/stores/useWizardStore";
import Link from "next/link";
import { Layers } from "lucide-react";
import { WizardSidebar } from "./WizardSidebar";
import { StackStep } from "./steps/StackStep";
import { UsageStep } from "./steps/UsageStep";
import { ArchitectureStep } from "./steps/ArchitectureStep";
import { DatabaseStep } from "./steps/DatabaseStep";
import { RelationsStep } from "./steps/RelationsStep";
import { LaravelStep } from "./steps/LaravelStep";
import { NestStep } from "./steps/NestStep";
import { ModelsStep } from "./steps/ModelsStep";
import { RoutesStep } from "./steps/RoutesStep";
import { MiddlewaresStep } from "./steps/MiddlewaresStep";
import { OutputStep } from "./steps/OutputStep";
import { ReactStep } from "./steps/ReactStep";
import { FastAPISetupStep } from "./steps/FastAPISetupStep";
import { IntegrationStep } from "./steps/IntegrationStep";
import { ServicesStep } from "./steps/ServicesStep";
import { ArchitectDrawer } from "./ArchitectDrawer";

export function WizardShell() {
  const { currentStepId, nextStep, prevStep, canProceed, steps, setStack, setProjectName } = useWizardStore();

  const QUICK_STARTS = [
    {
      label: 'Blog simple',
      icon: '📝',
      action: () => { setProjectName('my-blog'); setStack('express+react'); nextStep(); },
    },
    {
      label: 'API REST',
      icon: '🔌',
      action: () => { setProjectName('my-api'); setStack('express'); nextStep(); },
    },
    {
      label: 'SaaS Starter',
      icon: '🚀',
      action: () => { setProjectName('my-saas'); setStack('nestjs+react'); nextStep(); },
    },
  ];

  const renderStep = () => {
    switch (currentStepId) {
      case "stack":         return <StackStep />;
      case "usage":         return <UsageStep />;
      case "architecture":  return <ArchitectureStep />;
      case "database":      return <DatabaseStep />;
      case "services":      return <ServicesStep />;
      case "models":        return <ModelsStep />;
      case "relations":     return <RelationsStep />;
      case "routes":        return <RoutesStep />;
      case "middlewares":   return <MiddlewaresStep />;
      case "laravel-setup": return <LaravelStep />;
      case "nest-setup":    return <NestStep />;
      case "fastapi-setup": return <FastAPISetupStep />;
      case "react-setup":   return <ReactStep />;
      case "integration":   return <IntegrationStep />;
      case "output":        return <OutputStep />;
      default:              return <div className="si-empty">Step not implemented: {currentStepId}</div>;
    }
  };

  const currentIndex = steps.indexOf(currentStepId);
  const isLastStep = currentIndex === steps.length - 1;

  const STEP_DESCRIPTIONS: Record<StepId, string> = {
    stack: "Choose your tech stack",
    usage: "Select how you will use Next.js",
    architecture: "Define your project architecture",
    database: "Configure your database & ORM",
    services: "Select service modules to generate",
    models: "Define your data structure",
    relations: "Connect your models",
    'laravel-setup': "Configure your backend",
    'nest-setup': "Configure your NestJS backend",
    'fastapi-setup': "Configure FastAPI backend",
    'react-setup': "Configure your frontend",
    'integration': "Connect Frontend & Backend",
    output: "Generate and download",
    routes: "Define your API routes",
    middlewares: "Select your middlewares",
  };

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
                  Step {currentIndex + 1}
                </span>
                <span style={{ color: "var(--text3)", fontSize: 16, fontWeight: 300 }}>/</span>
                <span style={{ 
                  fontSize: 14, 
                  fontWeight: 600, 
                  color: "var(--text2)",
                  letterSpacing: "-0.01em"
                }}>
                  {STEP_DESCRIPTIONS[currentStepId]}
                </span>
              </div>
            </div>
          </div>
          <ArchitectDrawer />
        </div>

        {/* Quick-start presets */}
        {currentStepId === 'stack' && (
          <div style={{
            padding: '8px 32px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--bg2)',
          }}>
            <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginRight: 4 }}>
              Quick start:
            </span>
            {QUICK_STARTS.map(qs => (
              <button
                key={qs.label}
                onClick={() => qs.action()}
                style={{
                  fontSize: 11, fontWeight: 600,
                  padding: '4px 12px', borderRadius: 100,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg3)',
                  color: 'var(--text2)',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold-border)'; e.currentTarget.style.color = 'var(--gold)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text2)'; }}
              >
                <span>{qs.icon}</span>
                {qs.label}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="si-wiz-body">
          <div className="si-step-panel" key={currentStepId}>{renderStep()}</div>
        </div>

        {/* Footer */}
        <div className="si-wizard-footer">
          <button
            onClick={prevStep}
            disabled={currentIndex === 0}
            className="si-btn-secondary"
          >
            ← Back
          </button>

          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {steps.map((id, i) => (
              <div
                key={id}
                className={[
                  "si-progress-dot",
                  i === currentIndex ? "active" : "",
                  i < currentIndex  ? "done"   : "",
                ].join(" ")}
              />
            ))}
          </div>

          {!isLastStep ? (
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

