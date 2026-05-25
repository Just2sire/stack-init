"use client";

import { useWizardStore, type ServiceId } from "@/stores/useWizardStore";
import { MODULE_LIBRARY } from "@/lib/modules";
import { ShieldCheck, Upload, Mail, Database, Globe, Layers, Check, Info } from "lucide-react";

interface ServiceCard {
  id: ServiceId;
  name: string;
  icon: React.ReactNode;
  description: string;
  generates: string[];
  badge?: string;
  available: boolean;
}

const ALL_SERVICES: ServiceCard[] = [
  {
    id: 'auth',
    name: 'Authentication',
    icon: <ShieldCheck size={24} />,
    description: 'JWT-based login, register, logout and protected routes.',
    generates: ['auth.service', 'auth.controller', 'auth.routes', 'jwt.middleware', '.env JWT_SECRET'],
    available: true,
  },
  {
    id: 'file-upload',
    name: 'File Upload',
    icon: <Upload size={24} />,
    description: 'Multer or S3 integration for file uploads with validation.',
    generates: ['upload.service', 'upload.routes', 'storage.config'],
    available: true,
  },
  {
    id: 'email',
    name: 'Email',
    icon: <Mail size={24} />,
    description: 'Nodemailer / Sendgrid setup with templated transactional emails.',
    generates: ['mail.service', 'mail.templates/', '.env SMTP_*'],
    available: true,
  },
  {
    id: 'cache',
    name: 'Cache (Redis)',
    icon: <Database size={24} />,
    description: 'Redis client setup with cache helpers for common patterns.',
    generates: ['cache.service', 'redis.config', '.env REDIS_URL'],
    available: true,
  },
  {
    id: 'websockets',
    name: 'WebSockets',
    icon: <Globe size={24} />,
    description: 'Socket.io or native WS server with event-based architecture.',
    generates: ['gateway', 'ws.server', 'events/'],
    available: true,
  },
  {
    id: 'queue',
    name: 'Queue / Workers',
    icon: <Layers size={24} />,
    description: 'Bull (Node) or Celery (Python) queue setup with worker boilerplate.',
    generates: ['queue.service', 'workers/', '.env REDIS_URL'],
    available: true,
  },
];

export function ServicesStep() {
  const { enabledServices, toggleService, applyTemplate, models, stack } = useWizardStore();

  const authService = ALL_SERVICES.find(s => s.id === 'auth')!;
  const isAuthEnabled = enabledServices.includes('auth');
  const hasUserModel  = models.some(m => m.name.toLowerCase() === 'user');
  const authModule    = MODULE_LIBRARY.find(m => m.id === 'auth');

  const handleToggleAuth = () => {
    toggleService('auth');

    // When enabling auth, offer to add auth models if not already present
    if (!isAuthEnabled && !hasUserModel && authModule) {
      applyTemplate(authModule.models);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="si-title">Services & Integrations</h2>
        <p className="si-subtitle mt-2">
          Select ready-made service modules to generate beyond your data models.
          Each service produces fully working code, not just stubs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ALL_SERVICES.map((service) => {
          const isEnabled = enabledServices.includes(service.id);
          const isAuth    = service.id === 'auth';

          return (
            <div
              key={service.id}
              onClick={() => service.available && (isAuth ? handleToggleAuth() : toggleService(service.id))}
              className={[
                "si-card relative transition-all duration-200 overflow-hidden",
                service.available ? "cursor-pointer" : "cursor-not-allowed opacity-50",
                isEnabled ? "ring-1 ring-gold/40" : "",
              ].join(" ")}
              style={{
                background: isEnabled ? "var(--gold-subtle)" : "var(--bg3)",
                borderColor: isEnabled ? "var(--gold-border)" : undefined,
              }}
            >
              {/* Badge */}
              {service.badge && (
                <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                  style={{ color: "var(--text3)", borderColor: "var(--border-subtle)" }}>
                  {service.badge}
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
                    {service.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-text">{service.name}</p>
                    <p className="text-xs text-text3 mt-0.5 leading-relaxed">{service.description}</p>
                  </div>
                </div>

                {/* Generated files preview */}
                <div className="mt-1 pl-1">
                  <p className="text-[10px] font-bold text-text3 uppercase tracking-widest mb-2">Generates</p>
                  <div className="flex flex-wrap gap-1.5">
                    {service.generates.map(f => (
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

      {/* Auth enabled info box */}
      {isAuthEnabled && (
        <div className="flex gap-3 p-4 rounded-xl border border-gold/20 bg-gold/5">
          <Info size={16} className="text-gold mt-0.5 shrink-0" />
          <div className="text-xs text-text2 leading-relaxed">
            <strong className="text-gold">Authentication enabled.</strong> The auth service will be generated for your stack (JWT login, register, protected routes).
            {!hasUserModel && <span className="ml-1">The <strong>User</strong>, <strong>Session</strong> and <strong>PasswordReset</strong> models have been added automatically.</span>}
          </div>
        </div>
      )}

      {enabledServices.length === 0 && (
        <p className="text-xs text-text3 text-center py-4">
          No services selected — you can always add them later via the CLI.
        </p>
      )}
    </div>
  );
}
