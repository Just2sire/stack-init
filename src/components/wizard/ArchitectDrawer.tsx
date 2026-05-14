"use client";

import { useWizardStore } from "@/stores/useWizardStore";
import { cn } from "@/lib/utils";
import { X, Database, Code, ChevronRight, FileCode, Layers } from "lucide-react";
import { generateModelPreview, generateMigrationPreview } from "@/lib/generator/previews";
import { ERDDiagram } from "./erd/ERDDiagram";
import { useState } from "react";

export function ArchitectDrawer() {
  const { isDrawerOpen, setIsDrawerOpen, activePreviewTab, setActivePreviewTab, models } = useWizardStore();
  const [selectedModelName, setSelectedModelName] = useState<string | null>(null);

  if (!isDrawerOpen) return null;

  const currentModel = models.find(m => m.name === selectedModelName) || models[0];

  return (
    <div className="fixed inset-y-0 right-0 w-[500px] bg-[#0f111a] border-l border-white/[0.08] shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between p-4 border-b border-white/[0.08] bg-[#161926]">
        <div className="flex gap-4">
          <button
            onClick={() => setActivePreviewTab('erd')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              activePreviewTab === 'erd' ? "bg-[#6C63FF] text-white" : "text-gray-400 hover:text-white"
            )}
          >
            <Layers className="w-4 h-4" />
            ERD
          </button>
          <button
            onClick={() => setActivePreviewTab('code')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              activePreviewTab === 'code' ? "bg-[#6C63FF] text-white" : "text-gray-400 hover:text-white"
            )}
          >
            <Code className="w-4 h-4" />
            Code
          </button>
        </div>
        <button
          onClick={() => setIsDrawerOpen(false)}
          className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-gray-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-0 flex flex-col">
        {activePreviewTab === 'erd' ? (
          <div className="flex-1 p-6 flex flex-col min-h-0">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 shrink-0">Architecture Map</h3>
            <div className="flex-1 min-h-[400px]">
                <ERDDiagram />
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-white/[0.04] bg-white/[0.01] flex gap-2 overflow-x-auto">
                {models.map(m => (
                    <button 
                        key={m.name}
                        onClick={() => setSelectedModelName(m.name)}
                        className={cn(
                            "px-3 py-1 rounded text-xs whitespace-nowrap transition-colors",
                            (selectedModelName === m.name || (!selectedModelName && models[0]?.name === m.name)) 
                                ? "bg-white/10 text-white" 
                                : "text-gray-500 hover:text-gray-300"
                        )}
                    >
                        {m.name}.php
                    </button>
                ))}
            </div>
            
            <div className="flex-1 p-6 space-y-8 overflow-y-auto font-mono text-sm">
                {currentModel ? (
                    <>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-400">
                                <FileCode className="w-4 h-4" />
                                <span className="text-xs uppercase tracking-wider font-bold">Model Preview</span>
                            </div>
                            <pre className="bg-black/40 p-4 rounded-lg text-[#4ade80] overflow-x-auto">
                                {generateModelPreview(currentModel)}
                            </pre>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-400">
                                <FileCode className="w-4 h-4" />
                                <span className="text-xs uppercase tracking-wider font-bold">Migration Preview</span>
                            </div>
                            <pre className="bg-black/40 p-4 rounded-lg text-[#a59bff] overflow-x-auto">
                                {generateMigrationPreview(currentModel)}
                            </pre>
                        </div>
                    </>
                ) : (
                    <p className="text-gray-600 text-center mt-20">Select a model to preview code.</p>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
