"use client";

import { Handle, Position } from "@xyflow/react";
import { Table2, Key } from "lucide-react";
import { Model } from "@stack-init/schema";

interface ModelNodeData {
  model: Model;
}

export function ModelNode({ data }: { data: ModelNodeData }) {
  const { model } = data;

  return (
    <div className="bg-bg3 border-2 border-gold/30 rounded-xl overflow-hidden min-w-[220px] shadow-2xl transition-all hover:border-gold/60">
      {/* Target handle at the top */}
      <Handle type="target" position={Position.Top} className="!bg-gold !w-2.5 !h-2.5 !border-none" />
      
      <div className="bg-gold px-4 py-2.5 flex items-center gap-2">
        <Table2 className="w-4 h-4 text-bg" />
        <span className="text-sm font-black text-bg uppercase tracking-tight">{model.name}</span>
      </div>
      
      <div className="p-3 space-y-1.5 bg-bg3/50 backdrop-blur-sm">
        {model.fields.map((field) => (
          <div key={field.name} className="flex justify-between items-center gap-4 text-[11px] py-0.5">
            <span className="text-text flex items-center gap-2 font-medium">
              {field.name}
            </span>
            <span className="text-text3 italic uppercase font-mono text-[9px] bg-bg4 px-1.5 py-0.5 rounded border border-white/[0.03]">
              {field.type}
            </span>
          </div>
        ))}
      </div>

      {/* Source handle at the bottom */}
      <Handle type="source" position={Position.Bottom} className="!bg-gold !w-2.5 !h-2.5 !border-none" />
    </div>
  );
}

