"use client";

import { useWizardStore, type ServiceId, type LaravelPluginId } from "@/stores/useWizardStore";
import { MODULE_LIBRARY } from "@/lib/modules";
import { ShieldCheck, Upload, Mail, Database, Globe, Layers, Check, Info, Bell, Users, Image, Activity, Gauge, KeyRound } from "lucide-react";
import { AIAssistant } from "@/components/wizard/AIAssistant";

interface LaravelPluginCard {
  id: LaravelPluginId;
  name: string;
  icon: React.ReactNode;
  description: string;
  generates: string[];
  package: string;
}

const LARAVEL_PLUGINS: LaravelPluginCard[] = [
  {
    id: 'notifications',
    name: 'Notifications',
    icon: <Bell size={22} />,
    description: 'Multi-channel notifications (database, mail, broadcast, SMS) with ShouldQueue support.',
    generates: ['app/Notifications/WelcomeNotification.php', 'toMail / toDatabase / toArray'],
    package: 'built-in',
  },
  {
    id: 'socialite',
    name: 'OAuth / Socialite',
    icon: <Globe size={22} />,
    description: 'Social login via Google, GitHub, Facebook. Redirect + callback controller auto-generated.',
    generates: ['Auth/SocialiteController.php', 'routes/socialite', '.env GOOGLE_CLIENT_ID'],
    package: 'laravel/socialite',
  },
  {
    id: 'spatie-permissions',
    name: 'Roles & Permissions',
    icon: <Users size={22} />,
    description: 'RBAC complet avec spatie/laravel-permission — rôles, permissions, middleware HasRole.',
    generates: ['RolesPermissionsSeeder.php', 'Middleware/CheckPermission.php', 'config/permission.php'],
    package: 'spatie/laravel-permission',
  },
  {
    id: 'spatie-media',
    name: 'Media Library',
    icon: <Image size={22} />,
    description: 'Upload + variants (thumbnails, conversions) via spatie/laravel-medialibrary.',
    generates: ['MediaController.php', 'routes/media', 'config/media-library.php'],
    package: 'spatie/laravel-medialibrary',
  },
  {
    id: 'spatie-activity',
    name: 'Activity Log',
    icon: <Activity size={22} />,
    description: 'Audit trail automatique de tous les changements de modèles via spatie/laravel-activitylog.',
    generates: ['ActivityController.php', 'config/activitylog.php', 'LogsActivity trait'],
    package: 'spatie/laravel-activitylog',
  },
  {
    id: 'horizon',
    name: 'Laravel Horizon',
    icon: <Gauge size={22} />,
    description: 'Dashboard de monitoring et supervision des queues Redis (requires use_redis).',
    generates: ['config/horizon.php', 'route /horizon', 'HorizonGate auth'],
    package: 'laravel/horizon',
  },
  {
    id: 'two-factor-auth',
    name: 'Two-Factor Auth',
    icon: <KeyRound size={22} />,
    description: 'TOTP-based 2FA compatible Google Authenticator — enable, confirm, recovery codes.',
    generates: ['Auth/TwoFactorController.php', 'add_2fa_to_users migration', 'EnsureTwoFactorEnabled'],
    package: 'pragmarx/google2fa-laravel',
  },
];

