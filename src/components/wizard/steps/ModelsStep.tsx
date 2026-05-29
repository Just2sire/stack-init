"use client";

import { useState, useRef } from "react";
import { useWizardStore } from "@/stores/useWizardStore";
import type { Model, NamedField } from "@stack-init/schema";
import { Zap, X, List, LayoutGrid, Network, Library } from "lucide-react";
import { ImportModal } from "../ImportModal";
import { ModulesModal } from "../ModulesModal";
import { CanvasView } from "../canvas/CanvasView";
import { AIAssistant } from "@/components/wizard/AIAssistant";

const FIELD_TYPES = [
  "string","char","text","longText","mediumText","tinyText",
  "integer","bigInteger","smallInteger","unsignedBigInteger",
  "boolean","decimal","float","double",
  "timestamp","timestampTz","date","dateTime",
  "foreignId","foreignUuid",
  "enum","set","json","jsonb","uuid","ulid","binary","rememberToken",
];

type FieldType = typeof FIELD_TYPES[number];

type SuggestedField = { name: string; type: string; nullable?: boolean; values?: string[]; references?: string[] };

const SUGGESTED_FIELDS: Record<string, SuggestedField[]> = {
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
  Article: [
    { name: "title", type: "string" },
    { name: "slug", type: "string" },
    { name: "excerpt", type: "text", nullable: true },
    { name: "content", type: "longText" },
    { name: "status", type: "enum", values: ["draft", "published", "archived"] },
    { name: "published_at", type: "timestamp", nullable: true },
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
    { name: "status", type: "enum", values: ["pending", "paid", "shipped", "delivered", "cancelled"] },
    { name: "notes", type: "text", nullable: true },
    { name: "shipped_at", type: "timestamp", nullable: true },
  ],
  Invoice: [
    { name: "number", type: "string" },
    { name: "amount", type: "decimal" },
    { name: "tax", type: "decimal", nullable: true },
    { name: "status", type: "enum", values: ["draft", "sent", "paid", "overdue", "cancelled"] },
    { name: "due_date", type: "date" },
    { name: "paid_at", type: "timestamp", nullable: true },
  ],
  Payment: [
    { name: "amount", type: "decimal" },
    { name: "currency", type: "string" },
    { name: "method", type: "enum", values: ["card", "bank", "paypal", "crypto"] },
    { name: "status", type: "enum", values: ["pending", "completed", "failed", "refunded"] },
    { name: "reference", type: "string", nullable: true },
    { name: "paid_at", type: "timestamp", nullable: true },
  ],
  Category: [
    { name: "name", type: "string" },
    { name: "slug", type: "string" },
    { name: "description", type: "text", nullable: true },
    { name: "parent_id", type: "foreignId", references: ["categories"] },
  ],
  Tag: [
    { name: "name", type: "string" },
    { name: "slug", type: "string" },
    { name: "color", type: "string", nullable: true },
  ],
  Comment: [
    { name: "content", type: "text" },
    { name: "is_approved", type: "boolean" },
    { name: "user_id", type: "foreignId", references: ["users"] },
    { name: "post_id", type: "foreignId", references: ["posts"] },
  ],
  Review: [
    { name: "rating", type: "integer" },
    { name: "title", type: "string", nullable: true },
    { name: "content", type: "text", nullable: true },
    { name: "is_verified", type: "boolean" },
  ],
  Address: [
    { name: "street", type: "string" },
    { name: "city", type: "string" },
    { name: "state", type: "string", nullable: true },
    { name: "country", type: "string" },
    { name: "postal_code", type: "string" },
    { name: "is_default", type: "boolean" },
  ],
  Profile: [
    { name: "bio", type: "text", nullable: true },
    { name: "avatar", type: "string", nullable: true },
    { name: "website", type: "string", nullable: true },
    { name: "location", type: "string", nullable: true },
    { name: "is_public", type: "boolean" },
  ],
  Notification: [
    { name: "type", type: "string" },
    { name: "title", type: "string" },
    { name: "message", type: "text" },
    { name: "is_read", type: "boolean" },
    { name: "read_at", type: "timestamp", nullable: true },
  ],
  Message: [
    { name: "content", type: "text" },
    { name: "is_read", type: "boolean" },
    { name: "read_at", type: "timestamp", nullable: true },
    { name: "sender_id", type: "foreignId", references: ["users"] },
  ],
  Media: [
    { name: "name", type: "string" },
    { name: "path", type: "string" },
    { name: "mime_type", type: "string" },
    { name: "size", type: "integer" },
    { name: "disk", type: "string" },
  ],
  Role: [
    { name: "name", type: "string" },
    { name: "slug", type: "string" },
    { name: "description", type: "text", nullable: true },
  ],
  Permission: [
    { name: "name", type: "string" },
    { name: "slug", type: "string" },
    { name: "description", type: "text", nullable: true },
  ],
  Subscription: [
    { name: "plan", type: "string" },
    { name: "status", type: "enum", values: ["trialing", "active", "past_due", "cancelled"] },
    { name: "trial_ends_at", type: "timestamp", nullable: true },
    { name: "current_period_end", type: "timestamp", nullable: true },
    { name: "cancelled_at", type: "timestamp", nullable: true },
  ],
};

