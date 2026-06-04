"use client";

import { useWizardStore } from "@/stores/useWizardStore";
import { SubStepPills } from "../SubStepPills";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { Monitor, FileCode, Layout, Pencil, Check, Terminal, Search, FolderOpen, Globe, Sliders } from "lucide-react";
import { useTranslations } from "next-intl";

export function ReactStep() {
  const t = useTranslations("steps");
  const { models, reactOptions, setReactOptions, setModelPages, currentSubStep, setCurrentSubStep } = useWizardStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeModelName, setActiveModelName] = useState<string | null>(null);

  const PAGE_TYPES = [
    { key: "list"   as const, label: t("reactSetup.pages.list.title"),   desc: t("reactSetup.pages.list.desc"),   icon: Layout,   defaultEnabled: true  },
    { key: "detail" as const, label: t("reactSetup.pages.detail.title"), desc: t("reactSetup.pages.detail.desc"), icon: FileCode, defaultEnabled: true  },
    { key: "create" as const, label: t("reactSetup.pages.create.title"), desc: t("reactSetup.pages.create.desc"), icon: Pencil,   defaultEnabled: true  },
    { key: "edit"   as const, label: t("reactSetup.pages.edit.title"),   desc: t("reactSetup.pages.edit.desc"),   icon: Monitor,  defaultEnabled: false },
  ];

  const LIBRARIES_MATRIX = [
    {
      category: t("reactSetup.categories.state_lib"),
      key: "state_lib" as const,
      options: [
        { value: "zustand",       label: "Zustand",       desc: t("reactSetup.libs.zustand.desc"),       package: "zustand" },
        { value: "redux-toolkit", label: "Redux",         desc: t("reactSetup.libs.redux_toolkit.desc"), package: "@reduxjs/toolkit" },
        { value: "jotai",         label: "Jotai",         desc: t("reactSetup.libs.jotai.desc"),         package: "jotai" },
        { value: "none",          label: "None",          desc: t("reactSetup.libs.none_state.desc"),    package: null },
      ],
    },
    {
      category: t("reactSetup.categories.form_lib"),
      key: "form_lib" as const,
      options: [
        { value: "react-hook-form", label: "Hook Form", desc: t("reactSetup.libs.react_hook_form.desc"), package: "react-hook-form" },
        { value: "formik",          label: "Formik",    desc: t("reactSetup.libs.formik.desc"),          package: "formik" },
        { value: "zod",             label: "Zod",       desc: t("reactSetup.libs.zod.desc"),             package: "zod" },
        { value: "none",            label: "None",      desc: t("reactSetup.libs.none_form.desc"),       package: null },
      ],
    },
    {
      category: t("reactSetup.categories.http_lib"),
      key: "http_lib" as const,
      options: [
        { value: "axios", label: "Axios",     desc: t("reactSetup.libs.axios.desc"),     package: "axios" },
        { value: "ky",    label: "Ky",        desc: t("reactSetup.libs.ky.desc"),        package: "ky" },
        { value: "fetch", label: "Fetch API", desc: t("reactSetup.libs.fetch.desc"),     package: null },
      ],
    },
    {
      category: t("reactSetup.categories.data_fetching"),
      key: "data_fetching" as const,
      options: [
        { value: "tanstack-query", label: "TanStack Query", desc: t("reactSetup.libs.tanstack_query.desc"), package: "@tanstack/react-query" },
        { value: "swr",            label: "SWR",            desc: t("reactSetup.libs.swr.desc"),            package: "swr" },
        { value: "none",           label: "None",           desc: t("reactSetup.libs.none_data.desc"),      package: null },
      ],
    },
    {
      category: t("reactSetup.categories.router"),
      key: "router" as const,
      options: [
        { value: "react-router-v6", label: "React Router",   desc: t("reactSetup.libs.react_router.desc"),   package: "react-router-dom" },
        { value: "tanstack-router", label: "TanStack Router", desc: t("reactSetup.libs.tanstack_router.desc"), package: "@tanstack/react-router" },
        { value: "none",            label: "None",            desc: t("reactSetup.libs.none_router.desc"),    package: null },
      ],
    },
    {
      category: t("reactSetup.categories.ui_lib"),
      key: "ui_lib" as const,
      options: [
        { value: "shadcn", label: "shadcn/ui",   desc: t("reactSetup.libs.shadcn.desc"), package: "lucide-react" },
        { value: "mui",    label: "Material UI", desc: t("reactSetup.libs.mui.desc"),    package: "@mui/material" },
        { value: "antd",   label: "Ant Design",  desc: t("reactSetup.libs.antd.desc"),   package: "antd" },
        { value: "none",   label: "None",        desc: t("reactSetup.libs.none_ui.desc"), package: null },
      ],
    },
  ];

  const SUB_STEPS = [
    { label: t("reactSetup.librariesSection") },
    { label: t("reactSetup.pagesSection") },
  ];

  // Compute active model or default to first filtered model
  const activeModel = useMemo(() => {
    if (!models.length) return null;
    if (activeModelName) return models.find(m => m.name === activeModelName) || null;
    return models[0];
  }, [models, activeModelName]);

  // Filter models based on search bar input
  const filteredModels = useMemo(() => {
    return models.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [models, searchTerm]);

  // Compute live package.json contents based on active selections
  const computedDependencies = useMemo(() => {
    const deps: Record<string, string> = {
      "react": "^19.1.0",
      "react-dom": "^19.1.0",
    };
    const devDeps: Record<string, string> = {
      "vite": "^6.3.5",
      "@vitejs/plugin-react": "^4.5.1",
      "typescript": "^5.8.3",
    };

    LIBRARIES_MATRIX.forEach(category => {
      const selectedValue = reactOptions[category.key];
      const selectedOption = category.options.find(opt => opt.value === selectedValue);
      if (selectedOption && selectedOption.package) {
        deps[selectedOption.package] = "^" + getMockVersion(selectedOption.value);
        if (selectedOption.value === "shadcn") {
          deps["tailwind-merge"] = "^2.3.0";
          deps["clsx"] = "^2.1.1";
        } else if (selectedOption.value === "redux-toolkit") {
          deps["react-redux"] = "^9.1.2";
        } else if (selectedOption.value === "zod") {
          deps["react-hook-form"] = "^" + getMockVersion("react-hook-form");
          deps["@hookform/resolvers"] = "^3.9.0";
        }
      }
    });

    return { deps, devDeps };
  }, [reactOptions]);

  // Bulk action: toggle pages for all models
  const togglePageForAllModels = (pageKey: typeof PAGE_TYPES[number]["key"], enable: boolean) => {
    models.forEach(m => {
      setModelPages(m.name, { [pageKey]: enable });
    });
  };

  // Determine if a page key is globally active on ALL models
  const getGlobalPageState = (pageKey: typeof PAGE_TYPES[number]["key"]) => {
    if (!models.length) return false;
    return models.every(m => m.pages?.[pageKey] ?? (pageKey === "edit" ? false : true));
  };

  return (
    <div className="si-step-panel" style={{ height: "calc(100vh - 160px)", display: "flex", flexDirection: "column", minHeight: 0 }}>
      {/* Title */}
      <div style={{ flexShrink: 0, marginBottom: 16 }}>
        <span className="si-section-label">Frontend Setup</span>
        <h2 className="si-title" style={{ marginBottom: 4 }}>{t("reactSetup.title")}</h2>
        <p className="si-subtitle">{t("reactSetup.subtitle")}</p>
      </div>

      <div style={{ flexShrink: 0, marginBottom: 20 }}>
        <SubStepPills steps={SUB_STEPS} current={currentSubStep} onSelect={setCurrentSubStep} />
      </div>

      {/* Sub-step 0 — Tactile Library Matrix & Terminal Preview */}
      {currentSubStep === 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 32, flex: 1, minHeight: 0, overflow: "hidden" }}>

          {/* Left panel: Tactical matrices */}
          <div style={{ overflowY: "auto", paddingRight: 8 }} className="space-y-6">
            {LIBRARIES_MATRIX.map((track) => {
              const currentValue = reactOptions[track.key];

              return (
                <div key={track.category}>
                  <span className="si-section-label" style={{ display: "block", marginBottom: 8 }}>{track.category}</span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                    {track.options.map((opt) => {
                      const isSelected = currentValue === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setReactOptions({ [track.key]: opt.value })}
                          className={cn(
                            "w-full text-left transition-all duration-200",
                            "flex items-center gap-3"
                          )}
                          style={{
                            background: isSelected ? "var(--gold-subtle)" : "var(--bg3)",
                            border: `1.5px solid ${isSelected ? "var(--gold)" : "var(--border-subtle)"}`,
                            padding: "10px 14px",
                            borderRadius: 12,
                            cursor: "pointer",
                            outline: "none"
                          }}
                          role="radio"
                          aria-checked={isSelected}
                        >
                          <div className={cn("si-led-dot", isSelected ? "active" : "inactive")} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? "var(--gold)" : "var(--text)" }}>
                              {opt.label}
                            </div>
                            <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 1 }}>
                              {opt.desc}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-gold flex items-center justify-center shrink-0">
                              <Check size={10} strokeWidth={3} className="text-bg" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right panel: Terminal dependencies viewer */}
          <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <span className="si-section-label" style={{ display: "block", marginBottom: 8 }}>{t("reactSetup.dependenciesPreview")}</span>
            <div
              className="si-terminal-window flex-1"
              style={{
                boxShadow: "inset 0 4px 12px rgba(0,0,0,0.60)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden"
              }}
            >
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 12, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 8, flexShrink: 0 }}>
                <Terminal size={13} className="text-gold" />
                <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "var(--text3)", letterSpacing: "0.08em" }}>{t("reactSetup.packageJson")}</span>
              </div>
              <div style={{ overflowY: "auto", flex: 1, fontFamily: "var(--font-jetbrains-mono), monospace" }}>
                <span style={{ color: "#fca5a5" }}>{`{`}</span>
                <div style={{ paddingLeft: 16 }}>
                  <span style={{ color: "#93c5fd" }}>"dependencies"</span>: <span style={{ color: "#fca5a5" }}>{`{`}</span>
                  <div style={{ paddingLeft: 16 }}>
                    {Object.entries(computedDependencies.deps).map(([depName, ver], i, arr) => (
                      <div key={depName} className="tech-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                        <span style={{ color: "#fed7aa" }}>"{depName}"</span>: <span style={{ color: "#a7f3d0" }}>"{ver}"</span>
                        {i < arr.length - 1 ? "," : ""}
                      </div>
                    ))}
                  </div>
                  <span style={{ color: "#fca5a5" }}>{`},`}</span>
                  <br />
                  <span style={{ color: "#93c5fd" }}>"devDependencies"</span>: <span style={{ color: "#fca5a5" }}>{`{`}</span>
                  <div style={{ paddingLeft: 16 }}>
                    {Object.entries(computedDependencies.devDeps).map(([depName, ver], i, arr) => (
                      <div key={depName}>
                        <span style={{ color: "#fed7aa" }}>"{depName}"</span>: <span style={{ color: "#a7f3d0" }}>"{ver}"</span>
                        {i < arr.length - 1 ? "," : ""}
                      </div>
                    ))}
                  </div>
                  <span style={{ color: "#fca5a5" }}>{`}`}</span>
                </div>
                <span style={{ color: "#fca5a5" }}>{`}`}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Sub-step 1 — Pages per Model (Scalability Fix) */}
      {currentSubStep === 1 && (
        <div style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: 24, flex: 1, minHeight: 0, overflow: "hidden" }}>

          {/* Column 1: Model Navigator List */}
          <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--bg2)", border: "1px solid var(--border-subtle)", borderRadius: 16, overflow: "hidden" }}>
            {/* Search Box */}
            <div style={{ padding: 12, borderBottom: "1px solid var(--border-subtle)", position: "relative" }}>
              <Search size={14} className="text-text3" style={{ position: "absolute", left: 22, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--bg)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: 8,
                  padding: "6px 12px 6px 30px",
                  fontSize: 12,
                  color: "var(--text)",
                  outline: "none"
                }}
              />
            </div>

            {/* Model Tree List */}
            <div style={{ flex: 1, overflowY: "auto", padding: 8 }} className="space-y-1">
              {filteredModels.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: "var(--text3)", fontSize: 11, fontStyle: "italic" }}>
                  No models found.
                </div>
              ) : (
                filteredModels.map((m) => {
                  const isActive = activeModel?.name === m.name;

                  // Compute number of pages enabled
                  const pageCount = PAGE_TYPES.reduce((acc, pt) => {
                    const active = m.pages?.[pt.key] ?? (pt.key === "edit" ? false : true);
                    return active ? acc + 1 : acc;
                  }, 0);

                  return (
                    <button
                      key={m.name}
                      onClick={() => setActiveModelName(m.name)}
                      className="w-full text-left flex items-center justify-between"
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        background: isActive ? "var(--gold-subtle)" : "transparent",
                        border: `1.5px solid ${isActive ? "var(--gold)" : "transparent"}`,
                        cursor: "pointer",
                        outline: "none"
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "var(--font-jetbrains-mono)", color: isActive ? "var(--gold)" : "var(--text)" }}>
                        {m.name}
                      </span>
                      <span className="si-badge" style={{ fontSize: 10, background: isActive ? "var(--gold-border)" : "var(--bg4)", color: isActive ? "var(--gold)" : "var(--text3)" }}>
                        {pageCount} / 4
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Column 2: Focused Workspace Pane */}
          <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto", paddingRight: 4 }} className="space-y-6">

            {/* Global Master Preset Switcher */}
            <div>
              <span className="si-section-label" style={{ display: "block", marginBottom: 8 }}>{t("reactSetup.globalPresets")}</span>
              <div
                style={{
                  background: "var(--bg3)",
                  border: "1px dashed var(--border-medium)",
                  borderRadius: 16,
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Sliders size={16} className="text-gold" />
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 700, display: "block" }}>{t("reactSetup.masterControls")}</span>
                    <span style={{ fontSize: 10, color: "var(--text3)", display: "block", marginTop: 2 }}>{t("reactSetup.globalDesc")}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {PAGE_TYPES.map((pt) => {
                    const isAllEnabled = getGlobalPageState(pt.key);
                    return (
                      <button
                        key={pt.key}
                        onClick={() => togglePageForAllModels(pt.key, !isAllEnabled)}
                        className="si-btn-secondary"
                        style={{
                          fontSize: 11,
                          padding: "6px 12px",
                          borderRadius: 8,
                          borderColor: isAllEnabled ? "var(--gold)" : "var(--border-medium)",
                          color: isAllEnabled ? "var(--gold)" : "var(--text2)",
                          background: isAllEnabled ? "var(--gold-subtle)" : "transparent"
                        }}
                      >
                        {pt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Focused Model Overrides */}
            {activeModel ? (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <FolderOpen size={15} className="text-gold" />
                  <span className="si-section-label" style={{ marginBottom: 0 }}>{t("reactSetup.modelOverrides", { name: activeModel.name })}</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                  {PAGE_TYPES.map((pt) => {
                    const isEnabled = activeModel.pages?.[pt.key] ?? (pt.key === "edit" ? false : true);
                    const Icon = pt.icon;

                    return (
                      <button
                        key={pt.key}
                        onClick={() => setModelPages(activeModel.name, { [pt.key]: !isEnabled })}
                        className={cn("si-toggle-card text-left w-full transition-all duration-200", isEnabled && "on")}
                        style={{
                          background: isEnabled ? "var(--gold-subtle)" : "var(--bg3)",
                          borderColor: isEnabled ? "var(--gold)" : "var(--border-subtle)",
                          padding: "16px 20px"
                        }}
                      >
                        <div className={cn("si-toggle shrink-0 mr-4", isEnabled && "on")}>
                          <div className="si-toggle-knob" />
                        </div>
                        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: isEnabled ? "var(--gold-border)" : "var(--bg4)",
                            color: isEnabled ? "var(--gold)" : "var(--text3)",
                            flexShrink: 0
                          }}>
                            <Icon style={{ width: 16, height: 16 }} />
                          </div>
                          <div>
                            <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: isEnabled ? "var(--gold)" : "var(--text)" }}>{pt.label}</span>
                            <span style={{ display: "block", fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{pt.desc}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ padding: 48, border: "1px dashed var(--border-subtle)", borderRadius: 16, textAlign: "center", color: "var(--text3)" }}>
                {t("reactSetup.noOverride")}
              </div>
            )}

          </div>

        </div>
      )}
    </div>
  );
}

// Mock version mappings for package display
function getMockVersion(lib: string): string {
  switch (lib) {
    case "zustand": return "4.5.2";
    case "redux-toolkit": return "2.2.3";
    case "jotai": return "2.8.0";
    case "react-hook-form": return "7.51.3";
    case "formik": return "2.4.5";
    case "zod": return "3.23.4";
    case "axios": return "1.6.8";
    case "ky": return "1.2.4";
    case "shadcn": return "0.379.0";
    case "mui": return "5.15.15";
    case "antd": return "5.16.2";
    case "tanstack-query":
    case "@tanstack/react-query": return "5.76.1";
    case "swr": return "2.3.3";
    case "react-router-v6":
    case "react-router-dom": return "7.6.0";
    case "tanstack-router":
    case "@tanstack/react-router": return "1.114.0";
    default: return "1.0.0";
  }
}
