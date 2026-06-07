# AGENTS.md

Conventions for AI agents (Claude Code, Codex, Copilot, Gemini, etc.) working in
this repository. For Claude Code–specific guidance, see also
[`CLAUDE.md`](./CLAUDE.md).

## About the project

**3D Print Management System** — management for an on-demand 3D modeling and
printing operation, covering **clients**, **filament stock**, and **production**
(quotes, demand queue, statuses). See the [`README.md`](./README.md) for the
overview and the [PRD](./docs/prd/001-gestao-impressao-3d.md) for the full scope.

> **Closed, single-tenant product** for one company — not a multi-tenant SaaS
> (despite the name). It is an **internal system of record**: only the ~3 business
> owners use it, all as administrators (no RBAC); the end customer never logs in.
> Client, seller, and modeler are **data**, not users.

## Stack

- **Next.js 16 (App Router)** + React 19 + **TypeScript** (strict)
- **Supabase / PostgreSQL** for data, authentication, and Realtime
- **Tailwind CSS v4** + shadcn components (on `@base-ui/react`) + `lucide-react`
- Deployed on **Vercel**
- **Mobile-first web** — a native app (React Native/Expo) is **out of scope**;
  mobile-first web is enough
- **Bun** as package manager and runtime (use `bun`, not `npm`/`yarn`/`pnpm`;
  lockfile `bun.lock`)

## Working principles

1. **TDD** — write the test before production code. Don't mark a task done
   without passing tests.
2. **Verify before completing** — run build, typecheck, and tests; confirm the
   real behavior, not just that the code compiles.
3. **Systematic debugging** — find the root cause before fixing; no superficial
   patches.
4. **Plan before large changes** — for multi-step tasks, outline a plan before
   implementing.
5. **Small, reviewable changes** — prefer focused PRs.

## PRD & SPEC

Non-trivial work goes through two documents, at different altitudes:

- **PRD** (product) — *what* and *why*. Problem statement, the solution from the
  user's perspective, user stories, product decisions. **No** file paths or
  snippets. Stable; rarely changes. Lives in `docs/prd/`. Skill: `to-prd`.
- **SPEC** (technical, for agents) — *how*. Files to touch, interfaces, schema,
  and bite-sized TDD tasks (2–5 min) ready for an agent to implement. Volatile;
  disposable after merge. Lives in `docs/specs/`. Skill: `writing-plans`.

Flow: `PRD → (slice into issues) → SPEC → execute`. One PRD can produce several
SPECs (one per subsystem). Each SPEC should produce working, testable software on
its own.

Name PRDs with sequential numbering — `NNN-<feature>.md` (the first is
[`docs/prd/001-gestao-impressao-3d.md`](./docs/prd/001-gestao-impressao-3d.md)).
Use the templates in `docs/prd/TEMPLATE.md` and `docs/specs/TEMPLATE.md`. An HTML
version of the PRD (to present to the client) may accompany the `.md`.

Quick rule: align **scope/value** with a stakeholder → PRD; I already know the
*what* and want **step-by-step code** → SPEC.

## Code conventions

- **Language:** TypeScript in strict mode; avoid `any`.
- **Components:** follow React composition patterns (children instead of render
  props, avoid excessive boolean props, no `forwardRef` in React 19).
- **Forms:** use **React Hook Form + Zod** (via `@hookform/resolvers`) where it
  makes sense — any form with non-trivial validation, state, or submit. The Zod
  schema is the source of truth for validation (use `z.infer` for the type), and
  when the submit is a Server Action, **re-validate on the server with the same
  schema** — never trust client validation alone. For simple `<input>` fields with
  no validation, don't force the setup. For advanced selects (search/async/multi),
  combine with `react-select`; for simple selects, shadcn's `Select` is enough.
  Canonical example (schema → action → form) in
  [`docs/conventions/forms.md`](./docs/conventions/forms.md).
- **Style:** stay consistent with existing code — mirror names, comment density,
  and the language of the surrounding file.
- **Database:** follow Postgres/Supabase best practices (RLS, indexes, connection
  pooling). Never expose service keys to the client.
- **Secrets:** never commit `.env`/keys. Use `.env.local`.

## Git and PRs

- Work on **branches**; never commit directly to `main`.
- Target branch for diffs and PRs: `main` (`git diff origin/main...`,
  `gh pr create --base main`).
- Commit/push only when asked.
- Clear, imperative commit messages.

## Available skills

The `.agents/skills/` directory provides reusable skills (registered in
`skills-lock.json`). Highlights:

- **Superpowers** — `brainstorming`, `writing-plans`, `executing-plans`,
  `subagent-driven-development`, `dispatching-parallel-agents`,
  `systematic-debugging`, `test-driven-development`,
  `verification-before-completion`, `requesting-code-review`,
  `receiving-code-review`, `finishing-a-development-branch`,
  `using-git-worktrees`, `writing-guidelines`.
- **Vercel** — `deploy-to-vercel`, `vercel-react-best-practices`,
  `vercel-composition-patterns`, `vercel-react-native-skills`,
  `vercel-react-view-transitions`, `vercel-optimize`, `web-design-guidelines`.
- **Supabase** — `supabase`, `supabase-postgres-best-practices`.
- **Matt Pocock** — `to-prd`, `to-issues` (PRD/SPEC flow), `caveman` (compressed
  response mode).
- **UI/UX** — `ui-ux-pro-max` (design intelligence for web/mobile: styles,
  palettes, typography, UX rules, and charts). The per-domain search scripts
  (`scripts/search.py --design-system`) require **Python 3**.

Read the corresponding `SKILL.md` before applying each one.

## Language

The application UI is in **Portuguese (pt-BR)** for a Brazilian business, so route
folder names and user-facing strings are in Portuguese. Code identifiers, comments,
and documentation are in **English**. Communicate with the maintainer in the
language they write in.
