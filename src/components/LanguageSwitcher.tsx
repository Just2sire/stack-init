"use client";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "@/lib/locale";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const next = locale === "en" ? "fr" : "en";

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          await setLocale(next);
          router.refresh();
        })
      }
      disabled={isPending}
      aria-label="Switch language"
      className="si-btn-secondary"
      style={{
        padding: "5px 12px",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.05em",
        minWidth: 38,
        textAlign: "center",
      }}
    >
      {isPending ? "…" : next.toUpperCase()}
    </button>
  );
}
