"use client";

import { useWizardStore } from "@/stores/useWizardStore";
import { SubStepPills } from "../SubStepPills";
import { Box, Globe, ShieldCheck, Lock, Folder, FileCode, Check, Database, Layers, Zap, Leaf } from "lucide-react";

const SUB_STEPS = [
  { label: "Architecture Layout" },
  { label: "Database & ORM" },
  { label: "Modules & Security" },
];

const ARCH_TREES = {
  layered: [
    "src/",
    "├── app.module.ts",
    "├── main.ts",
    "├── controllers/",
    "│   └── users.controller.ts",
    "├── services/",
    "│   └── users.service.ts",
    "└── repositories/",
    "    └── users.repository.ts"
  ],
  modular: [
    "src/",
    "├── app.module.ts",
    "├── main.ts",
    "└── users/",
    "    ├── users.module.ts",
    "    ├── users.controller.ts",
    "    ├── users.service.ts",
    "    └── dto/",
    "        ├── create-user.dto.ts",
    "        └── update-user.dto.ts"
  ],
  cqrs: [
    "src/",
    "├── app.module.ts",
    "├── main.ts",
    "└── users/",
    "    ├── users.module.ts",
    "    ├── commands/",
    "    │   ├── create-user.command.ts",
    "    │   └── handlers/",
    "    ├── queries/",
    "    │   ├── get-user.query.ts",
    "    │   └── handlers/",
    "    └── events/",
    "        └── user-created.event.ts"
  ]
};

const ORM_OPTIONS = [
  { id: 'typeorm',  title: 'TypeORM',  desc: 'Decorator-based ORM, native NestJS integration.',      Icon: Layers },
  { id: 'prisma',   title: 'Prisma',   desc: 'Type-safe schema-first ORM with full auto-completion.', Icon: Database },
  { id: 'mongoose', title: 'Mongoose', desc: 'MongoDB ODM — requires MongoDB engine.',                Icon: Leaf },
  { id: 'drizzle',  title: 'Drizzle',  desc: 'Lightweight TypeScript-first SQL query builder.',       Icon: Zap },
] as const;

const DB_ENGINES = [
  { id: 'postgresql', label: 'PostgreSQL' },
  { id: 'mysql',      label: 'MySQL' },
  { id: 'sqlite',     label: 'SQLite' },
  { id: 'mongodb',    label: 'MongoDB' },
] as const;

