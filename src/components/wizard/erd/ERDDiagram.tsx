"use client";

import React, { useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import { useWizardStore } from "@/stores/useWizardStore";
import { ModelNode } from "./ModelNode";

const nodeTypes = {
  modelNode: ModelNode,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 220;
const nodeHeight = 150;

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  dagreGraph.setGraph({ rankdir: "TB" });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export function ERDDiagram() {
  const { models } = useWizardStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    if (models.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    // Generate Nodes
    const newNodes: Node[] = models.map((model) => ({
      id: model.name,
      type: "modelNode",
      data: { model },
      position: { x: 0, y: 0 },
    }));

    // Generate Edges
    const newEdges: Edge[] = [];
    models.forEach((model) => {
      model.relations.forEach((rel, idx) => {
        newEdges.push({
          id: `e-${model.name}-${rel.model}-${idx}`,
          source: model.name,
          target: rel.model,
          label: rel.type,
          labelStyle: { fill: "#a0a0a0", fontSize: 10, fontWeight: 700 },
          labelBgStyle: { fill: "#161926", fillOpacity: 0.8 },
          animated: true,
          style: { stroke: "#6C63FF", strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: "#6C63FF",
          },
        });
      });
    });

    const layouted = getLayoutedElements(newNodes, newEdges);
    setNodes(layouted.nodes);
    setEdges(layouted.edges);
  }, [models, setNodes, setEdges]);

  return (
    <div className="w-full h-full bg-[#0f111a] rounded-xl overflow-hidden border border-white/[0.08]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        colorMode="dark"
        minZoom={0.2}
        maxZoom={1.5}
      >
        <Background color="#ffffff" opacity={0.03} gap={20} />
        <Controls showInteractive={false} className="!bg-[#161926] !border-white/[0.08] !fill-white" />
      </ReactFlow>
    </div>
  );
}
