"use client";

import { useTranslations } from "next-intl";
import { useWizardStore, type ServiceId, type LaravelPluginId } from "@/stores/useWizardStore";
import { MODULE_LIBRARY } from "@/lib/modules";
import { ShieldCheck, Upload, Mail, Database, Globe, Layers, Check, Info, Bell, Users, Image, Activity, Gauge, KeyRound } from "lucide-react";
import { AIAssistant } from "@/components/wizard/AIAssistant";

interface LaravelPluginCard {
  id: LaravelPluginId;
  icon: React.ReactNode;
  package: string;
}

const LARAVEL_PLUGIN_ICONS: LaravelPluginCard[] = [
  { id: 'notifications',     icon: <Bell     size={22} />, package: 'built-in' },
  { id: 'socialite',         icon: <Globe    size={22} />, package: 'laravel/socialite' },
  { id: 'spatie-permissions', icon: <Users   size={22} />, package: 'spatie/laravel-permission' },
  { id: 'spatie-media',      icon: <Image    size={22} />, package: 'spatie/laravel-medialibrary' },
  { id: 'spatie-activity',   icon: <Activity size={22} />, package: 'spatie/laravel-activitylog' },
  { id: 'horizon',           icon: <Gauge    size={22} />, package: 'laravel/horizon' },
  { id: 'two-factor-auth',   icon: <KeyRound size={22} />, package: 'pragmarx/google2fa-laravel' },
];

interface ServiceCardMeta {
  id: ServiceId;
  icon: React.ReactNode;
  available: boolean;
  badge?: string;
}

const SERVICE_META: ServiceCardMeta[] = [
  { id: 'auth',        icon: <ShieldCheck size={24} />, available: true },
  { id: 'file-upload', icon: <Upload      size={24} />, available: true },
  { id: 'email',       icon: <Mail        size={24} />, available: true },
  { id: 'cache',       icon: <Database    size={24} />, available: true },
  { id: 'websockets',  icon: <Globe       size={24} />, available: true },
  { id: 'queue',       icon: <Layers      size={24} />, available: true },
];

