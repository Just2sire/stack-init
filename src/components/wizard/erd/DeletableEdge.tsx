"use client";

import {
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
  MarkerType,
  type EdgeProps,
} from "@xyflow/react";

const RELATION_STYLES: Record<string, {
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
  labelColor: string;
  markerEnd: string;
}> = {
  hasOne: {
    stroke: "#4d9fff",
    strokeWidth: 1.5,
    labelColor: "#4d9fff",
    markerEnd: MarkerType.Arrow,
  },
  hasMany: {
    stroke: "#f5c842",
    strokeWidth: 2,
    labelColor: "#f5c842",
    markerEnd: MarkerType.ArrowClosed,
  },
  belongsToMany: {
    stroke: "#9d6fff",
    strokeWidth: 1.5,
    strokeDasharray: "6 3",
    labelColor: "#9d6fff",
    markerEnd: MarkerType.ArrowClosed,
  },
  belongsTo: {
    stroke: "rgba(255,255,255,0.12)",
    strokeWidth: 1,
    labelColor: "rgba(255,255,255,0.3)",
    markerEnd: MarkerType.Arrow,
  },
};

const DEFAULT_STYLE = {
  stroke: "rgba(255,255,255,0.15)",
  strokeWidth: 1.5,
  labelColor: "#9d6fff",
  markerEnd: MarkerType.Arrow,
};

export function DeletableEdge(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  } = props;

  const data = props.data as { label?: string; onDelete?: () => void } | undefined;
  const relType = data?.label ?? "";
  const rs = RELATION_STYLES[relType] ?? DEFAULT_STYLE;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={`url(#${rs.markerEnd})`}
        style={{
          strokeWidth: rs.strokeWidth,
          stroke: rs.stroke,
          strokeDasharray: rs.strokeDasharray,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan"
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "var(--bg3, #1a1a1f)",
            border: `1px solid ${rs.stroke}40`,
            borderRadius: 6,
            padding: "2px 6px 2px 8px",
            fontSize: 10,
          }}
        >
          <span style={{ color: rs.labelColor, fontWeight: 600 }}>
            {data?.label ?? "→"}
          </span>
          {data?.onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.onDelete!();
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.3)",
                fontSize: 10,
                padding: "0 2px",
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
