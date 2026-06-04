"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ReactFlow,
  Background,
  Controls,
  ReactFlowProvider,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";
import dagre from "dagre";
import { useWizardStore } from "@/stores/useWizardStore";
import type { Model } from "@stack-init/schema";
import { Plus, X, Check, ArrowRight, Share2 } from "lucide-react";
import { EditableModelNode } from "../erd/EditableModelNode";
import { DeletableEdge } from "../erd/DeletableEdge";

const nodeTypes = { modelNode: EditableModelNode };
const edgeTypes = { deletable: DeletableEdge };

const NODE_W = 180;
const NODE_H = 110;

function computeDagreLayout(
  models: Model[]
): Record<string, { x: number; y: number }> {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", nodesep: 60, ranksep: 120 });

  models.forEach((m) => g.setNode(m.name, { width: NODE_W, height: NODE_H }));
  models.forEach((m) =>
    m.relations.forEach((r) => {
      if (models.find((x) => x.name === r.model)) {
        g.setEdge(m.name, r.model);
      }
    })
  );
  dagre.layout(g);

  const positions: Record<string, { x: number; y: number }> = {};
  models.forEach((m) => {
    const n = g.node(m.name);
    if (n) positions[m.name] = { x: n.x - NODE_W / 2, y: n.y - NODE_H / 2 };
  });
  return positions;
}

const CANONICAL_ERD_TYPES = new Set(["hasOne", "hasMany", "belongsToMany"]);

const RELATION_BADGE_STYLE: Record<string, React.CSSProperties> = {
  hasOne:       { color: "#4d9fff", background: "rgba(77,159,255,0.1)" },
  hasMany:      { color: "#f5c842", background: "rgba(245,200,66,0.1)" },
  belongsToMany:{ color: "#9d6fff", background: "rgba(157,111,255,0.1)" },
  belongsTo:    { color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.06)" },
};

function buildErdEdges(
  models: Model[],
  removeRelation: (name: string, idx: number) => void
): Edge[] {
  const edges: Edge[] = [];
  const seen = new Set<string>();
  for (const model of models) {
    for (let i = 0; i < model.relations.length; i++) {
      const rel = model.relations[i];
      if (!CANONICAL_ERD_TYPES.has(rel.type)) continue;
      if (!models.find((m) => m.name === rel.model)) continue;
      const edgeId = `${model.name}__${rel.type}__${rel.model}__${i}`;
      if (seen.has(edgeId)) continue;
      seen.add(edgeId);
      const cName = model.name;
      const cIdx = i;
      edges.push({
        id: edgeId,
        source: model.name,
        target: rel.model,
        type: "deletable",
        data: {
          label: rel.type,
          onDelete: () => removeRelation(cName, cIdx),
        },
      });
    }
  }
  return edges;
}

