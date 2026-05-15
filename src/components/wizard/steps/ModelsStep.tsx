"use client";

import { useState } from "react";
import { useWizardStore } from "@/stores/useWizardStore";
import type { Model, NamedField } from "@stack-init/schema";

const FIELD_TYPES = [
  "string","char","text","longText","mediumText","tinyText",
  "integer","bigInteger","smallInteger","unsignedBigInteger",
  "boolean","decimal","float","double",
  "timestamp","timestampTz","date","dateTime",
  "foreignId","foreignUuid",
  "enum","set","json","jsonb","uuid","ulid","binary","rememberToken",
];

type FieldType = typeof FIELD_TYPES[number];

const SUGGESTED_FIELDS: Record<string, { name: string; type: string; nullable?: boolean; values?: string[]; references?: string[] }[]> = {
  User: [
    { name: "name", type: "string" },
    { name: "email", type: "string" },
    { name: "password", type: "string" },
    { name: "avatar", type: "string", nullable: true },
    { name: "role", type: "enum", values: ["admin", "user"] },
    { name: "bio", type: "text", nullable: true },
  ],
  Post: [
    { name: "title", type: "string" },
    { name: "slug", type: "string" },
    { name: "content", type: "text" },
    { name: "status", type: "enum", values: ["draft", "published", "archived"] },
    { name: "published_at", type: "timestamp", nullable: true },
    { name: "image_url", type: "string", nullable: true },
  ],
  Product: [
    { name: "name", type: "string" },
    { name: "slug", type: "string" },
    { name: "sku", type: "string" },
    { name: "price", type: "decimal" },
    { name: "stock", type: "integer" },
    { name: "description", type: "text", nullable: true },
    { name: "is_active", type: "boolean" },
  ],
  Order: [
    { name: "order_number", type: "string" },
    { name: "total_amount", type: "decimal" },
    { name: "status", type: "enum", values: ["pending", "paid", "shipped", "cancelled"] },
    { name: "notes", type: "text", nullable: true },
  ],
  Category: [
    { name: "name", type: "string" },
    { name: "slug", type: "string" },
    { name: "description", type: "text", nullable: true },
    { name: "parent_id", type: "foreignId", references: ["categories"] },
  ],
  Comment: [
    { name: "content", type: "text" },
    { name: "is_approved", type: "boolean" },
    { name: "user_id", type: "foreignId", references: ["users"] },
    { name: "post_id", type: "foreignId", references: ["posts"] },
  ],
};

const GLOBAL_FIELD_SUGGESTIONS = [
  { name: "name", type: "string" },
  { name: "slug", type: "string" },
  { name: "description", type: "text", nullable: true },
  { name: "status", type: "string" },
  { name: "active", type: "boolean" },
  { name: "sort_order", type: "integer", nullable: true },
];

function typeColor(type: string): { bg: string; color: string } {
  const t = type.toLowerCase();
  if (["string","char","tinytext"].some(k => t.includes(k)))          return { bg: "rgba(77,255,145,0.12)", color: "#4dff91" };
  if (["text","mediumtext","longtext"].some(k => t.includes(k)))      return { bg: "rgba(160,160,176,0.1)", color: "var(--text2)" };
  if (["integer","biginteger","smallinteger","int"].some(k => t.includes(k))) return { bg: "rgba(77,159,255,0.1)", color: "var(--blue)" };
  if (["decimal","float","double"].some(k => t.includes(k)))          return { bg: "rgba(77,255,200,0.1)", color: "#4dffc8" };
  if (t.includes("boolean"))                                           return { bg: "rgba(245,200,66,0.12)", color: "var(--gold)" };
  if (["timestamp","date","datetime"].some(k => t.includes(k)))       return { bg: "rgba(255,77,109,0.1)", color: "var(--red)" };
  if (["foreignid","foreignuuid"].some(k => t.includes(k)))           return { bg: "rgba(157,111,255,0.12)", color: "var(--purple)" };
  if (["enum","set"].some(k => t.includes(k)))                        return { bg: "rgba(255,127,77,0.1)", color: "#ff7f4d" };
  if (["json","uuid","ulid"].some(k => t.includes(k)))                return { bg: "rgba(77,159,255,0.1)", color: "var(--blue)" };
  return { bg: "rgba(255,255,255,0.06)", color: "var(--text2)" };
}

