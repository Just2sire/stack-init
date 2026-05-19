# Spec — Guides Blog (Long Tail SEO)

**Date:** 2026-05-19
**Project:** stack-init
**Status:** Approved

---

## Context

StackInit needs a `/guides` section to capture long-tail SEO traffic from queries like "laravel react boilerplate" or "nextjs prisma scaffold". The section consists of a listing page and individual technical guides, each targeting a specific keyword.

---

## Architecture

### Technology choice
`@next/mdx` (official Next.js integration). No third-party MDX library. Compatible with Next.js 16.x App Router.

**Dependencies to add:**
- `@next/mdx`
- `@mdx-js/react`
- `@types/mdx`
- `remark-gfm` (tables, strikethrough in MDX)

### File structure

```
src/
  app/
    guides/
      layout.tsx                           # shared chrome: navbar + back link
      page.tsx                             # /guides — listing all guides
      scaffold-laravel-react/
        page.mdx                           # /guides/scaffold-laravel-react
      scaffold-nextjs-prisma/
        page.mdx                           # /guides/scaffold-nextjs-prisma
      scaffold-express-typescript/
        page.mdx                           # /guides/scaffold-express-typescript
  lib/
    guides-manifest.ts                     # source of truth: slug, title, description, date, tags
mdx-components.tsx                         # required by @next/mdx (project root)
next.config.ts                             # updated with withMDX wrapper
```

### Guides manifest (`src/lib/guides-manifest.ts`)

Each entry:
```ts
{
  slug: string        // matches directory name
  title: string
  description: string // used in listing cards and og:description
  date: string        // ISO 8601, e.g. "2026-05-19"
  tags: string[]
  readTime: string    // e.g. "5 min"
}
```

The listing page (`/guides/page.tsx`) and `sitemap.ts` both import from this manifest. Adding a new guide = add the MDX file + add one entry to the manifest.

---

## Pages

### `/guides` — Listing page

- Exports `metadata` with title "Guides | StackInit" and relevant description
- Renders guide cards from `guides-manifest.ts`
- Each card: title, description, date, tags, read time, arrow link to the guide
- Visual style: consistent with landing page (dark background, gold accents, Space Grotesk / Syne)

### `/guides/[slug]` — Individual guide pages

Each `page.mdx` exports:
```mdx
export const metadata = {
  title: "How to Scaffold a ... | StackInit Guides",
  description: "...",
  keywords: [...],
}
```

Guide content structure (consistent across all guides):
1. **Intro** — the problem this guide solves
2. **Prerequisites** — what you need
3. **Steps with StackInit** — numbered walkthrough (pick stack → model data → configure → generate)
4. **Generated output** — code snippet or file tree excerpt
5. **CTA** — link to `/create`

### `/guides/layout.tsx` — Shared chrome

- Sticky navbar with StackInit logo + "Guides" breadcrumb + "Open Wizard" CTA button
- Consistent with landing page navbar style
- Back link to `/guides`

---

## Initial guides (3 at launch)

| Slug | H1 title | Target keyword |
|---|---|---|
| `scaffold-laravel-react` | How to Scaffold a Laravel + React Project | laravel react boilerplate |
| `scaffold-nextjs-prisma` | How to Scaffold a Next.js App with Prisma | nextjs prisma scaffold |
| `scaffold-express-typescript` | How to Scaffold an Express TypeScript REST API | express typescript boilerplate generator |

---

## Sitemap update

`src/app/sitemap.ts` imports `guides-manifest.ts` and appends one entry per guide:
```ts
{
  url: `https://stack-init-dev.vercel.app/guides/${g.slug}`,
  lastModified: new Date(g.date),
  changeFrequency: 'monthly',
  priority: 0.7,
}
```

The `/guides` listing page itself gets `priority: 0.8`.

---

## Landing page navbar

A "Guides" link is added to the landing page (`src/app/page.tsx`) navbar, between the status badge and the "Open wizard" CTA.

---

## What is NOT in scope

- Search or filter on the listing page
- Comments or reactions
- RSS feed
- CMS or admin interface
- Auth
