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
    <div className="bg-[#1a1d2d] border-2 border-[#6C63FF]/30 rounded-xl overflow-hidden min-w-[200px] shadow-2xl">
      {/* Target handle at the top */}
      <Handle type="target" position={Position.Top} className="!bg-[#6C63FF] !w-3 !h-3 !border-none" />
      
      <div className="bg-[#6C63FF] px-4 py-2 flex items-center gap-2">
        <Table2 className="w-4 h-4 text-white" />
        <span className="text-sm font-bold text-white">{model.name}</span>
      </div>
      
      <div className="p-3 space-y-1 bg-[#1a1d2d]">
        {model.fields.map((field) => (
          <div key={field.name} className="flex justify-between items-center gap-4 text-[11px]">
            <span className="text-gray-200 flex items-center gap-1.5">
              {field.primary && <Key className="w-3 h-3 text-amber-500" />}
              {field.name}
            </span>
            <span className="text-gray-500 italic uppercase font-mono text-[9px]">
              {field.type}
            </span>
          </div>
        ))}
      </div>

      {/* Source handle at the bottom */}
      <Handle type="source" position={Position.Bottom} className="!bg-[#6C63FF] !w-3 !h-3 !border-none" />
    </div>
  );
}
