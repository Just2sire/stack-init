"use client";

import { useWizardStore } from "@/stores/useWizardStore";
import { Box, Code2, Globe, ShieldCheck, Lock } from "lucide-react";

export function NestStep() {
  const { nestOptions, setNestOptions } = useWizardStore();

  const architectures = [
    { id: 'layered', title: 'Layered', desc: 'Standard controllers/services/repositories architecture.' },
    { id: 'modular', title: 'Modular', desc: 'Highly encapsulated modules for large applications.' },
    { id: 'cqrs', title: 'CQRS', desc: 'Separation of Read and Write concerns for complex logic.' },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h2 className="si-title">NestJS Configuration</h2>
        <p className="si-subtitle mt-2">Fine-tune your backend architecture and features.</p>
      </div>

      {/* Architecture */}
      <section>
        <div className="si-section-label">Architecture Pattern</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {architectures.map((arch) => (
            <div
              key={arch.id}
              onClick={() => setNestOptions({ architecture: arch.id as any })}
              className={[
                "si-toggle-card flex-col items-start gap-4",
                nestOptions.architecture === arch.id ? "on" : ""
              ].join(" ")}
            >
              <div className="flex items-center justify-between w-full">
                <div className={[
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  nestOptions.architecture === arch.id ? "bg-gold text-bg" : "bg-bg4 text-gold-dim"
                ].join(" ")}>
                  <Box size={20} />
                </div>
                <div className="si-toggle">
                  <div className="si-toggle-knob" />
                </div>
              </div>
              <div>
                <div className="font-bold text-sm mb-1">{arch.title}</div>
                <p className="text-[11px] text-text3 leading-normal">{arch.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section>
        <div className="si-section-label">Features & Plugins</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => setNestOptions({ swagger: !nestOptions.swagger })}
            className={[
              "si-toggle-card",
              nestOptions.swagger ? "on" : ""
            ].join(" ")}
          >
            <div className="si-toggle">
              <div className="si-toggle-knob" />
            </div>
            <div className="flex items-center gap-3">
              <Globe size={18} className="text-gold" />
              <div>
                <div className="font-bold text-sm">Swagger Documentation</div>
                <p className="text-[11px] text-text3">Auto-generate OpenAPI spec at /api/docs</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => setNestOptions({ validation: !nestOptions.validation })}
            className={[
              "si-toggle-card",
              nestOptions.validation ? "on" : ""
            ].join(" ")}
          >
            <div className="si-toggle">
              <div className="si-toggle-knob" />
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-gold" />
              <div>
                <div className="font-bold text-sm">Global Validation</div>
                <p className="text-[11px] text-text3">Enforce class-validator and ValidationPipe</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => setNestOptions({ auth: nestOptions.auth === 'jwt' ? 'none' : 'jwt' })}
            className={[
              "si-toggle-card",
              nestOptions.auth === 'jwt' ? "on" : ""
            ].join(" ")}
          >
            <div className="si-toggle">
              <div className="si-toggle-knob" />
            </div>
            <div className="flex items-center gap-3">
              <Lock size={18} className="text-gold" />
              <div>
                <div className="font-bold text-sm">JWT Authentication</div>
                <p className="text-[11px] text-text3">Add Passport JWT Guard, Strategy and AuthModule</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="si-info-card">
        <div className="flex gap-3">
          <Code2 className="text-gold shrink-0" size={20} />
          <div>
            <p className="text-xs font-bold text-gold uppercase tracking-wider mb-1">TypeScript First</p>
            <p className="text-sm text-text2">
              All generated files will use NestJS best practices, including DTOs, Decorators, and dependency injection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
