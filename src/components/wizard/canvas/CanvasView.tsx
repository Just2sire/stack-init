"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  ReactFlowProvider,
  useReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";
import { useWizardStore } from "@/stores/useWizardStore";
import { EditableModelNode } from "../erd/EditableModelNode";
import { DeletableEdge } from "../erd/DeletableEdge";

const nodeTypes = { modelNode: EditableModelNode };
const edgeTypes = { deletable: DeletableEdge };

const DEFAULT_GENERATE = {
  migration: true, controller: true, resource: true, request: true,
  seeder: false, factory: true, policy: false, service: false,
  tests: true, routes: true, swagger: false, softDelete: false, repository: false,
};

const CANONICAL_TYPES = new Set(["hasOne", "hasMany", "belongsTo", "belongsToMany"]);

function buildEdges(
  models: ReturnType<typeof useWizardStore.getState>["models"],
  removeRelation: (name: string, idx: number) => void
): Edge[] {
  const edges: Edge[] = [];
  const seen = new Set<string>();
  for (const model of models) {
    for (let i = 0; i < model.relations.length; i++) {
      const rel = model.relations[i];
      if (!CANONICAL_TYPES.has(rel.type)) continue;
      const target = models.find((m) => m.name === rel.model);
      if (!target) continue;
      const edgeId = `${model.name}__${rel.type}__${rel.model}__${i}`;
      if (seen.has(edgeId)) continue;
      seen.add(edgeId);
      const capturedName = model.name;
      const capturedIdx = i;
      edges.push({
        id: edgeId,
        source: model.name,
        target: rel.model,
        type: "deletable",
        data: {
          label: rel.type,
          onDelete: () => removeRelation(capturedName, capturedIdx),
        },
      });
    }
  }
  return edges;
}

