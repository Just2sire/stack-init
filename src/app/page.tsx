import Link from "next/link";
import {
  ArrowRight, Code2, Database, Download, Layers,
  Settings2, Sparkles, Zap, FileCode, Globe, ShieldCheck,
} from "lucide-react";

const HOW_IT_WORKS = [
  {
    n: "01",
    icon: <Layers className="w-5 h-5" />,
    title: "Pick your stack",
    desc: "Choose Laravel, Express, NestJS, React, or the full-stack Next.js + Prisma combo.",
  },
  {
    n: "02",
    icon: <Database className="w-5 h-5" />,
    title: "Model your data",
    desc: "Add models and fields visually. Enums, foreign keys, and advanced attributes included.",
  },
  {
    n: "03",
    icon: <Settings2 className="w-5 h-5" />,
    title: "Configure architecture",
    desc: "Select patterns like DDD, MVC or Feature-First. Toggle Swagger, validation, and auth.",
  },
  {
    n: "04",
    icon: <Download className="w-5 h-5" />,
    title: "Generate & download",
    desc: "Get a ready-to-unzip project or a YAML config. No login, no server, 100% browser-side.",
  },
];

const FEATURES = [
  {
    icon: <Globe className="w-5 h-5" />,
    title: "Runs entirely in your browser",
    desc: "No account, no server, no CLI required to use the wizard. The ZIP is assembled client-side with JSZip.",
  },
  {
    icon: <FileCode className="w-5 h-5" />,
    title: "Real files, not stubs",
    desc: "TypeScript interfaces, App Router pages, package.json with your exact deps — not Lorem Ipsum scaffolding.",
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: "Sane defaults, your choices",
    desc: "Sensible starting config for every option — override anything. Zustand or Redux, Tailwind or plain CSS.",
  },
];

const BACKEND_FILES = [
  "📦  backend-project.zip",
  "",
  "├── src/",
  "│   ├── controllers/",
  "│   ├── services/",
  "│   ├── models/",
  "│   └── routes/",
  "├── prisma/",
  "│   └── schema.prisma      # Auto-generated schema",
  "├── package.json           # With all selected deps",
  "└── tsconfig.json",
];

const FULLSTACK_FILES = [
  "📦  fullstack-nextjs.zip",
  "",
  "├── src/app/",
  "│   ├── api/               # API Routes per model",
  "│   ├── posts/             # CRUD Pages",
  "│   └── layout.tsx",
  "├── src/lib/",
  "│   └── prisma.ts          # Ready-to-use client",
  "├── prisma/schema.prisma",
  "└── README.md",
];

const TECH = ["Laravel 13", "NestJS 11", "Express 4", "Next.js 15", "React 19", "Prisma ORM", "TypeScript 5", "Tailwind CSS 4"];

