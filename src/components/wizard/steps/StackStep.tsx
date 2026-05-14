"use client";

import { useWizardStore } from "@/stores/useWizardStore";

function LaravelLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M27 14 L27 72 L73 72 L73 59 L40 59 L40 14 Z" fill="#FF2D20"/>
      <path d="M27 14 L27 28 L40 28 L40 14 Z" fill="rgba(255,45,32,0.5)"/>
    </svg>
  );
}

function ReactLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="7.5" fill="#61DBFB"/>
      <ellipse cx="50" cy="50" rx="44" ry="17" stroke="#61DBFB" strokeWidth="3.5"/>
      <ellipse cx="50" cy="50" rx="44" ry="17" stroke="#61DBFB" strokeWidth="3.5" transform="rotate(60 50 50)"/>
      <ellipse cx="50" cy="50" rx="44" ry="17" stroke="#61DBFB" strokeWidth="3.5" transform="rotate(120 50 50)"/>
    </svg>
  );
}

function MixLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 6 L87 27 L87 73 L50 94 L13 73 L13 27 Z" stroke="#9b87ff" strokeWidth="3" fill="none"/>
      <path d="M24 34 L24 66 L40 66" stroke="#FF2D20" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="66" cy="50" r="5" fill="#61DBFB"/>
      <ellipse cx="66" cy="50" rx="18" ry="7" stroke="#61DBFB" strokeWidth="2.5"/>
      <ellipse cx="66" cy="50" rx="18" ry="7" stroke="#61DBFB" strokeWidth="2.5" transform="rotate(60 66 50)"/>
      <ellipse cx="66" cy="50" rx="18" ry="7" stroke="#61DBFB" strokeWidth="2.5" transform="rotate(120 66 50)"/>
    </svg>
  );
}

const STACKS = [
  {
    id: "laravel" as const,
    title: "Laravel",
    desc: "API REST or Blade backend with Eloquent, migrations, and artisan CLI.",
    badge: "PHP",
    Logo: LaravelLogo,
    colors: {
      border: "rgba(255,45,32,.35)",
      bg: "rgba(255,45,32,.06)",
      bgSelected: "rgba(255,45,32,.085)",
      iconBg: "rgba(255,45,32,.15)",
      title: "#ff7a6e",
      shadow: "0 4px 20px rgba(255,45,32,.15)",
    },
  },
  {
    id: "react" as const,
    title: "React / Next.js",
    desc: "Next.js front-end with TypeScript, routing, and component architecture.",
    badge: "TS",
    Logo: ReactLogo,
    colors: {
      border: "rgba(97,219,251,.28)",
      bg: "rgba(97,219,251,.05)",
      bgSelected: "rgba(97,219,251,.07)",
      iconBg: "rgba(97,219,251,.12)",
      title: "#7ee6ff",
      shadow: "0 4px 20px rgba(97,219,251,.12)",
    },
  },
  {
    id: "laravel+react" as const,
    title: "Laravel + React",
    desc: "Full-stack — a Laravel API paired with a Next.js SPA. Best of both worlds.",
    badge: "Full",
    Logo: MixLogo,
    colors: {
      border: "rgba(108,99,255,.4)",
      bg: "rgba(108,99,255,.08)",
      bgSelected: "rgba(108,99,255,.112)",
      iconBg: "rgba(108,99,255,.18)",
      title: "#b3adff",
      shadow: "0 4px 20px rgba(108,99,255,.18)",
    },
  },
] as const;

export function StackStep() {
  const { stack, setStack, projectName, setProjectName } = useWizardStore();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="si-title mb-2">Project setup</h1>
      <p className="si-subtitle mb-10">
        Choose your tech stack and name your project to get started.
      </p>

      {/* Project Name */}
      <div className="mb-10">
        <label className="si-section-label">Project name</label>
        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="my-awesome-project"
          className="si-input max-w-md font-mono text-[13px]"
        />
      </div>

      {/* Stack Selection */}
      <div className="mb-10">
        <label className="si-section-label">Select stack</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {STACKS.map((s) => {
            const isSelected = stack === s.id;
            const isUnfocused = !!stack && !isSelected;
            const { Logo, colors } = s;

            return (
              <button
                key={s.id}
                onClick={() => setStack(s.id)}
                className="text-left rounded-[14px] p-5 border transition-all duration-200 cursor-pointer relative"
                style={{
                  borderColor: colors.border,
                  background: isSelected ? colors.bgSelected : colors.bg,
                  boxShadow: isSelected ? colors.shadow : "none",
                  opacity: isUnfocused ? 0.5 : 1,
                }}
              >
                {isSelected && (
                  <span
                    className="absolute top-3.5 right-3.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: colors.iconBg, color: colors.title }}
                  >
                    {s.badge}
                  </span>
                )}

                <div
                  className="w-11 h-11 rounded-[10px] flex items-center justify-center mb-4 p-2"
                  style={{ background: colors.iconBg }}
                >
                  <Logo size={28} />
                </div>

                <span
                  className="block text-[15px] font-medium mb-1.5 tracking-tight transition-colors duration-200"
                  style={{ color: isSelected ? colors.title : "#c5c8d8" }}
                >
                  {s.title}
                </span>

                <span className="block text-[13px] text-[#5c6078] leading-relaxed">
                  {s.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Info card */}
      <div className="si-info-card">
        <p className="text-[11px] font-medium text-[#a59bff] mb-1 uppercase tracking-wider">Note</p>
        <p className="text-[13px] text-[#8b8fa3] leading-relaxed">
          React & Next.js → ZIP téléchargeable. Laravel →{" "}
          <code className="font-mono bg-white/[0.05] px-1.5 py-0.5 rounded text-[#c5c8d8] text-[12px]">
            stack-init.yaml
          </code>{" "}
          + commande CLI.
        </p>
      </div>
    </div>
  );
}
