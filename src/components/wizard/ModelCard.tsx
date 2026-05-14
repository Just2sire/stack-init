"use client";

import { Model } from "@stack-init/schema";
import { useWizardStore } from "@/stores/useWizardStore";
import { Edit2, Trash2, Key, Database } from "lucide-react";

interface ModelCardProps {
  model: Model;
  onEdit: () => void;
}

export function ModelCard({ model, onEdit }: ModelCardProps) {
  const { removeModel } = useWizardStore();

  return (
    <div className="group relative bg-[#1a1d2d] border border-white/[0.08] rounded-xl p-5 hover:border-[#6C63FF]/50 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-[#6C63FF] transition-colors">
            {model.name}
          </h3>
          <p className="text-[11px] text-gray-500 font-mono uppercase tracking-wider">
            {model.table || `${model.name.toLowerCase()}s`}
          </p>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
            title="Edit model"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); if(confirm(`Delete ${model.name}?`)) removeModel(model.name); }}
            className="p-1.5 hover:bg-red-500/10 rounded-md text-gray-400 hover:text-red-500 transition-colors"
            title="Delete model"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {model.fields.slice(0, 4).map((field) => (
          <div key={field.name} className="flex justify-between items-center text-xs">
            <span className="text-gray-300 flex items-center gap-1.5">
              {field.name === (model.migration.primary_key || 'id') && <Key className="w-3 h-3 text-amber-500" />}
              {field.name}
            </span>
            <span className="text-gray-500 italic">{field.type}</span>
          </div>
        ))}
        {model.fields.length > 4 && (
          <p className="text-[10px] text-gray-600 text-center pt-1">
            + {model.fields.length - 4} more fields
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-white/[0.04] mt-auto">
        <div className="flex items-center gap-1 text-[10px] text-gray-400">
          <Database className="w-3 h-3" />
          {model.migration.engine || 'InnoDB'}
        </div>
        {model.migration.softDeletes && (
          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[9px] font-medium">
            Soft Delete
          </span>
        )}
      </div>
    </div>
  );
}
