"use client";

import { useRef, useState } from "react";
import yaml from "js-yaml";
import { useWizardStore } from "@/stores/useWizardStore";
import { X, Zap, Table, Sparkles, Loader2, Upload, FileCode } from "lucide-react";
import { parseSqlToModels } from "@/lib/parseSql";
import type { ProjectConfig } from "@stack-init/schema";

interface ImportModalProps {
  onClose: () => void;
}

export function ImportModal({ onClose }: ImportModalProps) {
  const { addModel, importConfig } = useWizardStore();
  const [mode, setMode] = useState<'choice' | 'sql' | 'ai' | 'yaml'>('choice');
  const [input, setInput]         = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult]       = useState<{ count: number; names: string[] } | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setInput(ev.target?.result as string ?? '');
      setResult(null);
      setError(null);
    };
    reader.readAsText(file);
    // Reset so the same file can be re-selected
    e.target.value = '';
  };

  const handleImport = async () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    setError(null);

    try {
      if (mode === 'ai') {
        const res = await fetch('/api/parse-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: input }),
        });
        const data = await res.json();
        if (data.models) {
          data.models.forEach((m: any) => addModel(m));
          setResult({ count: data.models.length, names: data.models.map((m: any) => m.name) });
        }
      } else if (mode === 'sql') {
        const models = parseSqlToModels(input);
        if (models.length === 0) {
          setError('No CREATE TABLE statements found. Make sure you pasted valid SQL DDL.');
          return;
        }
        models.forEach(m => addModel(m));
        setResult({ count: models.length, names: models.map(m => m.name) });
      } else if (mode === 'yaml') {
        const parsed = yaml.load(input) as ProjectConfig;
        if (!parsed || typeof parsed !== 'object' || !parsed.stack) {
          setError('Invalid config file. Make sure it is a valid stack-init.yaml or exported JSON preset.');
          return;
        }
        importConfig(parsed);
        onClose();
      }
    } catch (err) {
      console.error('Import failed:', err);
      setError('An error occurred while parsing. Check the console for details.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDone = () => onClose();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-bg3 border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">

        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
              <Zap size={18} fill="currentColor" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Quick Import</h3>
              <p className="text-xs text-text3">Import models from existing schemas or using AI.</p>
            </div>
          </div>
          <button onClick={onClose} className="si-btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Success state */}
          {result ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
              <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: 'var(--text)' }}>
                {result.count} model{result.count > 1 ? 's' : ''} imported
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 20 }}>
                {result.names.map(n => (
                  <span key={n} style={{
                    fontFamily: 'var(--font-jetbrains-mono)', fontSize: 12,
                    background: 'var(--gold-subtle)', color: 'var(--gold)',
                    border: '1px solid var(--gold-border)', borderRadius: 6,
                    padding: '2px 10px',
                  }}>
                    {n}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20 }}>
                Fields and relations have been extracted. Review them in the Models step.
              </p>
              <button onClick={handleDone} className="si-btn-primary px-8">Go to Models →</button>
            </div>
          ) : mode === 'choice' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setMode('ai')}
                className="si-card p-6 text-left hover:border-gold/40 transition-colors group"
              >
                <Sparkles className="text-gold mb-3 group-hover:scale-110 transition-transform" size={24} />
                <div className="font-bold text-sm mb-1">Natural Language (AI)</div>
                <p className="text-[11px] text-text3 leading-relaxed">
                  "Build a marketplace with products, orders and reviews..."
                </p>
              </button>

              <button
                onClick={() => setMode('sql')}
                className="si-card p-6 text-left hover:border-blue/40 transition-colors group"
              >
                <Table className="text-blue mb-3 group-hover:scale-110 transition-transform" size={24} />
                <div className="font-bold text-sm mb-1">SQL DDL</div>
                <p className="text-[11px] text-text3 leading-relaxed">
                  Paste or upload a SQL file. Extracts all tables, columns, types and foreign key relations.
                </p>
              </button>

              <button
                onClick={() => setMode('yaml')}
                className="si-card p-6 text-left hover:border-gold/40 transition-colors group col-span-full md:col-span-2"
              >
                <FileCode className="text-text2 mb-3 group-hover:scale-110 transition-transform" size={24} />
                <div className="font-bold text-sm mb-1">YAML / JSON Config</div>
                <p className="text-[11px] text-text3 leading-relaxed">
                  Upload a <code className="font-mono">stack-init.yaml</code> or exported preset JSON to resume editing a saved configuration.
                </p>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gold uppercase tracking-wider">
                  {mode === 'ai' ? 'Describe your models' : mode === 'sql' ? 'SQL DDL' : 'YAML / JSON Config'}
                </span>
                <button onClick={() => { setMode('choice'); setInput(''); setError(null); }} className="text-[10px] text-text3 hover:text-text underline">
                  Back to options
                </button>
              </div>

              {/* File upload (SQL and YAML) */}
              {(mode === 'sql' || mode === 'yaml') && (
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept={mode === 'yaml' ? '.yaml,.yml,.json' : '.sql,.ddl,.txt'}
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="si-btn-secondary text-xs w-full"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', borderStyle: 'dashed' }}
                  >
                    <Upload size={14} />
                    {input
                      ? 'Replace with another file…'
                      : mode === 'yaml'
                        ? 'Upload a .yaml or .json file'
                        : 'Upload a .sql file'}
                  </button>
                  {input && (
                    <p className="text-[10px] text-text3 mt-1 text-center">
                      {input.split('\n').length} lines loaded — or edit below
                    </p>
                  )}
                  <div className="flex items-center gap-3 my-3">
                    <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
                    <span className="text-[10px] text-text3">or paste</span>
                    <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
                  </div>
                </div>
              )}

              <textarea
                value={input}
                onChange={(e) => { setInput(e.target.value); setError(null); }}
                autoFocus={mode === 'ai'}
                placeholder={mode === 'ai'
                  ? 'e.g. An e-commerce with users, products and categories...'
                  : mode === 'yaml'
                    ? 'stack: laravel\nname: my-project\nmodels:\n  - name: User\n    fields:\n      - name: email\n        ...'
                    : 'CREATE TABLE users (\n  id UUID PRIMARY KEY,\n  email VARCHAR(255) NOT NULL UNIQUE,\n  ...\n);'}
                className="si-input min-h-[200px] font-mono text-xs w-full resize-none bg-bg2"
              />

              {error && (
                <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 4 }}>{error}</p>
              )}

              {mode === 'sql' && input && (
                <div style={{ fontSize: 11, color: 'var(--text3)', padding: '8px 12px', background: 'var(--bg4)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 700 }}>What gets extracted: </span>
                  table names → PascalCase singular model names · all columns with types · NOT NULL / UNIQUE constraints · ENUM values · REFERENCES → foreign key fields + belongsTo/hasMany relations
                </div>
              )}

              {mode === 'yaml' && (
                <div style={{ fontSize: 11, color: 'var(--text3)', padding: '8px 12px', background: 'var(--bg4)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 700 }}>Accepted formats: </span>
                  stack-init.yaml generated by the CLI · exported preset .json from this wizard · any valid stack-init config with a <code style={{ fontFamily: 'monospace' }}>stack</code> key.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!result && mode !== 'choice' && (
          <div className="p-6 border-t border-white/5 bg-bg2 flex justify-end gap-3">
            <button onClick={onClose} className="si-btn-secondary px-6">Cancel</button>
            <button
              disabled={!input.trim() || isProcessing}
              onClick={handleImport}
              className="si-btn-primary px-8 gap-2"
            >
              {isProcessing
                ? <><Loader2 size={16} className="animate-spin" /> Processing...</>
                : <><Zap size={16} fill="currentColor" /> Import Now</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