export function ModelsStep() {
  const { models } = useWizardStore();
  const [activeModel, setActiveModel]   = useState<string | null>(null);
  const [showNewModel, setShowNewModel] = useState(false);

  const model = activeModel ? models.find((m) => m.name === activeModel) : null;

  return (
    <div className="si-step-panel" style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24, minHeight: 0 }}>

      {/* ── Left panel: Model list ──────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text3)" }}>
            Models ({models.length})
          </span>
          <button
            onClick={() => { setShowNewModel(true); setActiveModel(null); }}
            style={{
              fontSize: 12, fontWeight: 700, color: "var(--gold)",
              background: "var(--gold-subtle)", border: "1px solid var(--gold-border)",
              borderRadius: 8, padding: "4px 10px", cursor: "pointer",
              opacity: showNewModel ? 0.5 : 1
            }}
            disabled={showNewModel}
          >
            + New
          </button>
        </div>

        {models.length === 0 && (
          <div style={{ 
            padding: "40px 16px", textAlign: "center", border: "1px dashed var(--border-medium)", 
            borderRadius: 12, color: "var(--text3)",
            opacity: showNewModel ? 0.4 : 1,
            transition: "opacity 0.2s"
          }}>
            <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.3 }}>◫</div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)", marginBottom: 4 }}>No models yet</p>
            <p style={{ fontSize: 12, marginBottom: 16 }}>Start by adding your first model</p>
            {!showNewModel && (
              <button onClick={() => setShowNewModel(true)} className="si-btn-primary" style={{ fontSize: 12, padding: "7px 16px" }}>
                Add model
              </button>
            )}
          </div>
        )}

        {/* Model rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {models.map((m) => (
            <ModelRow
              key={m.name}
              model={m}
              isActive={activeModel === m.name}
              onClick={() => { setActiveModel(m.name); setShowNewModel(false); }}
            />
          ))}
        </div>
      </div>

      {/* ── Right panel: Editor ─────────────────────────────────── */}
      <div>
        {showNewModel && (
          <NewModelPanel
            onCreated={(name) => { setShowNewModel(false); setActiveModel(name); }}
            onCancel={() => setShowNewModel(false)}
          />
        )}
        {!showNewModel && model && (
          <ModelEditor key={model.name} model={model} />
        )}
        {!showNewModel && !model && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 320, color: "var(--text3)", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.2 }}>◫</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text2)", marginBottom: 6 }}>Select a model to edit</p>
            <p style={{ fontSize: 13 }}>Or create a new one from the list on the left</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Model row in list ────────────────────────────────────────── */
function ModelRow({ model, isActive, onClick }: { model: Model; isActive: boolean; onClick: () => void }) {
  const { removeModel } = useWizardStore();
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 12px", borderRadius: 8, cursor: "pointer",
        background: isActive ? "var(--gold-subtle)" : "transparent",
        border: `1px solid ${isActive ? "var(--gold-border)" : "transparent"}`,
        transition: "all 0.15s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <span style={{
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: 13, fontWeight: 700,
          color: isActive ? "var(--gold)" : "var(--text)",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {model.name}
        </span>
        <span style={{ fontSize: 11, color: "var(--text3)", whiteSpace: "nowrap" }}>
          {model.fields.length}f
        </span>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); removeModel(model.name); }}
        style={{
          background: "none", border: "none", color: "var(--text3)",
          cursor: "pointer", fontSize: 14, padding: "0 2px",
          opacity: 0, transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
        title="Delete"
      >✕</button>
    </div>
  );
}

