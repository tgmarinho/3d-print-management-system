# CLAUDE.md

Guide for **Claude Code** working in this repository. The general conventions
(valid for any agent) live in [`AGENTS.md`](./AGENTS.md); this file covers only
what is specific to Claude Code. The product overview is in the
[`README.md`](./README.md).

## Project

**3D Print Management System** — management of **clients**, **filament stock**,
and **production** for an on-demand 3D printing operation. It is a **closed,
single-tenant product**, an internal system of record: only the business owners
use it, all as administrators; the end customer never logs in. Full scope in the
[PRD](./docs/prd/001-gestao-impressao-3d.md).

Stack: **Next.js 16 (App Router) + React 19 + TypeScript**, **Supabase/PostgreSQL**
(Auth + RLS + Realtime), **Tailwind v4** + shadcn components (on `@base-ui/react`)
and `lucide-react` icons, deployed on **Vercel**, **mobile-first web** (no native
app). Package manager and runtime: **Bun**.

## Architecture

- **Routes** in `src/app`:
  - `page.tsx` — public landing (`/`) with the product vision and a sign-in button.
  - `(auth)/login` — sign in / sign up via Supabase Auth (Server Actions).
  - `(app)/*` — authenticated area (the `layout.tsx` redirects to `/login` when
    there is no user): `dashboard`, `pedidos` (orders), `fila` (drag-and-drop
    queue with `@dnd-kit`), `cadastros` (clients, products, filaments, locations,
    users), and `auditoria` (audit log).
- **Domain** in `src/lib/*.ts` (e.g. `orders.ts`, `filaments.ts`, `clients.ts`,
  `queue.ts`, `audit.ts`) — each with a `*.test.ts` alongside it.
- **Supabase** in `src/lib/supabase/`: `server.ts` (RSC/Server Actions),
  `client.ts` (browser), `middleware.ts` (session refresh), `admin.ts`
  (service role — server only), `realtime.ts`.
- **Mutations** via **Server Actions** (`actions.ts` per route); the UI updates
  in real time via Realtime (`realtime-refresh.tsx`).
- **Schema** in `supabase/migrations/` (tables, RLS, indexes, Realtime).

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the full write-up.

## Commands

```bash
bun install         # install dependencies
bun run dev         # development server (http://localhost:3000)
bun run build       # production build
bun test            # tests (bun test)
bunx tsc --noEmit   # typecheck (there is no dedicated lint script)
```

> Use **Bun** as the package manager and runtime — do not use `npm`/`yarn`/`pnpm`.
> The lockfile is `bun.lock`. The real scripts live in `package.json`
> (`dev`/`build`/`start`/`test`); there is no `lint` — use `tsc --noEmit`.

## Expected workflow

1. **Plan** multi-step tasks before coding.
2. **TDD**: test first, then implementation.
3. **Verify** with build/typecheck/tests and confirm the real behavior.
4. **Systematic debugging**: find the root cause before fixing.
5. Work on a **branch**; PRs target `main`. Commit/push only when asked.

## Skills

There are local skills in `.agents/skills/` (lockfile in `skills-lock.json`) in
addition to the harness skills. Use them when applicable — for example
`test-driven-development`, `systematic-debugging`,
`supabase-postgres-best-practices`, `vercel-react-best-practices`,
`deploy-to-vercel`, and `ui-ux-pro-max` (UI/UX design; the per-domain search
scripts require Python 3). Read the `SKILL.md` before applying.

## Specific conventions

- **Strict TypeScript**; avoid `any`.
- **Forms: React Hook Form + Zod** (`@hookform/resolvers`) where it makes sense —
  any form with non-trivial validation/state/submit. The Zod schema is the source
  of truth (`z.infer` for the type); if the submit is a Server Action,
  **re-validate with the same schema on the server**. Trivial inputs don't need
  the setup. Advanced selects → `react-select`; simple selects → shadcn's
  `Select`. Canonical example in [`docs/conventions/forms.md`](./docs/conventions/forms.md).
- Mirror the style of surrounding code (names, language, comments).
- **Secrets**: use `.env.local`; never commit keys. Supabase service keys stay on
  the server.
- **`.context/`** is the agent collaboration area (gitignored) — use it for
  shared notes/todos.

## Language

The application UI is in **Portuguese (pt-BR)** for a Brazilian business, so route
folder names and user-facing strings are in Portuguese. Code identifiers, comments,
and documentation are in **English**. When replying to the maintainer, match the
language they write in.
