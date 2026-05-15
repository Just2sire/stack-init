"use client";

import { useWizardStore } from "@/stores/useWizardStore";
import { Layout, Database, ArrowRight } from "lucide-react";

export function UsageStep() {
  const { nextjsUsage, setNextjsUsage } = useWizardStore();

  const options = [
    {
      id: "frontend-only" as const,
      title: "Frontend Only",
      icon: <Layout className="w-8 h-8" />,
      desc: "Next.js as a React renderer. Your API comes from elsewhere (Laravel, Express, etc.).",
      benefit: "Generates a specialized Frontend ZIP.",
    },
    {
      id: "full-stack" as const,
      title: "Full-Stack",
      icon: <Database className="w-8 h-8" />,
      desc: "API Routes or Server Actions with direct database access. Everything in one project.",
      benefit: "Generates a full project ZIP with Prisma/ORM.",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="si-title">How will you use Next.js?</h2>
        <p className="si-subtitle mt-2">Choose the architecture that best fits your needs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {options.map((opt) => (
          <div
            key={opt.id}
            onClick={() => setNextjsUsage(opt.id)}
            className={[
              "si-stack-card group",
              nextjsUsage === opt.id ? "selected" : ""
            ].join(" ")}
          >
            <div className="relative z-10">
              <div className={[
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300",
                nextjsUsage === opt.id ? "bg-gold text-bg" : "bg-bg4 text-gold-dim group-hover:text-gold group-hover:bg-gold-subtle"
              ].join(" ")}>
                {opt.icon}
              </div>

              <h3 className="text-xl font-bold mb-3">{opt.title}</h3>
              <p className="text-sm text-text2 leading-relaxed mb-6">
                {opt.desc}
              </p>

              <div className="si-badge si-badge-gold">
                <ArrowRight size={12} className="mr-2" />
                {opt.benefit}
              </div>
            </div>
          </div>
        ))}
      </div>

      {nextjsUsage && (
        <div className="si-info-card animate-in fade-in slide-in-from-bottom-2 duration-300">
          <p className="text-sm font-medium">
            Next step: {nextjsUsage === "frontend-only" ? "Architecture Setup" : "Database Configuration"}
          </p>
        </div>
      )}
    </div>
  );
}
