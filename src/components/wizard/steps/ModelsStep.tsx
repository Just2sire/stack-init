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
    { name: "parent_id", type: "foreignId", references: "categories" },
  ],
  Comment: [
    { name: "content", type: "text" },
    { name: "is_approved", type: "boolean" },
    { name: "user_id", type: "foreignId", references: "users" },
    { name: "post_id", type: "foreignId", references: "posts" },
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
            }}
          >
            + New
          </button>
        </div>

        {models.length === 0 && !showNewModel && (
          <div style={{ padding: "40px 16px", textAlign: "center", border: "1px dashed var(--border-medium)", borderRadius: 12, color: "var(--text3)" }}>
            <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.3 }}>◫</div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)", marginBottom: 4 }}>No models yet</p>
            <p style={{ fontSize: 12, marginBottom: 16 }}>Start by adding your first model</p>
            <button onClick={() => setShowNewModel(true)} className="si-btn-primary" style={{ fontSize: 12, padding: "7px 16px" }}>
              Add model
            </button>
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

/* ── Model editor (right panel) ───────────────────────────────── */
function ModelEditor({ model }: { model: Model }) {
  const { addField, removeField, updateField, updateModel } = useWizardStore();
  const [fieldName, setFieldName]     = useState("");
  const [fieldType, setFieldType]     = useState("string");
  const [fieldValues, setFieldValues] = useState("");
  const [fieldRef, setFieldRef]       = useState("");
  const [nullable, setNullable]       = useState(false);
  const [fieldDefault, setFieldDefault] = useState("");
  const [fieldUnique, setFieldUnique] = useState(false);
  const [isAddingField, setIsAddingField] = useState(false);
  const [editingField, setEditingField]   = useState<string | null>(null);
  const [fieldError, setFieldError]       = useState("");

  const needsValues = ["enum","set"].includes(fieldType);
  const needsRef    = ["foreignId","foreignUuid"].includes(fieldType);

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

    const f: NamedField = { name: fn, type: fieldType, required: !nullable };
    if (needsValues && fieldValues.trim()) f.values = fieldValues.split(",").map(v => v.trim()).filter(Boolean);
    if (needsRef && fieldRef.trim()) f.references = fieldRef.trim();
    if (nullable) f.nullable = true;
    if (fieldUnique) f.unique = true;
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
        addField(model.name, f);
      } else {
        updateField(model.name, editingField, f);
      }
    } else {
      addField(model.name, f);
    }

    setFieldName(""); setFieldType("string"); setFieldValues(""); setFieldRef(""); 
    setNullable(false); setFieldDefault(""); setFieldUnique(false);
    setIsAddingField(true); setEditingField(null);
  };

  const addQuickField = (suggested: any) => {
    setFieldName(suggested.name);
    setFieldType(suggested.type);
    setNullable(suggested.nullable || false);
    setFieldValues(suggested.values ? suggested.values.join(",") : "");
    setFieldRef(suggested.references || "");
    setFieldDefault(suggested.default?.toString() || "");
    setFieldUnique(suggested.unique || false);
    setIsAddingField(true);
    setEditingField(null);
  };

  const editFieldSetup = (f: NamedField) => {
    setFieldName(f.name);
    setFieldType(f.type);
    setNullable(f.nullable || false);
    setFieldValues(f.values ? f.values.join(",") : "");
    setFieldRef(f.references || "");
    setFieldDefault(f.default?.toString() || "");
    setFieldUnique(f.unique || false);
    setIsAddingField(true);
    setEditingField(f.name);
  };

  const cancelEdit = () => {
    setFieldName(""); setFieldType("string"); setFieldValues(""); setFieldRef(""); 
    setNullable(false); setFieldDefault(""); setFieldUnique(false);
    setIsAddingField(false); setEditingField(null);
  };

  const enumOptions = needsValues ? fieldValues.split(",").map(v => v.trim()).filter(Boolean) : [];

  const suggestions = (SUGGESTED_FIELDS[model.name] || GLOBAL_FIELD_SUGGESTIONS)
    .filter(s => !model.fields.find(f => f.name === s.name));

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
            <button onClick={() => { cancelEdit(); setIsAddingField(true); }} className="si-btn-ghost" style={{ fontSize: 12, padding: "4px 10px" }}>
              + Add field
            </button>
          )}
        </div>

        {/* Quick Suggestions */}
        {suggestions.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 10, color: "var(--text3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Suggested Fields</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {suggestions.slice(0, 8).map(s => (
                <button
                  key={s.name}
                  onClick={() => addQuickField(s)}
                  style={{
                    fontSize: 11, padding: "4px 10px", borderRadius: 6,
                    background: "var(--bg4)", border: "1px solid var(--border-subtle)",
                    color: "var(--text2)", cursor: "pointer", transition: "all 0.1s",
                    display: "flex", alignItems: "center", gap: 4,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--gold-border)")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
                >
                  <span style={{ color: "var(--gold)", fontWeight: 700 }}>+</span>
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Field rows */}
        {model.fields.length === 0 && !isAddingField && (
          <p style={{ fontSize: 13, color: "var(--text3)", fontStyle: "italic", padding: "20px 0" }}>
            No fields yet — add your first field below.
          </p>
        )}
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
              {f.default !== undefined && <span style={{ fontSize: 10, color: "var(--blue)", background: "rgba(77,159,255,0.1)", padding: "1px 4px", borderRadius: 4, fontFamily: "var(--font-jetbrains-mono)" }}>def: {String(f.default)}</span>}
              {f.values && (
                <span style={{ fontSize: 10, color: "var(--purple)", display: "flex", gap: 4 }}>
                  {f.values.map(v => <span key={v} style={{ background: "rgba(157,111,255,0.1)", padding: "1px 4px", borderRadius: 4 }}>{v}</span>)}
                </span>
              )}
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
            padding: 16, borderRadius: 10,
            border: "1px solid var(--gold-border)",
            background: "var(--gold-subtle)",
            marginTop: 8,
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, marginBottom: fieldError ? 4 : 10 }}>
              <input
                autoFocus
                value={fieldName}
                onChange={(e) => handleFieldNameChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddField()}
                placeholder="field_name"
                className="si-input"
                style={{ 
                  fontFamily: "var(--font-jetbrains-mono)", 
                  fontSize: 13,
                  borderColor: fieldError ? "var(--red)" : undefined 
                }}
              />
              <select value={fieldType} onChange={(e) => setFieldType(e.target.value)} className="si-select" style={{ fontSize: 13, width: "auto" }}>
                {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {fieldError && (
              <p style={{ fontSize: 11, color: "var(--red)", marginBottom: 10, marginLeft: 4 }}>{fieldError}</p>
            )}
            {needsValues && (
              <input value={fieldValues} onChange={(e) => setFieldValues(e.target.value)} placeholder="Values: admin,editor,viewer" className="si-input" style={{ marginBottom: 8, fontFamily: "var(--font-jetbrains-mono)", fontSize: 13 }} />
            )}
            {needsRef && (
              <input value={fieldRef} onChange={(e) => setFieldRef(e.target.value)} placeholder="References table (e.g. users)" className="si-input" style={{ marginBottom: 8, fontFamily: "var(--font-jetbrains-mono)", fontSize: 13 }} />
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", gap: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text2)", cursor: "pointer" }}>
                  <input type="checkbox" checked={nullable} onChange={(e) => setNullable(e.target.checked)} style={{ accentColor: "var(--gold)" }} />
                  Nullable
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text2)", cursor: "pointer" }}>
                  <input type="checkbox" checked={fieldUnique} onChange={(e) => setFieldUnique(e.target.checked)} style={{ accentColor: "var(--gold)" }} />
                  Unique
                </label>
                
                {needsValues ? (
                  <select 
                    value={fieldDefault} 
                    onChange={(e) => setFieldDefault(e.target.value)} 
                    className="si-select" 
                    style={{ width: 180, fontSize: 12, height: 28, padding: "0 8px" }}
                  >
                    <option value="">Default value (none)</option>
                    {enumOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input 
                    value={fieldDefault} 
                    onChange={(e) => setFieldDefault(e.target.value)} 
                    placeholder="Default value (optional)" 
                    className="si-input" 
                    style={{ width: 180, fontFamily: "var(--font-jetbrains-mono)", fontSize: 12, padding: "4px 8px", height: 28 }} 
                  />
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={cancelEdit} className="si-btn-secondary" style={{ fontSize: 12, padding: "6px 14px" }}>Cancel</button>
                <button onClick={handleAddField} className="si-btn-primary" style={{ fontSize: 12, padding: "6px 16px" }}>{editingField ? "Save" : "Add"}</button>
              </div>
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
              value={model.migration.primary_key || "id"}
              onChange={(e) => updateModel(model.name, { migration: { ...model.migration, primary_key: e.target.value as any } })}
              className="si-select"
              style={{ fontSize: 13 }}
            >
              <option value="id">Auto-increment</option>
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
          {(["timestamps", "softDeletes"] as const).map((key) => (
            <button
              key={key}
              onClick={() => updateModel(model.name, { migration: { ...model.migration, [key]: !model.migration[key] } })}
              style={{
                fontSize: 12, padding: "6px 14px", borderRadius: 100,
                border: `1px solid ${model.migration[key] ? "var(--gold-border)" : "var(--border-subtle)"}`,
                background: model.migration[key] ? "var(--gold-subtle)" : "transparent",
                color: model.migration[key] ? "var(--gold)" : "var(--text3)",
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {key === "timestamps" ? "⏱ Timestamps" : "🗑 Soft Deletes"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
