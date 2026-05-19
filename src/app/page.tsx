import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Layers, Database, Zap, FileCode, Globe,
  Sparkles, Table, GitBranch, Package, BookOpen, Download,
  Code2, Settings2, Check, Blocks,
} from "lucide-react";


/* ─── Static data ─────────────────────────────────────────────────── */

const STATS = [
  { value: "6+", label: "Frameworks" },
  { value: "4", label: "Import modes" },
  { value: "0", label: "Signup required" },
  { value: "~2 min", label: "To a full project" },
];

const FEATURES = [
  {
    icon: <Database size={22} />,
    color: "#F5C842",
    colorSubtle: "rgba(245,200,66,0.08)",
    colorBorder: "rgba(245,200,66,0.2)",
    title: "Visual data modeling",
    desc: "Build your schema with a drag-and-drop canvas. Enums, nullable fields, unique constraints, foreign keys — all in one place.",
    wide: true,
  },
  {
    icon: <Sparkles size={22} />,
    color: "#4d9fff",
    colorSubtle: "rgba(77,159,255,0.08)",
    colorBorder: "rgba(77,159,255,0.2)",
    title: "AI natural language import",
    desc: "Describe your schema in plain English. AI extracts models, fields and relations automatically.",
    wide: false,
  },
  {
    icon: <Table size={22} />,
    color: "#4dff91",
    colorSubtle: "rgba(77,255,145,0.08)",
    colorBorder: "rgba(77,255,145,0.2)",
    title: "SQL DDL import",
    desc: "Paste or upload a .sql file — tables, columns, types and foreign keys extracted in one click.",
    wide: false,
  },
  {
    icon: <GitBranch size={22} />,
    color: "#9d6fff",
    colorSubtle: "rgba(157,111,255,0.08)",
    colorBorder: "rgba(157,111,255,0.2)",
    title: "ERD canvas with relations",
    desc: "See your full entity-relationship diagram in real time as you build. hasOne · hasMany · belongsToMany with visual edge styles.",
    wide: false,
  },
  {
    icon: <Package size={22} />,
    color: "#ff9d4d",
    colorSubtle: "rgba(255,157,77,0.08)",
    colorBorder: "rgba(255,157,77,0.2)",
    title: "Module library",
    desc: "One-click import of pre-built model sets: Auth, Blog, E-commerce, SaaS, Media. Skip the repetitive setup.",
    wide: false,
  },
  {
    icon: <BookOpen size={22} />,
    color: "#F5C842",
    colorSubtle: "rgba(245,200,66,0.08)",
    colorBorder: "rgba(245,200,66,0.2)",
    title: "Saveable presets",
    desc: "Save any config as a named preset. Load it instantly on your next project, or share the JSON file with your team.",
    wide: true,
  },
];

const HOW_IT_WORKS = [
  {
    n: "01",
    icon: <Layers size={18} />,
    title: "Pick your stack",
    desc: "Laravel, Express, NestJS, FastAPI, React, Next.js — or a combo like MERN or FastAPI + React.",
  },
  {
    n: "02",
    icon: <Database size={18} />,
    title: "Model your data",
    desc: "Add models visually or import from SQL / AI. Define fields, types, constraints and relations.",
  },
  {
    n: "03",
    icon: <Settings2 size={18} />,
    title: "Configure everything",
    desc: "Toggle controllers, routes, services, repositories. Choose auth middleware and architecture patterns.",
  },
  {
    n: "04",
    icon: <Download size={18} />,
    title: "Generate & download",
    desc: "Get a production-ready ZIP — or a stack-init.yaml for the CLI. No login, 100% in your browser.",
  },
];

const STACKS = [
  { name: "Laravel", badge: "PHP", color: "#ff4d6d", icon: "/icons/laravel.svg" },
  { name: "Express", badge: "Node", color: "#ffffff", icon: "/icons/expressjs.svg" },
  { name: "NestJS", badge: "Node", color: "#ea2845", icon: "/icons/nestjs.svg" },
  { name: "FastAPI", badge: "Python", color: "#009688", icon: "/icons/fastapi.svg" },
  { name: "Next.js", badge: "Full-stack", color: "#e0e0e0", icon: "/icons/nextdotjs.svg" },
  { name: "React", badge: "Frontend", color: "#61dafb", icon: "/icons/react.svg" },
];

