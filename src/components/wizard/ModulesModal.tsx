"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { useWizardStore } from "@/stores/useWizardStore";
import { MODULE_LIBRARY } from "@/lib/modules";
import type { Model } from "@stack-init/schema";

interface ModulesModalProps {
  onClose: () => void;
}

export function ModulesModal({ onClose }: ModulesModalProps) {
  const { models, addModel } = useWizardStore();
  const [imported, setImported] = useState<string | null>(null);

  const existingNames = new Set(models.map((m) => m.name));

  const handleImport = (moduleId: string, moduleModels: Model[]) => {
    let added = 0;
    for (const m of moduleModels) {
      if (!existingNames.has(m.name)) {
        addModel(m);
        added++;
      }
    }
    setImported(moduleId);
    setTimeout(() => setImported(null), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        style={{
          background: "var(--bg3)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 20,
          width: "100%",
          maxWidth: 680,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", fontFamily: "var(--font-syne)", marginBottom: 2 }}>
              Module Library
            </h3>
            <p style={{ fontSize: 12, color: "var(--text3)" }}>
              Import a pre-built set of models into your project in one click.
            </p>
          </div>
          <button onClick={onClose} className="si-btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {MODULE_LIBRARY.map((mod) => {
              const skipped = mod.models.filter((m) => existingNames.has(m.name)).length;
              const willAdd = mod.models.length - skipped;
              const isJustImported = imported === mod.id;

              return (
                <div
                  key={mod.id}
                  style={{
                    padding: "18px 20px",
                    borderRadius: 14,
                    border: `1.5px solid ${isJustImported ? "var(--gold)" : "var(--border-subtle)"}`,
                    background: isJustImported ? "var(--gold-subtle)" : "var(--bg4)",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ fontSize: 26, marginBottom: 8 }}>{mod.icon}</div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: isJustImported ? "var(--gold)" : "var(--text)",
                      marginBottom: 4,
                      fontFamily: "var(--font-syne)",
                    }}
                  >
                    {mod.name}
                  </div>
                  <p style={{ fontSize: 11, color: "var(--text3)", lineHeight: 1.55, marginBottom: 12 }}>
                    {mod.description}
                  </p>

                  {/* Model list preview */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14 }}>
                    {mod.models.map((m) => (
                      <span
                        key={m.name}
                        style={{
                          fontSize: 10,
                          fontFamily: "var(--font-jetbrains-mono)",
                          padding: "2px 7px",
                          borderRadius: 4,
                          background: existingNames.has(m.name) ? "rgba(255,255,255,0.05)" : "rgba(245,200,66,0.1)",
                          color: existingNames.has(m.name) ? "var(--text3)" : "var(--gold)",
                          border: existingNames.has(m.name) ? "1px solid transparent" : "1px solid rgba(245,200,66,0.2)",
                          textDecoration: existingNames.has(m.name) ? "line-through" : "none",
                        }}
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>

                  {skipped > 0 && (
                    <p style={{ fontSize: 10, color: "var(--text3)", marginBottom: 8, fontStyle: "italic" }}>
                      {skipped} model{skipped > 1 ? "s" : ""} already in project — will be skipped.
                    </p>
                  )}

                  <button
                    onClick={() => handleImport(mod.id, mod.models as Model[])}
                    disabled={willAdd === 0}
                    style={{
                      width: "100%",
                      padding: "8px 0",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: willAdd === 0 ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      background: isJustImported
                        ? "var(--gold)"
                        : willAdd === 0
                        ? "rgba(255,255,255,0.05)"
                        : "var(--gold-subtle)",
                      color: isJustImported
                        ? "var(--bg)"
                        : willAdd === 0
                        ? "var(--text3)"
                        : "var(--gold)",
                      border: `1px solid ${isJustImported ? "var(--gold)" : willAdd === 0 ? "var(--border-subtle)" : "var(--gold-border)"}`,
                      transition: "all 0.15s",
                    }}
                  >
                    {isJustImported ? (
                      <><Check size={13} strokeWidth={3} /> Added!</>
                    ) : willAdd === 0 ? (
                      "Already in project"
                    ) : (
                      `+ Add ${willAdd} model${willAdd > 1 ? "s" : ""}`
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid var(--border-subtle)",
            background: "var(--bg2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <p style={{ fontSize: 11, color: "var(--text3)" }}>
            Models with a <span style={{ color: "var(--gold)" }}>gold</span> badge are new · strikethrough = already exists.
          </p>
          <button onClick={onClose} className="si-btn-secondary" style={{ fontSize: 12 }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
