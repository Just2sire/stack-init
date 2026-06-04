"use client";

import { useWizardStore } from "@/stores/useWizardStore";
import { LayoutGrid, Globe } from "lucide-react";
import { useTranslations } from "next-intl";

export function IntegrationStep() {
  const { projectName, stack, backendUrl, setBackendUrl } = useWizardStore();
  const t = useTranslations("steps.integration");

  const defaultUrl = stack?.includes('fastapi') ? 'http://localhost:8000' : 'http://localhost:3000/api';
  const displayUrl = backendUrl || defaultUrl;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="si-title">{t("title")}</h2>
        <p className="si-subtitle mt-2">{t("subtitle")}</p>
      </div>

      <section>
        <div className="si-section-label">{t("apiUrlLabel")}</div>
        <div className="max-w-md">
          <p className="text-xs text-text3 mb-2">
            {t("apiUrlHint")}
          </p>
          <div className="flex gap-2">
            <input
              value={displayUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder={defaultUrl}
              className="si-input"
            />
            {backendUrl && backendUrl !== defaultUrl && (
              <button
                onClick={() => setBackendUrl('')}
                className="si-btn-secondary"
                style={{ fontSize: 11, whiteSpace: 'nowrap' }}
                title={t("resetTitle")}
              >
                {t("resetButton")}
              </button>
            )}
          </div>
          <p className="text-[10px] text-gold mt-2 uppercase font-bold tracking-wider">
            {t("envVarNote")}
          </p>
        </div>
      </section>

      <section>
        <div className="si-section-label">{t("structureLabel")}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="si-toggle-card on">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-gold-subtle text-gold">
                <LayoutGrid size={24} />
              </div>
              <div>
                <div className="font-bold text-sm text-gold">{t("monorepoTitle")}</div>
                <p className="text-[11px] text-text3 mt-1">
                   {t("monorepoDesc")}
                   <code className="block mt-1 opacity-60">{projectName}/frontend/</code>
                   <code className="block opacity-60">{projectName}/backend/</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="si-info-card">
        <div className="flex gap-3">
          <Globe className="text-gold shrink-0" size={20} />
          <div>
            <p className="text-xs font-bold text-gold uppercase tracking-wider mb-1">{t("corsTitle")}</p>
            <p className="text-sm text-text2">
              {t("corsDesc")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