const GLOBAL_FIELD_SUGGESTIONS: SuggestedField[] = [
  { name: "name", type: "string" },
  { name: "slug", type: "string" },
  { name: "description", type: "text", nullable: true },
  { name: "status", type: "string" },
  { name: "is_active", type: "boolean" },
  { name: "sort_order", type: "integer", nullable: true },
];

const PATTERN_SUGGESTIONS: Array<{ pattern: RegExp; fields: SuggestedField[] }> = [
  { pattern: /item|line/i,    fields: [{ name: "quantity", type: "integer" }, { name: "unit_price", type: "decimal" }, { name: "total", type: "decimal" }] },
  { pattern: /log|history/i,  fields: [{ name: "action", type: "string" }, { name: "ip_address", type: "string", nullable: true }, { name: "user_agent", type: "string", nullable: true }] },
  { pattern: /setting|config/i, fields: [{ name: "key", type: "string" }, { name: "value", type: "text" }, { name: "group", type: "string", nullable: true }] },
  { pattern: /token/i,        fields: [{ name: "token", type: "string" }, { name: "type", type: "string" }, { name: "expires_at", type: "timestamp", nullable: true }, { name: "is_used", type: "boolean" }] },
  { pattern: /report/i,       fields: [{ name: "title", type: "string" }, { name: "type", type: "string" }, { name: "status", type: "enum", values: ["pending", "processing", "done", "failed"] }, { name: "generated_at", type: "timestamp", nullable: true }] },
];

function getSuggestionsForModel(modelName: string): SuggestedField[] {
  if (SUGGESTED_FIELDS[modelName]) return SUGGESTED_FIELDS[modelName];

  // Partial match: does the name contain a known key?
  const lowerName = modelName.toLowerCase();
  for (const [key, suggestions] of Object.entries(SUGGESTED_FIELDS)) {
    if (lowerName.includes(key.toLowerCase())) return suggestions;
  }

  // Pattern match
  for (const { pattern, fields } of PATTERN_SUGGESTIONS) {
    if (pattern.test(modelName)) return fields;
  }

  return GLOBAL_FIELD_SUGGESTIONS;
}

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

type ViewMode = "list" | "grid" | "canvas";