export function NestStep() {
  const { nestOptions, setNestOptions, currentSubStep, setCurrentSubStep } = useWizardStore();

  const architectures = [
    { id: 'layered', title: 'Layered', desc: 'Standard controllers/services/repositories architecture.' },
    { id: 'modular', title: 'Modular', desc: 'Highly encapsulated modules for large applications.' },
    { id: 'cqrs', title: 'CQRS', desc: 'Separation of Read and Write concerns for complex logic.' },
  ] as const;

  const currentOrm = nestOptions.orm ?? 'typeorm';
  const isMongoose = currentOrm === 'mongoose';

  function handleOrmChange(orm: typeof ORM_OPTIONS[number]['id']) {
    if (orm === 'mongoose') {
      setNestOptions({ orm, db_engine: 'mongodb' });
    } else {
      const engine = nestOptions.db_engine === 'mongodb' ? 'postgresql' : nestOptions.db_engine;
      setNestOptions({ orm, db_engine: engine });
    }
  }

  function handleDbEngineChange(engine: typeof DB_ENGINES[number]['id']) {
    if (engine === 'mongodb' && !isMongoose) return;
    if (engine !== 'mongodb' && isMongoose) return;
    setNestOptions({ db_engine: engine });
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="si-section-label">Backend</span>
        <h2 className="si-title" style={{ marginBottom: 4 }}>NestJS Setup</h2>
        <p className="si-subtitle">Fine-tune your modular backend architecture and features.</p>
      </div>

      <SubStepPills steps={SUB_STEPS} current={currentSubStep} onSelect={setCurrentSubStep} />

      {/* Sub-step 0 — Architecture Selection */}
      {currentSubStep === 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, maxWidth: 840, alignItems: "start" }}>
          <div className="space-y-3" role="radiogroup" aria-label="NestJS Architecture Patterns">
            <span className="si-section-label" style={{ marginBottom: 8, display: "block" }}>Select Layout</span>
            {architectures.map((arch) => {
              const isSelected = nestOptions.architecture === arch.id;
              return (
                <button
                  key={arch.id}
                  onClick={() => setNestOptions({ architecture: arch.id as any })}
                  className={[
                    "si-toggle-card w-full text-left flex-row items-center gap-4 transition-all duration-200",
                    isSelected ? "on" : ""
                  ].join(" ")}
                  style={{
                    background: isSelected ? "var(--gold-subtle)" : "var(--bg3)",
                    borderColor: isSelected ? "var(--gold)" : "var(--border-subtle)",
                    padding: 16,
                  }}
                  role="radio"
                  aria-checked={isSelected}
                >
                  <div className={[
                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                    isSelected ? "bg-gold text-bg" : "bg-bg4 text-gold-dim"
                  ].join(" ")}>
                    <Box size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm mb-0.5" style={{ color: isSelected ? "var(--gold)" : "var(--text)" }}>{arch.title}</div>
                    <p className="text-[11px] text-text3 leading-normal line-clamp-2">{arch.desc}</p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center shrink-0">
                      <Check size={12} strokeWidth={3} className="text-bg" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div>
            <span className="si-section-label" style={{ marginBottom: 8, display: "block" }}>Structure Preview</span>
            <div
              className="si-yaml-preview"
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 11,
                padding: 20,
                borderRadius: 16,
                background: "var(--bg3)",
                border: "1px solid var(--border-subtle)",
                color: "var(--text2)",
                boxShadow: "inset 0 2px 8px rgba(0,0,0,0.50)",
                minHeight: 220,
                lineHeight: 1.6,
              }}
            >
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 8 }}>
                <Folder size={13} className="text-gold" />
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text3)", letterSpacing: "0.05em" }}>Generated Directory Tree</span>
              </div>
              {ARCH_TREES[nestOptions.architecture as keyof typeof ARCH_TREES]?.map((line, i) => {
                const isFile = line.includes(".ts");
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: isFile ? "var(--text3)" : "var(--gold)" }}>
                      {isFile ? "📄" : "📁"}
                    </span>
                    <span>{line}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sub-step 1 — Database & ORM */}
      {currentSubStep === 1 && (
        <div style={{ maxWidth: 840 }} className="space-y-6">

          {/* ORM selection */}
          <div>
            <span className="si-section-label" style={{ marginBottom: 10, display: "block" }}>ORM / Database Driver</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {ORM_OPTIONS.map(({ id, title, desc, Icon }) => {
                const isSelected = currentOrm === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleOrmChange(id)}
                    className={[
                      "si-toggle-card w-full text-left flex-row items-center gap-4 transition-all duration-200",
                      isSelected ? "on" : ""
                    ].join(" ")}
                    style={{
                      background: isSelected ? "var(--gold-subtle)" : "var(--bg3)",
                      borderColor: isSelected ? "var(--gold)" : "var(--border-subtle)",
                      padding: 16,
                    }}
                    role="radio"
                    aria-checked={isSelected}
                  >
                    <div className={[
                      "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                      isSelected ? "bg-gold text-bg" : "bg-bg4 text-gold-dim"
                    ].join(" ")}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm mb-0.5" style={{ color: isSelected ? "var(--gold)" : "var(--text)" }}>{title}</div>
                      <p className="text-[11px] text-text3 leading-normal">{desc}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={3} className="text-bg" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DB Engine selection */}
          <div>
            <span className="si-section-label" style={{ marginBottom: 10, display: "block" }}>Database Engine</span>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {DB_ENGINES.map(({ id, label }) => {
                const isMongoPill = id === 'mongodb';
                const isDisabled = isMongoPill ? !isMongoose : isMongoose;
                const isSelected = nestOptions.db_engine === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleDbEngineChange(id)}
                    disabled={isDisabled}
                    style={{
                      padding: "8px 18px",
                      borderRadius: 10,
                      border: `1.5px solid ${isSelected ? "var(--gold)" : isDisabled ? "var(--border-subtle)" : "var(--border)"}`,
                      background: isSelected ? "var(--gold-subtle)" : isDisabled ? "var(--bg2)" : "var(--bg3)",
                      color: isSelected ? "var(--gold)" : isDisabled ? "var(--text3)" : "var(--text2)",
                      fontSize: 12,
                      fontWeight: isSelected ? 700 : 500,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      opacity: isDisabled ? 0.45 : 1,
                      transition: "all 0.15s",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                    {label}
                    {isMongoPill && !isMongoose && (
                      <span style={{ fontSize: 9, opacity: 0.6, marginLeft: 2 }}>Mongoose only</span>
                    )}
                  </button>
                );
              })}
            </div>
            {isMongoose && (
              <p className="text-[11px] text-text3 mt-3">
                MongoDB is required when using Mongoose. Other engines are not compatible.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Sub-step 2 — Modules & Security */}
      {currentSubStep === 2 && (
        <div style={{ maxWidth: 840 }} className="space-y-6">
          <span className="si-section-label" style={{ display: "block" }}>Available Integrations</span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setNestOptions({ swagger: !nestOptions.swagger })}
              className={[
                "si-toggle-card text-left items-center w-full transition-all duration-200",
                nestOptions.swagger ? "on" : ""
              ].join(" ")}
              style={{
                background: nestOptions.swagger ? "var(--gold-subtle)" : "var(--bg3)",
                borderColor: nestOptions.swagger ? "var(--gold)" : "var(--border-subtle)"
              }}
            >
              <div className={["si-toggle shrink-0", nestOptions.swagger ? "on" : ""].join(" ")}>
                <div className="si-toggle-knob" />
              </div>
              <div className="flex items-center gap-3">
                <Globe size={18} className={nestOptions.swagger ? "text-gold" : "text-text3"} />
                <div>
                  <div className="font-bold text-sm" style={{ color: nestOptions.swagger ? "var(--gold)" : "var(--text)" }}>Swagger Documentation</div>
                  <p className="text-[11px] text-text3 mt-0.5">Auto-generate OpenAPI spec at /api/docs</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setNestOptions({ validation: !nestOptions.validation })}
              className={[
                "si-toggle-card text-left items-center w-full transition-all duration-200",
                nestOptions.validation ? "on" : ""
              ].join(" ")}
              style={{
                background: nestOptions.validation ? "var(--gold-subtle)" : "var(--bg3)",
                borderColor: nestOptions.validation ? "var(--gold)" : "var(--border-subtle)"
              }}
            >
              <div className={["si-toggle shrink-0", nestOptions.validation ? "on" : ""].join(" ")}>
                <div className="si-toggle-knob" />
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className={nestOptions.validation ? "text-gold" : "text-text3"} />
                <div>
                  <div className="font-bold text-sm" style={{ color: nestOptions.validation ? "var(--gold)" : "var(--text)" }}>Global Validation</div>
                  <p className="text-[11px] text-text3 mt-0.5">Enforce class-validator and ValidationPipe</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setNestOptions({ auth: nestOptions.auth === 'jwt' ? 'none' : 'jwt' })}
              className={[
                "si-toggle-card text-left items-center w-full transition-all duration-200",
                nestOptions.auth === 'jwt' ? "on" : ""
              ].join(" ")}
              style={{
                background: nestOptions.auth === 'jwt' ? "var(--gold-subtle)" : "var(--bg3)",
                borderColor: nestOptions.auth === 'jwt' ? "var(--gold)" : "var(--border-subtle)"
              }}
            >
              <div className={["si-toggle shrink-0", nestOptions.auth === 'jwt' ? "on" : ""].join(" ")}>
                <div className="si-toggle-knob" />
              </div>
              <div className="flex items-center gap-3">
                <Lock size={18} className={nestOptions.auth === 'jwt' ? "text-gold" : "text-text3"} />
                <div>
                  <div className="font-bold text-sm" style={{ color: nestOptions.auth === 'jwt' ? "var(--gold)" : "var(--text)" }}>JWT Authentication</div>
                  <p className="text-[11px] text-text3 mt-0.5">Add Passport JWT Guard, Strategy and AuthModule</p>
                </div>
              </div>
            </button>
          </div>

          <div className="si-info-card">
            <div className="flex gap-3">
              <FileCode className="text-gold shrink-0" size={18} />
              <div>
                <p className="text-xs font-bold text-gold uppercase tracking-wider mb-1">TypeScript Architecture First</p>
                <p className="text-sm text-text2" style={{ lineHeight: 1.5 }}>
                  All generated modules, controllers, and providers will follow NestJS architectural patterns with strict dependency injection, DTO generation, and {currentOrm === 'typeorm' ? 'TypeORM' : currentOrm === 'prisma' ? 'Prisma' : currentOrm === 'mongoose' ? 'Mongoose' : 'Drizzle'} bindings.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
