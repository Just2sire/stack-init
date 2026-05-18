"use client";

import { useWizardStore } from "@/stores/useWizardStore";
import { Table, Check, X, Code2, Zap } from "lucide-react";

export function RoutesStep() {
  const { models, setGenerate } = useWizardStore();

  const OPTIONS = [
    { key: 'controller', label: 'Controller', icon: <Code2 size={14} />, tooltip: 'Generates a CRUD controller with HTTP handler methods (index, show, store, update, destroy).' },
    { key: 'routes', label: 'Routes', icon: <Zap size={14} />, tooltip: 'Registers RESTful API routes for this model in the router (GET, POST, PUT/PATCH, DELETE).' },
    { key: 'service', label: 'Service', icon: <Code2 size={14} />, tooltip: 'Generates a Service class with business logic, separating it from the controller layer.' },
    { key: 'repository', label: 'Repository', icon: <Table size={14} />, tooltip: 'Generates a Repository class abstracting data access — useful for testing and swapping ORMs.' },
    { key: 'tests', label: 'Tests', icon: <Check size={14} />, tooltip: 'Generates unit/feature test files with example test cases for CRUD operations.' },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h2 className="si-title">API Routes & Controllers</h2>
        <p className="si-subtitle mt-2">Control which components are generated for each model.</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/5 bg-bg3">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-bottom border-white/5 bg-white/5">
              <th className="py-4 px-6 text-[11px] font-bold text-text3 uppercase tracking-wider">Model</th>
              {OPTIONS.map(opt => (
                <th key={opt.key} className="py-4 px-6 text-[11px] font-bold text-text3 uppercase tracking-wider text-center">
                  <div className="flex flex-col items-center gap-1" title={opt.tooltip}>
                    {opt.icon}
                    <span>{opt.label}</span>
                    <span style={{ fontSize: 10, opacity: 0.4, cursor: 'help' }}>ⓘ</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {models.map((model) => (
              <tr key={model.name} className="border-bottom border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-6">
                  <span className="font-bold text-gold">{model.name}</span>
                </td>
                {OPTIONS.map(opt => (
                  <td key={opt.key} className="py-4 px-6 text-center">
                    <div 
                      onClick={() => setGenerate(model.name, opt.key as any, !model.generate[opt.key as keyof typeof model.generate])}
                      className={[
                        "si-toggle mx-auto scale-90",
                        model.generate[opt.key as keyof typeof model.generate] ? "on" : ""
                      ].join(" ")}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="si-toggle-knob" />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="si-info-card">
        <p className="text-sm text-text2">
          <strong>Tip:</strong> If you disable "Routes", the model will still exist in the database (if "Schema" is enabled in Models step), but no API endpoints will be created for it.
        </p>
      </div>
    </div>
  );
}
