"use client";

import { useWizardStore } from "@/stores/useWizardStore";

const STACKS = [
  {
    id: "laravel" as const,
    icon: "🐘",
    title: "Laravel",
    badge: "PHP",
    desc: "API REST or Blade backend with Eloquent, migrations, and artisan CLI.",
    badgeColor: "#ff4d6d",
  },
  {
    id: "react" as const,
    icon: "⚛️",
    title: "React / Next.js",
    badge: "TS",
    desc: "Next.js front-end with TypeScript, routing, and component architecture.",
    badgeColor: "#4d9fff",
  },
  {
    id: "laravel+react" as const,
    icon: "✦",
    title: "Laravel + React",
    badge: "Full",
    desc: "Full-stack — a Laravel API paired with a Next.js SPA. Best of both worlds.",
    badgeColor: "#9d6fff",
  },
] as const;

export function StackStep() {
  const { stack, setStack, projectName, setProjectName } = useWizardStore();

  return (
    <div className="si-step-panel">
      <div className="si-section-label">Setup</div>
      <h1 className="si-title" style={{ marginBottom: 8 }}>Project setup</h1>
      <p className="si-subtitle" style={{ marginBottom: 40 }}>
        Choose your tech stack and name your project to get started.
      </p>

      {/* Project Name */}
      <div style={{ marginBottom: 40 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text2)", marginBottom: 6, letterSpacing: "0.04em" }}>
          Project name
        </label>
        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="my-awesome-project"
          className="si-input"
          style={{ maxWidth: 420, fontFamily: "var(--font-jetbrains-mono)", fontSize: 14 }}
        />
      </div>

      {/* Stack Selection */}
      <div style={{ marginBottom: 40 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text2)", marginBottom: 16, letterSpacing: "0.04em" }}>
          Select stack
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, maxWidth: 700 }}>
          {STACKS.map((s) => {
            const isSelected  = stack === s.id;
            const isUnfocused = !!stack && !isSelected;

            return (
              <button
                key={s.id}
                onClick={() => setStack(s.id)}
                className="si-stack-card"
                style={{
                  opacity: isUnfocused ? 0.45 : 1,
                  textAlign: "left",
                  background: isSelected ? "var(--gold-subtle)" : "var(--bg3)",
                  borderColor: isSelected ? "var(--gold)" : undefined,
                }}
              >
                {isSelected && (
                  <span style={{
                    position: "absolute", top: 12, right: 12,
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    background: "var(--gold)", color: "var(--bg)",
                    padding: "3px 8px", borderRadius: 4,
                  }}>{s.badge}</span>
                )}
                <span style={{ fontSize: 28, display: "block", marginBottom: 14 }}>{s.icon}</span>
                <span style={{ display: "block", fontSize: 15, fontWeight: 700, marginBottom: 6, color: isSelected ? "var(--gold)" : "var(--text)" }}>
                  {s.title}
                </span>
                <span style={{ display: "block", fontSize: 13, color: "var(--text2)", lineHeight: 1.55 }}>
                  {s.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Info card */}
      <div className="si-info-card" style={{ maxWidth: 700 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--gold)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Note</p>
        <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
          React &amp; Next.js → ZIP download. Laravel →{" "}
          <code style={{ fontFamily: "var(--font-jetbrains-mono)", background: "rgba(255,255,255,0.06)", padding: "1px 6px", borderRadius: 4, color: "var(--text)", fontSize: 12 }}>
            stack-init.yaml
          </code>{" "}
          + CLI command.
        </p>
      </div>
    </div>
  );
}
