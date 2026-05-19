"use client";

import { useState } from "react";
import { X, Check, AlertTriangle, Link } from "lucide-react";
import { useWizardStore } from "@/stores/useWizardStore";
import { MODULE_LIBRARY, type LibraryModule } from "@/lib/modules";
import type { Model } from "@stack-init/schema";

interface ModulesModalProps {
  onClose: () => void;
}

type UserLink = { model: string; field: string; references: string };

export function ModulesModal({ onClose }: ModulesModalProps) {
  const { models, addModel, addEnabledServices, addField, addRelation } = useWizardStore();
  const [imported, setImported] = useState<string | null>(null);
  const [missingRequires, setMissingRequires] = useState<string[]>([]);
  const [pendingLinks, setPendingLinks] = useState<UserLink[] | null>(null);
  const [selectedLinks, setSelectedLinks] = useState<Set<string>>(new Set());

  const existingNames = new Set(models.map((m) => m.name));

  const handleImport = (mod: LibraryModule) => {
    // Add new models (skip duplicates)
    for (const m of mod.models) {
      if (!existingNames.has(m.name)) addModel(m as Model);
    }

    // Activate services
    if (mod.services && mod.services.length > 0) addEnabledServices(mod.services);

    // Optimistic set of all model names after this import
    const afterNames = new Set([...existingNames, ...mod.models.map(m => m.name)]);

    // Check missing requires (e.g. Blog needs Auth)
    if (mod.requires && mod.requires.length > 0) {
      const missing = mod.requires.filter(reqId => {
        const req = MODULE_LIBRARY.find(lib => lib.id === reqId);
        return req ? !req.models.some(m => afterNames.has(m.name)) : false;
      });
      setMissingRequires(missing);
    } else {
      setMissingRequires([]);
    }

    // Propose User FK links if User model exists
    if (mod.userLinks && afterNames.has('User')) {
      const applicable = mod.userLinks.filter(l => afterNames.has(l.model));
      if (applicable.length > 0) {
        setPendingLinks(applicable);
        setSelectedLinks(new Set(applicable.map(l => l.model)));
      }
    }

    setImported(mod.id);
    setTimeout(() => setImported(null), 1800);
  };

  // Called when user clicks "+ Import Auth" in the missing-requires banner
  const handleImportRequirement = (reqId: string) => {
    const reqModule = MODULE_LIBRARY.find(m => m.id === reqId);
    if (!reqModule) return;

    for (const m of reqModule.models) {
      if (!existingNames.has(m.name)) addModel(m as Model);
    }
    if (reqModule.services) addEnabledServices(reqModule.services);

    // After importing Auth, check if any previously imported module has pending userLinks
    const afterNames = new Set([...existingNames, ...reqModule.models.map(m => m.name)]);
    const allLinks: UserLink[] = [];
    for (const lib of MODULE_LIBRARY) {
      if (!lib.userLinks) continue;
      if (!lib.models.some(m => afterNames.has(m.name))) continue;
      const applicable = lib.userLinks.filter(l => afterNames.has(l.model));
      allLinks.push(...applicable);
    }
    if (allLinks.length > 0) {
      setPendingLinks(allLinks);
      setSelectedLinks(new Set(allLinks.map(l => l.model)));
    }

    setMissingRequires([]);
  };

  const handleApplyLinks = () => {
    pendingLinks?.forEach(link => {
      if (!selectedLinks.has(link.model)) return;
      addField(link.model, {
        name: link.field,
        type: 'foreignId',
        nullable: false,
        references: link.references,
      } as any);
      // addField auto-adds belongsTo via the FK detection in useWizardStore
      // Add hasMany on the User side
      addRelation('User', { type: 'hasMany', model: link.model });
    });
    setPendingLinks(null);
  };

  const toggleLink = (modelName: string) => {
    setSelectedLinks(prev => {
      const next = new Set(prev);
      if (next.has(modelName)) next.delete(modelName); else next.add(modelName);
      return next;
    });
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

          {/* Missing requires banner */}
          {missingRequires.length > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "9px 12px", marginBottom: 16,
              background: "rgba(245,200,66,0.07)",
              border: "1px solid var(--gold-border)",
              borderRadius: 10, fontSize: 12,
            }}>
              <AlertTriangle size={13} style={{ color: "var(--gold)", flexShrink: 0 }} />
              <span style={{ color: "var(--text2)", flex: 1 }}>
                This module works best with <strong style={{ color: "var(--text)" }}>Auth</strong> (user management).
              </span>
              <button
                onClick={() => handleImportRequirement(missingRequires[0])}
                style={{
                  fontSize: 11, fontWeight: 700, color: "var(--gold)",
                  padding: "3px 10px", borderRadius: 6,
                  border: "1px solid var(--gold-border)",
                  background: "var(--gold-subtle)", cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                + Import Auth
              </button>
              <button
                onClick={() => setMissingRequires([])}
                style={{ fontSize: 11, color: "var(--text3)", cursor: "pointer", textDecoration: "underline", flexShrink: 0 }}
              >
                Dismiss
              </button>
            </div>
          )}

          {/* User links panel */}
          {pendingLinks && (
            <div style={{
              padding: "14px 16px", marginBottom: 16,
              background: "var(--bg4)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <Link size={13} style={{ color: "var(--gold)" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>
                  Link imported models to User?
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                {pendingLinks.map(link => (
                  <label
                    key={link.model}
                    style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedLinks.has(link.model)}
                      onChange={() => toggleLink(link.model)}
                      style={{ accentColor: "var(--gold)", width: 14, height: 14 }}
                    />
                    <span style={{
                      fontFamily: "var(--font-jetbrains-mono)", fontSize: 11,
                      color: selectedLinks.has(link.model) ? "var(--gold)" : "var(--text2)",
                    }}>
                      {link.model}.{link.field}
                    </span>
                    <span style={{ fontSize: 10, color: "var(--text3)" }}>→ users</span>
                  </label>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleApplyLinks}
                  disabled={selectedLinks.size === 0}
                  className="si-btn-primary"
                  style={{ fontSize: 11, padding: "5px 14px" }}
                >
                  Add links
                </button>
                <button
                  onClick={() => setPendingLinks(null)}
                  className="si-btn-secondary"
                  style={{ fontSize: 11, padding: "5px 14px" }}
                >
                  Later
                </button>
              </div>
            </div>
          )}

          {/* Module grid */}
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
                    onClick={() => handleImport(mod)}
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
