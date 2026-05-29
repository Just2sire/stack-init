"use client";

import React, { useState, useEffect, useCallback } from "react";

/* ─── Data ──────────────────────────────────────────────────────────── */

const STEPS = [
  { n: 1, label: "Stack", icon: "◈" },
  { n: 2, label: "Models", icon: "⬡" },
  { n: 3, label: "Relations", icon: "⤮" },
  { n: 4, label: "Routes", icon: "⌘" },
  { n: 5, label: "Output", icon: "▸" },
];

const MODELS = [
  { name: "User", fields: ["id: uuid", "email: string", "name: string", "role: enum"], color: "#f5c842" },
  { name: "Post", fields: ["id: uuid", "title: string", "content: text", "authorId: fk"], color: "#4d9fff" },
  { name: "Comment", fields: ["id: uuid", "body: text", "postId: fk"], color: "#9d6fff" },
  { name: "Category", fields: ["id: uuid", "name: string", "slug: string"], color: "#4dff91" },
];

const STACKS = [
  { name: "NestJS + React", backend: "NestJS", frontend: "React", db: "PostgreSQL", color: "#ea2845" },
  { name: "Laravel + Vue", backend: "Laravel", frontend: "Vue.js", db: "MySQL", color: "#FF2D20" },
  { name: "FastAPI + Next", backend: "FastAPI", frontend: "Next.js", db: "PostgreSQL", color: "#009688" },
  { name: "Express + React", backend: "Express", frontend: "React", db: "MongoDB", color: "#00c4cc" },
];

const ROUTES = [
  { method: "GET", path: "/api/users", handler: "UserController.findAll()" },
  { method: "POST", path: "/api/users", handler: "UserController.create()" },
  { method: "GET", path: "/api/posts", handler: "PostController.findAll()" },
  { method: "POST", path: "/api/posts", handler: "PostController.create()" },
  { method: "GET", path: "/api/posts/:id/comments", handler: "CommentController.findByPost()" },
  { method: "DELETE", path: "/api/users/:id", handler: "UserController.remove()" },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "#4dff91", POST: "#f5c842", PUT: "#4d9fff", DELETE: "#ff5f57", PATCH: "#9d6fff",
};

const TERMINAL_LINES = [
  "$ stackinit generate --stack nestjs-react",
  "✓ Scaffolding backend (NestJS)...",
  "  → Created src/users/users.module.ts",
  "  → Created src/users/users.controller.ts",
  "  → Created src/users/users.service.ts",
  "  → Created src/posts/posts.module.ts",
  "  → Created src/posts/posts.controller.ts",
  "✓ Scaffolding frontend (React)...",
  "  → Created src/hooks/useUsers.ts",
  "  → Created src/components/PostList.tsx",
  "✓ Generating migrations...",
  "  → Created migrations/001_create_users.sql",
  "  → Created migrations/002_create_posts.sql",
  "✓ Done! 14 files generated in 1.2s",
  "  📦 Download ready: project.zip (24kb)",
];

/* ─── Component ─────────────────────────────────────────────────────── */

