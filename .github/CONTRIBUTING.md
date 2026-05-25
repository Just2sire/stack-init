# Contributing to Stack-Init

First off, thank you for taking the time to contribute! 🎉

This guide is written for **first-time contributors** as well as seasoned developers. Take your time, ask questions freely, and don't worry about making mistakes — that's what reviews are for.

---

## Table of Contents

1. [Before You Start](#before-you-start)
2. [Finding an Issue to Work On](#finding-an-issue-to-work-on)
3. [Setting Up Your Development Environment](#setting-up-your-development-environment)
4. [Making Your Changes](#making-your-changes)
5. [Opening a Pull Request](#opening-a-pull-request)
6. [The Review Process](#the-review-process)
7. [Reporting a Bug](#reporting-a-bug)
8. [Suggesting a Feature](#suggesting-a-feature)

---

## Before You Start

**You'll need:**

- [Node.js](https://nodejs.org/) v18 or later
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- [Git](https://git-scm.com/)
- A [GitHub account](https://github.com/)

**Helpful to know:**

- Stack-Init is a Next.js application (App Router)
- State is managed with [Zustand](https://docs.pmnd.rs/zustand)
- UI components use [Radix UI](https://www.radix-ui.com/) + [Tailwind CSS v4](https://tailwindcss.com/)
- All code generation happens **client-side** — no server involved

You don't need to understand every part of the codebase to contribute. Most issues are self-contained.

---

## Finding an Issue to Work On

### Step 1 — Browse the issues

Go to the [Issues tab](../../issues) on GitHub. You'll see a list of open issues.

### Step 2 — Filter by label

Look for these labels:

| Label | What it means |
|---|---|
| `good first issue` | Small, well-defined task — perfect if this is your first contribution |
| `help wanted` | The maintainer is looking for help — any experience level welcome |
| `bug` | Something is broken |
| `enhancement` | A new feature or improvement |
| `documentation` | Fixes or additions to docs — great for non-code contributions |

### Step 3 — Claim the issue

Leave a comment like: *"I'd like to work on this — I'll start this week."*

The maintainer will assign it to you so no one duplicates the effort.

> **Tip:** If an issue has been assigned to someone for more than 2–3 weeks with no activity, it's usually fine to ask if it's still being worked on.

---

## Setting Up Your Development Environment

### 1. Fork the repository

Click the **Fork** button at the top right of this page. This creates your own copy of the repo under your GitHub account.

### 2. Clone your fork

```bash
git clone https://github.com/YOUR_USERNAME/stack-init.git
cd stack-init
```

### 3. Add the upstream remote

This lets you pull in future updates from the original repo:

```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/stack-init.git
```

### 4. Install dependencies

```bash
pnpm install
```

### 5. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the Stack-Init wizard.

---

## Making Your Changes

### 1. Create a branch

Never work directly on `main`. Create a descriptive branch for your change:

```bash
git checkout -b fix/yaml-duplicate-timeout
# or
git checkout -b feat/copy-yaml-button
# or
git checkout -b docs/add-field-type-descriptions
```

Branch naming convention:
- `fix/` — bug fixes
- `feat/` — new features
- `docs/` — documentation changes
- `refactor/` — code cleanup without behavior change
- `test/` — adding or fixing tests

### 2. Make your changes

Edit the relevant files. Key directories:

```
src/
├── components/wizard/steps/   # Each wizard step UI
├── lib/generator/             # Code generators (express.ts, nextjs.ts, etc.)
├── stores/useWizardStore.ts   # Global wizard state
└── types/schema.ts            # ProjectConfig type definitions
```

### 3. Check your work

```bash
# TypeScript type check
npx tsc --noEmit

# Lint
pnpm lint
```

Open the app in your browser and manually test the flow related to your change.

### 4. Commit your changes

Write clear, concise commit messages:

```bash
git add src/components/wizard/steps/ModelsStep.tsx
git commit -m "feat: add copy-to-clipboard button on YAML preview"
```

Commit message format: `type: short description` (50 chars max for the first line)

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

---

## Opening a Pull Request

### 1. Push your branch

```bash
git push origin fix/your-branch-name
```

### 2. Open a PR on GitHub

Go to your fork on GitHub. You'll see a **"Compare & pull request"** button. Click it.

Fill in the PR description:
- **What does this change?** — A short summary
- **Why?** — What problem does it solve or what issue does it close?
- **How to test it?** — Steps for the reviewer to verify your change works

Example:
```
Closes #42

## What
Added a copy-to-clipboard button to the YAML preview panel.

## Why
Users had to manually select and copy the YAML text, which was error-prone.

## How to test
1. Run the wizard and reach the generation step
2. Select a YAML-based stack (Laravel)
3. Click the copy button in the preview panel
4. Paste in a text editor — the YAML should be complete and valid
```

### 3. Link the issue

In the description, write `Closes #ISSUE_NUMBER` (e.g., `Closes #12`). GitHub will automatically close the issue when the PR is merged.

---

## The Review Process

After opening a PR:

1. A maintainer will review your code — this usually takes a few days
2. They may leave comments or request changes — this is normal and not personal
3. Make the requested changes in new commits on the same branch — no need to open a new PR
4. Once approved, the maintainer will merge your PR

**Your PR will be merged faster if:**
- It's focused on one thing (small PRs are easier to review)
- It includes a clear description
- The code follows existing patterns in the codebase
- TypeScript compiles without errors

---

## Reporting a Bug

Use the **Bug Report** issue template. Include:

- What you did (steps to reproduce)
- What you expected to happen
- What actually happened
- Screenshots if relevant
- Your browser and OS

> The more detail you provide, the faster it can be fixed.

---

## Suggesting a Feature

Use the **Feature Request** issue template. Explain:

- The problem you're trying to solve
- How you imagine the solution working
- Any alternatives you considered

Feature suggestions are always welcome, even if they're not immediately implemented.

---

## Questions?

If you're stuck at any point, open a [Discussion](../../discussions) or leave a comment on the relevant issue. No question is too small.

Happy contributing! 🚀
