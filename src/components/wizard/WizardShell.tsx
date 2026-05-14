"use client";

import { useWizardStore } from "@/stores/useWizardStore";
import { WizardSidebar } from "./WizardSidebar";
import { StackStep } from "./steps/StackStep";
import { RelationsStep } from "./steps/RelationsStep";
import { LaravelStep } from "./steps/LaravelStep";
import { ModelsStep } from "./steps/ModelsStep";
import { OutputStep } from "./steps/OutputStep";
import { ReactStep } from "./steps/ReactStep";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function WizardShell() {
  const { currentStep, nextStep, prevStep, canProceed, stack } = useWizardStore();

  const isLaravel = stack === "laravel" || stack === "laravel+react";
  const isReact = stack === "react" || stack === "laravel+react";

  const totalSteps = (isLaravel && isReact) ? 6 : (!stack ? 6 : 5);

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StackStep />;
      case 1:
        return <ModelsStep />;
      case 2:
        return <RelationsStep />;
      case 3:
        return isLaravel ? <LaravelStep /> : (isReact ? <ReactStep /> : <OutputStep />);
      case 4:
        return isLaravel && isReact ? <ReactStep /> : <OutputStep />;
      case 5:
        return <OutputStep />;
      default:
        return null;
    }
  };

  const isLastStep = () => {
    if (!stack) return false;
    if (stack === "laravel" && currentStep === 4) return true;
    if (stack === "react" && currentStep === 4) return true;
    if (stack === "laravel+react" && currentStep === 5) return true;
    return false;
  };

  return (
    <div className="si-wizard-layout">
      <WizardSidebar />
      <div className="si-wizard-main">
        <div className="flex-1">
          {renderStep()}
        </div>

        <div className="si-wizard-footer">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="si-btn-secondary inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex gap-2 items-center">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`si-progress-dot ${i === currentStep ? "active" : ""} ${i < currentStep ? "!bg-[#6C63FF]/40" : ""}`}
              />
            ))}
          </div>

          {!isLastStep() ? (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="si-btn-primary inline-flex items-center gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-[120px]" />
          )}
        </div>
      </div>
    </div>
  );
}
