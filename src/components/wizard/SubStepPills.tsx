"use client";

import { Check } from "lucide-react";

interface SubStepPillsProps {
  steps: { label: string }[];
  current: number;
  onSelect: (i: number) => void;
}

export function SubStepPills({ steps, current, onSelect }: SubStepPillsProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 36 }}>
      {steps.map((step, i) => {
        const isDone   = i < current;
        const isActive = i === current;

        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 100,
              border: `1.5px solid ${isActive ? "var(--gold)" : isDone ? "var(--gold-border)" : "var(--border-medium)"}`,
              background: isActive ? "var(--gold-subtle)" : "transparent",
              color: isActive ? "var(--gold)" : isDone ? "var(--gold-dim)" : "var(--text3)",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              transition: "all 0.15s",
              lineHeight: 1,
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 800,
                background: isActive ? "var(--gold)" : isDone ? "var(--gold-border)" : "var(--bg4)",
                color: isActive ? "var(--bg)" : isDone ? "var(--gold)" : "var(--text3)",
                flexShrink: 0,
              }}
            >
              {isDone ? <Check size={10} strokeWidth={3} /> : i + 1}
            </span>
            {step.label}
          </button>
        );
      })}

      {/* Connecting line between pills */}
      <style>{`
        /* Nothing to add — layout handled inline */
      `}</style>
    </div>
  );
}