export function ServicesStep() {
  const t = useTranslations("steps");
  const { enabledServices, toggleService, applyTemplate, models, stack, laravelPlugins, toggleLaravelPlugin } = useWizardStore();
  const isLaravel = stack?.includes('laravel') ?? false;

  const isAuthEnabled = enabledServices.includes('auth');
  const hasUserModel  = models.some(m => m.name.toLowerCase() === 'user');
  const authModule    = MODULE_LIBRARY.find(m => m.id === 'auth');

  const handleToggleAuth = () => {
    toggleService('auth');
    if (!isAuthEnabled && !hasUserModel && authModule) {
      applyTemplate(authModule.models);
    }
  };

  const visibleServiceMeta = isLaravel
    ? SERVICE_META.filter(s => s.id !== 'auth')
    : SERVICE_META;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="si-title">{t("services.title")}</h2>
        <p className="si-subtitle mt-2">
          {t("services.readyMadeDesc")}
        </p>
      </div>

      {/* Laravel: auth note */}
      {isLaravel && (
        <div className="flex gap-3 p-4 rounded-xl border border-gold/20 bg-gold/5">
          <Info size={16} className="text-gold mt-0.5 shrink-0" />
          <p className="text-xs text-text2 leading-relaxed">
            <strong className="text-gold">Authentication</strong>{" "}
            {t("services.laravelNote")}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleServiceMeta.map((meta) => {
          const id = meta.id;
          const isEnabled = enabledServices.includes(id);
          const isAuth    = id === 'auth';

          const nameKey     = isLaravel && id !== 'auth' ? `services.options.${id}.titleLaravel` : `services.options.${id}.title`;
          const descKey     = isLaravel ? `services.options.${id}.descLaravel` : `services.options.${id}.desc`;
          const generatesKey = isLaravel ? `services.options.${id}.generatesLaravel` : `services.options.${id}.generates`;

          // Fallback: title is always the same key (no Laravel variant for name)
          const name      = t.has(`services.options.${id}.titleLaravel`) && isLaravel
            ? t(`services.options.${id}.titleLaravel` as any)
            : t(`services.options.${id}.title` as any);

          const desc      = t.has(`services.options.${id}.descLaravel`) && isLaravel
            ? t(`services.options.${id}.descLaravel` as any)
            : t(`services.options.${id}.desc` as any);

          const generatesRaw = t.has(`services.options.${id}.generatesLaravel`) && isLaravel
            ? t(`services.options.${id}.generatesLaravel` as any)
            : t(`services.options.${id}.generates` as any);

          const generates = (generatesRaw as string).split(" · ");

          return (
            <div
              key={id}
              onClick={() => meta.available && (isAuth ? handleToggleAuth() : toggleService(id))}
              className={[
                "si-card relative transition-all duration-200 overflow-hidden",
                meta.available ? "cursor-pointer" : "cursor-not-allowed opacity-50",
                isEnabled ? "ring-1 ring-gold/40" : "",
              ].join(" ")}
              style={{
                background: isEnabled ? "var(--gold-subtle)" : "var(--bg3)",
                borderColor: isEnabled ? "var(--gold-border)" : undefined,
              }}
            >
              {/* Badge */}
              {meta.badge && (
                <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                  style={{ color: "var(--text3)", borderColor: "var(--border-subtle)" }}>
                  {meta.badge}
                </span>
              )}

              {/* Checkmark */}
              {isEnabled && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                  <Check size={12} strokeWidth={3} className="text-bg" />
                </div>
              )}

              <div className="si-card-body flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${isEnabled ? "bg-gold/20 text-gold" : "bg-white/5 text-text3"}`}>
                    {meta.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-text">{name}</p>
                    <p className="text-xs text-text3 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>

                {/* Generated files preview */}
                <div className="mt-1 pl-1">
                  <p className="text-[10px] font-bold text-text3 uppercase tracking-widest mb-2">{t("services.generatesLabel")}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {generates.map(f => (
                      <span key={f} className="font-mono text-[10px] px-2 py-0.5 rounded border"
                        style={{ color: isEnabled ? "var(--gold)" : "var(--text3)", borderColor: isEnabled ? "var(--gold-border)" : "var(--border-subtle)", background: isEnabled ? "var(--gold-subtle)" : "var(--bg4)" }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Auth enabled info box (non-Laravel) */}
      {!isLaravel && isAuthEnabled && (
        <div className="flex gap-3 p-4 rounded-xl border border-gold/20 bg-gold/5">
          <Info size={16} className="text-gold mt-0.5 shrink-0" />
          <div className="text-xs text-text2 leading-relaxed">
            <strong className="text-gold">{t("services.authEnabledTitle")}</strong>{" "}
            {t("services.authEnabledDesc")}
            {!hasUserModel && <span className="ml-1">{t("services.authModelsAdded")}</span>}
          </div>
        </div>
      )}

      {enabledServices.length === 0 && !isLaravel && (
        <p className="text-xs text-text3 text-center py-4">
          {t("services.noServices")}
        </p>
      )}

      {/* Laravel Plugins — third-party integrations */}
      {isLaravel && (
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-sm text-text">{t("services.laravelSection")}</h3>
            <p className="text-xs text-text3 mt-1">{t("services.laravelDesc")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LARAVEL_PLUGIN_ICONS.map((meta) => {
              const id = meta.id;
              const isEnabled = laravelPlugins.includes(id);

              const name         = t(`services.laravel.${id}.title` as any);
              const desc         = t(`services.laravel.${id}.desc` as any);
              const generatesRaw = t(`services.laravel.${id}.generates` as any) as string;
              const generates    = generatesRaw.split(" · ");

              return (
                <div
                  key={id}
                  onClick={() => toggleLaravelPlugin(id)}
                  className={[
                    "si-card relative transition-all duration-200 overflow-hidden cursor-pointer",
                    isEnabled ? "ring-1 ring-gold/40" : "",
                  ].join(" ")}
                  style={{
                    background: isEnabled ? "var(--gold-subtle)" : "var(--bg3)",
                    borderColor: isEnabled ? "var(--gold-border)" : undefined,
                  }}
                >
                  {/* Package badge */}
                  <span className="absolute top-3 right-3 font-mono text-[9px] px-2 py-0.5 rounded-full border"
                    style={{ color: "var(--text3)", borderColor: "var(--border-subtle)", background: "var(--bg4)" }}>
                    {meta.package}
                  </span>

                  {/* Checkmark */}
                  {isEnabled && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                      <Check size={12} strokeWidth={3} className="text-bg" />
                    </div>
                  )}

                  <div className="si-card-body flex flex-col gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${isEnabled ? "bg-gold/20 text-gold" : "bg-white/5 text-text3"}`}>
                        {meta.icon}
                      </div>
                      <div className="flex-1 pr-20">
                        <p className="font-bold text-sm text-text">{name}</p>
                        <p className="text-xs text-text3 mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </div>

                    <div className="mt-1 pl-1">
                      <p className="text-[10px] font-bold text-text3 uppercase tracking-widest mb-2">{t("services.generatesLabel")}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {generates.map(f => (
                          <span key={f} className="font-mono text-[10px] px-2 py-0.5 rounded border"
                            style={{ color: isEnabled ? "var(--gold)" : "var(--text3)", borderColor: isEnabled ? "var(--gold-border)" : "var(--border-subtle)", background: isEnabled ? "var(--gold-subtle)" : "var(--bg4)" }}>
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {laravelPlugins.length === 0 && (
            <p className="text-xs text-text3 text-center py-2">
              {t("services.noLaravel")}
            </p>
          )}
        </div>
      )}

      <AIAssistant step="services" placeholder={t("services.aiPlaceholder")} />
    </div>
  );
}