/* ── New model creation panel ─────────────────────────────────── */
function NewModelPanel({ onCreated, onCancel }: { onCreated: (name: string) => void; onCancel: () => void }) {
  const { models, addModel } = useWizardStore();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleCreate = () => {
    const n = name.trim();
    if (!n) { setError("Name is required"); return; }
    if (!/^[A-Z][A-Za-z0-9]*$/.test(n)) { setError("Must be PascalCase, e.g. UserProfile"); return; }
    if (models.find((m) => m.name === n)) { setError("A model with this name already exists"); return; }

    addModel({
      name: n,
      fields: [],
      relations: [],
      generate: {
        migration: true, controller: true, resource: true, request: true,
        seeder: false, factory: true, policy: false, service: false,
        tests: true, routes: true, swagger: false, softDelete: false, repository: false,
      },
      migration: { primary_key: "id", timestamps: true, softDeletes: false },
    });
    onCreated(n);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div className="si-section-label">New model</div>
        <h2 style={{ fontFamily: "var(--font-syne)", fontSize: 22, fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>
          Create a model
        </h2>
        <p style={{ fontSize: 13, color: "var(--text2)" }}>
          Give your model a PascalCase name. Fields can be added after.
        </p>
      </div>

      <div style={{ maxWidth: 480 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text2)", marginBottom: 8, letterSpacing: "0.04em" }}>
          Model name
        </label>
        <input
          autoFocus
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="e.g. UserProfile, BlogPost, OrderItem"
          className="si-input"
          style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 15, marginBottom: 8 }}
        />
        {error && <p style={{ fontSize: 12, color: "var(--red)", marginBottom: 8 }}>{error}</p>}
        <p style={{ fontSize: 11, color: "var(--text3)", marginBottom: 20 }}>
          PascalCase, singular — e.g. <code style={{ fontFamily: "var(--font-jetbrains-mono)", color: "var(--gold)" }}>Post</code>, not <code style={{ fontFamily: "var(--font-jetbrains-mono)" }}>posts</code>
        </p>

        {/* Common model suggestions */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, color: "var(--text3)", marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Suggestions</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["User","Post","Comment","Category","Product","Order","Tag","Article"].map((s) => (
              <button
                key={s}
                onClick={() => { setName(s); setError(""); }}
                style={{
                  padding: "4px 12px", borderRadius: 100, fontSize: 12, cursor: "pointer",
                  border: `1px solid ${name === s ? "var(--gold-border)" : "var(--border-subtle)"}`,
                  background: name === s ? "var(--gold-subtle)" : "var(--bg4)",
                  color: name === s ? "var(--gold)" : "var(--text2)",
                  transition: "all 0.15s",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleCreate} className="si-btn-primary">
            Create model
          </button>
          <button onClick={onCancel} className="si-btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const FIELD_TYPE_CATEGORIES = {
  'Text':         ['string', 'char', 'tinyText', 'text', 'mediumText', 'longText', 'enum', 'set', 'uuid', 'ulid', 'ipAddress', 'macAddress'],
  'JSON':         ['json', 'jsonb'],
  'Numbers':      ['tinyInteger', 'smallInteger', 'mediumInteger', 'integer', 'bigInteger', 'unsignedTinyInteger', 'unsignedSmallInteger', 'unsignedInteger', 'unsignedBigInteger', 'float', 'double', 'decimal', 'year'],
  'Date & Time':  ['date', 'dateTime', 'dateTimeTz', 'time', 'timeTz', 'timestamp', 'timestampTz'],
  'Bool & Blob':  ['boolean', 'binary', 'tinyBlob', 'blob', 'mediumBlob', 'longBlob'],
  'Relations':    ['id', 'foreignId', 'foreignUuid', 'foreignUlid', 'morphs', 'uuidMorphs'],
  'Special':      ['geometry', 'geography', 'point', 'lineString', 'polygon', 'vector', 'rememberToken'],
};

const FIELD_TYPES_WITH_PARAMS: Record<string, string[]> = {
  string:      ['length'],
  char:        ['length'],
  enum:        ['values'],
  set:         ['values'],
  float:       ['precision', 'scale'],
  double:      ['precision', 'scale'],
  decimal:     ['precision', 'scale'],
  dateTime:    ['precision'],
  dateTimeTz:  ['precision'],
  time:        ['precision'],
  timeTz:      ['precision'],
  timestamp:   ['precision'],
  timestampTz: ['precision'],
  foreignId:   ['references', 'on_delete', 'constrained'],
  foreignUuid: ['references', 'on_delete', 'constrained'],
  foreignUlid: ['references', 'on_delete', 'constrained'],
  vector:      ['dimensions'],
};

/* ── Model editor (right panel) ───────────────────────────────── */
function ModelEditor({ model }: { model: Model }) {
  const { addField, removeField, updateField, updateModel, models } = useWizardStore();
  const [fieldName, setFieldName]     = useState("");
  const [fieldType, setFieldType]     = useState<string>("string");
  
  // Paramètres de champs
  const [fieldLength, setFieldLength] = useState<number>(255);
  const [fieldPrecision, setFieldPrecision] = useState<number>(10);
  const [fieldScale, setFieldScale] = useState<number>(2);
  const [fieldValues, setFieldValues] = useState("");
  const [fieldRef, setFieldRef]       = useState("");
  const [fieldDimensions, setFieldDimensions] = useState<number>(1536);
  
  const [nullable, setNullable]       = useState(false);
  const [fieldDefault, setFieldDefault] = useState("");
  const [fieldUnique, setFieldUnique] = useState(false);
  const [fieldIndex, setFieldIndex]   = useState(false);
  
  const [isAddingField, setIsAddingField] = useState(model.fields.length === 0);
  const [editingField, setEditingField]   = useState<string | null>(null);
  const [fieldError, setFieldError]       = useState("");

  const params = FIELD_TYPES_WITH_PARAMS[fieldType] || [];

  const handleFieldNameChange = (val: string) => {
    setFieldName(val);
    setFieldError("");
    const low = val.toLowerCase();
    if (low.endsWith("_id"))                                setFieldType("foreignId");
    else if (low.endsWith("_at"))                           setFieldType("timestamp");
    else if (low.startsWith("is_") || low.startsWith("has_")) setFieldType("boolean");
    else if (low === "price" || low === "amount")           setFieldType("decimal");
    else if (["description","content","body","bio"].some(k => low.includes(k))) setFieldType("text");
    else                                                    setFieldType("string");
  };

  const handleAddField = () => {
    const fn = fieldName.trim();
    if (!fn) { setFieldError("Field name is required"); return; }
    if (!/^[a-z][a-z0-9_]*$/.test(fn)) { setFieldError("Use snake_case (e.g. first_name)"); return; }

    const f: any = { 
      name: fn, 
      type: fieldType, 
      nullable,
      unique: fieldUnique,
      index: fieldIndex,
    };

    if (params.includes('length')) f.length = fieldLength;
    if (params.includes('precision')) f.precision = fieldPrecision;
    if (params.includes('scale')) f.scale = fieldScale;
    if (params.includes('values') && fieldValues.trim()) f.values = fieldValues.split(",").map(v => v.trim()).filter(Boolean);
    if (params.includes('references') && fieldRef.trim()) f.references = fieldRef.trim();
    if (params.includes('dimensions')) f.dimensions = fieldDimensions;
    
    if (fieldDefault.trim()) {
      let dv: any = fieldDefault.trim();
      if (dv === "true") dv = true;
      else if (dv === "false") dv = false;
      else if (!isNaN(Number(dv))) dv = Number(dv);
      f.default = dv;
    }

    if (editingField) {
      if (editingField !== f.name) {
        removeField(model.name, editingField);
        addField(model.name, f as NamedField);
      } else {
        updateField(model.name, editingField, f as Partial<NamedField>);
      }
    } else {
      addField(model.name, f as NamedField);
    }

    resetForm();
    setIsAddingField(true);
  };

  const resetForm = () => {
    setFieldName(""); setFieldType("string"); setFieldValues(""); setFieldRef(""); 
    setNullable(false); setFieldDefault(""); setFieldUnique(false); setFieldIndex(false);
    setFieldLength(255); setFieldPrecision(10); setFieldScale(2); setFieldDimensions(1536);
    setEditingField(null); setFieldError("");
  };

  const editFieldSetup = (f: any) => {
    setFieldName(f.name);
    setFieldType(f.type);
    setNullable(f.nullable || false);
    setFieldUnique(f.unique || false);
    setFieldIndex(f.index || false);
    setFieldValues(f.values ? f.values.join(",") : "");
    setFieldRef(f.references || "");
    setFieldDefault(f.default?.toString() || "");
    setFieldLength(f.length || 255);
    setFieldPrecision(f.precision || 10);
    setFieldScale(f.scale || 2);
    setFieldDimensions(f.dimensions || 1536);
    setIsAddingField(true);
    setEditingField(f.name);
  };

  const enumOptions = params.includes('values') ? fieldValues.split(",").map(v => v.trim()).filter(Boolean) : [];

  const suggestions = SUGGESTED_FIELDS[model.name] || GLOBAL_FIELD_SUGGESTIONS;
  const existingFieldNames = new Set(model.fields.map(f => f.name));
  const filteredSuggestions = suggestions.filter(s => !existingFieldNames.has(s.name));

  return (
    <div>
      {/* Model title */}
      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{
          fontFamily: "var(--font-syne)", fontSize: 24, fontWeight: 800,
          color: "var(--gold)", letterSpacing: "-0.02em",
        }}>{model.name}</span>
        <span style={{ fontSize: 12, color: "var(--text3)", fontFamily: "var(--font-jetbrains-mono)" }}>
          {model.table || `${model.name.toLowerCase()}s`}
        </span>
      </div>

      {/* Fields table */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text3)" }}>
            Fields ({model.fields.length})
          </span>
          {!isAddingField && (
            <button onClick={() => { resetForm(); setIsAddingField(true); }} className="si-btn-ghost" style={{ fontSize: 12, padding: "4px 10px" }}>
              + Add field
            </button>
          )}
        </div>

        {/* Field rows */}
        {model.fields.map((f) => {
          const tc = typeColor(f.type);
          return (
            <div key={f.name} 
              onClick={() => editFieldSetup(f)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 8,
                borderBottom: "1px solid var(--border-subtle)",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg4)";
                const actions = e.currentTarget.querySelector(".field-actions") as HTMLElement;
                if (actions) actions.style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                const actions = e.currentTarget.querySelector(".field-actions") as HTMLElement;
                if (actions) actions.style.opacity = "0";
              }}
            >
              <span style={{ flex: 1, fontFamily: "var(--font-jetbrains-mono)", fontSize: 13, color: "var(--text)", fontWeight: 500 }}>
                {f.name}
              </span>
              <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, padding: "2px 8px", borderRadius: 4, background: tc.bg, color: tc.color, whiteSpace: "nowrap" }}>
                {f.type}
              </span>
              {f.nullable && <span style={{ fontSize: 10, color: "var(--text3)" }}>nullable</span>}
              {f.unique && <span style={{ fontSize: 10, color: "var(--gold)", background: "rgba(245,200,66,0.1)", padding: "1px 4px", borderRadius: 4 }}>unique</span>}
              <div className="field-actions" style={{ display: "flex", gap: 4, opacity: 0, transition: "opacity 0.15s" }}>
                <button
                  onClick={(e) => { e.stopPropagation(); removeField(model.name, f.name); }}
                  style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 13, padding: "0 2px" }}
                  title="Delete"
                >✕</button>
              </div>
            </div>
          );
        })}

        {/* Add field inline form */}
        {isAddingField && (
          <div style={{
            padding: 20, borderRadius: 16,
            border: "1px solid var(--gold-border)",
            background: "var(--gold-subtle)",
            marginTop: 8,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
          }}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="si-section-label">Field Name</label>
                <input
                  autoFocus
                  value={fieldName}
                  onChange={(e) => handleFieldNameChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddField()}
                  placeholder="e.g. email, user_id"
                  className="si-input"
                  style={{ borderColor: fieldError ? "var(--red)" : undefined }}
                />
              </div>
              <div>
                <label className="si-section-label">Type</label>
                <select value={fieldType} onChange={(e) => setFieldType(e.target.value)} className="si-select">
                  {Object.entries(FIELD_TYPE_CATEGORIES).map(([cat, types]) => (
                    <optgroup key={cat} label={cat}>
                      {types.map(t => <option key={t} value={t}>{t}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {/* Dynamic Params */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {params.includes('length') && (
                <div>
                  <label className="si-section-label">Length</label>
                  <input type="number" value={fieldLength} onChange={(e) => setFieldLength(Number(e.target.value))} onKeyDown={(e) => e.key === "Enter" && handleAddField()} className="si-input" />
                </div>
              )}
              {params.includes('precision') && (
                <div>
                  <label className="si-section-label">Precision</label>
                  <input type="number" value={fieldPrecision} onChange={(e) => setFieldPrecision(Number(e.target.value))} onKeyDown={(e) => e.key === "Enter" && handleAddField()} className="si-input" />
                </div>
              )}
              {params.includes('scale') && (
                <div>
                  <label className="si-section-label">Scale</label>
                  <input type="number" value={fieldScale} onChange={(e) => setFieldScale(Number(e.target.value))} onKeyDown={(e) => e.key === "Enter" && handleAddField()} className="si-input" />
                </div>
              )}
              {params.includes('values') && (
                <div className="col-span-3">
                  <label className="si-section-label">Enum Values (comma separated)</label>
                  <input value={fieldValues} onChange={(e) => setFieldValues(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddField()} placeholder="admin, editor, user" className="si-input" />
                </div>
              )}
              {params.includes('references') && (
                <div className="col-span-3">
                  <label className="si-section-label">References Table</label>
                  <select value={fieldRef} onChange={(e) => setFieldRef(e.target.value)} className="si-select">
                    <option value="">Select a table...</option>
                    {models.map(m => <option key={m.name} value={m.table || `${m.name.toLowerCase()}s`}>{m.table || `${m.name.toLowerCase()}s`}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--gold-border)", paddingTop: 16 }}>
              <div style={{ display: "flex", gap: 16 }}>
                <label className="flex items-center gap-2 text-xs text-text2 cursor-pointer">
                  <input type="checkbox" checked={nullable} onChange={(e) => setNullable(e.target.checked)} className="accent-gold" />
                  Nullable
                </label>
                <label className="flex items-center gap-2 text-xs text-text2 cursor-pointer">
                  <input type="checkbox" checked={fieldUnique} onChange={(e) => setFieldUnique(e.target.checked)} className="accent-gold" />
                  Unique
                </label>
                <label className="flex items-center gap-2 text-xs text-text2 cursor-pointer">
                  <input type="checkbox" checked={fieldIndex} onChange={(e) => setFieldIndex(e.target.checked)} className="accent-gold" />
                  Index
                </label>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsAddingField(false)} className="si-btn-secondary text-xs">Cancel</button>
                <button onClick={handleAddField} className="si-btn-primary text-xs">{editingField ? "Save Changes" : "Add Field"}</button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Add Suggestions */}
        {!isAddingField && filteredSuggestions.length > 0 && (
          <div style={{ marginTop: 24, padding: "16px 0", borderTop: "1px solid var(--border-subtle)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text3)", marginBottom: 12 }}>
              Quick Add / Suggestions
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {filteredSuggestions.map((s) => (
                <button
                  key={s.name}
                  onClick={() => addField(model.name, { 
                    name: s.name, 
                    type: s.type, 
                    nullable: s.nullable || false,
                    values: s.values,
                    references: s.references ? s.references[0] : undefined
                  } as NamedField)}
                  style={{
                    padding: "6px 14px", borderRadius: 100, fontSize: 12, cursor: "pointer",
                    border: "1px solid var(--border-subtle)",
                    background: "var(--bg4)",
                    color: "var(--text2)",
                    transition: "all 0.15s",
                    display: "flex", alignItems: "center", gap: 6
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--gold-border)";
                    e.currentTarget.style.color = "var(--gold)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                    e.currentTarget.style.color = "var(--text2)";
                  }}
                >
                  <span style={{ color: "var(--gold)", fontWeight: 800 }}>+</span>
                  {s.name}
                  <span style={{ fontSize: 10, opacity: 0.5, fontWeight: 400 }}>{s.type}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Settings */}
      <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 20, marginTop: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text3)", display: "block", marginBottom: 16 }}>
          Settings
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 480 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Primary key</label>
            <select
              value={model.migration?.primary_key || "id"}
              onChange={(e) => updateModel(model.name, { migration: { ...(model.migration || {}), primary_key: e.target.value as any } })}
              className="si-select"
              style={{ fontSize: 13 }}
            >
              <option value="id">Auto-increment (id)</option>
              <option value="uuid">UUID</option>
              <option value="ulid">ULID</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Table name</label>
            <input
              value={model.table || `${model.name.toLowerCase()}s`}
              onChange={(e) => updateModel(model.name, { table: e.target.value })}
              className="si-input"
              style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 13 }}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          {(["timestamps", "softDeletes"] as const).map((key) => {
            const isChecked = model.migration?.[key] ?? (key === "timestamps");
            return (
              <button
                key={key}
                onClick={() => updateModel(model.name, { migration: { ...(model.migration || {}), [key]: !isChecked } })}
                className={[
                  "si-badge",
                  isChecked ? "si-badge-gold" : "si-badge-gray"
                ].join(" ")}
                style={{ cursor: "pointer", padding: "6px 12px" }}
              >
                {key === "timestamps" ? "⏱ Timestamps" : "🗑 Soft Deletes"}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}