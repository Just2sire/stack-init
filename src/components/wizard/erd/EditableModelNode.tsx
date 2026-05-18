"use client";

import { memo } from "react";
import { Handle, Position } from "@xyflow/react";

interface NodeData {
  label: string;
  fieldCount: number;
  topFields: { name: string; type: string }[];
  relationCount: number;
  onDelete?: () => void;
}

function EditableModelNodeInner({
  data,
  selected,
}: {
  data: NodeData;
  selected: boolean;
}) {
  return (
    <div
      style={{
        background: selected
          ? "rgba(245,200,66,0.08)"
          : "var(--bg3, #1a1a1f)",
        border: `1.5px solid ${selected ? "rgba(245,200,66,0.4)" : "rgba(255,255,255,0.1)"}`,
        borderRadius: 10,
        minWidth: 168,
        maxWidth: 200,
        cursor: "pointer",
        transition: "border-color 0.15s, background 0.15s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        const btn = e.currentTarget.querySelector(
          ".node-delete-btn"
        ) as HTMLElement | null;
        if (btn) btn.style.opacity = "1";
      }}
      onMouseLeave={(e) => {
        const btn = e.currentTarget.querySelector(
          ".node-delete-btn"
        ) as HTMLElement | null;
        if (btn) btn.style.opacity = "0";
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "8px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-jetbrains-mono, monospace)",
            fontWeight: 700,
            fontSize: 13,
            color: selected ? "#f5c842" : "var(--text, #e8e8f0)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {data.label}
        </span>
        <button
          className="node-delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete?.();
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.3)",
            fontSize: 11,
            padding: 0,
            opacity: 0,
            transition: "opacity 0.15s",
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>

      {/* Fields */}
      <div style={{ padding: "7px 10px" }}>
        {data.topFields.length === 0 ? (
          <div
            style={{
              color: "rgba(255,255,255,0.25)",
              fontSize: 11,
              fontStyle: "italic",
            }}
          >
            No fields
          </div>
        ) : (
          data.topFields.map((f) => (
            <div
              key={f.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 3,
                gap: 8,
              }}
            >
              <span
                style={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 11,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {f.name}
              </span>
              <span
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontSize: 10,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {f.type}
              </span>
            </div>
          ))
        )}
        {data.fieldCount > 3 && (
          <div
            style={{
              color: "rgba(255,255,255,0.25)",
              fontSize: 10,
              marginTop: 3,
            }}
          >
            +{data.fieldCount - 3} more
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: "#f5c842",
          width: 8,
          height: 8,
          border: "2px solid var(--bg3, #1a1a1f)",
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: "#f5c842",
          width: 8,
          height: 8,
          border: "2px solid var(--bg3, #1a1a1f)",
        }}
      />
    </div>
  );
}

export const EditableModelNode = memo(EditableModelNodeInner);