export function ModelsStep() {
  const { models } = useWizardStore();
  const [view, setView]             = useState<ViewMode>(() => models.length > 0 ? "grid" : "list");
  const [activeModel, setActiveModel]   = useState<string | null>(() => models.length > 0 ? models[models.length - 1].name : null);
  const [showNewModel, setShowNewModel] = useState(() => models.length === 0);
  const [showImport, setShowImport]     = useState(false);
  const [showModules, setShowModules]   = useState(false);
  const [panelModel, setPanelModel]     = useState<string | null>(null);

  const model = activeModel ? models.find((m) => m.name === activeModel) : null;

  const handleSelectModelForPanel = (name: string | null) => {
    if (name === "__new__") {
      setPanelModel("__new__");
    } else {
      setPanelModel(name);
    }
  };

  const viewToggle = (
    <div
      style={{
        display: "flex",
        border: "1px solid var(--border-subtle)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {(
        [
          { id: "list", icon: <List size={14} />, label: "List" },
          { id: "grid", icon: <LayoutGrid size={14} />, label: "Grid" },
          { id: "canvas", icon: <Network size={14} />, label: "Canvas" },
        ] as const
      ).map((v, idx, arr) => (
        <button
          key={v.id}
          onClick={() => setView(v.id)}
          style={{
            padding: "6px 12px",
            fontSize: 11,
            fontWeight: 600,
            background: view === v.id ? "var(--gold-subtle)" : "transparent",
            color: view === v.id ? "var(--gold)" : "var(--text3)",
            border: "none",
            borderRight:
              idx < arr.length - 1 ? "1px solid var(--border-subtle)" : "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 5,
            transition: "all 0.15s",
          }}
        >
          {v.icon}
          {v.label}
        </button>
      ))}
    </div>
  );

  // ── Canvas view (full-bleed) ────────────────────────────────────
  if (view === "canvas") {
    return (
      <div
        className="si-step-panel"
        style={{
          margin: "-40px -48px",
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {showImport && <ImportModal onClose={() => setShowImport(false)} />}
        {showModules && <ModulesModal onClose={() => setShowModules(false)} />}

        {/* Toolbar */}
        <div
          style={{
            padding: "14px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            background: "var(--bg2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "var(--text)",
              }}
            >
              Models
            </span>
            <span
              style={{
                fontSize: 11,
                color: "var(--text3)",
                background: "var(--bg4)",
                padding: "2px 8px",
                borderRadius: 100,
              }}
            >
              {models.length}
            </span>
            <span
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.25)",
                fontStyle: "italic",
              }}
            >
              Double-click or + Model to create · Drag to relate
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => setShowModules(true)}
              className="si-btn-secondary"
              style={{ fontSize: 11, padding: "5px 12px", display: "flex", gap: 6, alignItems: "center" }}
            >
              <Library size={13} />
              Modules
            </button>
            <button
              onClick={() => setShowImport(true)}
              className="si-btn-secondary"
              style={{ fontSize: 11, padding: "5px 12px", display: "flex", gap: 6, alignItems: "center" }}
            >
              <Zap size={13} fill="var(--gold)" />
              Import
            </button>
            <button
              onClick={() => setPanelModel("__new__")}
              className="si-btn-primary"
              style={{ fontSize: 11, padding: "5px 12px" }}
            >
              + Model
            </button>
            {viewToggle}
          </div>
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <CanvasView onSelectModel={handleSelectModelForPanel} />
        </div>

        {/* Slide panel */}
        {panelModel && (
          <ModelEditorSlidePanel
            modelName={panelModel}
            onClose={() => setPanelModel(null)}
            onCreated={(name) => setPanelModel(name)}
          />
        )}
      </div>
    );
  }

  // ── Grid view ───────────────────────────────────────────────────
  if (view === "grid") {
    return (
      <div className="si-step-panel">
        {showImport && <ImportModal onClose={() => setShowImport(false)} />}
        {showModules && <ModulesModal onClose={() => setShowModules(false)} />}

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <div>
            <div className="si-section-label">Schema</div>
            <h1
              className="si-title"
              style={{ marginBottom: 0 }}
            >
              Models
            </h1>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => setShowModules(true)}
              className="si-btn-secondary"
              style={{ fontSize: 12, display: "flex", gap: 6, alignItems: "center" }}
            >
              <Library size={14} />
              Modules
            </button>
            <button
              onClick={() => setShowImport(true)}
              className="si-btn-secondary"
              style={{ fontSize: 12, display: "flex", gap: 6, alignItems: "center" }}
            >
              <Zap size={14} fill="var(--gold)" />
              Import
            </button>
            <button
              onClick={() => setPanelModel("__new__")}
              className="si-btn-primary"
              style={{ fontSize: 12 }}
            >
              + New model
            </button>
            {viewToggle}
          </div>
        </div>

        <GridView onSelectModel={handleSelectModelForPanel} />

        <div style={{ marginTop: 24 }}>
          <AIAssistant step="models" placeholder='Suggest models — e.g. "Add a subscription system with plans and invoices"' />
        </div>

        {panelModel && (
          <ModelEditorSlidePanel
            modelName={panelModel}
            onClose={() => setPanelModel(null)}
            onCreated={(name) => setPanelModel(name)}
          />
        )}
      </div>
    );
  }

  // ── List view (default) ─────────────────────────────────────────
  return (
    <div className="si-step-panel" style={{ display: "flex", flexDirection: "column" }}>
      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
      {showModules && <ModulesModal onClose={() => setShowModules(false)} />}

      {/* Header — always top-right regardless of view */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text3)",
            }}
          >
            Models
          </span>
          {models.length > 0 && (
            <span
              style={{
                fontSize: 10,
                color: "var(--text3)",
                background: "var(--bg4)",
                padding: "2px 7px",
                borderRadius: 100,
              }}
            >
              {models.length}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => setShowModules(true)}
            className="si-btn-icon"
            title="Module Library"
            style={{ width: 26, height: 26 }}
          >
            <Library size={14} />
          </button>
          <button
            onClick={() => setShowImport(true)}
            className="si-btn-icon"
            title="Quick Import"
            style={{ width: 26, height: 26 }}
          >
            <Zap size={14} fill="var(--gold)" />
          </button>
          <button
            onClick={() => {
              setShowNewModel(true);
              setActiveModel(null);
            }}
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--gold)",
              background: "var(--gold-subtle)",
              border: "1px solid var(--gold-border)",
              borderRadius: 8,
              padding: "4px 10px",
              cursor: "pointer",
              opacity: showNewModel ? 0.5 : 1,
            }}
          >
            + New
          </button>
          {viewToggle}
        </div>
      </div>

      {/* AI Assistant */}
      <div style={{ marginBottom: 20 }}>
        <AIAssistant step="models" placeholder='Suggest models — e.g. "Add a subscription system with plans and invoices"' />
      </div>

      {/* Two-column content */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: 24,
          minHeight: 0,
          flex: 1,
        }}
      >
        {/* Left panel: model list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              overflowY: "auto",
              flex: 1,
              paddingRight: 4,
            }}
          >
            {models.length === 0 && (
              <div
                style={{
                  padding: "40px 16px",
                  textAlign: "center",
                  border: "1px dashed var(--border-medium)",
                  borderRadius: 12,
                  color: "var(--text3)",
                  opacity: showNewModel ? 0.4 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.3 }}>◫</div>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text2)",
                    marginBottom: 4,
                  }}
                >
                  No models yet
                </p>
                <p style={{ fontSize: 12, marginBottom: 16 }}>
                  Start by adding your first model
                </p>
                {!showNewModel && (
                  <button
                    onClick={() => setShowNewModel(true)}
                    className="si-btn-primary"
                    style={{ fontSize: 12, padding: "7px 16px" }}
                  >
                    Add model
                  </button>
                )}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {models.map((m) => (
                <ModelRow
                  key={m.name}
                  model={m}
                  isActive={activeModel === m.name}
                  onClick={() => {
                    setActiveModel(m.name);
                    setShowNewModel(false);
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right panel: editor */}
        <div>
          {showNewModel && (
            <NewModelPanel
              onCreated={(name) => {
                setShowNewModel(false);
                setActiveModel(name);
              }}
              onCancel={() => setShowNewModel(false)}
            />
          )}
          {!showNewModel && model && (
            <ModelEditor key={model.name} model={model} />
          )}
          {!showNewModel && !model && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: 320,
                color: "var(--text3)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.2 }}>◫</div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--text2)",
                  marginBottom: 6,
                }}
              >
                Select a model to edit
              </p>
              <p style={{ fontSize: 13 }}>
                Or create a new one from the list on the left
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Grid view ────────────────────────────────────────────────────── */
function GridView({
  onSelectModel,
}: {
  onSelectModel: (name: string | null) => void;
}) {
  const { models } = useWizardStore();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: 14,
      }}
    >
      {models.map((m) => (
        <ModelCard key={m.name} model={m} onClick={() => onSelectModel(m.name)} />
      ))}

      {/* New model card */}
      <button
        onClick={() => onSelectModel("__new__")}
        style={{
          border: "1px dashed var(--border-medium)",
          borderRadius: 12,
          padding: 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          cursor: "pointer",
          color: "var(--text3)",
          background: "transparent",
          minHeight: 130,
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--gold-border)";
          e.currentTarget.style.color = "var(--gold)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border-medium)";
          e.currentTarget.style.color = "var(--text3)";
        }}
      >
        <span style={{ fontSize: 24, lineHeight: 1 }}>+</span>
        <span style={{ fontSize: 12, fontWeight: 600 }}>New model</span>
      </button>
    </div>
  );
}