function ErdBody({
  selectedModel,
  onSelectModel,
}: {
  selectedModel: string | null;
  onSelectModel: (name: string | null) => void;
}) {
  const { models, removeRelation, addRelation } = useWizardStore();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback((connection: Connection) => {
    if (connection.source && connection.target && connection.source !== connection.target) {
      addRelation(connection.source, { type: 'hasMany', model: connection.target });
    }
  }, [addRelation]);

  useEffect(() => {
    const dagrePositions = computeDagreLayout(models);
    setNodes((prev) => {
      const existingPos: Record<string, { x: number; y: number }> = {};
      prev.forEach((n) => {
        existingPos[n.id] = n.position;
      });
      return models.map((m) => ({
        id: m.name,
        type: "modelNode",
        position: existingPos[m.name] ?? dagrePositions[m.name] ?? { x: 0, y: 0 },
        selected: m.name === selectedModel,
        data: {
          label: m.name,
          fieldCount: m.fields.length,
          topFields: m.fields
            .slice(0, 3)
            .map((f) => ({ name: f.name, type: f.type })),
          relationCount: m.relations.length,
        },
      }));
    });
    setEdges(buildErdEdges(models, removeRelation));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [models]);

  useEffect(() => {
    setNodes((prev) =>
      prev.map((n) => ({ ...n, selected: n.id === selectedModel }))
    );
  }, [selectedModel]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={(_, node) => onSelectModel(node.id)}
      onPaneClick={() => onSelectModel(null)}
      deleteKeyCode={null}
      fitView
      fitViewOptions={{ padding: 0.25 }}
    >
      <Background gap={20} size={1} color="rgba(255,255,255,0.04)" />
      <Controls />
    </ReactFlow>
  );
}

export function RelationsStep() {
  const t = useTranslations("steps");
  const { models } = useWizardStore();
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const selected = selectedModel
    ? models.find((m) => m.name === selectedModel) ?? null
    : null;

  if (models.length === 0) {
    return (
      <div className="si-step-panel">
        <div className="si-section-label">{t("relations.sectionLabel")}</div>
        <h1 className="si-title" style={{ marginBottom: 8 }}>
          {t("relations.title")}
        </h1>
        <div
          style={{
            marginTop: 40,
            textAlign: "center",
            padding: "60px 20px",
            border: "1px dashed var(--border-medium)",
            borderRadius: 16,
            color: "var(--text3)",
          }}
        >
          <span style={{ fontSize: 36, display: "block", marginBottom: 12, opacity: 0.3 }}>
            ⇄
          </span>
          <p style={{ fontSize: 14 }}>{t("relations.createModelsFirst")}</p>
          <p style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}>
            {t("relations.goBack")}
          </p>
        </div>
      </div>
    );
  }

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
      {/* Toolbar */}
      <div
        style={{
          padding: "14px 24px",
          borderBottom: "1px solid var(--border-subtle)",
          flexShrink: 0,
          background: "var(--bg2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div className="si-section-label" style={{ marginBottom: 0 }}>
            {t("relations.sectionLabel")}
          </div>
          <h1
            style={{
              fontSize: 18,
              fontFamily: "var(--font-syne)",
              fontWeight: 800,
              color: "var(--text)",
              margin: 0,
            }}
          >
            {t("relations.title")}
          </h1>
        </div>
        <p style={{ fontSize: 12, color: "var(--text3)" }}>
          {t("relations.canvasHint")}
        </p>
      </div>

      {/* ERD + side panel */}
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        {/* ERD canvas */}
        <div style={{ flex: "0 0 65%", minWidth: 0 }}>
          <ReactFlowProvider>
            <ErdBody
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
            />
          </ReactFlowProvider>
        </div>

        {/* Right panel */}
        <div
          style={{
            flex: "0 0 35%",
            borderLeft: "1px solid var(--border-subtle)",
            overflowY: "auto",
            background: "var(--bg2)",
          }}
        >
          {selected ? (
            <RelationPanel model={selected} allModels={models} />
          ) : (
            <div
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text3)",
                textAlign: "center",
                padding: 24,
              }}
            >
              <span
                style={{
                  fontSize: 32,
                  display: "block",
                  marginBottom: 12,
                  opacity: 0.25,
                }}
              >
                ⇄
              </span>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text2)",
                  marginBottom: 6,
                }}
              >
                {t("relations.selectModel")}
              </p>
              <p style={{ fontSize: 12 }}>
                {t("relations.clickNode")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Relation management panel (right side) ──────────────────────── */
function RelationPanel({
  model,
  allModels,
}: {
  model: Model;
  allModels: Model[];
}) {
  const t = useTranslations("steps");
  const { addRelation, removeRelation, stack } = useWizardStore();
  const [relType, setRelType]         = useState("hasMany");
  const [targetModel, setTargetModel] = useState("");
  const [isAdding, setIsAdding]       = useState(false);

  const isLaravel =
    stack === "laravel" ||
    stack === "laravel+react" ||
    stack === "laravel+nextjs";

  const relTypes = ["hasOne", "hasMany", "belongsTo", "belongsToMany"];
  if (isLaravel) {
    relTypes.push("morphTo", "morphMany", "morphToMany", "morphedByMany");
  }

  const getSourceField = (rel: { type: string; model: string }) => {
    if (rel.type !== "belongsTo") return null;
    const targetMeta = allModels.find((m) => m.name === rel.model);
    const tableName = targetMeta?.table || `${rel.model.toLowerCase()}s`;
    return (
      model.fields.find(
        (f) =>
          ["foreignId", "foreignUuid", "foreignUlid"].includes(f.type) &&
          (f as any).references === tableName
      ) || null
    );
  };

  const handleAdd = () => {
    if (!targetModel) return;
    addRelation(model.name, { type: relType as any, model: targetModel });
    setTargetModel("");
    setIsAdding(false);
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 20,
        }}
      >
        <Share2 size={16} style={{ color: "var(--gold)" }} />
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
        <span className="si-badge si-badge-gray">
          {model.relations.length} rel
        </span>
      </div>

      {/* Relations list */}
      {model.relations.length === 0 ? (
        <p
          style={{
            fontSize: 12,
            color: "var(--text3)",
            fontStyle: "italic",
            marginBottom: 16,
          }}
        >
          {t("relations.noRelations")}
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            marginBottom: 16,
          }}
        >
          {model.relations.map((rel, idx) => {
            const sourceField = getSourceField(rel);
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "7px 10px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: 4,
                      ...(RELATION_BADGE_STYLE[rel.type] ?? RELATION_BADGE_STYLE.belongsTo),
                    }}
                  >
                    {rel.type}
                  </span>
                  <ArrowRight size={10} style={{ color: "var(--text3)", flexShrink: 0 }} />
                  <span
                    style={{
                      fontFamily: "var(--font-jetbrains-mono)",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--text)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {rel.model}
                  </span>
                  {sourceField && (
                    <span
                      style={{
                        fontSize: 10,
                        color: "var(--text3)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      · via {sourceField.name}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeRelation(model.name, idx)}
                  className="si-btn-icon"
                  style={{ width: 20, height: 20, flexShrink: 0 }}
                >
                  <X size={10} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add relation */}
      {isAdding ? (
        <div
          style={{
            padding: 14,
            borderRadius: 10,
            border: "1px solid var(--border-subtle)",
            background: "var(--bg3)",
          }}
        >
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <select
              value={relType}
              onChange={(e) => setRelType(e.target.value)}
              className="si-select"
              style={{ fontSize: 12, width: 130, flexShrink: 0 }}
            >
              {relTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={targetModel}
              onChange={(e) => setTargetModel(e.target.value)}
              className="si-select"
              style={{ flex: 1, fontSize: 12 }}
            >
              <option value="">Target...</option>
              {allModels
                .filter((m) => m.name !== model.name)
                .map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleAdd}
              disabled={!targetModel}
              className="si-btn-primary"
              style={{
                flex: 1,
                fontSize: 11,
                height: 32,
                padding: "0 10px",
                justifyContent: "center",
              }}
            >
              <Check size={14} strokeWidth={3} />
              Confirm
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="si-btn-secondary"
              style={{
                flex: 1,
                fontSize: 11,
                height: 32,
                padding: "0 10px",
                justifyContent: "center",
              }}
            >
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="si-btn-ghost"
          style={{
            width: "100%",
            textAlign: "center",
            fontSize: 12,
            padding: "10px",
            border: "1px dashed var(--border-subtle)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <Plus size={14} />
          {t("relations.addRelation")}
        </button>
      )}

      {/* Auto-detection note */}
      <div className="si-info-card" style={{ marginTop: 20 }}>
        <p
          style={{
            fontWeight: 600,
            color: "var(--gold)",
            marginBottom: 4,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontSize: 10,
          }}
        >
          {t("relations.autoDetection")}
        </p>
        <p style={{ color: "var(--text2)", lineHeight: 1.6, fontSize: 12 }}>
          {t("relations.autoDesc")}
        </p>
      </div>
    </div>
  );
}
