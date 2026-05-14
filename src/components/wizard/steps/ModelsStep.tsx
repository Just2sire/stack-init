"use client";

import { useState } from "react";
import { useWizardStore } from "@/stores/useWizardStore";
import { Plus, Trash2, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Model, NamedField } from "@stack-init/schema";

function getTypeStyle(type: string) {
  const t = type.toLowerCase();
  if (["string", "char", "tinytext"].some(k => t.includes(k))) return "si-badge-teal";
  if (["text", "mediumtext", "longtext"].some(k => t.includes(k))) return "si-badge-gray";
  if (["integer", "biginteger", "smallinteger", "int", "bigint"].some(k => t.includes(k))) return "si-badge-purple";
  if (["decimal", "float", "double"].some(k => t.includes(k))) return "si-badge-teal";
  if (t.includes("boolean")) return "si-badge-amber";
  if (["timestamp", "date", "datetime"].some(k => t.includes(k))) return "si-badge-red";
  if (["foreignid", "foreignuuid"].some(k => t.includes(k))) return "si-badge-purple";
  if (["enum", "set"].some(k => t.includes(k))) return "si-badge-amber";
  if (["json", "jsonb"].some(k => t.includes(k))) return "si-badge-gray";
  if (["uuid", "ulid"].some(k => t.includes(k))) return "si-badge-purple";
  return "si-badge-gray";
}

const FIELD_TYPES = [
  "string", "char", "text", "longText", "mediumText", "tinyText",
  "integer", "bigInteger", "smallInteger", "unsignedInteger", "unsignedBigInteger",
  "boolean", "decimal", "float", "double",
  "timestamp", "timestampTz", "date", "dateTime",
  "foreignId", "foreignUuid",
  "enum", "set",
  "json", "jsonb", "uuid", "ulid",
  "binary", "rememberToken",
];

