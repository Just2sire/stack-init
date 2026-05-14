"use client";

import { useState } from "react";
import { useWizardStore } from "@/stores/useWizardStore";
import { Plus, Table2, X, Trash2, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Model, NamedField } from "@stack-init/schema";
import { ModelCard } from "../ModelCard";

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
  const { models } = useWizardStore();
  const [editingModel, setEditingModel] = useState<Model | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const startNewModel = () => {
    setIsAdding(true);
  };

  const closeForm = () => {
    setIsAdding(false);
    setEditingModel(null);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="si-title mb-2">Models & fields</h1>
          <p className="si-subtitle max-w-xl">
            Define the data models for your application. Each model becomes an Eloquent model, a migration, and a controller.
          </p>
        </div>
        <button 
          onClick={startNewModel}
          className="si-btn-primary inline-flex items-center gap-2 shadow-[0_0_20px_rgba(108,99,255,0.3)]"
        >
          <Plus className="w-4 h-4" />
          Add model
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model) => (
          <ModelCard 
            key={model.name} 
            model={model} 
            onEdit={() => setEditingModel(model)} 
          />
        ))}

        {models.length === 0 && !isAdding && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 rounded-[14px] border border-dashed border-white/[0.08] text-[#5c6078] bg-white/[0.01]">
            <Table2 className="w-10 h-10 mb-4 opacity-20" />
            <p className="text-[16px] font-medium text-white/50">No models yet</p>
            <p className="text-[13px] mt-1 text-[#5c6078]/70">Add your first model to define your database schema</p>
            <button 
              onClick={startNewModel}
              className="mt-6 si-btn-secondary text-sm"
            >
              Get Started
            </button>
          </div>
        )}
      </div>

      {/* Edit/Add Overlay */}
      {(isAdding || editingModel) && (
        <div className="fixed inset-0 bg-[#0f111a]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#161926] border border-white/[0.08] rounded-2xl w-full max-w-3xl my-8 overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
             <ModelForm 
                initialModel={editingModel || undefined} 
                onClose={closeForm} 
             />
          </div>
        </div>
      )}
    </div>
  );
}

