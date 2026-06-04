"use client";

import { useWizardStore } from "@/stores/useWizardStore";
import { Layers, FolderTree, Box, Minimize2 } from "lucide-react";
import type { ExpressConfig, NestConfig, ReactOptions } from "@stack-init/schema";
import { useTranslations } from "next-intl";

type ArchPattern = 'feature-first' | 'ddd' | 'mvvm' | 'mvc' | 'layered' | 'minimal';

export function ArchitectureStep() {
  const { stack, reactOptions, setReactOptions, expressOptions, setExpressOptions, nestOptions, setNestOptions, fastapiOptions, setFastAPIOptions } = useWizardStore();
  const t = useTranslations("steps.architecture");

  const isFrontend = stack === 'react' || stack === 'nextjs';

  const isExpressLike = stack === 'express' || stack === 'express+react'
    || stack === 'mern' || stack === 'pern' || stack === 'mevn' || stack === 'mean';
  const isNestLike    = stack === 'nestjs' || stack === 'nestjs+react';
  const isFastapiLike = stack === 'fastapi' || stack === 'fastapi+react' || stack === 'fastapi+nextjs';
  const isBackend     = isExpressLike || isNestLike || isFastapiLike;

  const currentPattern = isFrontend
    ? reactOptions.architecture
    : isExpressLike ? expressOptions.architecture
    : isNestLike    ? nestOptions.architecture
    : isFastapiLike ? fastapiOptions.architecture
    : undefined;

  const setPattern = (pattern: ArchPattern) => {
    if (isFrontend)    setReactOptions({ architecture: pattern as any });
    else if (isExpressLike) setExpressOptions({ architecture: pattern as any });
    else if (isNestLike)    setNestOptions({ architecture: pattern as any });
    else if (isFastapiLike) setFastAPIOptions({ architecture: pattern as any });
  };

  const patterns = [
    {
      id: 'feature-first',
      title: t("options.feature-first.title"),
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
      title: t("options.ddd.title"),
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
      title: t("options.mvc.title"),
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
      title: t("options.layered.title"),
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
      title: t("options.minimal.title"),
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
        <h2 className="si-title">{t("title")}</h2>
        <p className="si-subtitle mt-2">{t("subtitle")}</p>
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
