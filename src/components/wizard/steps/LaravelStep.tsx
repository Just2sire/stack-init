"use client";

import { useWizardStore } from "@/stores/useWizardStore";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Settings2, Info } from "lucide-react";

export function LaravelStep() {
  const { models, setGenerate, setGenerateAll } = useWizardStore();
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const options = [
    { key: "migration", label: "Migration", desc: "Database table definition" },
    { key: "controller", label: "Controller", desc: "HTTP request handler" },
    { key: "seeder", label: "Seeder", desc: "Seed database with test data" },
    { key: "factory", label: "Factory", desc: "Generate fake model instances" },
    { key: "policy", label: "Policy", desc: "Authorization rules" },
    { key: "routes", label: "Routes", desc: "API / web route registration" },
  ] as const;

  const activeModel = activeTab ? models.find(m => m.name === activeTab) : null;

  /** Get toggle state for "all models" view */
  const getAllState = (key: string): "on" | "off" | "partial" => {
    if (models.length === 0) return "off";
    const all = models.every(m => m.generate[key as keyof typeof m.generate]);
    const none = models.every(m => !m.generate[key as keyof typeof m.generate]);
    if (all) return "on";
    if (none) return "off";
    return "partial";
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="si-title mb-2">
        {activeModel ? `Configure ${activeModel.name}` : "Laravel setup"}
      </h1>
      <p className="si-subtitle mb-8">
        {activeModel
          ? `Toggle which files to generate for the ${activeModel.name} model.`
          : "Configure what should be generated for each model, or set global defaults."}
      </p>

      {/* Model tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        <button
          onClick={() => setActiveTab(null)}
          className={cn(
            "px-4 py-2 rounded-[10px] text-[13px] font-medium transition-all duration-200",
            !activeTab
              ? "bg-[#6C63FF]/12 text-[#a59bff] border border-[#6C63FF]/25"
              : "bg-white/[0.03] text-[#5c6078] border border-white/[0.06] hover:text-[#8b8fa3] hover:border-white/[0.10]"
          )}
        >
          All models
        </button>
        {models.map((m) => {
          const allOn = options.every(o => m.generate[o.key]);
          const noneOn = options.every(o => !m.generate[o.key]);
          return (
            <button
              key={m.name}
              onClick={() => setActiveTab(m.name)}
              className={cn(
                "px-4 py-2 rounded-[10px] text-[13px] font-medium transition-all duration-200 inline-flex items-center gap-2",
                activeTab === m.name
                  ? "bg-[#6C63FF]/12 text-[#a59bff] border border-[#6C63FF]/25"
                  : "bg-white/[0.03] text-[#5c6078] border border-white/[0.06] hover:text-[#8b8fa3] hover:border-white/[0.10]"
              )}
            >
              {m.name}
              <span className={cn(
                "w-2 h-2 rounded-full",
                allOn ? "bg-[#34D399]" : noneOn ? "bg-[#5c6078]" : "bg-[#FBBF24]"
              )} />
            </button>
          );
        })}
      </div>

      {models.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-[14px] border border-dashed border-white/[0.08] text-[#5c6078]">
          <Settings2 className="w-8 h-8 mb-3 opacity-40" />
          <p className="text-[14px]">No models to configure</p>
          <p className="text-[12px] mt-1 text-[#5c6078]/70">Go back and define your models first</p>
        </div>
      ) : activeModel ? (
        /* Single model view */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {options.map((opt) => (
            <ToggleCard
              key={opt.key}
              label={opt.label}
              description={opt.desc}
              checked={activeModel.generate[opt.key]}
              onChange={(val) => setGenerate(activeModel.name, opt.key, val)}
            />
          ))}
        </div>
      ) : (
        /* All models view */
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {options.map((opt) => {
              const state = getAllState(opt.key);
              return (
                <ToggleCard
                  key={opt.key}
                  label={opt.label}
                  description={opt.desc}
                  checked={state === "on"}
                  partial={state === "partial"}
                  onChange={(val) => setGenerateAll(opt.key, val)}
                />
              );
            })}
          </div>

          <div className="si-info-card">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-[#a59bff] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[12px] text-[#8b8fa3] leading-relaxed">
                  <span className="inline-flex items-center gap-1.5 mr-2">
                    <span className="w-2 h-2 rounded-full bg-[#6C63FF] inline-block" /> Indigo
                  </span>
                  = enabled on all models.
                  <span className="inline-flex items-center gap-1.5 mx-2">
                    <span className="w-2 h-2 rounded-full bg-[#FBBF24] inline-block" /> Amber
                  </span>
                  = enabled on some models only. Click to toggle all.
                </p>
              </div>
            </div>
          </div>
        </>
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
}: {
  label: string;
  description: string;
  checked: boolean;
  partial?: boolean;
  onChange: (val: boolean) => void;
}) {
  const isOn = checked && !partial;
  const isPartial = partial;

  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "si-toggle-card",
        isOn && "on",
        isPartial && "!border-[#FBBF24]/25 !bg-[#FBBF24]/[0.04]"
      )}
    >
      {/* Toggle switch */}
      <div className={cn(
        "si-toggle",
        isOn && "on",
        isPartial && "!bg-[#FBBF24]"
      )}>
        <div className={cn(
          "si-toggle-knob",
          (isOn || isPartial) && "!left-[21px]"
        )} />
      </div>

      <div className="flex-1 text-left">
        <span className={cn(
          "block text-[13px] font-medium",
          isOn ? "text-[#a59bff]" : isPartial ? "text-[#FBBF24]" : "text-[#c5c8d8]"
        )}>
          {label}
        </span>
        <span className={cn(
          "block text-[11px] mt-0.5",
          isOn ? "text-[#6C63FF]/70" : isPartial ? "text-[#FBBF24]/60" : "text-[#5c6078]"
        )}>
          {description}
        </span>
      </div>
    </button>
  );
}
