"use client";

import { useTranslations } from "next-intl";
import { useWizardStore } from "@/stores/useWizardStore";
import { Table, Check, X, Code2, Zap } from "lucide-react";

export function RoutesStep() {
  const t = useTranslations("steps");
  const { models, setGenerate } = useWizardStore();

  const OPTIONS = [
    { key: 'controller', label: t("routes.controller"), icon: <Code2 size={14} />, tooltip: t("routes.tooltipController") },
    { key: 'routes',     label: t("routes.routes"),     icon: <Zap   size={14} />, tooltip: t("routes.tooltipRoutes") },
    { key: 'service',    label: t("routes.service"),    icon: <Code2 size={14} />, tooltip: t("routes.tooltipService") },
    { key: 'repository', label: t("routes.repository"), icon: <Table size={14} />, tooltip: t("routes.tooltipRepository") },
    { key: 'tests',      label: t("routes.tests"),      icon: <Check size={14} />, tooltip: t("routes.tooltipTests") },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h2 className="si-title">{t("routes.title")}</h2>
        <p className="si-subtitle mt-2">{t("routes.subtitle")}</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/5 bg-bg3">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-bottom border-white/5 bg-white/5">
              <th className="py-4 px-6 text-[11px] font-bold text-text3 uppercase tracking-wider">{t("routes.modelColumn")}</th>
              {OPTIONS.map(opt => (
                <th key={opt.key} className="py-4 px-6 text-[11px] font-bold text-text3 uppercase tracking-wider text-center">
                  <div className="flex flex-col items-center gap-1" title={opt.tooltip}>
                    {opt.icon}
                    <span>{opt.label}</span>
                    <span style={{ fontSize: 10, opacity: 0.4, cursor: 'help' }}>ⓘ</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {models.map((model) => (
              <tr key={model.name} className="border-bottom border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-6">
                  <span className="font-bold text-gold">{model.name}</span>
                </td>
                {OPTIONS.map(opt => (
                  <td key={opt.key} className="py-4 px-6 text-center">
                    <div
                      onClick={() => setGenerate(model.name, opt.key as any, !model.generate[opt.key as keyof typeof model.generate])}
                      className={[
                        "si-toggle mx-auto scale-90",
                        model.generate[opt.key as keyof typeof model.generate] ? "on" : ""
                      ].join(" ")}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="si-toggle-knob" />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="si-info-card">
        <p className="text-sm text-text2">
          <strong>{t("routes.tipLabel")}</strong>{" "}{t("routes.tip")}
        </p>
      </div>
    </div>
  );
}