/* ── Model card (grid) ───────────────────────────────────────────── */
function ModelCard({ model, onClick }: { model: Model; onClick: () => void }) {
  const { removeModel } = useWizardStore();
  const topFields = model.fields.slice(0, 4);

  return (
    <div
      onClick={onClick}
      className="si-card"
      style={{
        cursor: "pointer",
        padding: 16,
        position: "relative",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(245,200,66,0.25)";
        const btn = e.currentTarget.querySelector(".card-delete") as HTMLElement | null;
        if (btn) btn.style.opacity = "1";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "";
        const btn = e.currentTarget.querySelector(".card-delete") as HTMLElement | null;
        if (btn) btn.style.opacity = "0";
      }}
    >
      {/* Delete button */}
      <button
        className="card-delete"
        onClick={(e) => {
          e.stopPropagation();
          removeModel(model.name);
        }}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text3)",
          fontSize: 12,
          opacity: 0,
          transition: "opacity 0.15s",
          padding: "2px 4px",
        }}
      >
        ✕
      </button>

      {/* Model name */}
      <div style={{ marginBottom: 10 }}>
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 13,
            fontWeight: 700,
            color: "var(--gold)",
            display: "block",
          }}
        >
          {model.name}
        </span>
        <span style={{ fontSize: 10, color: "var(--text3)" }}>
          {model.table ?? `${model.name.toLowerCase()}s`}
        </span>
      </div>

      {/* Top fields */}
      {topFields.map((f) => {
        const tc = typeColor(f.type);
        return (
          <div
            key={f.name}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              marginBottom: 3,
              gap: 6,
            }}
          >
            <span
              style={{
                color: "var(--text2)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {f.name}
            </span>
            <span
              style={{
                color: tc.color,
                fontSize: 10,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {f.type}
            </span>
          </div>
        );
      })}
      {model.fields.length > 4 && (
        <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 3 }}>
          +{model.fields.length - 4} more
        </div>
      )}

      {/* Footer badges */}
      <div
        style={{
          marginTop: 10,
          paddingTop: 8,
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 10, color: "var(--text3)" }}>
          {model.fields.length} fields
        </span>
        {model.relations.length > 0 && (
          <span style={{ fontSize: 10, color: "#9d6fff" }}>
            {model.relations.length} rel
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Slide panel (grid + canvas views) ──────────────────────────── */
function ModelEditorSlidePanel({
  modelName,
  onClose,
  onCreated,
}: {
  modelName: string | null;
  onClose: () => void;
  onCreated: (name: string) => void;
}) {
  const { models } = useWizardStore();
  const model = modelName ? models.find((m) => m.name === modelName) : null;

  if (!modelName) return null;

  return (
    <>
      {/* Transparent backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 39 }}
      />
      {/* Panel */}
      <div
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          width: 480,
          background: "var(--bg2)",
          borderLeft: "1px solid var(--border-subtle)",
          zIndex: 40,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.35)",
        }}
      >
        {/* Panel header */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--gold)",
            }}
          >
            {modelName === "__new__" ? "New Model" : (model?.name ?? modelName)}
          </span>
          <button onClick={onClose} className="si-btn-icon">
            <X size={16} />
          </button>
        </div>

        {/* Panel body */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {modelName === "__new__" ? (
            <NewModelPanel
              onCreated={(name) => onCreated(name)}
              onCancel={onClose}
            />
          ) : model ? (
            <ModelEditor key={model.name} model={model} />
          ) : null}
        </div>
      </div>
    </>
  );
}

