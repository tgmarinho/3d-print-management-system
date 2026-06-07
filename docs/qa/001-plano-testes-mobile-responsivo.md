# Test Plan — Mobile Responsive (QA)

QA test plan to validate the quality of the **mobile responsive version** of the
3D Print SaaS Management System. The product is **mobile-first** (fixed bottom
nav, `max-w-3xl` container, no native app), so the phone is the primary
scenario — not an edge case.

> How to use: run section by section, mark ✅/❌/➖ (n/a) on each item, and record
> the actual result (screenshot, observed behavior). Bug found → log it in the
> "Defect log" at the end of the document.

---

## 1. Scope and environment

**Build under test:** branch `_____` · commit `_____` · date `_____`
**Tester:** `_____`

**How to start the app:**

```bash
bun install
bun run dev   # http://localhost:3000
```

**Data prerequisites:** have in the database at least — 3 clients, 2 sellers,
2 modelers, 3 products, 3 filaments (1 with low stock), 2 locations and
5 orders in varied statuses (to pay/paid, waiting/printing/completed).
This ensures lists with scroll, badges and filters with real content.

### 1.1 Device and viewport matrix

Test on at least **one real device** (iOS Safari **and** Android Chrome if
possible) + DevTools for the breakpoints. Target widths:

| Range | Width | Represents | Priority |
|---|---|---|---|
| Small mobile | **320 px** | iPhone SE / old Galaxy | High |
| Standard mobile | **375–390 px** | iPhone 12–15, Pixel | **Critical** |
| Large mobile | **414–430 px** | iPhone Pro Max | High |
| Tablet portrait | **768 px** | iPad | Medium |
| Container limit | **≥ 768 px** | desktop (`max-w-3xl` kicks in) | Medium |

**Browsers:** Safari iOS, Chrome Android, Chrome desktop (DevTools device
mode). Bonus: Firefox.

**Conditions:** portrait and landscape; light **and** dark theme (next-themes
follows the system — toggle the OS preference); slow 3G network (DevTools
throttling) to observe loading/realtime.

---

## 2. Cross-cutting checklist (applies to all screens)

Run this block on each main screen, at the critical viewport (375 px):

- [ ] **No horizontal scroll** — nothing "leaks" beyond the screen width at 320/375 px.
- [ ] **Touch targets ≥ 44×44 px** — buttons, tabs, action icons, drag handle.
- [ ] **Legible text** without zoom (≥ 14–16 px for body; no truncation that hides essential info).
- [ ] **Bottom nav does not cover content** — last list item/CTA reachable above the fixed bar (enough bottom padding).
- [ ] **iOS safe area** — bottom nav respects the notch/home indicator (not flush against the edge nor clipped).
- [ ] **Sticky header** works — stays fixed on scroll, with backdrop blur, without overlapping content.
- [ ] **Focus/touch states** visible (feedback when tapping buttons).
- [ ] **Dark theme** — contrast OK, no invisible text, badges and inputs legible.
- [ ] **Loading/empty states** — empty lists show a friendly message, not a broken screen.
- [ ] **Toasts (sonner)** appear visible and not behind the bottom nav.
- [ ] **Landscape orientation** — layout does not break when rotated.

---

## 3. Navigation (bottom nav + header)

Files: `src/components/bottom-nav.tsx`, `src/app/(app)/layout.tsx`

- [ ] The 5 tabs (Home, Stock, Orders, Queue, Records) fit within 320 px width without squeezing/breaking icon+label.
- [ ] Active tab highlighted correctly on each route.
- [ ] **Active item by most specific prefix**: when entering `/cadastros/filamentos/[id]`, it highlights **Records** (and "Stock" when reached through that entry point) consistently.
- [ ] "Stock" and "Records" point to the correct destinations (Stock → filaments).
- [ ] Header: logo "3D·PRINT" visible; **Sign out** button accessible and with an adequate touch target.
- [ ] **Sign out** button actually logs out and redirects to `/login`.
- [ ] Navigation between tabs is smooth (no odd flash/reload).
- [ ] Browser back/back gesture keeps the correct tab highlighted.

