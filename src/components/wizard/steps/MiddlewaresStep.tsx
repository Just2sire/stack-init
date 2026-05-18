"use client";

import { useWizardStore } from "@/stores/useWizardStore";
import { Shield, Activity, Lock, Maximize, Cpu, AlertTriangle, Globe, Cookie, Terminal } from "lucide-react";

export function MiddlewaresStep() {
  const { expressOptions, setExpressOptions } = useWizardStore();

  const middlewares = [
    { id: 'cors', title: 'CORS', icon: <Globe size={18} />, desc: 'Cross-Origin Resource Sharing enablement.' },
    { id: 'morgan', title: 'Morgan', icon: <Activity size={18} />, desc: 'HTTP request logger middleware for node.js.' },
    { id: 'helmet', title: 'Helmet', icon: <Shield size={18} />, desc: 'Help secure Express apps by setting various HTTP headers.' },
    { id: 'rate-limit', title: 'Rate Limit', icon: <Lock size={18} />, desc: 'Basic rate-limiting middleware for Express.' },
    { id: 'cookie-parser', title: 'Cookie Parser', icon: <Cookie size={18} />, desc: 'Parse Cookie header and populate req.cookies.' },
    { id: 'compression', title: 'Compression', icon: <Maximize size={18} />, desc: 'Node.js compression middleware (Gzip).' },
    { id: 'hpp', title: 'HPP', icon: <Shield size={18} />, desc: 'HTTP Parameter Pollution protection.' },
    { id: 'xss-clean', title: 'XSS Clean', icon: <Terminal size={18} />, desc: 'Sanitize user input coming from POST body, GET queries, and url params.' },
    { id: 'error-handler', title: 'Error Handler', icon: <AlertTriangle size={18} />, desc: 'Centralized error handling for all routes.' },
  ];

  const toggleMiddleware = (id: string) => {
    const current = expressOptions.middlewares || [];
    if (current.includes(id as any)) {
      setExpressOptions({ middlewares: current.filter(m => m !== id) as any });
    } else {
      setExpressOptions({ middlewares: [...current, id] as any });
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="si-title">HTTP Middlewares</h2>
        <p className="si-subtitle mt-2">Choose which middleware to include in your Express pipeline.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {middlewares.map((m) => {
          const isSelected = expressOptions.middlewares?.includes(m.id as any);
          return (
            <div
              key={m.id}
              onClick={() => toggleMiddleware(m.id)}
              className={[
                "si-toggle-card items-center",
                isSelected ? "on" : ""
              ].join(" ")}
            >
              <div className={["si-toggle", isSelected ? "on" : ""].join(" ")}>
                <div className="si-toggle-knob" />
              </div>
              <div className="flex items-center gap-3">
                <div className={isSelected ? "text-gold" : "text-text3"}>{m.icon}</div>
                <div>
                  <div className={["font-bold text-sm", isSelected ? "text-gold" : "text-text"].join(" ")}>{m.title}</div>
                  <p className="text-[11px] text-text3 line-clamp-1">{m.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="si-info-card">
        <div className="flex gap-3">
          <Cpu className="text-gold shrink-0" size={20} />
          <div>
            <p className="text-xs font-bold text-gold uppercase tracking-wider mb-1">Standard Stack</p>
            <p className="text-sm text-text2">
              Middlewares will be automatically configured in your <code className="text-gold">app.ts</code> or <code className="text-gold">server.ts</code> using industry best practices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
