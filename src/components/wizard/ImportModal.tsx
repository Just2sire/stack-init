"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import yaml from "js-yaml";
import { useWizardStore } from "@/stores/useWizardStore";
import { X, Zap, Table, Sparkles, Loader2, Upload, FileCode, GitBranch } from "lucide-react";
import { parseSqlToModels } from "@/lib/parseSql";
import type { ProjectConfig, Model } from "@/types/schema";

interface ImportModalProps {
  onClose: () => void;
}

// Convert snake_case plural table name to PascalCase singular model name
function toModelName(tableName: string): string {
  const singular = tableName.replace(/s$/, '').replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
  return singular.charAt(0).toUpperCase() + singular.slice(1);
}

// Legacy filename-only scanner (fallback if not logged in)
async function scanGitBranchRepo(url: string): Promise<string[]> {
  const match = url.match(/github\.com\/([^/\s]+)\/([^/\s]+)/);
  if (!match) throw new Error('Invalid GitHub URL');
  const [, owner, repo] = match;
  const cleanRepo = repo.replace(/\.git$/, '');

  const res = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/git/trees/HEAD?recursive=1`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('Repository not found or private');
    if (res.status === 403) throw new Error('GitHub API rate limit reached. Try again later.');
    throw new Error(`GitHub API error: ${res.status}`);
  }
  const data = await res.json();
  const tree: Array<{ path: string }> = data.tree || [];

  const modelNames = new Set<string>();

  for (const file of tree) {
    const p = file.path;

    const laravelMigration = p.match(/create_(\w+)_table\.php$/i);
    if (laravelMigration) modelNames.add(toModelName(laravelMigration[1]));

    const alembicMigration = p.match(/create[_-](\w+)\.py$/i);
    if (alembicMigration) modelNames.add(toModelName(alembicMigration[1]));

    const modelFile = p.match(/(?:models?|entities?)\/([A-Z][A-Za-z]+)\.(php|ts|js|py)$/);
    if (modelFile) modelNames.add(modelFile[1]);

    const entityFile = p.match(/([A-Z][A-Za-z]+)\.entity\.(ts|js)$/);
    if (entityFile) modelNames.add(entityFile[1]);
  }

  return Array.from(modelNames).filter(n => n.length > 1);
}

function makeDefaultModel(name: string): Model {
  return {
    name,
    fields: [],
    relations: [],
    generate: {
      migration: true,
      controller: true,
      resource: true,
      request: true,
      policy: false,
      factory: true,
      seeder: false,
      swagger: false,
      softDelete: false,
      repository: false,
      service: false,
      tests: false,
      routes: true,
    },
    migration: {
      timestamps: true,
      primary_key: 'id',
    },
  };
}

export function ImportModal({ onClose }: ImportModalProps) {
  const t = useTranslations('wizard')
  const { addModel, importConfig } = useWizardStore();
  const [mode, setMode] = useState<'choice' | 'sql' | 'ai' | 'yaml' | 'github'>('choice');
  const [input, setInput]         = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult]       = useState<{ count: number; names: string[] } | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // GitHub-specific state
  const [githubUrl, setGitBranchUrl] = useState("");
  const [githubDetected, setGitBranchDetected] = useState<string[] | null>(null);
  const [githubSelected, setGitBranchSelected] = useState<Set<string>>(new Set());

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
          data.models.forEach((m: Model) => addModel(m));
          setResult({ count: data.models.length, names: data.models.map((m: Model) => m.name) });
        }
      } else if (mode === 'sql') {
        const models = parseSqlToModels(input);
        if (models.length === 0) {
          setError(t('import.noCreateTable'));
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

  const [githubFullConfig, setGithubFullConfig] = useState<ProjectConfig | null>(null);
  const [githubFilesAnalyzed, setGithubFilesAnalyzed] = useState<number>(0);

  const handleScanGitBranch = async () => {
    if (!githubUrl.trim()) return;
    setIsProcessing(true);
    setError(null);
    setGitBranchDetected(null);
    setGitBranchSelected(new Set());
    setGithubFullConfig(null);

    try {
      // Try AI-powered full analysis first
      const aiRes = await fetch('/api/analyze-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: githubUrl.trim() }),
      });

      if (aiRes.ok) {
        const data = await aiRes.json();
        setGithubFullConfig(data.config as ProjectConfig);
        setGithubFilesAnalyzed(data.filesAnalyzed ?? 0);
        // Also set model names for display
        const names = (data.config?.models ?? []).map((m: { name: string }) => m.name);
        setGitBranchDetected(names.length > 0 ? names : ['(no models detected)']);
        setGitBranchSelected(new Set(names));
      } else if (aiRes.status === 401) {
        // Not logged in — fall back to filename scan
        const names = await scanGitBranchRepo(githubUrl.trim());
        if (names.length === 0) {
          setError('No model files or migration files found in this repository.');
        } else {
          setGitBranchDetected(names);
          setGitBranchSelected(new Set(names));
        }
      } else {
        const data = await aiRes.json();
        setError(data.error ?? 'Analysis failed. Try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while scanning the repository.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGitBranchImport = () => {
    if (githubFullConfig) {
      // Full AI config — load everything into wizard
      importConfig(githubFullConfig);
      onClose();
      return;
    }
    if (!githubDetected || githubSelected.size === 0) return;
    const toImport = githubDetected.filter(n => githubSelected.has(n));
    toImport.forEach(name => addModel(makeDefaultModel(name)));
    setResult({ count: toImport.length, names: toImport });
  };

  const toggleGitBranchModel = (name: string) => {
    setGitBranchSelected(prev => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const handleDone = () => onClose();

  const handleBackToChoice = () => {
    setMode('choice');
    setInput('');
    setError(null);
    setGitBranchUrl('');
    setGitBranchDetected(null);
    setGitBranchSelected(new Set());
  };

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
              <h3 className="font-bold text-lg">{t('import.title')}</h3>
              <p className="text-xs text-text3">{t('import.subtitle')}</p>
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
                {t('import.modelsImported', { count: result.count })}
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
                {t('import.reviewModels')}
              </p>
              <button onClick={handleDone} className="si-btn-primary px-8">{t('import.goToModels')}</button>
            </div>
          ) : mode === 'choice' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setMode('ai')}
                className="si-card p-6 text-left hover:border-gold/40 transition-colors group"
              >
                <Sparkles className="text-gold mb-3 group-hover:scale-110 transition-transform" size={24} />
                <div className="font-bold text-sm mb-1">{t('import.tabNl')}</div>
                <p className="text-[11px] text-text3 leading-relaxed">
                  {t('import.tabNlDesc')}
                </p>
              </button>

              <button
                onClick={() => setMode('sql')}
                className="si-card p-6 text-left hover:border-blue/40 transition-colors group"
              >
                <Table className="text-blue mb-3 group-hover:scale-110 transition-transform" size={24} />
                <div className="font-bold text-sm mb-1">{t('import.tabSql')}</div>
                <p className="text-[11px] text-text3 leading-relaxed">
                  {t('import.tabSqlDesc')}
                </p>
              </button>

              <button
                onClick={() => setMode('github')}
                className="si-card p-6 text-left hover:border-white/20 transition-colors group"
              >
                <GitBranch className="text-text2 mb-3 group-hover:scale-110 transition-transform" size={24} />
                <div className="font-bold text-sm mb-1">{t('import.tabGithub')}</div>
                <p className="text-[11px] text-text3 leading-relaxed">
                  {t('import.tabGithubDesc')}
                </p>
              </button>

              <button
                onClick={() => setMode('yaml')}
                className="si-card p-6 text-left hover:border-gold/40 transition-colors group"
              >
                <FileCode className="text-text2 mb-3 group-hover:scale-110 transition-transform" size={24} />
                <div className="font-bold text-sm mb-1">{t('import.tabYaml')}</div>
                <p className="text-[11px] text-text3 leading-relaxed">
                  {t('import.tabYamlDesc')}
                </p>
              </button>
            </div>
          ) : mode === 'github' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text2 uppercase tracking-wider">{t('import.tabGithub')}</span>
                <button onClick={handleBackToChoice} className="text-[10px] text-text3 hover:text-text underline">
                  {t('import.backToOptions')}
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-text3">{t('import.repoUrlLabel')}</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => { setGitBranchUrl(e.target.value); setError(null); setGitBranchDetected(null); }}
                    placeholder="https://github.com/user/repo"
                    className="si-input flex-1 text-sm"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleScanGitBranch(); }}
                    autoFocus
                  />
                  <button
                    onClick={handleScanGitBranch}
                    disabled={!githubUrl.trim() || isProcessing}
                    className="si-btn-primary px-4 gap-2 shrink-0"
                  >
                    {isProcessing
                      ? <Loader2 size={15} className="animate-spin" />
                      : <GitBranch size={15} />
                    }
                    {isProcessing ? t('import.scanning') : t('import.scanButton')}
                  </button>
                </div>
              </div>

              {error && (
                <p style={{ fontSize: 12, color: 'var(--red)', marginTop: 4 }}>{error}</p>
              )}

              {!githubDetected && !isProcessing && (
                <div style={{ fontSize: 11, color: 'var(--text3)', padding: '8px 12px', background: 'var(--bg4)', borderRadius: 8 }}>
                  <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{t('import.aiAnalysis')} </span>
                  reads your actual source files (migrations, models, prisma schema, package.json) and extracts the full configuration — stack, models with fields, and services.
                  <span className="block mt-1">Login required for full analysis.</span>
                </div>
              )}

              {githubDetected && githubDetected.length > 0 && (
                <div className="space-y-3">
                  {githubFullConfig && (
                    <div style={{ fontSize: 11, color: 'var(--gold)', padding: '6px 12px', background: 'var(--gold-subtle)', borderRadius: 8, border: '1px solid var(--gold-border)' }}>
                      ✨ Full AI analysis complete — {githubFilesAnalyzed} files read · stack: <strong>{githubFullConfig.stack}</strong>
                      {(githubFullConfig.services ?? []).length > 0 && ` · services: ${(githubFullConfig.services ?? []).join(', ')}`}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text3">
                      {githubDetected.length} model{githubDetected.length > 1 ? 's' : ''} detected
                      {githubFullConfig ? ' — importing full configuration' : ' — select which to import'}
                    </span>
                    <div className="flex gap-3 text-[10px]">
                      <button
                        className="text-text3 hover:text-text underline"
                        onClick={() => setGitBranchSelected(new Set(githubDetected))}
                      >
                        {t('import.selectAll')}
                      </button>
                      <button
                        className="text-text3 hover:text-text underline"
                        onClick={() => setGitBranchSelected(new Set())}
                      >
                        {t('import.deselectAll')}
                      </button>
                    </div>
                  </div>
                  <div
                    style={{
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 10,
                      overflow: 'hidden',
                      maxHeight: 220,
                      overflowY: 'auto',
                    }}
                  >
                    {githubDetected.map((name, i) => (
                      <label
                        key={name}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '9px 14px',
                          cursor: 'pointer',
                          borderTop: i > 0 ? '1px solid var(--border-subtle)' : undefined,
                          background: githubSelected.has(name) ? 'var(--gold-subtle)' : undefined,
                          transition: 'background 0.15s',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={githubSelected.has(name)}
                          onChange={() => toggleGitBranchModel(name)}
                          style={{ accentColor: 'var(--gold)', width: 14, height: 14, flexShrink: 0 }}
                        />
                        <span
                          style={{
                            fontFamily: 'var(--font-jetbrains-mono)',
                            fontSize: 12,
                            color: githubSelected.has(name) ? 'var(--gold)' : 'var(--text)',
                          }}
                        >
                          {name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gold uppercase tracking-wider">
                  {mode === 'ai' ? t('import.describeModels') : mode === 'sql' ? t('import.sqlLabel') : t('import.yamlLabel')}
                </span>
                <button onClick={handleBackToChoice} className="text-[10px] text-text3 hover:text-text underline">
                  {t('import.backToOptions')}
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
        {!result && mode === 'github' && githubDetected && githubDetected.length > 0 && (
          <div className="p-6 border-t border-white/5 bg-bg2 flex justify-end gap-3">
            <button onClick={onClose} className="si-btn-secondary px-6">{t('import.cancel')}</button>
            <button
              disabled={githubFullConfig ? false : githubSelected.size === 0}
              onClick={handleGitBranchImport}
              className="si-btn-primary px-8 gap-2"
            >
              <GitBranch size={16} />
              {githubFullConfig
                ? '✨ Load Full Config'
                : `Import ${githubSelected.size > 0 ? githubSelected.size : ''} Model${githubSelected.size !== 1 ? 's' : ''}`
              }
            </button>
          </div>
        )}

        {!result && mode !== 'choice' && mode !== 'github' && (
          <div className="p-6 border-t border-white/5 bg-bg2 flex justify-end gap-3">
            <button onClick={onClose} className="si-btn-secondary px-6">{t('import.cancel')}</button>
            <button
              disabled={!input.trim() || isProcessing}
              onClick={handleImport}
              className="si-btn-primary px-8 gap-2"
            >
              {isProcessing
                ? <><Loader2 size={16} className="animate-spin" /> {t('import.processing')}</>
                : <><Zap size={16} fill="currentColor" /> {t('import.importButton')}</>
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