/* ── Model row in list ───────────────────────────────────────────── */
function ModelRow({
  model,
  isActive,
  onClick,
}: {
  model: Model;
  isActive: boolean;
  onClick: () => void;
}) {
  const { removeModel } = useWizardStore();
  const previewFields = model.fields.slice(0, 3);
  const extraFields = model.fields.length - previewFields.length;

  return (
    <div
      onClick={onClick}
      style={{
        padding: "11px 13px",
        borderRadius: 10,
        cursor: "pointer",
        background: isActive ? "var(--gold-subtle)" : "var(--bg3)",
        border: `1.5px solid ${isActive ? "var(--gold-border)" : "var(--border-subtle)"}`,
        transition: "all 0.15s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (!isActive) (e.currentTarget as HTMLElement).style.borderColor = "var(--border-medium)";
        const btn = e.currentTarget.querySelector(".row-delete") as HTMLElement | null;
        if (btn) btn.style.opacity = "1";
      }}
      onMouseLeave={(e) => {
        if (!isActive) (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
        const btn = e.currentTarget.querySelector(".row-delete") as HTMLElement | null;
        if (btn) btn.style.opacity = "0";
      }}
    >
      {/* Name + delete */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: 13, fontWeight: 700,
          color: isActive ? "var(--gold)" : "var(--text)",
        }}>
          {model.name}
        </span>
        <button
          className="row-delete"
          onClick={(e) => { e.stopPropagation(); removeModel(model.name); }}
          style={{
            background: "none", border: "none", color: "var(--text3)",
            cursor: "pointer", fontSize: 12, padding: "0 2px",
            opacity: 0, transition: "opacity 0.15s", lineHeight: 1,
          }}
          title="Delete"
        >✕</button>
      </div>

      {/* Table name */}
      <div style={{ fontSize: 10, color: "var(--text3)", marginBottom: model.fields.length > 0 ? 8 : 0, fontFamily: "var(--font-jetbrains-mono)" }}>
        {model.table || `${model.name.toLowerCase()}s`}
      </div>

      {/* Field chips */}
      {model.fields.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: model.relations.length > 0 ? 6 : 0 }}>
          {previewFields.map((f) => {
            const tc = typeColor(f.type);
            return (
              <span key={f.name} style={{
                fontSize: 10, padding: "1px 6px", borderRadius: 4,
                background: tc.bg, color: tc.color,
                fontFamily: "var(--font-jetbrains-mono)",
                whiteSpace: "nowrap",
              }}>
                {f.name}
              </span>
            );
          })}
          {extraFields > 0 && (
            <span style={{ fontSize: 10, color: "var(--text3)", padding: "1px 4px" }}>
              +{extraFields}
            </span>
          )}
        </div>
      )}

      {/* Relations badge */}
      {model.relations.length > 0 && (
        <div style={{ fontSize: 10, color: "#9d6fff", fontWeight: 600 }}>
          {model.relations.length} relation{model.relations.length > 1 ? "s" : ""}
        </div>
      )}

      {/* Empty state */}
      {model.fields.length === 0 && (
        <div style={{ fontSize: 10, color: "var(--text3)", fontStyle: "italic" }}>No fields yet</div>
      )}
    </div>
  );
}