interface ServiceCard {
  id: ServiceId;
  name: string;
  icon: React.ReactNode;
  description: string;
  generates: string[];
  laravelDescription?: string;
  laravelGenerates?: string[];
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
    laravelDescription: 'Storage facade with local/S3 disk support and file validation.',
    laravelGenerates: ['UploadController.php', 'routes/upload', '.env FILESYSTEM_DISK'],
    available: true,
  },
  {
    id: 'email',
    name: 'Email',
    icon: <Mail size={24} />,
    description: 'Nodemailer / Sendgrid setup with templated transactional emails.',
    generates: ['mail.service', 'mail.templates/', '.env SMTP_*'],
    laravelDescription: 'Laravel Mailable class with Blade template and SMTP/Mailgun config.',
    laravelGenerates: ['app/Mail/WelcomeMail.php', 'emails/welcome.blade.php', '.env MAIL_*'],
    available: true,
  },
  {
    id: 'cache',
    name: 'Cache (Redis)',
    icon: <Database size={24} />,
    description: 'Redis client setup with cache helpers for common patterns.',
    generates: ['cache.service', 'redis.config', '.env REDIS_URL'],
    laravelDescription: 'Cache facade helpers with Redis driver and example controller.',
    laravelGenerates: ['CacheExampleController.php', '.env REDIS_HOST', '.env CACHE_DRIVER'],
    available: true,
  },
  {
    id: 'websockets',
    name: 'WebSockets',
    icon: <Globe size={24} />,
    description: 'Socket.io or native WS server with event-based architecture.',
    generates: ['gateway', 'ws.server', 'events/'],
    laravelDescription: 'Laravel Broadcasting with Reverb/Pusher and Laravel Echo client.',
    laravelGenerates: ['config/broadcasting.php', 'resources/js/echo.js', '.env BROADCAST_*'],
    available: true,
  },
  {
    id: 'queue',
    name: 'Queue / Workers',
    icon: <Layers size={24} />,
    description: 'Bull (Node) or Celery (Python) queue setup with worker boilerplate.',
    generates: ['queue.service', 'workers/', '.env REDIS_URL'],
    laravelDescription: 'Laravel Jobs with retry logic and configurable queue connection.',
    laravelGenerates: ['app/Jobs/ExampleJob.php', '.env QUEUE_CONNECTION', '.env REDIS_URL'],
    available: true,
  },
];

export function ServicesStep() {
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

  const visibleServices = isLaravel
    ? ALL_SERVICES.filter(s => s.id !== 'auth')
    : ALL_SERVICES;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="si-title">Services & Integrations</h2>
        <p className="si-subtitle mt-2">
          Select ready-made service modules to generate beyond your data models.
          Each service produces fully working code, not just stubs.
        </p>
      </div>

      {/* Laravel: auth note */}
      {isLaravel && (
        <div className="flex gap-3 p-4 rounded-xl border border-gold/20 bg-gold/5">
          <Info size={16} className="text-gold mt-0.5 shrink-0" />
          <p className="text-xs text-text2 leading-relaxed">
            <strong className="text-gold">Authentication</strong> is configured in the Laravel Setup step — choose between Sanctum, Passport, Breeze or Jetstream there.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleServices.map((service) => {
          const isEnabled = enabledServices.includes(service.id);
          const isAuth    = service.id === 'auth';
          const desc      = (isLaravel && service.laravelDescription) ? service.laravelDescription : service.description;
          const generates = (isLaravel && service.laravelGenerates)   ? service.laravelGenerates   : service.generates;

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
                    <p className="text-xs text-text3 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>

                {/* Generated files preview */}
                <div className="mt-1 pl-1">
                  <p className="text-[10px] font-bold text-text3 uppercase tracking-widest mb-2">Generates</p>
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
            <strong className="text-gold">Authentication enabled.</strong> The auth service will be generated for your stack (JWT login, register, protected routes).
            {!hasUserModel && <span className="ml-1">The <strong>User</strong>, <strong>Session</strong> and <strong>PasswordReset</strong> models have been added automatically.</span>}
          </div>
        </div>
      )}

      {enabledServices.length === 0 && !isLaravel && (
        <p className="text-xs text-text3 text-center py-4">
          No services selected — you can always add them later via the CLI.
        </p>
      )}

      {/* Laravel Plugins — third-party integrations */}
      {isLaravel && (
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-sm text-text">Laravel Packages</h3>
            <p className="text-xs text-text3 mt-1">Ready-made integrations — each generates working boilerplate + install instructions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LARAVEL_PLUGINS.map((plugin) => {
              const isEnabled = laravelPlugins.includes(plugin.id);
              return (
                <div
                  key={plugin.id}
                  onClick={() => toggleLaravelPlugin(plugin.id)}
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
                    {plugin.package}
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
                        {plugin.icon}
                      </div>
                      <div className="flex-1 pr-20">
                        <p className="font-bold text-sm text-text">{plugin.name}</p>
                        <p className="text-xs text-text3 mt-0.5 leading-relaxed">{plugin.description}</p>
                      </div>
                    </div>

                    <div className="mt-1 pl-1">
                      <p className="text-[10px] font-bold text-text3 uppercase tracking-widest mb-2">Generates</p>
                      <div className="flex flex-wrap gap-1.5">
                        {plugin.generates.map(f => (
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
              No Laravel packages selected — you can add them at any time.
            </p>
          )}
        </div>
      )}

      <AIAssistant step="services" placeholder='Which services do I need? E.g. "I want to send emails on user signup"' />
    </div>
  );
}
