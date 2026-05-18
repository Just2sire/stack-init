"use client";

import { useWizardStore } from "@/stores/useWizardStore";
import { Terminal, Settings, Shield, Box, Globe, Zap, Wifi, Activity } from "lucide-react";

export function FastAPISetupStep() {
  const { fastapiOptions, setFastAPIOptions } = useWizardStore();

  const toggleFeature = (key: keyof typeof fastapiOptions) =>
    setFastAPIOptions({ [key]: !fastapiOptions[key] } as any);

  const features = [
    { key: 'migrations',       label: 'Alembic Migrations',  desc: 'Generate alembic.ini + env.py for DB migrations.', icon: <Box size={18} /> },
    { key: 'async_mode',       label: 'Async Mode',           desc: 'Use async/await for handlers and DB sessions.',     icon: <Terminal size={18} /> },
    { key: 'cors',             label: 'CORS Middleware',       desc: 'Enable Cross-Origin Resource Sharing.',            icon: <Globe size={18} /> },
    { key: 'swagger',          label: 'Swagger / OpenAPI',     desc: 'Auto-generate API docs at /docs.',                 icon: <Settings size={18} /> },
    { key: 'rate_limiting',    label: 'Rate Limiting',         desc: 'SlowAPI rate limiter on all endpoints.',           icon: <Shield size={18} /> },
    { key: 'background_tasks', label: 'Background Tasks',      desc: 'Generate tasks.py with example BackgroundTasks.',  icon: <Zap size={18} /> },
    { key: 'websockets',       label: 'WebSockets',            desc: 'Add a WebSocket connection manager endpoint.',     icon: <Wifi size={18} /> },
  ] as const;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="si-title">FastAPI Configuration</h2>
        <p className="si-subtitle mt-2">Fine-tune your Python backend settings.</p>
      </div>

      {/* Row 1: Python Version + Auth */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="si-section-label">Python Version</div>
          <select
            value={fastapiOptions.python_version}
            onChange={(e) => setFastAPIOptions({ python_version: e.target.value as any })}
            className="si-select max-w-[200px]"
          >
            <option value="3.12">Python 3.12</option>
            <option value="3.11">Python 3.11</option>
            <option value="3.10">Python 3.10</option>
          </select>
        </div>

        <div>
          <div className="si-section-label">Authentication</div>
          <select
            value={fastapiOptions.auth}
            onChange={(e) => setFastAPIOptions({ auth: e.target.value as any })}
            className="si-select max-w-[220px]"
          >
            <option value="none">None</option>
            <option value="jwt">JWT (python-jose)</option>
            <option value="oauth2">OAuth2 Password Bearer</option>
            <option value="api-key">API Key (Header)</option>
          </select>
        </div>
      </section>

      {/* Row 2: Architecture + Runner */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="si-section-label">Architecture</div>
          <select
            value={fastapiOptions.architecture}
            onChange={(e) => setFastAPIOptions({ architecture: e.target.value as any })}
            className="si-select max-w-[200px]"
          >
            <option value="flat">Flat</option>
            <option value="layered">Layered</option>
            <option value="feature-based">Feature-based</option>
            <option value="domain">Domain-driven</option>
          </select>
        </div>

        <div>
          <div className="si-section-label">Task Runner</div>
          <select
            value={fastapiOptions.runner}
            onChange={(e) => setFastAPIOptions({ runner: e.target.value as any })}
            className="si-select max-w-[200px]"
          >
            <option value="makefile">Makefile</option>
            <option value="bash">Bash scripts</option>
            <option value="none">None</option>
          </select>
        </div>
      </section>

      {/* Feature toggles */}
      <section>
        <div className="si-section-label">Features & Tooling</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map(({ key, label, desc, icon }) => {
            const isOn = !!(fastapiOptions as any)[key];
            return (
              <div
                key={key}
                onClick={() => toggleFeature(key)}
                className={["si-toggle-card items-center", isOn ? "on" : ""].join(" ")}
              >
                <div className={["si-toggle", isOn ? "on" : ""].join(" ")}>
                  <div className="si-toggle-knob" />
                </div>
                <div className="flex items-center gap-3">
                  <div className={isOn ? "text-gold" : "text-text3"}>{icon}</div>
                  <div>
                    <div className="font-bold text-sm">{label}</div>
                    <p className="text-[11px] text-text3">{desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="si-info-card">
        <div className="flex gap-3">
          <Activity className="text-gold shrink-0" size={20} />
          <div>
            <p className="text-xs font-bold text-gold uppercase tracking-wider mb-1">Standard Structure</p>
            <p className="text-sm text-text2">
              We follow official FastAPI recommendations for production-ready project layouts with <code className="text-gold">app/models/</code>, <code className="text-gold">app/routers/</code> and <code className="text-gold">app/database.py</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