/* ── New model creation panel ─────────────────────────────────────── */
const RESERVED_MODEL_NAMES = new Set(['Model', 'Schema', 'Database', 'Migration', 'Query', 'Builder', 'Collection', 'Repository', 'Service', 'Controller', 'Router', 'Middleware', 'Request', 'Response', 'Event', 'Job', 'Command', 'Exception']);

function getNameHint(name: string, existingNames: Set<string>): { type: 'error' | 'warning' | 'success' | 'info'; msg: string } | null {
  const trimmed = name.trim();
  if (!trimmed) return null;
  if (existingNames.has(trimmed)) return { type: 'error', msg: 'A model with this name already exists' };
  if (RESERVED_MODEL_NAMES.has(trimmed)) return { type: 'warning', msg: `"${trimmed}" is a common framework word — consider a more specific name` };
  if (!/^[A-Z]/.test(trimmed)) return { type: 'error', msg: 'Must start with an uppercase letter (PascalCase)' };
  if (!/^[A-Z][A-Za-z0-9]*$/.test(trimmed)) return { type: 'error', msg: 'Only letters and numbers allowed (PascalCase)' };
  if (SUGGESTED_FIELDS[trimmed]) return { type: 'success', msg: `Field suggestions available for ${trimmed}` };
  const lower = trimmed.toLowerCase();
  const partialMatch = Object.keys(SUGGESTED_FIELDS).find(k => lower.includes(k.toLowerCase()));
  if (partialMatch) return { type: 'info', msg: `Suggestions from "${partialMatch}" will be available` };
  return null;
}

