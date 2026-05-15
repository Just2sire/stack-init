"use client";

import { useState } from "react";
import { useWizardStore } from "@/stores/useWizardStore";
import type { Model } from "@stack-init/schema";
import { Plus, X, Check, ArrowRight, Share2 } from "lucide-react";

export function RelationsStep() {
  const { models } = useWizardStore();

  return (
    <div className="si-step-panel">
      <div className="si-section-label">Relationships</div>
      <h1 className="si-title" style={{ marginBottom: 8 }}>Relations</h1>
      <p className="si-subtitle" style={{ marginBottom: 32 }}>
        Define relationships between your models. Foreign key fields are auto-detected.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[900px]">
        {models.map((model) => (
          <RelationCard key={model.name} model={model} allModels={models} />
        ))}

        {models.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px", border: "1px dashed var(--border-medium)", borderRadius: 16, color: "var(--text3)" }}>
            <span style={{ fontSize: 36, display: "block", marginBottom: 12, opacity: 0.3 }}>⇄</span>
            <p style={{ fontSize: 14 }}>Create models first</p>
            <p style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}>Go back and define your models to set up relations</p>
          </div>
        )}
      </div>

      {models.length > 0 && (
        <div className="si-info-card" style={{ maxWidth: 900, marginTop: 24 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--gold)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Auto-detection</p>
          <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
            Fields of type <code style={{ fontFamily: "var(--font-jetbrains-mono)", background: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: 4, color: "var(--text)", fontSize: 12 }}>foreignId</code>{" "}
            are automatically detected and generate corresponding relations.
          </p>
        </div>
      )}
    </div>
  );
}

function RelationCard({ model, allModels }: { model: Model; allModels: Model[] }) {
  const { addRelation, removeRelation, stack } = useWizardStore();
  const [relType, setRelType]       = useState("hasMany");
  const [targetModel, setTargetModel] = useState("");
  const [isAdding, setIsAdding]     = useState(false);

  const isLaravel = stack === 'laravel' || stack === 'laravel+react' || stack === 'laravel+nextjs';

  const relTypes = ["hasOne", "hasMany", "belongsTo", "belongsToMany"];
  if (isLaravel) {
    relTypes.push("morphTo", "morphMany", "morphToMany", "morphedByMany");
  }

  const handleAdd = () => {
    if (targetModel) { addRelation(model.name, { type: relType as any, model: targetModel }); setTargetModel(""); setIsAdding(false); }
  };

  return (
    <div className="si-card">
      <div className="si-card-header">
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-gold" />
          <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 14, fontWeight: 700, color: "var(--gold)" }}>{model.name}</span>
        </div>
        <span className="si-badge si-badge-gray">{model.relations.length} rel</span>
      </div>

      <div className="si-card-body">
        {model.relations.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {model.relations.map((rel, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px", borderRadius: 6, background: "rgba(255,255,255,0.02)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                  <span className="si-badge si-badge-purple" style={{ fontSize: 10 }}>{rel.type}</span>
                  <ArrowRight className="text-text3" size={10} />
                  <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 12, fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{rel.model}</span>
                </div>
                <button onClick={() => removeRelation(model.name, idx)} className="si-btn-icon" style={{ width: 18, height: 18, fontSize: 10 }}>
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 12, color: "var(--text3)", fontStyle: "italic", padding: "4px 0" }}>No relations.</p>
        )}

        {isAdding ? (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <select value={relType} onChange={(e) => setRelType(e.target.value)} className="si-select" style={{ fontSize: 12, width: "115px", flexShrink: 0 }}>
                {relTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={targetModel} onChange={(e) => setTargetModel(e.target.value)} className="si-select" style={{ flex: 1, fontSize: 12 }}>
                <option value="">Target...</option>
                {allModels.filter((m) => m.name !== model.name).map((m) => (
                  <option key={m.name} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button 
                onClick={handleAdd} 
                disabled={!targetModel} 
                className="si-btn-primary" 
                style={{ flex: 1, fontSize: 11, height: 32, padding: "0 10px", justifyContent: "center" }}
              >
                <Check size={14} strokeWidth={3} />
                Confirm
              </button>
              <button 
                onClick={() => setIsAdding(false)} 
                className="si-btn-secondary" 
                style={{ flex: 1, fontSize: 11, height: 32, padding: "0 10px", justifyContent: "center" }}
              >
                <X size={14} />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsAdding(true)} 
            className="si-btn-ghost" 
            style={{ marginTop: 8, width: "100%", textAlign: "center", fontSize: 11, padding: "8px", border: "1px dashed var(--border-subtle)", borderRadius: 8 }}
          >
            <Plus size={14} />
            Add relationship
          </button>
        )}
      </div>
    </div>
  );
}
