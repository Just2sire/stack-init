import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, BookOpen } from "lucide-react";
import { guides } from "@/lib/guides-manifest";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Guides | StackInit — Tech-Stack Scaffolding Tutorials",
  description:
    "Step-by-step guides to scaffold Laravel, Next.js, Express, and FastAPI projects with StackInit. From zero to a production-ready codebase in minutes.",
  keywords: [
    "laravel react boilerplate",
    "nextjs prisma scaffold",
    "express typescript boilerplate generator",
    "scaffold tutorial",
    "code generation guide",
  ],
};

const TAG_COLORS: Record<string, string> = {
  Laravel: "#ff4d6d",
  React: "#61dafb",
  PHP: "#7c3aed",
  Vite: "#9d6fff",
  "Next.js": "#e0e0e0",
  Prisma: "#4d9fff",
  TypeScript: "#4d9fff",
  "Full-stack": "#4dff91",
  Express: "#ffffff",
  "REST API": "#ff9d4d",
  "Node.js": "#4dff91",
  FastAPI: "#009688",
  Python: "#ffca28",
};

export default async function GuidesPage() {
  const t = await getTranslations("guides");
  return (
    <main style={{ position: "relative", zIndex: 10 }}>
      {/* Hero */}
      <section style={{
        padding: "clamp(60px, 8vh, 100px) clamp(20px, 4vw, 60px) 60px",
        maxWidth: 1280,
        margin: "0 auto",
      }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "5px 14px",
          borderRadius: 100,
          border: "1px solid var(--gold-border)",
          background: "var(--gold-subtle)",
          color: "var(--gold)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          marginBottom: 24,
        }}>
          <BookOpen size={11} />
          {t("badge")}
        </div>
        <h1 style={{
          fontFamily: "var(--font-syne)",
          fontSize: "clamp(32px, 4vw, 52px)",
          fontWeight: 800,
          letterSpacing: "-0.04em",
          lineHeight: 1.08,
          marginBottom: 16,
          color: "var(--text)",
        }}>
          {t("headline1")}<br />
          <span style={{ color: "var(--gold)" }}>{t("headline2")}</span>
        </h1>
        <p style={{
          fontSize: "clamp(14px, 1.2vw, 16px)",
          color: "var(--text2)",
          lineHeight: 1.65,
          maxWidth: 520,
        }}>
          {t("description")}
        </p>
      </section>

      {/* Guides grid */}
      <section style={{
        padding: "0 clamp(20px, 4vw, 60px) 100px",
        maxWidth: 1280,
        margin: "0 auto",
      }}>
        <div style={{
          height: 1,
          background: "linear-gradient(90deg, transparent, var(--gold-border) 30%, var(--gold-border) 70%, transparent)",
          marginBottom: 48,
        }} />
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(340px, 100%), 1fr))",
          gap: 20,
        }}>
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              style={{ textDecoration: "none" }}
            >
              <article className="guide-card">
                {/* Tags */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {guide.tags.map((tag) => (
                    <span key={tag} style={{
                      padding: "3px 9px",
                      borderRadius: 100,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      background: `${TAG_COLORS[tag] ?? "#ffffff"}14`,
                      color: TAG_COLORS[tag] ?? "var(--text3)",
                      border: `1px solid ${TAG_COLORS[tag] ?? "#ffffff"}28`,
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title + desc */}
                <div style={{ flex: 1 }}>
                  <h2 style={{
                    fontFamily: "var(--font-syne)",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "var(--text)",
                    letterSpacing: "-0.02em",
                    marginBottom: 10,
                    lineHeight: 1.3,
                  }}>
                    {guide.title}
                  </h2>
                  <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.65 }}>
                    {guide.description}
                  </p>
                </div>

                {/* Footer */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 14,
                  borderTop: "1px solid var(--border-subtle)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text3)" }}>
                    <Clock size={12} />
                    {t("readTime", { time: guide.readTime })}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--gold)", fontWeight: 600 }}>
                    {t("readGuide")} <ArrowRight size={12} />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