function NewModelPanel({
  onCreated,
  onCancel,
}: {
  onCreated: (name: string) => void;
  onCancel: () => void;
}) {
  const { models, addModel } = useWizardStore();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const existingNames = new Set(models.map(m => m.name));
  const nameHint = getNameHint(name, existingNames);

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
        <h2
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: 22,
            fontWeight: 800,
            color: "var(--text)",
            marginBottom: 4,
          }}
        >
          Create a model
        </h2>
        <p style={{ fontSize: 13, color: "var(--text2)" }}>
          Give your model a PascalCase name. Fields can be added after.
        </p>
      </div>

      <div style={{ maxWidth: 480 }}>
        <label
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text2)",
            marginBottom: 8,
            letterSpacing: "0.04em",
          }}
        >
          Model name
        </label>
        <input
          autoFocus
          value={name}
          onChange={(e) => { setName(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          placeholder="e.g. UserProfile, BlogPost, OrderItem"
          className="si-input"
          style={{
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: 15,
            marginBottom: 8,
          }}
        />
        {error && (
          <p style={{ fontSize: 12, color: "var(--red)", marginBottom: 8 }}>
            {error}
          </p>
        )}
        {!error && nameHint && (
          <p style={{
            fontSize: 11,
            marginBottom: 8,
            color: nameHint.type === 'error' ? 'var(--red)' : nameHint.type === 'warning' ? '#f5a623' : nameHint.type === 'success' ? '#4dff91' : 'var(--text3)',
          }}>
            {nameHint.type === 'success' ? '✓' : nameHint.type === 'warning' ? '⚠' : nameHint.type === 'error' ? '✕' : 'ℹ'} {nameHint.msg}
          </p>
        )}
        <p style={{ fontSize: 11, color: "var(--text3)", marginBottom: 20 }}>
          PascalCase, singular — e.g.{" "}
          <code
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              color: "var(--gold)",
            }}
          >
            Post
          </code>
          , not{" "}
          <code style={{ fontFamily: "var(--font-jetbrains-mono)" }}>posts</code>
        </p>

        <div style={{ marginBottom: 24 }}>
          <p
            style={{
              fontSize: 11,
              color: "var(--text3)",
              marginBottom: 10,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Suggestions
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {["User","Post","Comment","Category","Product","Order","Tag","Article"].map((s) => (
              <button
                key={s}
                onClick={() => { setName(s); setError(""); }}
                style={{
                  padding: "4px 12px",
                  borderRadius: 100,
                  fontSize: 12,
                  cursor: "pointer",
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

/* ── Model editor ─────────────────────────────────────────────────── */
function ModelEditor({ model }: { model: Model }) {
  const { addField, removeField, updateField, updateModel, models } = useWizardStore();
  const [fieldName, setFieldName]     = useState("");
  const [fieldType, setFieldType]     = useState<string>("string");

  const [fieldLength, setFieldLength]         = useState<number>(255);
  const [fieldPrecision, setFieldPrecision]   = useState<number>(10);
  const [fieldScale, setFieldScale]           = useState<number>(2);
  const [fieldValues, setFieldValues]         = useState("");
  const [fieldRef, setFieldRef]               = useState("");
  const [fieldDimensions, setFieldDimensions] = useState<number>(1536);

  const [nullable, setNullable]           = useState(false);
  const [fieldDefault, setFieldDefault]   = useState("");
  const [fieldUnique, setFieldUnique]     = useState(false);
  const [fieldIndex, setFieldIndex]       = useState(false);

  const [isAddingField, setIsAddingField] = useState(true);
  const [editingField, setEditingField]   = useState<string | null>(null);
  const [fieldError, setFieldError]       = useState("");

  const fieldNameRef = useRef<HTMLInputElement>(null);
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

    const f: any = { name: fn, type: fieldType, nullable, unique: fieldUnique, index: fieldIndex };

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
    setTimeout(() => fieldNameRef.current?.focus(), 0);
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

  const suggestions = getSuggestionsForModel(model.name);
  const existingFieldNames = new Set(model.fields.map(f => f.name));
  const filteredSuggestions = suggestions.filter(s => !existingFieldNames.has(s.name));

  return (
    <div>
      {/* Model title */}
      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontFamily: "var(--font-syne)", fontSize: 24, fontWeight: 800, color: "var(--gold)", letterSpacing: "-0.02em" }}>
          {model.name}
        </span>
        <span style={{ fontSize: 12, color: "var(--text3)", fontFamily: "var(--font-jetbrains-mono)" }}>
          {model.table || `${model.name.toLowerCase()}s`}
        </span>
      </div>

      {/* Fields */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text3)" }}>
            Fields ({model.fields.length})
          </span>
        </div>

        {model.fields.map((f) => {
          const tc = typeColor(f.type);
          return (
            <div
              key={f.name}
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

        {/* Quick Add Suggestions */}
        {filteredSuggestions.length > 0 && (
          <div style={{ marginTop: 12, marginBottom: 12, paddingTop: 12, borderTop: "1px solid var(--border-subtle)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text3)", marginBottom: 10 }}>
              Quick Add
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
                    references: s.references ? s.references[0] : undefined,
                  } as NamedField)}
                  style={{
                    padding: "5px 12px", borderRadius: 100, fontSize: 12, cursor: "pointer",
                    border: "1px solid var(--border-subtle)",
                    background: "var(--bg4)",
                    color: "var(--text2)",
                    transition: "all 0.15s",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--gold-border)"; e.currentTarget.style.color = "var(--gold)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.color = "var(--text2)"; }}
                >
                  <span style={{ color: "var(--gold)", fontWeight: 800 }}>+</span>
                  {s.name}
                  <span style={{ fontSize: 10, opacity: 0.5, fontWeight: 400 }}>{s.type}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add / Edit field form */}
        {isAddingField && (
          <div style={{
            padding: 16,
            borderRadius: 12,
            border: "1px solid var(--border-subtle)",
            background: "var(--bg3)",
            marginTop: 8,
          }}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="si-section-label">
                  {editingField ? `Editing: ${editingField}` : "Field Name"}
                </label>
                <input
                  ref={fieldNameRef}
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
                    {models.map(m => (
                      <option key={m.name} value={m.table || `${m.name.toLowerCase()}s`}>
                        {m.table || `${m.name.toLowerCase()}s`}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border-subtle)", paddingTop: 14 }}>
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
                <button onClick={resetForm} className="si-btn-secondary text-xs">
                  {editingField ? "Cancel edit" : "Clear"}
                </button>
                <button onClick={handleAddField} className="si-btn-primary text-xs">
                  {editingField ? "Save Changes" : "Add Field"}
                </button>
              </div>
            </div>
            {fieldError && (
              <p style={{ fontSize: 11, color: "var(--red)", marginTop: 8 }}>{fieldError}</p>
            )}
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
            <label style={{ display: "block", fontSize: 11, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              Primary key
            </label>
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
            <label style={{ display: "block", fontSize: 11, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              Table name
            </label>
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
                className={["si-badge", isChecked ? "si-badge-gold" : "si-badge-gray"].join(" ")}
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
