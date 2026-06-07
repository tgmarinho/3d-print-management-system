# Execution results — Mobile QA (round 1)

Execution of the [test plan](./001-plano-testes-mobile-responsivo.md) via an
automated browser (Chrome) + DOM/code inspection, on `http://localhost:3000`.
Authenticated Supabase session; QA data present. Effective test viewport:
~485–500 px (mobile).

> **Environment note:** the viewport control and the dev server were unstable
> (resizes oscillating the width, server restarted a few times). The overflow
> measurement and the functional validation were done via DOM/JS — reliable and
> independent of the screenshot crop. The **pixel-faithful visual** validation at
> 320/375 px and the **touch drag-and-drop** still need to be confirmed on a real
> device / DevTools device mode.

## Screens tested

| Screen | Overflow-X | Bottom nav | Result |
|---|---|---|---|
| Dashboard | ✅ no | ✅ | OK |
| Orders (list) | ✅ no | ✅ | OK — filters, search and paid toggle work |
| Orders / New | ✅ no | ✅ | OK — combobox, quick-create, inputs |
| Queue | ✅ no | ✅ | OK — reorder via arrows |
| Records (hub) | ✅ no | ✅ | OK |
| Clients (list) | ✅ no | ✅ | OK — server-side search |
| Products | ✅ no | ✅ | OK |
| Filaments (list) | ✅ no | ✅ | OK |
| Filaments / Edit | ✅ no | ✅ | OK — per-location stock |
| Stock locations | ✅ no | ✅ | OK |
| **Users** | — | — | ❌ **does not load** (see ACH-06) |
| Audit | ✅ no | ✅ | OK — 1-column layout, filters |

## Validated flows (functional, with rollback)
- **Orders — production filter:** "Printing" filters correctly. ✅
- **Orders — paid toggle:** marking as paid updates the "To receive" summary
  (R$ 630 → R$ 130) and the counter; **reverted** to the original state. ✅
- **New Order — client combobox:** opens, searches ("Cli" → "Cliente Inline
  QA"), offers **quick-create** ("Register 'Cli'") and the **menu is not clipped**
  (`menuClipped:false`). ✅
- **New Order — inputs:** `quantity` (inputmode=numeric) and `amount`
  (inputmode=decimal) → numeric keyboard on mobile; native selects. ✅
- **Queue — reorder:** "move to bottom" and "move to top" work, ranks update,
  `disabled` states correct (first cannot move up, last cannot move down);
  **order restored**. ✅
- **Clients — search:** `?q=Cleide` filters server-side to 1 result. ✅
- **Filament — per-location stock:** "Stock per location · 8 in stock" with 3
  locations and −/+ steppers per location (In stock / Ordered). ✅
- **Audit:** the trail recorded the test's own actions ("Changed priority",
  "Recorded payment to:paid/unpaid"). ✅

## Findings

### ACH-01 — Bottom nav present and functional ✅ (not a bug)
Investigated after the observation of "missing menu on mobile". `<nav fixed
bottom-0 z-20>`, 5 items, clickable (hit-test). The *Home* item appears covered
by the **`NEXTJS-PORTAL`** overlay (the Next dev "N" button) — **disappears in the
production build**. Also confirmed via screenshot. `src/components/bottom-nav.tsx`.

### ACH-02 — Bottom nav without `safe-area-inset-bottom` (P2)
`bottom-nav.tsx:40` — `fixed bottom-0` without `pb-[env(safe-area-inset-bottom)]`.
On iPhones with a *home indicator* the icons may touch the edge / sit under the
home bar — **likely cause of "clipped/missing menu" on a real device**. Fix:
add safe-area-inset to the `<nav>` and to the layout container's padding-bottom.

### ACH-05 — Touch targets below 44 px (P2)
- Payment toggle (Orders): **32×32 px**.
- Move top/bottom arrows (Queue): **28×28 px**.
- Drag handle (Queue): **32 px** wide.
Below the recommended minimum (44×44). Increase the tappable area (padding/hit-area).

### ACH-06 — `/cadastros/usuarios` does not load: `SUPABASE_SERVICE_ROLE_KEY` empty
**Server** error: `Missing SUPABASE_SERVICE_ROLE_KEY` (`env.ts:22` →
`createAdminClient` → `UsuariosPage`). The key is **empty** (len=0) in `.env` and
`.env.local`. This is **local environment configuration** (the page uses the
Supabase Admin API), not a code bug — and the screen degrades with an error
boundary ("This page couldn’t load"). In production (Vercel) with the key
configured, it should work. **Action:** populate the service role key in the
local environment to test Users.

### ACH-03 — Audit outside the main navigation (P3 / UX)
`/auditoria` is only reachable via the "Action history" card at the bottom of the
Dashboard (it is not in the bottom nav nor in the Records hub). Accessible, but
low discoverability.

### False alarm logged — env error on filament edit
During the session, `/cadastros/filamentos/[id]` threw `Missing
NEXT_PUBLIC_SUPABASE_URL` on the client. **Cause: inconsistent Turbopack build
cache** after an abrupt dev server restart (the `.env.local` appeared mid-way).
Resolved with `rm -rf .next` + a clean restart. **Not a code bug.**

## Console
No hydration errors or React warnings on the tested screens. The only runtime
error: the empty `SUPABASE_SERVICE_ROLE_KEY` (ACH-06).

## Pending for real device / DevTools
Visual validation at 320/375 px, touch drag-and-drop on the Queue, dark theme
(support exists via next-themes + CSS variables), landscape orientation, and the
virtual keyboard not covering submit buttons.

## Summary
Navigation and main flows **work well on mobile**, with no horizontal overflow on
any screen. **No blocking code bugs.** Items to address:
**ACH-02** (safe-area — priority, explains the "missing menu" on the device),
**ACH-05** (touch targets), **ACH-06** (config: local service role key),
**ACH-03** (Audit discoverability).
