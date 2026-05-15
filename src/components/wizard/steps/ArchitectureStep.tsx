"use client";

import { useWizardStore } from "@/stores/useWizardStore";
import { Layers, FolderTree, Box, Minimize2 } from "lucide-react";
import type { ExpressConfig, NestConfig, ReactOptions } from "@stack-init/schema";

type ArchPattern = 'feature-first' | 'ddd' | 'mvvm' | 'mvc' | 'layered' | 'minimal';

export function ArchitectureStep() {
  const { stack, reactOptions, setReactOptions, expressOptions, setExpressOptions, nestOptions, setNestOptions } = useWizardStore();

  const isFrontend = stack === 'react' || stack === 'nextjs';
  const isBackend = stack === 'express' || stack === 'nestjs';

  const currentPattern = isFrontend 
    ? reactOptions.architecture 
    : (stack === 'express' ? expressOptions.architecture : nestOptions.architecture);

  const setPattern = (pattern: ArchPattern) => {
    if (stack === 'react' || stack === 'nextjs') setReactOptions({ architecture: pattern as any });
    else if (stack === 'express') setExpressOptions({ architecture: pattern as any });
    else if (stack === 'nestjs') setNestOptions({ architecture: pattern as any });
  };

  const patterns = [
    {
      id: 'feature-first',
      title: 'Feature-First',
      icon: <Layers className="w-6 h-6" />,
      show: isFrontend,
      tree: [
        'src/',
        '├── features/',
        '│   ├── auth/',
        '│   └── dashboard/',
        '└── shared/'
      ]
    },
    {
      id: 'ddd',
      title: 'Domain-Driven',
      icon: <FolderTree className="w-6 h-6" />,
      show: isFrontend,
      tree: [
        'src/',
        '├── domain/',
        '├── application/',
        '└── infrastructure/'
      ]
    },
    {
      id: 'mvc',
      title: 'MVC Pattern',
      icon: <Box className="w-6 h-6" />,
      show: isBackend || stack === 'laravel',
      tree: [
        'src/',
        '├── controllers/',
        '├── models/',
        '└── views/'
      ]
    },
    {
      id: 'layered',
      title: 'Layered (N-Tier)',
      icon: <Layers className="w-6 h-6" />,
      show: isBackend,
      tree: [
        'src/',
        '├── services/',
        '├── repositories/',
        '└── controllers/'
      ]
    },
    {
      id: 'minimal',
      title: 'Minimal',
      icon: <Minimize2 className="w-6 h-6" />,
      show: true,
      tree: [
        'src/',
        '├── components/',
        '└── lib/'
      ]
    }
  ].filter(p => p.show);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="si-title">Project Architecture</h2>
        <p className="si-subtitle mt-2">Select the organizational pattern for your source code.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patterns.map((pattern) => (
          <div
            key={pattern.id}
            onClick={() => setPattern(pattern.id as ArchPattern)}
            className={[
              "si-stack-card group p-5",
              currentPattern === pattern.id ? "selected" : ""
            ].join(" ")}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className={[
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                  currentPattern === pattern.id ? "bg-gold text-bg" : "bg-bg4 text-gold-dim"
                ].join(" ")}>
                  {pattern.icon}
                </div>
                <h3 className="font-bold">{pattern.title}</h3>
              </div>

              <div className="si-yaml-preview text-[10px] py-3 opacity-60 group-hover:opacity-100 transition-opacity">
                {pattern.tree.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
