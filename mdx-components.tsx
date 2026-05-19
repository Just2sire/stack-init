import type { MDXComponents } from "mdx/types";
import Link from "next/link";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    wrapper: ({ children }) => (
      <article style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "60px clamp(20px, 4vw, 48px) 100px",
        position: "relative",
        zIndex: 10,
      }}>
        {children}
      </article>
    ),
    h1: ({ children }) => (
      <h1 style={{
        fontFamily: "var(--font-syne)",
        fontSize: "clamp(28px, 3.5vw, 44px)",
        fontWeight: 800,
        letterSpacing: "-0.03em",
        color: "var(--text)",
        lineHeight: 1.1,
        marginBottom: 16,
        marginTop: 0,
      }}>
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 style={{
        fontFamily: "var(--font-syne)",
        fontSize: "clamp(18px, 2vw, 24px)",
        fontWeight: 700,
        color: "var(--text)",
        marginTop: 52,
        marginBottom: 14,
        letterSpacing: "-0.02em",
        paddingBottom: 10,
        borderBottom: "1px solid var(--border-subtle)",
      }}>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 style={{
        fontSize: 16,
        fontWeight: 700,
        color: "var(--text)",
        marginTop: 32,
        marginBottom: 10,
      }}>
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p style={{
        fontSize: 15,
        color: "var(--text2)",
        lineHeight: 1.75,
        marginBottom: 20,
      }}>
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul style={{
        paddingLeft: 20,
        marginBottom: 20,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}>
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol style={{
        paddingLeft: 20,
        marginBottom: 20,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}>
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li style={{ fontSize: 15, color: "var(--text2)", lineHeight: 1.7 }}>
        {children}
      </li>
    ),
    strong: ({ children }) => (
      <strong style={{ color: "var(--text)", fontWeight: 600 }}>
        {children}
      </strong>
    ),
    a: ({ href, children }) => (
      <Link href={href ?? "#"} style={{ color: "var(--gold)", textDecoration: "underline", textUnderlineOffset: 3 }}>
        {children}
      </Link>
    ),
    code: ({ children }) => (
      <code style={{
        fontFamily: "var(--font-jetbrains-mono), monospace",
        fontSize: "0.875em",
        background: "var(--bg3)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 5,
        padding: "1px 6px",
        color: "var(--gold)",
      }}>
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre style={{
        background: "var(--bg2)",
        border: "1px solid var(--border-subtle)",
        borderRadius: 12,
        padding: "20px 24px",
        overflowX: "auto",
        marginBottom: 24,
        fontFamily: "var(--font-jetbrains-mono), monospace",
        fontSize: 13,
        lineHeight: 1.75,
        color: "var(--text2)",
      }}>
        {children}
      </pre>
    ),
    blockquote: ({ children }) => (
      <blockquote style={{
        borderLeft: "3px solid var(--gold)",
        background: "var(--gold-subtle)",
        borderRadius: "0 10px 10px 0",
        padding: "14px 20px",
        marginBottom: 24,
        color: "var(--text2)",
        fontSize: 14,
      }}>
        {children}
      </blockquote>
    ),
    hr: () => (
      <hr style={{
        border: "none",
        height: 1,
        background: "var(--border-subtle)",
        margin: "40px 0",
      }} />
    ),
    ...components,
  };
}
