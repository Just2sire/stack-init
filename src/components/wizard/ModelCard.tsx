"use client";

import { Model } from "@stack-init/schema";
import { useWizardStore } from "@/stores/useWizardStore";

function getTypeClass(type: string) {
  const t = type.toLowerCase();
  if (["string", "char", "tinytext"].some((k) => t.includes(k)))
    return "si-type-string";
  if (["text", "mediumtext", "longtext"].some((k) => t.includes(k)))
    return "si-type-text";
  if (
    ["integer", "biginteger", "smallinteger", "int"].some((k) => t.includes(k))
  )
    return "si-type-integer";
  if (["decimal", "float", "double"].some((k) => t.includes(k)))
    return "si-type-decimal";
  if (t.includes("boolean")) return "si-type-boolean";
  if (["timestamp", "date", "datetime"].some((k) => t.includes(k)))
    return "si-type-timestamp";
  if (["foreignid", "foreignuuid"].some((k) => t.includes(k)))
    return "si-type-foreignid";
  if (["enum", "set"].some((k) => t.includes(k))) return "si-type-enum";
  if (["json", "jsonb"].some((k) => t.includes(k))) return "si-type-json";
  if (["uuid", "ulid"].some((k) => t.includes(k))) return "si-type-uuid";
  return "si-type-default";
}

interface ModelCardProps {
  model: Model;
  onEdit: () => void;
}

export function ModelCard({ model, onEdit }: ModelCardProps) {
  const { removeModel } = useWizardStore();

  return (
    <div className="si-model-card">
      {/* Header */}
      <div
        className="si-model-card-header"
        onClick={onEdit}
        style={{ cursor: "pointer" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: 15,
              fontWeight: 700,
              color: "var(--gold)",
            }}
          >
            {model.name}
          </span>
          <span
            style={{
              fontSize: 11,
              color: "var(--text3)",
              fontFamily: "var(--font-space-grotesk)",
              fontWeight: 400,
            }}
          >
            {model.fields.length} field{model.fields.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="si-btn-icon edit"
            title="Edit"
          >
            ✏
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete ${model.name}?`)) removeModel(model.name);
            }}
            className="si-btn-icon"
            title="Delete"
          >
            🗑
          </button>
        </div>
      </div>

      {/* Fields */}
      <div style={{ padding: "12px 20px 16px" }}>
        {model.fields.slice(0, 5).map((f) => (
          <div key={f.name} className="si-field-row">
            <span
              style={{
                flex: 1,
                color: "var(--text)",
                fontFamily: "var(--font-jetbrains-mono)",
              }}
            >
              {f.name}
            </span>
            <span className={`si-type-chip ${getTypeClass(f.type)}`}>
              {f.type}
            </span>
            {f.nullable && (
              <span style={{ fontSize: 10, color: "var(--text3)" }}>
                nullable
              </span>
            )}
          </div>
        ))}
        {model.fields.length > 5 && (
          <p
            style={{
              fontSize: 11,
              color: "var(--text3)",
              textAlign: "center",
              marginTop: 8,
            }}
          >
            + {model.fields.length - 5} more fields
          </p>
        )}
        {model.fields.length === 0 && (
          <p
            style={{ fontSize: 12, color: "var(--text3)", fontStyle: "italic" }}
          >
            No fields yet — click to edit
          </p>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 20px",
          borderTop: "1px solid var(--border-subtle)",
          background: "var(--bg4)",
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "var(--text3)",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          ◉ {model.table || `${model.name.toLowerCase()}s`}
        </span>
        {model.migration.softDeletes && (
          <span className="si-badge si-badge-blue">soft delete</span>
        )}
        {model.migration.timestamps && (
          <span className="si-badge si-badge-gray">timestamps</span>
        )}
      </div>
    </div>
  );
}
