"use client";

import { useWizardStore } from "@/stores/useWizardStore";
import { Layout, Database, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

export function UsageStep() {
  const { nextjsUsage, setNextjsUsage } = useWizardStore();
  const t = useTranslations("steps.usage");

  const options = [
    {
      id: "frontend-only" as const,
      title: t("options.frontend-only.title"),
      icon: <Layout className="w-8 h-8" />,
      desc: t("options.frontend-only.desc"),
      benefit: t("options.frontend-only.benefit"),
    },
    {
      id: "full-stack" as const,
      title: t("options.full-stack.title"),
      icon: <Database className="w-8 h-8" />,
      desc: t("options.full-stack.desc"),
      benefit: t("options.full-stack.benefit"),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="si-title">{t("title")}</h2>
        <p className="si-subtitle mt-2">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {options.map((opt) => (
          <div
            key={opt.id}
            onClick={() => setNextjsUsage(opt.id)}
            className={[
              "si-stack-card group",
              nextjsUsage === opt.id ? "selected" : ""
            ].join(" ")}
          >
            <div className="relative z-10">
              <div className={[
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300",
                nextjsUsage === opt.id ? "bg-gold text-bg" : "bg-bg4 text-gold-dim group-hover:text-gold group-hover:bg-gold-subtle"
              ].join(" ")}>
                {opt.icon}
              </div>

              <h3 className="text-xl font-bold mb-3">{opt.title}</h3>
              <p className="text-sm text-text2 leading-relaxed mb-6">
                {opt.desc}
              </p>

              <div className="si-badge si-badge-gold">
                <ArrowRight size={12} className="mr-2" />
                {opt.benefit}
              </div>
            </div>
          </div>
        ))}
      </div>

      {nextjsUsage && (
        <div className="si-info-card animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-sm font-medium">
            {t("nextStep")}: {nextjsUsage === "frontend-only" ? t("nextStepArchitecture") : t("nextStepDatabase")}
          </p>
        </div>
      )}
    </div>
  );
}
