"use client";

import { useState } from "react";
import { useWizardStore } from "@/stores/useWizardStore";
import { Trash2, ArrowRight, Plus, Info } from "lucide-react";
import type { Model } from "@stack-init/schema";

export function RelationsStep() {
  const { models } = useWizardStore();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="si-title mb-2">Relations</h1>
      <p className="si-subtitle mb-10">
        Define relationships between your models. Foreign key fields are auto-detected.
      </p>

      <div className="flex flex-col gap-5">
        {models.map((model) => (
          <RelationCard key={model.name} model={model} allModels={models} />
        ))}

        {models.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 rounded-[14px] border border-dashed border-white/[0.08] text-[#5c6078]">
            <Info className="w-8 h-8 mb-3 opacity-40" />
            <p className="text-[14px]">Create models first</p>
            <p className="text-[12px] mt-1 text-[#5c6078]/70">Go back and define your models to set up relations</p>
          </div>
        )}
      </div>

      {models.length > 0 && (
        <div className="si-info-card mt-8">
          <p className="text-[11px] font-medium text-[#a59bff] mb-1 uppercase tracking-wider">Auto-detection</p>
          <p className="text-[13px] text-[#8b8fa3] leading-relaxed">
            Fields of type <code className="font-mono bg-white/[0.05] px-1.5 py-0.5 rounded text-[#c5c8d8] text-[12px]">foreignId</code> are automatically detected and generate corresponding relations.
          </p>
        </div>
      )}
    </div>
  );
}

function RelationCard({ model, allModels }: { model: Model; allModels: Model[] }) {
  const { addRelation, removeRelation } = useWizardStore();
  const [relType, setRelType] = useState("hasMany");
  const [targetModel, setTargetModel] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (targetModel) {
      addRelation(model.name, { type: relType, model: targetModel });
      setTargetModel("");
      setIsAdding(false);
    }
  };

  const relTypes = ["hasOne", "hasMany", "belongsTo", "belongsToMany"];

  return (
    <div className="si-card overflow-hidden">
      <div className="si-card-header">
        <h3 className="font-mono text-[14px] text-white font-medium tracking-tight">{model.name}</h3>
        <span className="si-badge si-badge-gray">{model.relations.length} relation{model.relations.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="si-card-body">
        {model.relations.length > 0 ? (
          <div className="flex flex-col">
            {model.relations.map((rel, index) => (
              <div key={index} className="si-field-row justify-between group">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[13px] text-white font-medium">{model.name}</span>
                  <span className="si-badge si-badge-purple">{rel.type}</span>
                  <ArrowRight className="w-3 h-3 text-[#5c6078]" />
                  <span className="font-mono text-[13px] text-[#8b8fa3]">{rel.model}</span>
                </div>
                <button
                  onClick={() => removeRelation(model.name, index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[#5c6078] hover:text-[#E24B4A]"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-[#5c6078] italic py-2">No relations defined yet.</p>
        )}

        {/* Add relation inline */}
        {isAdding ? (
          <div className="flex gap-2 items-center mt-3 pt-3 border-t border-white/[0.04]">
            <select
              value={relType}
              onChange={(e) => setRelType(e.target.value)}
              className="si-select text-[13px] py-2"
            >
              {relTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={targetModel}
              onChange={(e) => setTargetModel(e.target.value)}
              className="si-select flex-1 text-[13px] py-2"
            >
              <option value="">Select model...</option>
              {allModels.filter(m => m.name !== model.name).map(m => (
                <option key={m.name} value={m.name}>{m.name}</option>
              ))}
            </select>
            <button onClick={handleAdd} disabled={!targetModel} className="si-btn-primary text-[12px] py-2 px-4">
              Add
            </button>
            <button onClick={() => setIsAdding(false)} className="si-btn-icon !w-8 !h-8">
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="si-btn-ghost text-[13px] mt-2 w-full text-center"
          >
            <Plus className="w-3.5 h-3.5 inline mr-1" />
            Add relation
          </button>
        )}
      </div>
    </div>
  );
}