function CanvasBody({
  onSelectModel,
}: {
  onSelectModel: (name: string | null) => void;
}) {
  const { models, addModel, removeModel, addRelation, removeRelation } =
    useWizardStore();
  const { screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const [newModelPos, setNewModelPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [newModelName, setNewModelName] = useState("");
  const [newModelError, setNewModelError] = useState("");
  const newModelInputRef = useRef<HTMLInputElement>(null);

  const [pendingConnect, setPendingConnect] = useState<Connection | null>(null);

  // Sync nodes when store models change (preserve positions)
  useEffect(() => {
    setNodes((prev) => {
      const posMap: Record<string, { x: number; y: number }> = {};
      prev.forEach((n) => {
        posMap[n.id] = n.position;
      });
      return models.map((m, i) => ({
        id: m.name,
        type: "modelNode",
        position: posMap[m.name] ?? {
          x: (i % 4) * 240,
          y: Math.floor(i / 4) * 190,
        },
        data: {
          label: m.name,
          fieldCount: m.fields.length,
          topFields: m.fields
            .slice(0, 3)
            .map((f) => ({ name: f.name, type: f.type })),
          relationCount: m.relations.length,
          onDelete: () => removeModel(m.name),
        },
      }));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [models]);

  // Sync edges when relations change
  useEffect(() => {
    setEdges(buildEdges(models, removeRelation));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [models]);

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

  const onPaneDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      setNewModelPos(pos);
      setNewModelName("");
      setNewModelError("");
      setTimeout(() => newModelInputRef.current?.focus(), 50);
    },
    [screenToFlowPosition]
  );

  const handleCreateModel = useCallback(() => {
    const n = newModelName.trim();
    if (!n) {
      setNewModelError("Name required");
      return;
    }
    if (!/^[A-Z][A-Za-z0-9]*$/.test(n)) {
      setNewModelError("PascalCase required (e.g. UserProfile)");
      return;
    }
    if (models.find((m) => m.name === n)) {
      setNewModelError("Already exists");
      return;
    }
    const pos = newModelPos!;
    setNodes((prev) => [
      ...prev,
      {
        id: n,
        type: "modelNode",
        position: pos,
        data: {
          label: n,
          fieldCount: 0,
          topFields: [],
          relationCount: 0,
          onDelete: () => removeModel(n),
        },
      },
    ]);
    addModel({
      name: n,
      fields: [],
      relations: [],
      generate: { ...DEFAULT_GENERATE },
      migration: { primary_key: "id", timestamps: true, softDeletes: false },
    });
    setNewModelPos(null);
    onSelectModel(n);
  }, [newModelName, newModelPos, models, addModel, removeModel, onSelectModel]);

  const onConnect = useCallback((connection: Connection) => {
    setPendingConnect(connection);
  }, []);

  const handleAddRelation = useCallback(
    (relType: string) => {
      if (!pendingConnect?.source || !pendingConnect?.target) return;
      addRelation(pendingConnect.source, {
        type: relType as any,
        model: pendingConnect.target,
      });
      setPendingConnect(null);
    },
    [pendingConnect, addRelation]
  );

  return (
    <div
      style={{ width: "100%", height: "100%", position: "relative" }}
      onDoubleClick={(e) => {
        const t = e.target as HTMLElement;
        if (t.closest(".react-flow__node") || t.closest(".react-flow__edge")) return;
        onPaneDoubleClick(e);
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => {
          setNewModelPos(null);
          setPendingConnect(null);
          onSelectModel(node.id);
        }}
        onPaneClick={() => {
          onSelectModel(null);
          setNewModelPos(null);
          setPendingConnect(null);
        }}
        deleteKeyCode={null}
        fitView
        fitViewOptions={{ padding: 0.3 }}
      >
        <Background
          gap={20}
          size={1}
          color="rgba(255,255,255,0.04)"
        />
        <Controls />
      </ReactFlow>

      {/* Double-click: new model dialog */}
      {newModelPos && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 20,
            background: "var(--bg2, #111116)",
            border: "1px solid rgba(245,200,66,0.3)",
            borderRadius: 12,
            padding: 20,
            minWidth: 280,
            boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
          }}
        >
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#f5c842",
              marginBottom: 12,
            }}
          >
            New Model
          </p>
          <input
            ref={newModelInputRef}
            value={newModelName}
            onChange={(e) => {
              setNewModelName(e.target.value);
              setNewModelError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateModel();
              if (e.key === "Escape") setNewModelPos(null);
            }}
            placeholder="PascalCase name…"
            className="si-input"
            style={{
              marginBottom: 8,
              fontFamily: "var(--font-jetbrains-mono, monospace)",
              fontSize: 13,
            }}
          />
          {newModelError && (
            <p
              style={{ fontSize: 11, color: "var(--red, #ff4d6d)", marginBottom: 8 }}
            >
              {newModelError}
            </p>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleCreateModel}
              className="si-btn-primary"
              style={{ flex: 1, fontSize: 12, justifyContent: "center" }}
            >
              Create
            </button>
            <button
              onClick={() => setNewModelPos(null)}
              className="si-btn-secondary"
              style={{ fontSize: 12 }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* On-connect: relation type picker */}
      {pendingConnect && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 20,
            background: "var(--bg2, #111116)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 12,
            padding: 20,
            minWidth: 260,
            boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
          }}
        >
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "var(--text, #e8e8f0)",
              marginBottom: 4,
            }}
          >
            {pendingConnect.source} → {pendingConnect.target}
          </p>
          <p
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              marginBottom: 14,
            }}
          >
            Choose relation type
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}
          >
            {["hasOne", "hasMany", "belongsTo", "belongsToMany"].map((t) => (
              <button
                key={t}
                onClick={() => handleAddRelation(t)}
                className="si-btn-secondary"
                style={{ fontSize: 12, justifyContent: "center" }}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPendingConnect(null)}
            style={{
              marginTop: 12,
              width: "100%",
              fontSize: 11,
              color: "rgba(255,255,255,0.3)",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Empty hint */}
      {models.length === 0 && !newModelPos && (
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 12,
            color: "rgba(255,255,255,0.3)",
            pointerEvents: "none",
            background: "var(--bg3, #1a1a1f)",
            border: "1px solid rgba(255,255,255,0.06)",
            padding: "8px 16px",
            borderRadius: 100,
            whiteSpace: "nowrap",
          }}
        >
          Double-click or click + Model to create · Drag handle to relate
        </div>
      )}

      {/* Relation legend */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: 16,
          pointerEvents: "none",
          background: "var(--bg2, #111116)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 8,
          padding: "8px 12px",
          fontSize: 10,
          color: "rgba(255,255,255,0.35)",
          lineHeight: 1.8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "#4d9fff", fontWeight: 600 }}>——</span>
          <span>hasOne</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "#f5c842", fontWeight: 600 }}>——</span>
          <span>hasMany</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "rgba(255,255,255,0.15)", fontWeight: 600 }}>——</span>
          <span>belongsTo</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "#9d6fff", fontWeight: 600 }}>- - -</span>
          <span>belongsToMany</span>
        </div>
      </div>
    </div>
  );
}

export function CanvasView({
  onSelectModel,
}: {
  onSelectModel: (name: string | null) => void;
}) {
  return (
    <ReactFlowProvider>
      <CanvasBody onSelectModel={onSelectModel} />
    </ReactFlowProvider>
  );
}
