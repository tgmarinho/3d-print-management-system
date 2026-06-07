# Mobile Responsive Checklist (lean)

Short version to paste into an issue/Notion. Check `[x]`. Details and acceptance
criteria in the [full test plan](./001-plano-testes-mobile-responsivo.md).

**Build:** `_____` · **Device/viewport:** `_____` · **Tester:** `_____`

### Cross-cutting (every screen, 375 px)
- [ ] No horizontal scroll (320/375/430 px)
- [ ] Touch targets ≥ 44px
- [ ] Bottom nav does not cover content (+ iOS safe area)
- [ ] Sticky header OK
- [ ] Light and dark theme legible
- [ ] Toasts visible (not behind the nav)
- [ ] Landscape does not break

### Navigation
- [ ] 5 tabs fit in 320 px, correct active tab
- [ ] "Sign out" logs out → `/login`

### Login
- [ ] Keyboard does not cover submit; sign-in ↔ sign-up OK

### Dashboard
- [ ] Cards stack; values do not overflow
- [ ] Realtime updates without reload

### Orders
- [ ] Filters (payment/production) + search usable
- [ ] Paid/to pay toggle with toast; "To receive" correct
- [ ] Form: client combobox with non-clipped menu + quick-create
- [ ] Numeric keyboard for quantity/value; save accessible
- [ ] Production status (Waiting/Printing/Completed) tappable

### Queue
- [ ] Touch drag reorders; scroll does not trigger drag
- [ ] Top/bottom buttons work (disabled on first/last)
- [ ] Optimistic state + realtime without "snapping"

### Records
- [ ] Hub: 7 items tappable
- [ ] Clients: search + form (email/tel keyboard)
- [ ] Filaments/Stock: "low stock" badge, realtime, per-location management
- [ ] Products / Locations / Users: forms usable

### Audit
- [ ] List legible in 1 column (no wide table)

### Non-functional
- [ ] No console errors while navigating
- [ ] Loads in < ~3s on simulated 3G

### Release gate
- [ ] Critical flows completable with the thumb only on a real device
- [ ] No P0/P1 open
