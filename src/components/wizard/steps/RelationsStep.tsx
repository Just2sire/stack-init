"use client";

import { useState } from "react";
import { useWizardStore } from "@/stores/useWizardStore";
import type { Model } from "@stack-init/schema";

export function RelationsStep() {
  const { models } = useWizardStore();

  return (
    <div className="si-step-panel">
      <div className="si-section-label">Relationships</div>
      <h1 className="si-title" style={{ marginBottom: 8 }}>Relations</h1>
      <p className="si-subtitle" style={{ marginBottom: 32 }}>
        Define relationships between your models. Foreign key fields are auto-detected.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 720 }}>
        {models.map((model) => (
          <RelationCard key={model.name} model={model} allModels={models} />
        ))}

        {models.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", border: "1px dashed var(--border-medium)", borderRadius: 16, color: "var(--text3)" }}>
            <span style={{ fontSize: 36, display: "block", marginBottom: 12, opacity: 0.3 }}>⇄</span>
            <p style={{ fontSize: 14 }}>Create models first</p>
            <p style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}>Go back and define your models to set up relations</p>
          </div>
        )}
      </div>

      {models.length > 0 && (
        <div className="si-info-card" style={{ maxWidth: 720, marginTop: 24 }}>
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
  const { addRelation, removeRelation } = useWizardStore();
  const [relType, setRelType]       = useState("hasMany");
  const [targetModel, setTargetModel] = useState("");
  const [isAdding, setIsAdding]     = useState(false);

  const relTypes = ["hasOne","hasMany","belongsTo","belongsToMany"];

  const handleAdd = () => {
    if (targetModel) { addRelation(model.name, { type: relType, model: targetModel }); setTargetModel(""); setIsAdding(false); }
  };

  return (
    <div className="si-card">
      <div className="si-card-header">
        <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 14, fontWeight: 700, color: "var(--gold)" }}>{model.name}</span>
        <span className="si-badge si-badge-gray">{model.relations.length} relation{model.relations.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="si-card-body">
        {model.relations.length > 0 ? (
          <div>
            {model.relations.map((rel, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: 6, marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>{model.name}</span>
                  <span className="si-badge si-badge-purple">{rel.type}</span>
                  <span style={{ color: "var(--text3)", fontSize: 12 }}>→</span>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{rel.model}</span>
                </div>
                <button onClick={() => removeRelation(model.name, idx)} className="si-btn-icon" style={{ width: 20, height: 20 }}>✕</button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "var(--text3)", fontStyle: "italic", padding: "4px 0" }}>No relations defined yet.</p>
        )}

        {isAdding ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border-subtle)" }}>
            <select value={relType} onChange={(e) => setRelType(e.target.value)} className="si-select" style={{ fontSize: 13 }}>
              {relTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={targetModel} onChange={(e) => setTargetModel(e.target.value)} className="si-select" style={{ flex: 1, fontSize: 13 }}>
              <option value="">Select model...</option>
              {allModels.filter((m) => m.name !== model.name).map((m) => (
                <option key={m.name} value={m.name}>{m.name}</option>
              ))}
            </select>
            <button onClick={handleAdd} disabled={!targetModel} className="si-btn-primary" style={{ fontSize: 12, padding: "8px 16px" }}>Add</button>
            <button onClick={() => setIsAdding(false)} className="si-btn-icon">✕</button>
          </div>
        ) : (
          <button onClick={() => setIsAdding(true)} className="si-btn-ghost" style={{ marginTop: 8, width: "100%", textAlign: "center" }}>
            + Add relation
          </button>
        )}
      </div>
    </div>
  );
}
