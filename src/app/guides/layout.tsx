import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen } from "lucide-react";

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", position: "relative" }}>
      {/* Subtle background grid is provided by body::before in globals.css */}

      {/* Navbar */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 clamp(20px, 4vw, 60px)",
        height: 64,
        borderBottom: "1px solid var(--border-subtle)",
        background: "rgba(8,8,9,0.80)",
        backdropFilter: "blur(24px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <Image src="/favicon.svg" alt="StackInit" width={24} height={24} />
            <span style={{ fontFamily: "var(--font-syne)", fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>
              Stack<span style={{ color: "var(--gold)" }}>Init</span>
            </span>
          </Link>
          <span style={{ color: "var(--border-medium)", fontSize: 14 }}>/</span>
          <Link href="/guides" style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--text2)",
            textDecoration: "none",
          }}>
            <BookOpen size={14} />
            Guides
          </Link>
        </div>

        <Link href="/create" style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          padding: "8px 20px",
          borderRadius: 10,
          background: "var(--gold)",
          color: "var(--bg)",
          fontSize: 13,
          fontWeight: 700,
          textDecoration: "none",
          boxShadow: "0 0 24px rgba(245,200,66,0.25)",
        }}>
          Open wizard <ArrowRight size={14} />
        </Link>
      </nav>

      {children}
    </div>
  );
}
