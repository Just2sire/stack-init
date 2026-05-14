import Link from "next/link";
import {
  ArrowRight, Code2, Database, Download, Layers,
  Settings2, Sparkles, Zap, FileCode, Globe, ShieldCheck,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Shared gradient style (reused in several places)
───────────────────────────────────────────── */
const gradientText = {
  background: "linear-gradient(90deg, #ffffff 40%, #a59bff 100%)",
  WebkitBackgroundClip: "text" as const,
  WebkitTextFillColor: "transparent" as const,
  backgroundClip: "text" as const,
};

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
const HOW_IT_WORKS = [
  {
    n: "01",
    icon: <Layers className="w-5 h-5" />,
    title: "Pick your stack",
    desc: "Choose Laravel, React/Next.js, or the full-stack combo. Each path produces a different output.",
  },
  {
    n: "02",
    icon: <Database className="w-5 h-5" />,
    title: "Model your data",
    desc: "Add models, fields, and relations visually — enums, foreign keys, nullable toggles included.",
  },
  {
    n: "03",
    icon: <Settings2 className="w-5 h-5" />,
    title: "Configure options",
    desc: "Laravel: auth strategy, DB engine, PHP version. React: state lib, UI kit, HTTP client, pages per model.",
  },
  {
    n: "04",
    icon: <Download className="w-5 h-5" />,
    title: "Generate & download",
    desc: "Laravel → YAML config + CLI. React → ready-to-unzip project. No login, no server, 100% browser.",
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

const LARAVEL_FILES = [
  "📄  stack-init.yaml",
  "📄  GETTING_STARTED.md",
  "",
  "# After running `npx stack-init generate`:",
  "",
  "📄  app/Models/Post.php",
  "📄  app/Http/Controllers/Api/PostController.php",
  "📄  app/Http/Requests/StorePostRequest.php",
  "📄  app/Http/Resources/PostResource.php",
  "📄  database/migrations/xxxx_create_posts_table.php",
  "📄  database/factories/PostFactory.php",
  "📄  database/seeders/PostSeeder.php",
];

const REACT_FILES = [
  "📦  my-project.zip",
  "",
  "├── package.json",
  "├── tsconfig.json",
  "├── next.config.ts",
  "├── src/",
  "│   ├── app/",
  "│   │   ├── layout.tsx",
  "│   │   ├── page.tsx",
  "│   │   └── posts/",
  "│   │       ├── page.tsx          # list",
  "│   │       ├── create/page.tsx   # create form",
  "│   │       └── [id]/page.tsx     # detail",
  "│   └── types/",
  "│       └── Post.ts               # TS interface",
  "└── README.md",
];

const TECH = ["Laravel 11", "Next.js 15", "React 19", "TypeScript 5", "Tailwind CSS 4", "Eloquent ORM"];

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0b14] text-[#e2e4ed] flex flex-col relative overflow-hidden">

      {/* ── Ambient glows ─────────────────────────────────────── */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#6C63FF]/20 to-transparent" />
      <div className="absolute top-[-30%] right-[-15%] w-[50%] h-[50%] blur-[160px] rounded-full pointer-events-none" style={{ background: "rgba(108,99,255,0.12)" }} />
      <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] blur-[140px] rounded-full pointer-events-none" style={{ background: "rgba(108,99,255,0.10)" }} />

      {/* ── Navbar ────────────────────────────────────────────── */}
      <nav className="flex justify-between items-center px-8 py-5 border-b border-white/[0.06] bg-[#0a0b14]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-[0_0_16px_rgba(108,99,255,0.3)]" style={{ background: "linear-gradient(135deg, #6C63FF, #9b87ff)" }}>
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-lg text-white tracking-tight">Stack-Init</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm text-[#5c6078]">Laravel · Next.js · TypeScript</span>
          <Link href="/create" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#6C63FF] text-white text-sm font-medium transition-all duration-200 hover:bg-[#5851E6] hover:shadow-[0_0_24px_rgba(108,99,255,0.35)] hover:-translate-y-0.5">
            Start Building
          </Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="flex flex-col items-center text-center px-6 pt-28 pb-20 z-10 relative">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs mb-10 backdrop-blur-sm" style={{ border: "1px solid rgba(108,99,255,.35)", background: "rgba(108,99,255,.08)", color: "#a59bff" }}>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6C63FF] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6C63FF]" />
          </span>
          Open source · No account required · 100% browser
        </div>

        <h1 className="font-display text-5xl sm:text-6xl md:text-[72px] font-medium tracking-tight max-w-4xl mx-auto mb-6 leading-[1.08]" style={gradientText}>
          Design models.<br className="hidden sm:block" />
          Get production code.
        </h1>

        <p className="text-lg md:text-xl text-[#8b8fa3] max-w-2xl mx-auto mb-5 leading-relaxed">
          Stack-Init is a visual wizard that turns your data schema into a real codebase — a Laravel API config or a Next.js ZIP — in under two minutes.
        </p>

        {/* Concrete value props inline */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-[#5c6078] mb-12">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#FF2D20" }} />
            Laravel → <span className="text-[#8b8fa3]">YAML + migrations + controllers</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#61DBFB" }} />
            React → <span className="text-[#8b8fa3]">ZIP with pages, types & deps</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#6C63FF" }} />
            Full-stack → <span className="text-[#8b8fa3]">both at once</span>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link href="/create" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-[12px] bg-[#6C63FF] text-white text-[15px] font-medium shadow-[0_0_32px_rgba(108,99,255,0.25)] transition-all duration-200 hover:bg-[#5851E6] hover:shadow-[0_0_40px_rgba(108,99,255,0.4)] hover:-translate-y-0.5">
            Launch the wizard
            <ArrowRight className="w-4 h-4" />
          </Link>
          <span className="text-sm text-[#5c6078]">Takes ~2 min · No signup</span>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          <Divider />
          <SectionLabel>How it works</SectionLabel>
          <h2 className="font-display text-3xl md:text-4xl font-medium text-white tracking-tight mb-14 max-w-xl" style={gradientText}>
            Four steps from idea to files
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.n} className="relative p-6 rounded-[14px] border border-white/[0.06] bg-white/[0.02]">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-9 h-9 rounded-[9px] flex items-center justify-center" style={{ background: "rgba(108,99,255,.15)", color: "#a59bff" }}>
                    {step.icon}
                  </div>
                  <span className="font-mono text-[11px] text-[#3d3f58] font-semibold">{step.n}</span>
                </div>
                <h3 className="text-[15px] font-medium text-white mb-2 tracking-tight">{step.title}</h3>
                <p className="text-[13px] text-[#5c6078] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Output preview ────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          <Divider />
          <SectionLabel>What you get</SectionLabel>
          <h2 className="font-display text-3xl md:text-4xl font-medium tracking-tight mb-4" style={gradientText}>
            Real files, ready to use
          </h2>
          <p className="text-[#8b8fa3] text-[15px] mb-12 max-w-xl">
            Not a demo, not a stub. Every file is generated with your model names, field types, and library choices baked in.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Laravel panel */}
            <div className="rounded-[14px] border overflow-hidden" style={{ borderColor: "rgba(255,45,32,.25)", background: "rgba(255,45,32,.04)" }}>
              <div className="flex items-center gap-2.5 px-4 py-3 border-b" style={{ borderColor: "rgba(255,45,32,.15)", background: "rgba(255,45,32,.05)" }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#FF2D20" }} />
                <span className="text-[13px] font-medium" style={{ color: "#ff7a6e" }}>Laravel output</span>
                <span className="ml-auto text-[11px] text-[#5c6078] font-mono">stack-init.yaml + CLI</span>
              </div>
              <div className="p-5 font-mono text-[12px] leading-[1.9] text-[#8b8fa3] space-y-0">
                {LARAVEL_FILES.map((line, i) => (
                  <div key={i} className={line.startsWith("#") ? "text-[#3d3f58] mt-2" : ""}>
                    {line || <br />}
                  </div>
                ))}
              </div>
            </div>

            {/* React panel */}
            <div className="rounded-[14px] border overflow-hidden" style={{ borderColor: "rgba(97,219,251,.2)", background: "rgba(97,219,251,.03)" }}>
              <div className="flex items-center gap-2.5 px-4 py-3 border-b" style={{ borderColor: "rgba(97,219,251,.12)", background: "rgba(97,219,251,.04)" }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#61DBFB" }} />
                <span className="text-[13px] font-medium" style={{ color: "#7ee6ff" }}>React / Next.js output</span>
                <span className="ml-auto text-[11px] text-[#5c6078] font-mono">ZIP · instant download</span>
              </div>
              <div className="p-5 font-mono text-[12px] leading-[1.9] text-[#8b8fa3] space-y-0">
                {REACT_FILES.map((line, i) => (
                  <div key={i} className={line.endsWith("interface") || line.includes("#") ? "text-[#3d3f58]" : ""}>
                    {line || <br />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-12 relative z-10">
        <div className="max-w-5xl mx-auto">
          <Divider />
          <SectionLabel>Why Stack-Init</SectionLabel>
          <h2 className="font-display text-3xl md:text-4xl font-medium tracking-tight mb-14" style={gradientText}>
            Built for the impatient developer
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} desc={f.desc} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech stack ────────────────────────────────────────── */}
      <section className="py-16 px-6 z-10 relative">
        <div className="max-w-5xl mx-auto">
          <Divider />
          <p className="text-center text-[12px] text-[#3d3f58] uppercase tracking-widest font-medium mb-8">Supported technologies</p>
          <div className="flex flex-wrap justify-center gap-3">
            {TECH.map((t) => (
              <span key={t} className="px-4 py-1.5 rounded-full text-[13px] text-[#8b8fa3] border border-white/[0.06] bg-white/[0.02]">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ────────────────────────────────────────── */}
      <section className="py-24 px-6 z-10 relative">
        <div className="max-w-2xl mx-auto text-center">
          <div className="rounded-[20px] border p-12" style={{ borderColor: "rgba(108,99,255,.25)", background: "rgba(108,99,255,.06)" }}>
            <Zap className="w-8 h-8 mx-auto mb-6" style={{ color: "#a59bff" }} />
            <h2 className="font-display text-3xl font-medium text-white tracking-tight mb-4">
              Ready to stop writing boilerplate?
            </h2>
            <p className="text-[#8b8fa3] mb-8 text-[15px] leading-relaxed">
              Open the wizard, define your schema, click generate. Your project is waiting.
            </p>
            <Link href="/create" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-[12px] bg-[#6C63FF] text-white text-[15px] font-medium shadow-[0_0_32px_rgba(108,99,255,0.25)] transition-all duration-200 hover:bg-[#5851E6] hover:shadow-[0_0_40px_rgba(108,99,255,0.4)] hover:-translate-y-0.5">
              Launch the wizard
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.05] py-8 px-6 text-center text-sm text-[#5c6078] z-10">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#6C63FF]" />
          <span>Stack-Init — scaffold faster, ship sooner</span>
        </div>
      </footer>
    </main>
  );
}

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
function Divider() {
  return <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-12" />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: "#a59bff" }}>
      {children}
    </p>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group p-7 rounded-[16px] border border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.4)] hover:[border-color:rgba(108,99,255,0.3)]">
      <div className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-5" style={{ background: "rgba(108,99,255,.12)", color: "#a59bff" }}>
        {icon}
      </div>
      <h3 className="text-[16px] font-medium text-white mb-2 tracking-tight">{title}</h3>
      <p className="text-[14px] text-[#5c6078] leading-relaxed group-hover:text-[#8b8fa3] transition-colors">{desc}</p>
    </div>
  );
}
