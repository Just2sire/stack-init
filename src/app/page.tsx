import Link from "next/link";
import { ArrowRight, Code2, Database, Layers, Sparkles, Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0b14] text-[#e2e4ed] flex flex-col relative overflow-hidden">
      {/* ── Ambient background effects ──────────────────────────── */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#6C63FF]/20 to-transparent" />
      <div className="absolute top-[-30%] right-[-15%] w-[50%] h-[50%] bg-[#6C63FF]/8 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-[#6C63FF]/5 blur-[140px] rounded-full pointer-events-none" />

      {/* ── Navbar ──────────────────────────────────────────────── */}
      <nav className="flex justify-between items-center px-8 py-5 border-b border-white/[0.06] bg-[#0a0b14]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#6C63FF] flex items-center justify-center shadow-[0_0_16px_rgba(108,99,255,0.3)]">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-lg text-white tracking-tight">Stack-Init</span>
        </div>
        <Link
          href="/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#6C63FF] text-white text-sm font-medium transition-all duration-200 hover:bg-[#5851E6] hover:shadow-[0_0_24px_rgba(108,99,255,0.3)] hover:-translate-y-0.5"
        >
          Start Building
        </Link>
      </nav>

      {/* ── Hero Section ───────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-32 z-10 relative">
        {/* Version badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs font-mono-tabular text-[#8b8fa3] mb-10 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6C63FF] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6C63FF]" />
          </span>
          v0.1.0-alpha
        </div>

        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-medium text-white tracking-tight max-w-5xl mx-auto mb-7 leading-[1.08]">
          Scaffold your next<br className="hidden sm:block" /> full-stack project
        </h1>

        <p className="text-lg md:text-xl text-[#8b8fa3] max-w-2xl mx-auto mb-12 leading-relaxed">
          Generate production-ready codebases with Laravel and React.
          Define your models once, and let Stack-Init write the boilerplate.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-[12px] bg-[#6C63FF] text-white text-[15px] font-medium shadow-[0_0_32px_rgba(108,99,255,0.25)] transition-all duration-200 hover:bg-[#5851E6] hover:shadow-[0_0_40px_rgba(108,99,255,0.4)] hover:-translate-y-0.5"
          >
            Launch Wizard
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-[12px] bg-transparent border border-white/[0.08] text-[#c5c8d8] text-[15px] font-medium transition-all duration-200 hover:bg-white/[0.04] hover:border-white/[0.14] hover:text-white">
            View Documentation
          </button>
        </div>
      </section>

      {/* ── Features Section ───────────────────────────────────── */}
      <section className="py-28 px-6 md:px-12 relative z-10">
        {/* Divider */}
        <div className="max-w-5xl mx-auto mb-20 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Database className="w-5 h-5" />}
            title="Visual Data Modeling"
            desc="Define your schema, fields, and relationships through an intuitive UI instead of writing migrations by hand."
          />
          <FeatureCard
            icon={<Zap className="w-5 h-5" />}
            title="Instant Generation"
            desc="Get a fully structured Laravel + React setup as a ZIP file instantly. No server required."
          />
          <FeatureCard
            icon={<Code2 className="w-5 h-5" />}
            title="Production Ready"
            desc="Code is generated following best practices, ready for you to add your unique business logic."
          />
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.05] py-8 px-6 text-center text-sm text-[#5c6078] z-10">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#6C63FF]" />
          <span>Built with care</span>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="group relative p-7 rounded-[16px] border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm transition-all duration-300 hover:border-white/[0.10] hover:bg-white/[0.035] hover:-translate-y-1 hover:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.4)]">
      <div className="w-10 h-10 rounded-[10px] border border-white/[0.08] bg-white/[0.03] flex items-center justify-center mb-5 text-[#8b8fa3] group-hover:text-[#a59bff] group-hover:border-[#6C63FF]/20 group-hover:bg-[#6C63FF]/8 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-[16px] font-medium text-white mb-2 tracking-tight">{title}</h3>
      <p className="text-[14px] text-[#5c6078] leading-relaxed group-hover:text-[#8b8fa3] transition-colors">{desc}</p>
    </div>
  );
}