export function HeroIllustration() {
  const [activeStep, setActiveStep] = useState(1);
  const [selectedStack, setSelectedStack] = useState(0);
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);
  const [terminalIndex, setTerminalIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-cycle steps
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev % 5) + 1);
    }, 3500);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  // Terminal typing animation for step 5
  useEffect(() => {
    if (activeStep !== 5) { setTerminalIndex(0); return; }
    if (terminalIndex >= TERMINAL_LINES.length) return;
    const timer = setTimeout(() => {
      setTerminalIndex((i) => i + 1);
    }, 180);
    return () => clearTimeout(timer);
  }, [activeStep, terminalIndex]);

  const handleStepClick = useCallback((n: number) => {
    setIsAutoPlaying(false);
    setActiveStep(n);
    if (n === 5) setTerminalIndex(0);
  }, []);

  const completedSteps = Array.from({ length: activeStep - 1 }, (_, i) => i + 1);

  return (
    <div style={{ position: "relative" }}>
      {/* Glow */}
      <div aria-hidden style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "130%", height: "130%",
        background: "radial-gradient(ellipse, rgba(245,200,66,0.07) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />

      <div className="si-card" style={{
        borderRadius: 18, overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
        position: "relative",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
      }}>
        {/* Window chrome */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "10px 16px",
          borderBottom: "1px solid var(--border-subtle)",
          background: "var(--bg2)",
        }}>
          {["#ff5f57", "#ffbd2e", "#28c840"].map((c) => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, transition: "transform 0.2s", cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.3)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          ))}
          <span style={{
            fontSize: 11, color: "var(--text3)", marginLeft: 8,
            fontFamily: "var(--font-jetbrains-mono)",
          }}>
            stackinit.dev/create — Step {activeStep}: {STEPS[activeStep - 1].label}
          </span>
          {/* Auto-play indicator */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            style={{
              marginLeft: "auto", padding: "2px 8px", borderRadius: 4,
              background: isAutoPlaying ? "rgba(245,200,66,0.15)" : "var(--bg4)",
              border: `1px solid ${isAutoPlaying ? "rgba(245,200,66,0.3)" : "var(--border-subtle)"}`,
              color: isAutoPlaying ? "var(--gold)" : "var(--text3)",
              fontSize: 9, cursor: "pointer", fontWeight: 700,
              transition: "all 0.2s",
            }}
          >
            {isAutoPlaying ? "▸ LIVE" : "▪ PAUSED"}
          </button>
        </div>

        {/* Main body */}
        <div style={{ display: "flex", minHeight: 360 }}>
          {/* Steps sidebar */}
          <div style={{
            width: 140, borderRight: "1px solid var(--border-subtle)",
            background: "var(--bg2)", padding: "12px 0", flexShrink: 0,
          }}>
            {STEPS.map((s) => {
              const isDone = completedSteps.includes(s.n);
              const isActive = s.n === activeStep;
              return (
                <button
                  key={s.n}
                  onClick={() => handleStepClick(s.n)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "9px 14px", width: "100%", border: "none",
                    background: isActive ? "rgba(245,200,66,0.07)" : "transparent",
                    borderLeft: isActive ? "2px solid var(--gold)" : "2px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: isDone ? "var(--gold)" : isActive ? "rgba(245,200,66,0.15)" : "var(--bg4)",
                    border: isActive ? "1.5px solid var(--gold)" : "1.5px solid var(--border-subtle)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 800,
                    color: isDone ? "var(--bg)" : isActive ? "var(--gold)" : "var(--text3)",
                    flexShrink: 0,
                    transition: "all 0.25s ease",
                    transform: isActive ? "scale(1.1)" : "scale(1)",
                  }}>
                    {isDone ? "✓" : s.icon}
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: isActive ? 700 : 500,
                    color: isActive ? "var(--gold)" : isDone ? "var(--text2)" : "var(--text3)",
                    transition: "color 0.2s",
                    textAlign: "left",
                  }}>
                    {s.label}
                  </span>
                </button>
              );
            })}

            {/* Progress bar */}
            <div style={{ margin: "16px 14px 0", padding: "10px 0", borderTop: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: 9, color: "var(--text3)", marginBottom: 6, fontWeight: 600 }}>
                PROGRESS
              </div>
              <div style={{ height: 3, borderRadius: 2, background: "var(--bg4)" }}>
                <div style={{
                  height: "100%", borderRadius: 2,
                  background: "var(--gold)",
                  width: `${(activeStep / 5) * 100}%`,
                  transition: "width 0.5s ease",
                  boxShadow: "0 0 8px rgba(245,200,66,0.4)",
                }} />
              </div>
            </div>
          </div>

          {/* Content area */}
          <div style={{
            flex: 1, padding: 16, background: "var(--bg3)",
            position: "relative", overflow: "hidden",
          }}>
            {/* Fade-in wrapper */}
            <div key={activeStep} style={{ animation: "heroContentFade 0.35s ease" }}>
              {activeStep === 1 && <StackSelector selected={selectedStack} onSelect={setSelectedStack} />}
              {activeStep === 2 && <ModelEditor hovered={hoveredModel} onHover={setHoveredModel} />}
              {activeStep === 3 && <RelationGraph />}
              {activeStep === 4 && <RouteList />}
              {activeStep === 5 && <TerminalOutput lineCount={terminalIndex} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 1: Stack Selector ────────────────────────────────────────── */

function StackSelector({ selected, onSelect }: { selected: number; onSelect: (i: number) => void }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>
        Choose your stack
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {STACKS.map((s, i) => (
          <button
            key={s.name}
            onClick={() => onSelect(i)}
            style={{
              padding: "12px 14px", borderRadius: 10, border: "none",
              background: i === selected ? `${s.color}15` : "var(--bg2)",
              outline: i === selected ? `1.5px solid ${s.color}` : "1.5px solid var(--border-subtle)",
              cursor: "pointer",
              transition: "all 0.25s ease",
              transform: i === selected ? "scale(1.02)" : "scale(1)",
              textAlign: "left",
            }}
            onMouseEnter={(e) => {
              if (i !== selected) e.currentTarget.style.outline = `1.5px solid ${s.color}60`;
            }}
            onMouseLeave={(e) => {
              if (i !== selected) e.currentTarget.style.outline = "1.5px solid var(--border-subtle)";
            }}
          >
            <div style={{
              fontSize: 12, fontWeight: 700, color: s.color,
              fontFamily: "var(--font-jetbrains-mono)", marginBottom: 8,
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%", background: s.color,
                boxShadow: i === selected ? `0 0 8px ${s.color}80` : "none",
                transition: "box-shadow 0.3s",
              }} />
              {s.name}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {[["Backend", s.backend], ["Frontend", s.frontend], ["Database", s.db]].map(([k, v]) => (
                <span key={k} style={{ fontSize: 9, color: "var(--text3)", fontFamily: "var(--font-jetbrains-mono)" }}>
                  <span style={{ color: "var(--text3)", opacity: 0.5 }}>{k}:</span> {v}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Step 2: Model Editor ──────────────────────────────────────────── */

function ModelEditor({ hovered, onHover }: { hovered: string | null; onHover: (v: string | null) => void }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)" }}>Data Models</span>
        <div style={{
          padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700,
          background: "var(--gold)", color: "var(--bg)", cursor: "pointer",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 0 16px rgba(245,200,66,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          + Add Model
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {MODELS.map((m) => {
          const isHovered = hovered === m.name;
          return (
            <div
              key={m.name}
              onMouseEnter={() => onHover(m.name)}
              onMouseLeave={() => onHover(null)}
              style={{
                padding: "10px 12px", borderRadius: 10,
                border: `1px solid ${m.color}${isHovered ? "60" : "25"}`,
                background: `${m.color}${isHovered ? "12" : "06"}`,
                cursor: "pointer",
                transition: "all 0.25s ease",
                transform: isHovered ? "translateY(-2px) scale(1.02)" : "translateY(0) scale(1)",
                boxShadow: isHovered ? `0 8px 24px ${m.color}20` : "none",
              }}
            >
              <div style={{
                fontSize: 11, fontWeight: 800, color: m.color,
                marginBottom: 6,
                fontFamily: "var(--font-jetbrains-mono)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                {m.name}
                <span style={{
                  fontSize: 8, padding: "1px 5px", borderRadius: 4,
                  background: `${m.color}20`, color: m.color,
                }}>
                  {m.fields.length} fields
                </span>
              </div>
              {m.fields.map((f, fi) => (
                <div key={f} style={{
                  fontSize: 9, color: "var(--text3)",
                  fontFamily: "var(--font-jetbrains-mono)",
                  padding: "2px 0",
                  borderBottom: fi < m.fields.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none",
                  opacity: isHovered ? 1 : 0.7,
                  transform: isHovered ? `translateX(${fi * 1}px)` : "translateX(0)",
                  transition: `all 0.2s ease ${fi * 0.03}s`,
                }}>
                  <span style={{ color: m.color, opacity: 0.5 }}>│</span> {f}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Step 3: Relation Graph (visual) ───────────────────────────────── */

function RelationGraph() {
  const [highlighted, setHighlighted] = useState<number | null>(null);

  const relations = [
    { from: "User", to: "Post", label: "hasMany", fromColor: "#f5c842", toColor: "#4d9fff" },
    { from: "Post", to: "Comment", label: "hasMany", fromColor: "#4d9fff", toColor: "#9d6fff" },
    { from: "Post", to: "Category", label: "belongsTo", fromColor: "#4d9fff", toColor: "#4dff91" },
    { from: "User", to: "Comment", label: "hasMany", fromColor: "#f5c842", toColor: "#9d6fff" },
  ];

  const nodes = [
    { name: "User", x: 40, y: 50, color: "#f5c842" },
    { name: "Post", x: 200, y: 40, color: "#4d9fff" },
    { name: "Comment", x: 360, y: 100, color: "#9d6fff" },
    { name: "Category", x: 200, y: 170, color: "#4dff91" },
  ];

  const getNode = (name: string) => nodes.find((n) => n.name === name)!;

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>
        Entity Relations
      </div>
      <div style={{ position: "relative", height: 230 }}>
        {/* SVG connections */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 440 230">
          {relations.map((r, i) => {
            const from = getNode(r.from);
            const to = getNode(r.to);
            const active = highlighted === i;
            const mx = (from.x + 40 + to.x + 40) / 2;
            const my = (from.y + 18 + to.y + 18) / 2 - 15;
            return (
              <g key={i}
                onMouseEnter={() => setHighlighted(i)}
                onMouseLeave={() => setHighlighted(null)}
                style={{ cursor: "pointer" }}
              >
                <line
                  x1={from.x + 40} y1={from.y + 18}
                  x2={to.x + 40} y2={to.y + 18}
                  stroke={active ? r.fromColor : "rgba(255,255,255,0.1)"}
                  strokeWidth={active ? 2 : 1}
                  strokeDasharray={active ? "none" : "4 4"}
                  style={{ transition: "all 0.3s" }}
                />
                {active && (
                  <text x={mx} y={my} fill={r.fromColor} fontSize={8} textAnchor="middle"
                    fontFamily="var(--font-jetbrains-mono)" fontWeight={700}>
                    {r.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((n) => (
          <div key={n.name} style={{
            position: "absolute", left: n.x, top: n.y,
            width: 80, padding: "8px 10px", borderRadius: 8,
            background: `${n.color}10`, border: `1px solid ${n.color}40`,
            textAlign: "center", cursor: "pointer",
            transition: "all 0.25s ease",
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.08)";
              e.currentTarget.style.boxShadow = `0 4px 20px ${n.color}30`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{
              width: 8, height: 8, borderRadius: "50%", background: n.color,
              margin: "0 auto 4px", boxShadow: `0 0 8px ${n.color}60`,
            }} />
            <div style={{
              fontSize: 10, fontWeight: 800, color: n.color,
              fontFamily: "var(--font-jetbrains-mono)",
            }}>
              {n.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Step 4: Route List ────────────────────────────────────────────── */

function RouteList() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text)", marginBottom: 12 }}>
        Generated Routes
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {ROUTES.map((r, i) => {
          const isHovered = hoveredIdx === i;
          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                display: "grid", gridTemplateColumns: "52px 1fr auto",
                alignItems: "center", gap: 10,
                padding: "7px 10px", borderRadius: 6,
                background: isHovered ? "rgba(255,255,255,0.03)" : "transparent",
                transition: "all 0.2s ease",
                cursor: "pointer",
              }}
            >
              <span style={{
                fontSize: 9, fontWeight: 800, fontFamily: "var(--font-jetbrains-mono)",
                padding: "2px 6px", borderRadius: 3,
                background: `${METHOD_COLORS[r.method]}18`,
                color: METHOD_COLORS[r.method],
                textAlign: "center",
              }}>
                {r.method}
              </span>
              <span style={{
                fontSize: 10, color: "var(--text2)",
                fontFamily: "var(--font-jetbrains-mono)",
              }}>
                {r.path}
              </span>
              <span style={{
                fontSize: 8, color: "var(--text3)",
                fontFamily: "var(--font-jetbrains-mono)",
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? "translateX(0)" : "translateX(8px)",
                transition: "all 0.2s ease",
              }}>
                → {r.handler}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Step 5: Terminal Output ───────────────────────────────────────── */

function TerminalOutput({ lineCount }: { lineCount: number }) {
  return (
    <div style={{
      background: "rgba(0,0,0,0.4)", borderRadius: 8, padding: "12px 14px",
      fontFamily: "var(--font-jetbrains-mono)", fontSize: 10,
      minHeight: 280, border: "1px solid var(--border-subtle)",
    }}>
      {TERMINAL_LINES.slice(0, lineCount).map((line, i) => {
        const isCommand = line.startsWith("$");
        const isSuccess = line.startsWith("✓");
        const isDone = line.includes("Done!");
        return (
          <div key={i} style={{
            padding: "2px 0",
            color: isCommand ? "var(--gold)" : isSuccess ? "#4dff91" : isDone ? "#f5c842" : "var(--text3)",
            fontWeight: isCommand || isSuccess ? 700 : 400,
            opacity: 0,
            animation: "heroLineFadeIn 0.15s ease forwards",
            animationDelay: `${i * 0.02}s`,
          }}>
            {line}
          </div>
        );
      })}
      {lineCount < TERMINAL_LINES.length && (
        <span style={{
          display: "inline-block", width: 7, height: 14,
          background: "var(--gold)", marginLeft: 2,
          animation: "heroCursorBlink 0.8s step-end infinite",
        }} />
      )}
    </div>
  );
}