---

## 4. Login (`/login`)

- [ ] Form centered and legible at 320/375 px.
- [ ] **Sign-in ↔ sign-up** toggle works and does not break the layout.
- [ ] Virtual keyboard does not cover the submit button (the field scrolls into view on focus).
- [ ] Email/password inputs with the correct `type` (email keyboard; password masked).
- [ ] Credential errors displayed legibly.
- [ ] Browser autofill/password manager works.

---

## 5. Dashboard (`/dashboard`)

Realtime: `filament_stock`, `filaments`, `orders`

- [ ] Cards/sections (low stock, queue, production, pending payments, history) stack well in 1 column on mobile.
- [ ] Numbers/values do not overflow the card; R$ values formatted.
- [ ] Status badges legible (light and dark).
- [ ] Long lists scroll properly; nothing clipped by the bottom nav.
- [ ] **Realtime**: changing stock/order in another tab/session reflects here without manual reload (test with throttling to observe).
- [ ] Card links lead to the correct screen (e.g. low stock → filaments).

---

## 6. Orders

### 6.1 List (`/pedidos`) — `orders-list.tsx`

- [ ] **Payment** filter (All / To pay / Paid) usable with the thumb.
- [ ] **Production status** filter (All / Waiting / Printing / Completed) fits within the width without breaking.
- [ ] Search by client/product filters in real time.
- [ ] Order cards legible: client, product, value, status badges.
- [ ] **Mark as paid/to pay** toggle (Check/RotateCcw) with OK touch target and feedback (toast).
- [ ] **"To receive"** summary sums correctly and is visible.
- [ ] Combining filters + search does not break (coherent result / empty state).

### 6.2 New / Edit (`/pedidos/novo`, `/pedidos/[id]`) — `order-form.tsx`

- [ ] **EntityCombobox (Client)**: opens, searches, and the **menu is not clipped** by the container nor by the bottom nav (portal menu).
- [ ] **Inline quick-create**: register a new client inside the combobox; validates duplicate name; returns selected.
- [ ] Same behavior for **Seller** and **Modeler** (clearable works).
- [ ] **Product Select** opens the phone's native picker correctly.
- [ ] Numeric keyboard appears for **Quantity** and **Value** (number inputs).
- [ ] Description textarea expands/scrolls well; keyboard does not cover the field.
- [ ] **Save** button always accessible (not behind the keyboard/bottom nav).
- [ ] Validation (RHF + Zod) shows legible errors below the fields.
- [ ] **ProductionStatusControl** (Waiting/Printing/Completed) — tappable segments, optimistic state, toast.
- [ ] **Delete** button (in edit) with confirmation; OK touch target.
- [ ] Saving redirects/updates the list correctly.

---

## 7. Queue (`/fila`) — `queue-list.tsx`

Critical for mobile (touch drag-and-drop).

- [ ] **Touch drag-and-drop** reorders (PointerSensor, 6 px distance avoids triggering on accidental touch/scroll).
- [ ] Vertical list scroll does **not** trigger a drag by mistake.
- [ ] Drag handle (GripVertical) with touch target ≥ 44 px.
- [ ] **"Move to top"** (ChevronsUp) and **"Move to bottom"** (ChevronsDown) buttons work as an alternative to dragging.
- [ ] The correct buttons are **disabled** on the first/last item.
- [ ] **Optimistic state**: order changes instantly; does not "snap" back.
- [ ] **Realtime**: reordering in another session reflects here without overwriting a drag in progress.
- [ ] Rank/position displayed correctly after reordering.
- [ ] Long list: items do not end up under the bottom nav; smooth scroll.

---

## 8. Records (hub and entities)

### 8.1 Hub (`/cadastros`)