function ModelForm({ initialModel, onClose }: { initialModel?: Model, onClose: () => void }) {
  const { models, addModel, updateModel, addField, removeField } = useWizardStore();
  
  const [name, setName] = useState(initialModel?.name || "");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Field editing state
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("string");
  const [fieldValues, setFieldValues] = useState("");
  const [fieldRef, setFieldRef] = useState("");
  const [fieldLength, setFieldLength] = useState("");
  const [isAddingField, setIsAddingField] = useState(false);

  const model = initialModel ? models.find(m => m.name === initialModel.name)! : null;

  const handleSaveModel = () => {
    if (!name.trim()) return;
    if (!initialModel) {
      if (models.find(m => m.name === name)) {
        alert("Model name already exists");
        return;
      }
      addModel({
        name,
        fields: [],
        relations: [],
        generate: {
          migration: true,
          controller: true,
          resource: true,
          request: true,
          seeder: false,
          factory: true,
          policy: false,
          service: false,
          tests: true,
          routes: true,
          swagger: false,
          softDelete: false,
          repository: false,
        },
        migration: {
            primary_key: 'id',
            timestamps: true,
            softDeletes: false,
        }
      });
    } else {
       updateModel(initialModel.name, { name });
    }
    onClose();
  };

  const needsValues = ["enum", "set"].includes(fieldType);
  const needsRef = ["foreignId", "foreignUuid"].includes(fieldType);
  const needsLength = ["string", "char"].includes(fieldType);

  const handleFieldNameChange = (val: string) => {
    setFieldName(val);
    const low = val.toLowerCase();
    if (low.includes('email')) setFieldType('string');
    if (low.includes('password')) setFieldType('string');
    if (low.includes('description') || low.includes('content') || low.includes('body')) setFieldType('text');
    if (low.endsWith('_id')) setFieldType('foreignId');
    if (low.endsWith('_at')) setFieldType('timestamp');
    if (low === 'is_active' || low.startsWith('is_') || low.startsWith('has_')) setFieldType('boolean');
    if (low === 'price' || low === 'amount') setFieldType('decimal');
  };

  const handleAddField = () => {
    if (!fieldName.trim() || !initialModel) return;
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
    addField(initialModel.name, field);
    setFieldName("");
    setFieldType("string");
    setFieldValues("");
    setFieldRef("");
    setFieldLength("");
    setIsAddingField(false);
  };

  return (
    <>
      <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <Table2 className="w-5 h-5 text-[#6C63FF]" />
          {initialModel ? `Edit Model: ${initialModel.name}` : "Create New Model"}
        </h2>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 min-h-[400px]">
        {/* Name Section */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-300">Model Name (PascalCase)</label>
          <div className="flex gap-4">
            <input
              autoFocus={!initialModel}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. UserProfile"
              className="si-input flex-1 text-lg font-mono"
            />
            {!initialModel && (
                <button onClick={handleSaveModel} className="si-btn-primary px-8">
                   Create
                </button>
            )}
          </div>
        </div>

        {initialModel && model && (
          <>
            {/* Fields Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Fields</h3>
                {!isAddingField && (
                    <button 
                        onClick={() => setIsAddingField(true)}
                        className="text-xs text-[#6C63FF] hover:underline flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3" /> Add Field
                    </button>
                )}
              </div>

              <div className="space-y-1">
                {model.fields.map((field) => (
                  <div key={field.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.02] group transition-colors border border-transparent hover:border-white/[0.05]">
                    <div className="flex items-center gap-4">
                        <span className="font-mono text-sm text-gray-200">{field.name}</span>
                        <span className={cn("si-badge", getTypeStyle(field.type))}>{field.type}</span>
                    </div>
                    <button onClick={() => removeField(model.name, field.name)} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-500 transition-all">
                        <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {isAddingField && (
                  <div className="p-4 bg-white/[0.03] rounded-xl border border-[#6C63FF]/30 mt-4 space-y-4 animate-in slide-in-from-top-4">
                     <div className="grid grid-cols-2 gap-4">
                        <input
                            autoFocus
                            value={fieldName}
                            onChange={(e) => handleFieldNameChange(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAddField()}
                            placeholder="field_name"
                            className="si-input font-mono"
                        />
                        <select
                            value={fieldType}
                            onChange={(e) => setFieldType(e.target.value)}
                            className="si-select"
                        >
                            {FIELD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                     </div>
                     
                     {needsValues && (
                        <input
                            value={fieldValues}
                            onChange={(e) => setFieldValues(e.target.value)}
                            placeholder="Values: admin,editor,viewer"
                            className="si-input text-[13px] font-mono py-2 w-full"
                        />
                    )}
                    {needsRef && (
                        <input
                            value={fieldRef}
                            onChange={(e) => setFieldRef(e.target.value)}
                            placeholder="References table (e.g. users)"
                            className="si-input text-[13px] font-mono py-2 w-full"
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

                     <div className="flex justify-end gap-2">
                        <button onClick={() => setIsAddingField(false)} className="si-btn-secondary py-1.5 px-3 text-xs">Cancel</button>
                        <button onClick={handleAddField} className="si-btn-primary py-1.5 px-4 text-xs">Add Field</button>
                     </div>
                  </div>
                )}
              </div>
            </div>

            {/* Advanced Section Toggle */}
            <div className="pt-6 border-t border-white/[0.08]">
                <button 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
                >
                    <Settings2 className="w-4 h-4" />
                    {showAdvanced ? "Hide Advanced Settings" : "Show Advanced Settings (Table, Engine, Keys...)"}
                </button>

                {showAdvanced && (
                    <div className="mt-6 grid grid-cols-2 gap-8 animate-in slide-in-from-top-4">
                        <div className="space-y-4">
                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Primary Key</label>
                             <select
                                value={model.migration.primary_key}
                                onChange={(e) => updateModel(model.name, {
                                    migration: { ...model.migration, primary_key: e.target.value as any }
                                })}
                                className="si-select w-full"
                             >
                                <option value="id">Auto-increment ID</option>
                                <option value="uuid">UUID</option>
                                <option value="ulid">ULID</option>
                                <option value="custom">Custom</option>
                             </select>
                        </div>
                        <div className="space-y-4">
                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Custom Table Name</label>
                             <input
                                placeholder="e.g. users_legacy"
                                value={model.table || ""}
                                onChange={(e) => updateModel(model.name, { table: e.target.value })}
                                className="si-input w-full font-mono"
                             />
                        </div>
                        <div className="space-y-4">
                             <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">DB Engine</label>
                             <input
                                placeholder="InnoDB"
                                value={model.migration.engine || ""}
                                onChange={(e) => updateModel(model.name, {
                                    migration: { ...model.migration, engine: e.target.value }
                                })}
                                className="si-input w-full font-mono"
                             />
                        </div>
                        <div className="flex gap-4 items-end pb-2">
                            <button
                                onClick={() => updateModel(model.name, {
                                    migration: { ...model.migration, timestamps: !model.migration.timestamps }
                                })}
                                className={cn(
                                    "text-[11px] px-3 py-1.5 rounded-full border transition-all",
                                    model.migration.timestamps ? "bg-purple-500/10 border-purple-500/30 text-purple-400" : "bg-white/5 border-white/10 text-gray-500"
                                )}
                            >
                                Timestamps
                            </button>
                            <button
                                onClick={() => updateModel(model.name, {
                                    migration: { ...model.migration, softDeletes: !model.migration.softDeletes }
                                })}
                                className={cn(
                                    "text-[11px] px-3 py-1.5 rounded-full border transition-all",
                                    model.migration.softDeletes ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-white/5 border-white/10 text-gray-500"
                                )}
                            >
                                Soft Deletes
                            </button>
                        </div>
                    </div>
                )}
            </div>
          </>
        )}
      </div>

      <div className="p-6 bg-white/[0.02] border-t border-white/[0.08] flex justify-end gap-3">
        <button onClick={onClose} className="si-btn-secondary px-6">
          {initialModel ? "Done" : "Cancel"}
        </button>
        {initialModel && (
            <button onClick={handleSaveModel} className="si-btn-primary px-8">
                Save Changes
            </button>
        )}
      </div>
    </>
  );
}