const OUTPUT_LINES = [
  { text: "📦  my-saas-app.zip", dim: false },
  { text: "", dim: false },
  { text: "├── src/controllers/", dim: false },
  { text: "│   ├── UserController.ts      # CRUD + auth middleware", dim: true },
  { text: "│   ├── PostController.ts      # REST endpoints", dim: true },
  { text: "│   └── CommentController.ts", dim: true },
  { text: "├── src/services/", dim: false },
  { text: "│   └── UserService.ts         # Business logic layer", dim: true },
  { text: "├── src/models/", dim: false },
  { text: "│   └── User.ts                # Typed interfaces", dim: true },
  { text: "├── prisma/schema.prisma       # Auto-generated", dim: true },
  { text: "├── package.json               # All your deps, exact versions", dim: true },
  { text: "└── tsconfig.json", dim: false },
];

const CHECKLIST = [
  "Full CRUD controllers",
  "Prisma schema from your models",
  "RESTful routes registered",
  "Service & repository layers",
  "Jest test stubs",
  "All dependencies in package.json",
  "TypeScript interfaces",
  "Swagger / OpenAPI (optional)",
];

/* ─── Page ──────────────────────────────────────────────────────────── */

export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "var(--bg)",
      color: "var(--text)",
      fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
      overflowX: "hidden",
      position: "relative",
    }}>

      {/* ── Background mesh ────────────────────────────────────────── */}
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", top: "-30%", right: "-15%",
          width: "70%", height: "80%",
          background: "radial-gradient(ellipse, rgba(245,200,66,0.055) 0%, transparent 65%)",
        }} />
        <div style={{
          position: "absolute", bottom: "-20%", left: "-10%",
          width: "60%", height: "70%",
          background: "radial-gradient(ellipse, rgba(77,159,255,0.04) 0%, transparent 65%)",
        }} />
        <div style={{
          position: "absolute", top: "40%", left: "40%",
          width: "50%", height: "50%",
          background: "radial-gradient(ellipse, rgba(157,111,255,0.03) 0%, transparent 65%)",
        }} />
        {/* Top line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent 0%, rgba(245,200,66,0.4) 50%, transparent 100%)",
        }} />
      </div>

      {/* ── Navbar ─────────────────────────────────────────────────── */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 clamp(20px, 4vw, 60px)", height: 64,
        borderBottom: "1px solid var(--border-subtle)",
        background: "rgba(8,8,9,0.80)",
        backdropFilter: "blur(24px)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <Image src="/favicon.svg" alt="StackInit" width={28} height={28} />
          <span style={{ fontFamily: "var(--font-syne)", fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Stack<span style={{ color: "var(--gold)" }}>Init</span>
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/guides" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "7px 14px", borderRadius: 8,
            fontSize: 13, color: "var(--text2)",
            fontWeight: 500, textDecoration: "none",
          }}>
            <BookOpen size={14} />
            Guides
          </Link>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 12px", borderRadius: 8,
            border: "1px solid var(--border-subtle)",
            background: "var(--bg3)",
            fontSize: 12, color: "var(--text3)",
            marginRight: 8,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4dff91", display: "inline-block" }} />
            No signup · 100% browser
          </div>
          <Link href="/create" style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "8px 20px", borderRadius: 10,
            background: "var(--gold)", color: "var(--bg)",
            fontSize: 13, fontWeight: 700, textDecoration: "none",
            boxShadow: "0 0 24px rgba(245,200,66,0.25)",
          }}>
            Open wizard <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section style={{
        position: "relative", zIndex: 10,
        padding: "clamp(60px, 10vh, 120px) clamp(20px, 4vw, 60px) 80px",
        maxWidth: 1280, margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "clamp(40px, 5vw, 80px)",
        alignItems: "center",
      }}>
        {/* Left — text */}
        <div>
          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "5px 14px", borderRadius: 100,
            border: "1px solid var(--gold-border)",
            background: "var(--gold-subtle)",
            color: "var(--gold)", fontSize: 11, fontWeight: 700,
            letterSpacing: "0.05em", textTransform: "uppercase",
            marginBottom: 28,
          }}>
            <Zap size={11} fill="currentColor" />
            Visual scaffolder · Open source
          </div>

          <h1 style={{
            fontFamily: "var(--font-syne)",
            fontSize: "clamp(32px, 4vw, 52px)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 1.08,
            marginBottom: 18,
          }}>
            Schema in.{" "}
            <span style={{
              color: "var(--gold)",
              position: "relative",
              display: "inline-block",
            }}>
              Code out.
              <span style={{
                position: "absolute", bottom: -3, left: 0, right: 0, height: 2,
                background: "linear-gradient(90deg, var(--gold), transparent)",
                borderRadius: 2,
              }} />
            </span>
          </h1>

          <p style={{
            fontSize: "clamp(13px, 1.2vw, 15px)",
            color: "var(--text2)", lineHeight: 1.65,
            maxWidth: 420, marginBottom: 32,
          }}>
            StackInit is the fastest <strong>tech-stack boilerplate generator</strong>. Design your data models visually, pick your stack, and download a fully-wired codebase — no boilerplate, no copy-paste.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 40 }}>
            <Link href="/create" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "13px 32px", borderRadius: 12,
              background: "var(--gold)", color: "var(--bg)",
              fontSize: 15, fontWeight: 700, textDecoration: "none",
              boxShadow: "0 0 48px rgba(245,200,66,0.30), 0 4px 16px rgba(0,0,0,0.4)",
              letterSpacing: "-0.01em",
            }}>
              <Zap size={16} fill="currentColor" />
              Launch the wizard
            </Link>
            <div style={{ fontSize: 13, color: "var(--text3)", display: "flex", flexDirection: "column", gap: 2 }}>
              <span>Takes ~2 min</span>
              <span>No account required</span>
            </div>
          </div>

          {/* Trust indicators */}
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {[
              { dot: "#FF2D20", label: "Laravel" },
              { dot: "#ea2845", label: "NestJS" },
              { dot: "#ffffff", label: "Express" },
              { dot: "#009688", label: "FastAPI" },
              { dot: "#61dafb", label: "React" },
              { dot: "#e0e0e0", label: "Next.js" },
            ].map(({ dot, label }) => (
              <span key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text3)" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: dot, flexShrink: 0 }} />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Right — wizard preview mockup */}
        <div style={{ position: "relative" }}>
          {/* Glow behind card */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: "120%", height: "120%",
            background: "radial-gradient(ellipse, rgba(245,200,66,0.10) 0%, transparent 65%)",
            pointerEvents: "none",
          }} />

          <div style={{
            borderRadius: 18,
            border: "1px solid var(--border-medium)",
            background: "var(--bg3)",
            overflow: "hidden",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
            position: "relative",
          }}>
            {/* Window chrome */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "12px 16px",
              borderBottom: "1px solid var(--border-subtle)",
              background: "var(--bg2)",
            }}>
              {["#ff5f57", "#ffbd2e", "#28c840"].map((c) => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
              ))}
              <span style={{ fontSize: 11, color: "var(--text3)", marginLeft: 8, fontFamily: "var(--font-jetbrains-mono)" }}>
                stackinit.dev/create — Step 2: Models
              </span>
            </div>

            {/* Wizard sidebar */}
            <div style={{ display: "flex", height: 340 }}>
              {/* Steps sidebar */}
              <div style={{
                width: 160, borderRight: "1px solid var(--border-subtle)",
                background: "var(--bg2)", padding: "16px 0", flexShrink: 0,
              }}>
                {[
                  { n: 1, label: "Stack", done: true },
                  { n: 2, label: "Models", active: true },
                  { n: 3, label: "Relations", done: false },
                  { n: 4, label: "Routes", done: false },
                  { n: 5, label: "Output", done: false },
                ].map((s) => (
                  <div key={s.n} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 16px",
                    background: s.active ? "rgba(245,200,66,0.07)" : "transparent",
                    borderLeft: s.active ? "2px solid var(--gold)" : "2px solid transparent",
                  }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: s.done ? "var(--gold)" : s.active ? "var(--gold-subtle)" : "var(--bg4)",
                      border: s.active ? "1.5px solid var(--gold)" : "1.5px solid var(--border-subtle)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, fontWeight: 800,
                      color: s.done ? "var(--bg)" : s.active ? "var(--gold)" : "var(--text3)",
                      flexShrink: 0,
                    }}>
                      {s.done ? "✓" : s.n}
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: s.active ? 700 : 500,
                      color: s.active ? "var(--gold)" : s.done ? "var(--text2)" : "var(--text3)",
                    }}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Main content area — model cards */}
              <div style={{ flex: 1, padding: 16, overflowY: "hidden", background: "var(--bg3)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Data Models</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <div style={{
                      padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700,
                      background: "var(--gold)", color: "var(--bg)",
                    }}>+ Add Model</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { name: "User", fields: ["id", "email", "name", "role"], color: "var(--gold)" },
                    { name: "Post", fields: ["id", "title", "content", "userId"], color: "#4d9fff" },
                    { name: "Comment", fields: ["id", "body", "postId"], color: "#9d6fff" },
                    { name: "Category", fields: ["id", "name", "slug"], color: "#4dff91" },
                  ].map((m) => (
                    <div key={m.name} style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: `1px solid ${m.color}30`,
                      background: `${m.color}08`,
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: m.color, marginBottom: 8, fontFamily: "var(--font-jetbrains-mono)" }}>
                        {m.name}
                      </div>
                      {m.fields.map((f) => (
                        <div key={f} style={{
                          fontSize: 9, color: "var(--text3)",
                          fontFamily: "var(--font-jetbrains-mono)",
                          padding: "2px 0",
                          borderBottom: "1px solid rgba(255,255,255,0.03)",
                        }}>
                          {f}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 10, padding: "0 clamp(20px, 4vw, 60px) 80px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            borderRadius: 16,
            border: "1px solid var(--border-subtle)",
            background: "var(--bg3)",
            overflow: "hidden",
          }}>
            {STATS.map((s, i) => (
              <div key={s.label} style={{
                padding: "28px 24px",
                textAlign: "center",
                borderRight: i < STATS.length - 1 ? "1px solid var(--border-subtle)" : "none",
              }}>
                <div style={{
                  fontFamily: "var(--font-syne)",
                  fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 800,
                  color: "var(--gold)", letterSpacing: "-0.03em",
                  lineHeight: 1.1, marginBottom: 6,
                }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Features bento grid ────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 10, padding: "80px clamp(20px, 4vw, 60px)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <GoldDivider />
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: 48, flexWrap: "wrap" }}>
            <div>
              <SectionLabel>Features</SectionLabel>
              <h2 style={{
                fontFamily: "var(--font-syne)",
                fontSize: "clamp(26px, 3.5vw, 44px)", fontWeight: 800,
                letterSpacing: "-0.03em", color: "var(--text)", marginTop: 8,
              }}>
                Everything you need,<br />nothing you don&apos;t.
              </h2>
            </div>
            <p style={{ fontSize: 14, color: "var(--text3)", maxWidth: 320, lineHeight: 1.65, textAlign: "right" }}>
              From empty canvas to downloadable project in minutes. Covers the full workflow, not just the schema.
            </p>
          </div>

          {/* Bento grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  gridColumn: f.wide ? "span 2" : "span 1",
                  padding: "28px 28px",
                  borderRadius: 16,
                  border: `1px solid ${f.colorBorder}`,
                  background: f.colorSubtle,
                  display: "flex",
                  flexDirection: f.wide ? "row" : "column",
                  gap: f.wide ? 24 : 0,
                  alignItems: f.wide ? "flex-start" : undefined,
                }}
              >
                <div>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `${f.color}18`,
                    border: `1px solid ${f.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: f.color,
                    marginBottom: f.wide ? 0 : 20,
                    flexShrink: 0,
                  }}>
                    {f.icon}
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.65 }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}

            {/* Extra feature cards */}
            <div style={{
              gridColumn: "span 1",
              padding: "28px",
              borderRadius: 16,
              border: "1px solid var(--border-subtle)",
              background: "var(--bg3)",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid var(--border-subtle)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--text3)",
                marginBottom: 20,
              }}>
                <FileCode size={22} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>
                YAML config re-import
              </h3>
              <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.65 }}>
                Already generated a <code style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "var(--text)" }}>stack-init.yaml</code>? Import it back into the wizard to resume or tweak any part of your config.
              </p>
            </div>

            <div style={{
              gridColumn: "span 2",
              padding: "28px",
              borderRadius: 16,
              border: "1px solid var(--border-subtle)",
              background: "var(--bg3)",
              display: "flex", gap: 24,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "rgba(77,159,255,0.10)",
                border: "1px solid rgba(77,159,255,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#4d9fff",
                flexShrink: 0,
              }}>
                <Globe size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>
                  100% browser-side — no server, no account
                </h3>
                <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.65 }}>
                  Every file is generated client-side using JSZip and your selections. Nothing leaves your machine. The CLI is optional — the wizard works standalone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 10, padding: "80px clamp(20px, 4vw, 60px)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <GoldDivider />
          <SectionLabel>How it works</SectionLabel>
          <h2 style={{
            fontFamily: "var(--font-syne)",
            fontSize: "clamp(26px, 3.5vw, 44px)", fontWeight: 800,
            letterSpacing: "-0.03em", color: "var(--text)",
            marginBottom: 52, marginTop: 8,
          }}>
            Four steps from idea to files.
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 2, position: "relative" }}>
            {/* Connector line */}
            <div style={{
              position: "absolute",
              top: 35, left: "12.5%", right: "12.5%",
              height: 1,
              background: "linear-gradient(90deg, transparent, var(--gold-border), var(--gold-border), transparent)",
              pointerEvents: "none",
            }} />
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.n} style={{ padding: "0 12px", position: "relative" }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  background: i === 0 ? "var(--gold)" : "var(--bg3)",
                  border: `1.5px solid ${i === 0 ? "var(--gold)" : "var(--border-subtle)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: i === 0 ? "var(--bg)" : "var(--text3)",
                  marginBottom: 24, position: "relative", zIndex: 2,
                }}>
                  {step.icon}
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 800, color: "var(--text3)",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  fontFamily: "var(--font-jetbrains-mono)",
                  marginBottom: 8,
                }}>
                  {step.n}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 10 }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Output preview split ─────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 10, padding: "80px clamp(20px, 4vw, 60px)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <GoldDivider />
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: "clamp(32px, 4vw, 60px)", alignItems: "start",
          }}>
            {/* Left — copy */}
            <div style={{ paddingTop: 8 }}>
              <SectionLabel>What you get</SectionLabel>
              <h2 style={{
                fontFamily: "var(--font-syne)",
                fontSize: "clamp(26px, 3vw, 40px)", fontWeight: 800,
                letterSpacing: "-0.03em", color: "var(--text)",
                marginBottom: 20, marginTop: 8,
              }}>
                Real files,<br />not stubs.
              </h2>
              <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7, marginBottom: 36, maxWidth: 440 }}>
                Every generated file contains your actual model names, your field types, and your library choices. Not Lorem Ipsum. Not placeholders.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 40 }}>
                {CHECKLIST.map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text2)" }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: "rgba(77,255,145,0.12)",
                      border: "1px solid rgba(77,255,145,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <Check size={10} color="#4dff91" strokeWidth={3} />
                    </div>
                    {item}
                  </div>
                ))}
              </div>

              <Link href="/create" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "11px 24px", borderRadius: 10,
                background: "var(--gold)", color: "var(--bg)",
                fontSize: 14, fontWeight: 700, textDecoration: "none",
                boxShadow: "0 0 32px rgba(245,200,66,0.25)",
              }}>
                Generate my project <ArrowRight size={14} />
              </Link>
            </div>

            {/* Right — file tree terminal */}
            <div style={{
              borderRadius: 16,
              border: "1px solid rgba(245,200,66,0.15)",
              background: "var(--bg2)",
              overflow: "hidden",
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 16px",
                borderBottom: "1px solid var(--border-subtle)",
                background: "var(--bg3)",
              }}>
                {["#ff5f57", "#ffbd2e", "#28c840"].map((c) => (
                  <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                ))}
                <span style={{ fontSize: 11, color: "var(--text3)", marginLeft: 8, fontFamily: "var(--font-jetbrains-mono)" }}>
                  output
                </span>
                <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--gold)", fontWeight: 700, fontFamily: "var(--font-jetbrains-mono)" }}>
                  ZIP · ready to run
                </span>
              </div>
              <div style={{ padding: "20px 24px", fontFamily: "var(--font-jetbrains-mono)", fontSize: 12, lineHeight: 2 }}>
                {OUTPUT_LINES.map((line, i) => (
                  <div key={i} style={{ color: line.dim ? "var(--text3)" : "var(--text2)" }}>
                    {line.text || <>&nbsp;</>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stacks grid ────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 10, padding: "80px clamp(20px, 4vw, 60px)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <GoldDivider />
          <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 40px" }}>
            <SectionLabel>Supported stacks</SectionLabel>
            <h2 style={{
              fontFamily: "var(--font-syne)",
              fontSize: "clamp(26px, 3.5vw, 44px)", fontWeight: 800,
              letterSpacing: "-0.03em", color: "var(--text)",
              marginBottom: 12, marginTop: 8,
            }}>
              Your language, your rules.
            </h2>
            <p style={{ fontSize: 14, color: "var(--text3)" }}>
              Each stack generates framework-specific patterns — not generic templates.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, maxWidth: 780, margin: "0 auto" }}>
            {STACKS.map((s) => (
              <div key={s.name} style={{
                padding: "20px 22px",
                borderRadius: 14,
                border: "1px solid var(--border-subtle)",
                background: "var(--bg3)",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <img src={s.icon} alt={s.name} style={{ width: 28, height: 28, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: s.color, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    {s.badge}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 16, maxWidth: 780, margin: "16px auto 0" }}>
            Plus combo stacks: MERN · PERN · FastAPI + React · Laravel + React
          </p>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 10, padding: "80px clamp(20px, 4vw, 60px) 120px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{
            borderRadius: 24,
            border: "1px solid var(--gold-border)",
            background: "linear-gradient(135deg, rgba(245,200,66,0.05) 0%, rgba(245,200,66,0.02) 100%)",
            padding: "clamp(48px, 6vw, 80px) clamp(32px, 5vw, 80px)",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Inner glow */}
            <div style={{
              position: "absolute", top: "-30%", left: "50%", transform: "translateX(-50%)",
              width: 400, height: 250,
              background: "radial-gradient(ellipse, rgba(245,200,66,0.12), transparent 70%)",
              pointerEvents: "none",
            }} />

            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 60, height: 60, borderRadius: 16,
              background: "var(--gold)", color: "var(--bg)",
              fontSize: 28, marginBottom: 28, position: "relative",
            }}>
              <Blocks size={28} />
            </div>

            <h2 style={{
              fontFamily: "var(--font-syne)",
              fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 800,
              letterSpacing: "-0.03em", color: "var(--text)",
              marginBottom: 14, position: "relative",
            }}>
              Ready to stop writing boilerplate?
            </h2>
            <p style={{
              fontSize: 15, color: "var(--text2)", lineHeight: 1.65,
              marginBottom: 36, maxWidth: 520, margin: "0 auto 36px",
              position: "relative",
            }}>
              Open the wizard, pick your stack, define your schema, download your project. Your next side-project starts now.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
              <Link href="/create" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 36px", borderRadius: 12,
                background: "var(--gold)", color: "var(--bg)",
                fontSize: 15, fontWeight: 700, textDecoration: "none",
                boxShadow: "0 0 48px rgba(245,200,66,0.30)",
                letterSpacing: "-0.01em",
              }}>
                <Zap size={16} fill="currentColor" />
                Launch the wizard for free
              </Link>
              <div style={{
                padding: "14px 24px", borderRadius: 12, fontSize: 13,
                color: "var(--text3)", border: "1px solid var(--border-subtle)",
                display: "flex", alignItems: "center", gap: 8,
                background: "var(--bg3)",
              }}>
                <Code2 size={14} />
                No signup · No server · No limits
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "28px clamp(20px, 4vw, 60px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        fontSize: 12, color: "var(--text3)",
        position: "relative", zIndex: 10,
        flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Image src="/favicon.svg" alt="StackInit" width={14} height={14} />
          <span>StackInit — scaffold faster, ship sooner</span>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {["Open source", "No tracking", "MIT License"].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </footer>
    </main>
  );
}

/* ─── Sub-components ────────────────────────────────────────────────── */

function GoldDivider() {
  return (
    <div style={{
      height: 1, marginBottom: 56,
      background: "linear-gradient(90deg, transparent, var(--gold-border) 30%, var(--gold-border) 70%, transparent)",
    }} />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.12em", color: "var(--gold)",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{ display: "inline-block", width: 20, height: 1.5, background: "var(--gold)", borderRadius: 1 }} />
      {children}
    </p>
  );
}