export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "var(--bg)",
      color: "var(--text)",
      fontFamily: "var(--font-space-grotesk), 'Space Grotesk', sans-serif",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflowX: "hidden",
    }}>

      {/* ── Gold ambient glows ──────────────────────────────────── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, transparent, var(--gold-border), transparent)",
      }} />
      <div style={{
        position: "absolute", top: "-20%", right: "-10%",
        width: "45%", height: "55%",
        background: "radial-gradient(ellipse, rgba(245,200,66,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-15%", left: "-8%",
        width: "40%", height: "50%",
        background: "radial-gradient(ellipse, rgba(245,200,66,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "0 40px", height: 64,
        borderBottom: "1px solid var(--border-subtle)",
        background: "rgba(8,8,9,0.85)",
        backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <div style={{ position: "relative", width: 32, height: 32 }}>
            <div style={{
              position: "absolute", top: 4, left: 4, width: 24, height: 24, borderRadius: 6,
              background: "var(--gold-border)", border: "1px solid var(--gold-border)",
            }} />
            <div style={{
              position: "absolute", top: 0, left: 0, width: 24, height: 24, borderRadius: 6,
              background: "var(--gold)", color: "var(--bg)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 2,
              boxShadow: "2px 2px 10px rgba(0,0,0,0.3)",
            }}>
              <Layers className="w-4 h-4" strokeWidth={3} />
            </div>
          </div>
          <span style={{
            fontFamily: "var(--font-syne), 'Syne', sans-serif",
            fontSize: 18, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em",
          }}>
            Stack<span style={{ color: "var(--gold)" }}>Init</span>
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 13, color: "var(--text3)" }}>Laravel · Next.js · TypeScript</span>
          <Link href="/create" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 20px", borderRadius: 10,
            background: "var(--gold)", color: "var(--bg)",
            fontSize: 14, fontWeight: 700, textDecoration: "none",
            transition: "all 0.2s",
          }}>
            Start Building →
          </Link>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section style={{
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
        padding: "140px 24px 100px", position: "relative", zIndex: 10,
      }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "6px 16px", borderRadius: 100,
          border: "1px solid var(--gold-border)",
          background: "var(--gold-subtle)",
          color: "var(--gold)", fontSize: 12, fontWeight: 600,
          marginBottom: 40,
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "var(--gold)", display: "inline-block",
          }} />
          Open source · No account required · 100% browser
        </div>

        <h1 style={{
          fontFamily: "var(--font-syne), 'Syne', sans-serif",
          fontSize: "clamp(40px, 7vw, 72px)",
          fontWeight: 800,
          letterSpacing: "-0.03em",
          lineHeight: 1.06,
          maxWidth: 900,
          marginBottom: 24,
          color: "var(--text)",
        }}>
          Design models.{" "}
          <span style={{ color: "var(--gold)" }}>Get production code.</span>
        </h1>

        <p style={{
          fontSize: 18, color: "var(--text2)", maxWidth: 680,
          lineHeight: 1.7, marginBottom: 20,
        }}>
          Stack-Init is a visual wizard that turns your data schema into a real codebase — a Laravel API config or a Next.js ZIP — in under two minutes.
        </p>

        {/* Value props */}
        <div style={{
          display: "flex", flexWrap: "wrap", justifyContent: "center",
          gap: "8px 24px", fontSize: 13, color: "var(--text3)", marginBottom: 48,
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF2D20", flexShrink: 0 }} />
            Laravel → <span style={{ color: "var(--text2)" }}>YAML + migrations + controllers</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#61DBFB", flexShrink: 0 }} />
            React → <span style={{ color: "var(--text2)" }}>ZIP with pages, types & deps</span>
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", flexShrink: 0 }} />
            Full-stack → <span style={{ color: "var(--text2)" }}>both at once</span>
          </span>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/create" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "14px 36px", borderRadius: 12,
            background: "var(--gold)", color: "var(--bg)",
            fontSize: 16, fontWeight: 700, textDecoration: "none",
            boxShadow: "0 0 40px var(--gold-glow)",
            transition: "all 0.2s",
          }}>
            Launch the wizard <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
          <span style={{ fontSize: 13, color: "var(--text3)" }}>Takes ~2 min · No signup</span>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────── */}
      <section style={{ padding: "120px 24px", position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Divider />
          <SectionLabel>How it works</SectionLabel>
          <h2 style={{
            fontFamily: "var(--font-syne), 'Syne', sans-serif",
            fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800,
            letterSpacing: "-0.03em", color: "var(--text)",
            marginBottom: 60,
          }}>
            Four steps from idea to files
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            {HOW_IT_WORKS.map((step) => (
              <div key={step.n} style={{
                padding: "24px 20px",
                borderRadius: 14,
                border: "1px solid var(--border-subtle)",
                background: "var(--bg3)",
                position: "relative",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: "var(--gold-subtle)", color: "var(--gold)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {step.icon}
                  </div>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: 11, color: "var(--text3)", fontWeight: 700 }}>{step.n}</span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Output preview ─────────────────────────────────────── */}
      <section style={{ padding: "120px 24px", position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Divider />
          <SectionLabel>What you get</SectionLabel>
          <h2 style={{
            fontFamily: "var(--font-syne), 'Syne', sans-serif",
            fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800,
            letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 20,
          }}>
            Real files, ready to use
          </h2>
          <p style={{ color: "var(--text2)", fontSize: 15, marginBottom: 40, maxWidth: 520, lineHeight: 1.6 }}>
            Not a demo, not a stub. Every file is generated with your model names, field types, and library choices baked in.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 16 }}>
            {/* Backend panel */}
            <div style={{
              borderRadius: 14, border: "1px solid rgba(245,200,66,.2)",
              background: "rgba(245,200,66,.03)", overflow: "hidden",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 16px",
                borderBottom: "1px solid rgba(245,200,66,.12)",
                background: "rgba(245,200,66,.04)",
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--gold)" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)" }}>Backend output (Express / NestJS)</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-jetbrains-mono)" }}>ZIP · instant download</span>
              </div>
              <div style={{ padding: 20, fontFamily: "var(--font-jetbrains-mono)", fontSize: 12, lineHeight: 1.9, color: "var(--text2)" }}>
                {BACKEND_FILES.map((line, i) => (
                  <div key={i} style={{ color: line.includes("#") ? "var(--text3)" : undefined }}>
                    {line || <br />}
                  </div>
                ))}
              </div>
            </div>

            {/* Full-Stack panel */}
            <div style={{
              borderRadius: 14, border: "1px solid rgba(157,111,255,.2)",
              background: "rgba(157,111,255,.03)", overflow: "hidden",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "12px 16px",
                borderBottom: "1px solid rgba(157,111,255,.12)",
                background: "rgba(157,111,255,.04)",
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--purple)" }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#b494ff" }}>Next.js Full-Stack output</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-jetbrains-mono)" }}>ZIP · ready-to-run</span>
              </div>
              <div style={{ padding: 20, fontFamily: "var(--font-jetbrains-mono)", fontSize: 12, lineHeight: 1.9, color: "var(--text2)" }}>
                {FULLSTACK_FILES.map((line, i) => (
                  <div key={i} style={{ color: line.includes("#") ? "var(--text3)" : undefined }}>
                    {line || <br />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section style={{ padding: "120px 24px", position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Divider />
          <SectionLabel>Why Stack-Init</SectionLabel>
          <h2 style={{
            fontFamily: "var(--font-syne), 'Syne', sans-serif",
            fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800,
            letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 60,
          }}>
            Built for the impatient developer
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech stack ─────────────────────────────────────────── */}
      <section style={{ padding: "80px 24px", position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Divider />
          <p style={{ textAlign: "center", fontSize: 11, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 24 }}>
            Supported technologies
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
            {TECH.map((t) => (
              <span key={t} style={{
                padding: "6px 16px", borderRadius: 100,
                fontSize: 13, color: "var(--text2)",
                border: "1px solid var(--border-subtle)",
                background: "var(--bg3)",
              }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ─────────────────────────────────────────── */}
      <section style={{ padding: "120px 24px", position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            borderRadius: 20,
            border: "1px solid var(--gold-border)",
            background: "var(--gold-subtle)",
            padding: "80px 40px",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Glow inside banner */}
            <div style={{
              position: "absolute", top: "-50%", left: "50%", transform: "translateX(-50%)",
              width: 300, height: 200,
              background: "radial-gradient(ellipse, var(--gold-glow), transparent 70%)",
              pointerEvents: "none",
            }} />
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "var(--gold)", color: "var(--bg)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, margin: "0 auto 24px", position: "relative",
            }}>⚡</div>
            <h2 style={{
              fontFamily: "var(--font-syne), 'Syne', sans-serif",
              fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em",
              color: "var(--text)", marginBottom: 12,
            }}>
              Ready to stop writing boilerplate?
            </h2>
            <p style={{ color: "var(--text2)", marginBottom: 32, fontSize: 15, lineHeight: 1.6 }}>
              Open the wizard, define your schema, click generate. Your project is waiting.
            </p>
            <Link href="/create" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 36px", borderRadius: 12,
              background: "var(--gold)", color: "var(--bg)",
              fontSize: 15, fontWeight: 700, textDecoration: "none",
              boxShadow: "0 0 40px var(--gold-glow)",
            }}>
              Launch the wizard <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer style={{
        borderTop: "1px solid var(--border-subtle)",
        padding: "24px 24px",
        textAlign: "center",
        fontSize: 13, color: "var(--text3)",
        position: "relative", zIndex: 10,
      }}>
        <span style={{ color: "var(--gold)" }}><Layers className="inline-block w-3 h-3 mb-0.5" /></span>{" "}
        StackInit — scaffold faster, ship sooner
      </footer>
    </main>
  );
}

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
function Divider() {
  return (
    <div style={{
      height: 1, marginBottom: 80,
      background: "linear-gradient(90deg, transparent, var(--gold-border), transparent)",
    }} />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "0.12em", color: "var(--gold)",
      marginBottom: 20, display: "flex", alignItems: "center", gap: 8,
    }}>
      <span style={{ display: "inline-block", width: 20, height: 1, background: "var(--gold)" }} />
      {children}
    </p>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div style={{
      padding: "28px 24px",
      borderRadius: 16,
      border: "1px solid var(--border-subtle)",
      background: "var(--bg3)",
      transition: "all 0.2s",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: "var(--gold-subtle)", color: "var(--gold)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 20,
        border: "1px solid var(--gold-border)",
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.65 }}>{desc}</p>
    </div>
  );
}
