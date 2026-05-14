"use client";

import { useWizardStore } from "@/stores/useWizardStore";
import { cn } from "@/lib/utils";
import { Check, Layers } from "lucide-react";

export function WizardSidebar() {
  const { currentStep, stack, setStep } = useWizardStore();

  const isLaravel = stack === "laravel" || stack === "laravel+react";
  const isReact = stack === "react" || stack === "laravel+react";

  const allSteps = [
    { label: "Stack & Project", index: 0, show: true },
    { label: "Models & Fields", index: 1, show: true },
    { label: "Relations", index: 2, show: true },
    { label: "Laravel Setup", index: 3, show: isLaravel },
    { label: "React Setup", index: isLaravel ? 4 : 3, show: isReact },
    { label: "Output", index: (isLaravel && isReact) ? 5 : 4, show: true },
  ];

  const visibleSteps = allSteps.filter((s) => s.show);

  return (
    <div className="si-wizard-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div
          className="w-9 h-9 rounded-[10px] text-white flex items-center justify-center shadow-[0_0_16px_rgba(108,99,255,0.3)]"
          style={{ background: "linear-gradient(135deg, #6C63FF, #9b87ff)" }}
        >
          <Layers className="w-[18px] h-[18px]" />
        </div>
        <span className="font-display text-[16px] text-white tracking-tight">Stack-Init</span>
      </div>

      {/* Steps */}
      <nav className="flex flex-col gap-1">
        {visibleSteps.map((step) => {
          const isActive = currentStep === step.index;
          const isCompleted = currentStep > step.index;

          return (
            <div
              key={step.label}
              className={cn(
                "si-step-item",
                isActive && "active",
                isCompleted && "done"
              )}
            >
              <div className="si-step-dot">
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : visibleSteps.indexOf(step) + 1}
              </div>
              {step.label}
            </div>
          );
        })}
      </nav>

      {/* Bottom spacer for visual balance */}
      <div className="mt-auto pt-6 border-t border-white/[0.04]">
        <p className="text-[11px] text-[#5c6078] leading-relaxed">
          Define your stack, design your models, and generate everything in one go.
        </p>
      </div>
    </div>
  );
}