export function ModelsStep() {
  const { models, addModel } = useWizardStore();
  const [newModelName, setNewModelName] = useState("");

  const handleAddModel = () => {
    const name = newModelName.trim();
    if (name && !models.find(m => m.name === name)) {
      addModel({
        name,
        fields: [],
        relations: [],
        generate: {
          migration: true,
          controller: true,
          seeder: false,
          factory: true,
          policy: false,
          routes: true,
        },
      });
      setNewModelName("");
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="si-title mb-2">Models & fields</h1>
      <p className="si-subtitle mb-10">
        Define the data models for your application. Each model becomes an Eloquent model, a migration, and a controller.
      </p>

      <div className="flex gap-3 items-center mb-8">
        <input
          value={newModelName}
          onChange={(e) => setNewModelName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddModel()}
          placeholder="ModelName (PascalCase)..."
          className="si-input max-w-xs font-mono text-[13px]"
        />
        <button onClick={handleAddModel} className="si-btn-primary inline-flex items-center gap-2 text-[13px] py-[10px]">
          <Plus className="w-4 h-4" />
          Add model
        </button>
      </div>

      <div className="flex flex-col gap-5">
        {models.map((model) => (
          <ModelCard key={model.name} model={model} />
        ))}

        {models.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 rounded-[14px] border border-dashed border-white/[0.08] text-[#5c6078]">
            <Table2 className="w-8 h-8 mb-3 opacity-40" />
            <p className="text-[14px]">No models yet</p>
            <p className="text-[12px] mt-1 text-[#5c6078]/70">Add your first model above to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ModelCard({ model }: { model: Model }) {
  const { removeModel, addField, updateField, removeField } = useWizardStore();
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("string");
  const [fieldValues, setFieldValues] = useState("");
  const [fieldRef, setFieldRef] = useState("");
  const [fieldLength, setFieldLength] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const needsValues = ["enum", "set"].includes(fieldType);
  const needsRef = ["foreignId", "foreignUuid"].includes(fieldType);
  const needsLength = ["string", "char"].includes(fieldType);

  const handleAddField = () => {
    if (!fieldName.trim()) return;
    const field: NamedField = {
      name: fieldName.trim(),
      type: fieldType,
      required: true,
    };
    if (needsValues && fieldValues.trim()) {
      field.values = fieldValues.split(",").map((v) => v.trim()).filter(Boolean);
    }
    if (needsRef && fieldRef.trim()) {
      field.references = fieldRef.trim();
    }
    if (needsLength && fieldLength) {
      const len = parseInt(fieldLength, 10);
      if (!isNaN(len)) field.length = len;
    }
    addField(model.name, field);
    setFieldName("");
    setFieldType("string");
    setFieldValues("");
    setFieldRef("");
    setFieldLength("");
  };

  const resetAddState = () => {
    setIsAdding(false);
    setFieldName("");
    setFieldType("string");
    setFieldValues("");
    setFieldRef("");
    setFieldLength("");
  };

  return (
    <div className="si-card overflow-hidden animate-in fade-in duration-300">
      <div className="si-card-header justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-[8px] bg-[#6C63FF]/12 flex items-center justify-center">
            <Table2 className="w-3.5 h-3.5 text-[#a59bff]" />
          </div>
          <h3 className="font-medium text-[14px] text-white tracking-tight font-mono">{model.name}</h3>
          <span className="si-badge si-badge-gray">{model.fields.length} field{model.fields.length !== 1 ? "s" : ""}</span>
        </div>
        <button
          onClick={() => removeModel(model.name)}
          className="si-btn-icon !text-[#E24B4A]/60 hover:!text-[#E24B4A] hover:!bg-[#E24B4A]/8 hover:!border-[#E24B4A]/20"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="si-card-body">
        {model.fields.length > 0 && (
          <div className="flex flex-col">
            {model.fields.map((field) => (
              <div key={field.name} className="si-field-row justify-between group">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[13px] text-[#c5c8d8]">{field.name}</span>
                  <span className={`si-badge ${getTypeStyle(field.type)}`}>{field.type}</span>
                  {field.values && field.values.length > 0 && (
                    <span className="text-[11px] text-[#fbbf24] font-mono">[{field.values.join(", ")}]</span>
                  )}
                  {field.references && (
                    <span className="text-[11px] text-[#a59bff] font-mono">→ {field.references}</span>
                  )}
                  {field.length && (
                    <span className="text-[11px] text-[#5c6078]">({field.length})</span>
                  )}
                  <button
                    onClick={() => updateField(model.name, field.name, { nullable: !field.nullable })}
                    className={cn(
                      "text-[11px] px-2 py-0.5 rounded-full border transition-all duration-150",
                      field.nullable
                        ? "border-[#6C63FF]/30 bg-[#6C63FF]/10 text-[#a59bff]"
                        : "border-white/[0.06] text-[#5c6078] hover:border-white/[0.12] hover:text-[#8b8fa3]"
                    )}
                  >
                    nullable
                  </button>
                  <button
                    onClick={() => updateField(model.name, field.name, { unique: !field.unique })}
                    className={cn(
                      "text-[11px] px-2 py-0.5 rounded-full border transition-all duration-150",
                      field.unique
                        ? "border-[#34D399]/30 bg-[#34D399]/10 text-[#6ee7b7]"
                        : "border-white/[0.06] text-[#5c6078] hover:border-white/[0.12] hover:text-[#8b8fa3]"
                    )}
                  >
                    unique
                  </button>
                </div>
                <button
                  onClick={() => removeField(model.name, field.name)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[#5c6078] hover:text-[#E24B4A] ml-2 shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {isAdding ? (
          <div className="mt-3 pt-3 border-t border-white/[0.04] flex flex-col gap-2">
            <div className="flex gap-2 items-center flex-wrap">
              <input
                autoFocus
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddField()}
                placeholder="field_name"
                className="si-input flex-1 min-w-[120px] text-[13px] font-mono py-2"
              />
              <select
                value={fieldType}
                onChange={(e) => {
                  setFieldType(e.target.value);
                  setFieldValues("");
                  setFieldRef("");
                  setFieldLength("");
                }}
                className="si-select text-[13px] py-2"
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {needsValues && (
              <input
                value={fieldValues}
                onChange={(e) => setFieldValues(e.target.value)}
                placeholder="Values: admin,editor,viewer"
                className="si-input text-[13px] font-mono py-2"
              />
            )}
            {needsRef && (
              <input
                value={fieldRef}
                onChange={(e) => setFieldRef(e.target.value)}
                placeholder="References table (e.g. users)"
                className="si-input text-[13px] font-mono py-2"
              />
            )}
            {needsLength && (
              <input
                value={fieldLength}
                onChange={(e) => setFieldLength(e.target.value)}
                placeholder="Max length (e.g. 255)"
                type="number"
                min={1}
                className="si-input w-40 text-[13px] font-mono py-2"
              />
            )}

            <div className="flex gap-2">
              <button onClick={handleAddField} className="si-btn-primary text-[12px] py-2 px-4">
                Add field
              </button>
              <button onClick={resetAddState} className="si-btn-secondary text-[12px] py-2 px-3">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="si-btn-ghost text-[13px] mt-2 w-full text-center"
          >
            <Plus className="w-3.5 h-3.5 inline mr-1" />
            Add field
          </button>
        )}
      </div>
    </div>
  );
}