- [ ] Menu with the 7 entities in tappable cards/list; no overflow.
- [ ] Each item leads to the correct screen.

### 8.2 Clients (`/cadastros/clientes` + new/`[id]`)

- [ ] **Search** filters by name, company, email and phone.
- [ ] Cards with initials avatar + inline data legible (no ugly wrapping at 320 px).
- [ ] New/edit form: fields (name*, company, email, phone) with the correct `type` and keyboard (email/tel).
- [ ] Deletion with confirmation.

### 8.3 Products (`/cadastros/produtos` + new/`[id]`)

- [ ] List: name + truncated description (2 lines) without breaking the layout.
- [ ] Form: name*, description (textarea) usable on mobile.

### 8.4 Filaments / Stock (`/cadastros/filamentos` + new/`[id]`)

Realtime: `filament_stock`, `filaments` · This is also the **"Stock"** tab.

- [ ] List shows color + material, brand + weight, **"Low stock" badge**, roll counter.
- [ ] **Realtime** stock reflects live changes.
- [ ] Form: color*, material*, brand, weight (number), low-stock threshold (number) — correct keyboards.
- [ ] **Per-location stock manager** (in edit) usable on mobile: adjust quantity per location without a broken layout.

### 8.5 Locations (`/cadastros/locais`)

- [ ] Create/edit/remove a stock location (home, store) with OK touch targets.

### 8.6 Users (`/cadastros/usuarios`)

- [ ] User list legible.
- [ ] Create a user with a temporary password — form usable on mobile.

---

## 9. Audit (`/auditoria`)

- [ ] List (actor, action/badge, entity, details, timestamp) legible in 1 column on mobile — no wide table forcing horizontal scroll.
- [ ] Filters usable with the thumb.
- [ ] Timestamps formatted legibly.

---

## 10. Non-functional

- [ ] **Performance**: main screens load in < ~3 s on simulated 3G; no jank when scrolling long lists.
- [ ] **No console errors** (hydration warnings, React keys, layout shift) while navigating the app.
- [ ] **Resilient realtime**: losing/reconnecting the network neither duplicates nor loses updates.
- [ ] **Basic accessibility**: screen reader navigation on the main action buttons; ARIA labels present (queue, combobox); AA contrast.
- [ ] **No perceptible layout shift** when loading images/badges/realtime.
- [ ] **PWA/zoom**: pinch-to-zoom does not break; viewport meta does not improperly block accessibility.

---

## 11. Acceptance criteria (release gate)

The mobile version is approved when:

1. **Zero** horizontal scroll and **zero** content covered by the bottom nav at 320/375/430 px widths.
2. All critical flows completable **with the thumb only** on a real device: create order (with client quick-create), reorder queue, mark paid, adjust stock.
3. Combobox and selects open with the menu **fully visible** (not clipped).
4. Realtime updates dashboard/stock/queue without a manual reload.
5. Light and dark theme with no illegible text.
6. **No blocking bugs (P0/P1)** open. P2/P3 documented and accepted.

---

## 12. Defect log

| # | Screen / component | Viewport | Severity (P0–P3) | Description | Steps to reproduce | Status |
|---|---|---|---|---|---|---|
| 1 |  |  |  |  |  |  |
| 2 |  |  |  |  |  |  |

**Severity:** P0 = blocks usage · P1 = breaks an important flow · P2 = degrades UX ·
P3 = cosmetic.

---

## Appendix — Quick smoke test script (≈ 10 min)

For a quick sanity check on each build, on **1 real device (375 px)**:

1. Login → Dashboard loads with data and realtime.
2. Bottom nav: walk through the 5 tabs, no overflow.
3. Orders → New → client combobox + **quick-create** → save.
4. Queue → reorder by **drag** and by **top/bottom buttons**.
5. Orders → mark one as **paid** (toast).
6. Stock → open a filament → adjust quantity per location.
7. Toggle **dark theme** and review contrast.
8. Rotate to **landscape** on a list screen.
