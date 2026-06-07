# 3D Printing Management System — PRD

> **Altitude: product.** The what and why, from the user's perspective. No file
> paths or code snippets (they age quickly). Generates one or more SPECs in
> `docs/specs/`. Skill: `to-prd`.

**Status:** proposal
**Author:** Thiago Marinho
**Date:** 2026-06-04

## Problem statement

The company does **on-demand 3D modeling and printing**: a client requests a
product, someone models it, someone prints it and delivers it. Today the control
is informal — filament stock and order progress live in a spreadsheet (or in the
partners' heads), which creates day-to-day friction:

- **Filament stock** (the raw material) is only known by asking "how much do you
  have over there?" from one person to another. There is no single, up-to-date
  source of truth for how much there is of each color, in each location, nor for
  what was purchased and is on its way.
- **Orders/quotes** have no common place. There is no visibility into who the
  client is, who sold it, who is modeling it, what the production status is,
  whether it is paid, and what the **demand queue** order is.
- Opening a spreadsheet on a computer is inconvenient — the work happens on your
  feet, on the phone, opening filament packages and running production.

## Solution

A **web, online, multi-user** application (mobile-first) that the company's
people access from their phones and see in **real time**. It is a **closed
product** for this company (not a multi-client SaaS).

It is an **internal system of record (back-office)**: it reflects what is already
happening in the business, fed **only by the company's people**. The end client
**does not access** the system — they do not register themselves nor request
quotes through it. The partners already arrive with the data in hand (agreed via
WhatsApp, in person, etc.) and **enter** it here. "Client", "seller" and
"modeler" are **data on an order**, not users who log in.

It covers two major business flows:

1. **Filament stock control** — knowing, at any moment and from anywhere, how
   much there is of each filament per location, and what is on order. Updating is
   one tap: you open a package, adjust the number, save, and everyone sees it
   instantly.

2. **Demand management (quotes → production)** — each order becomes a record with
   client, seller, modeler, product, amount, production status, payment status
   and **queue position** (prioritizable by dragging).

A **visual dashboard** summarizes the state of the business: low stock, current
queue, production in progress and pending payments.

## User stories

**Authentication and people**

1. As a company user, I want to register and log in, so that only authorized
   people access the system.
2. As an administrator, I want to manage (CRUD) the system's users, so that I
   control who has access.

**Client registry**

3. As an administrator, I want to register a client, so that I can link orders to
   them.
4. As a user, I want to list, search, edit and remove clients, so that the
   registry stays up to date.

**Seller and modeler registry**

5. As an administrator, I want to register sellers, so that I know who converted
   each sale.
6. As an administrator, I want to register modelers, so that I know who is
   responsible for the modeling of each order.
7. As a user, I want to list/edit/remove sellers and modelers, to keep the
   registries correct.

**Product registry**

8. As a user, I want to record the product the client ordered, so that the order
   describes what will be modeled and printed.
9. As a user, I want to reuse recurring products from a catalog (the same product
   can be used in orders from different clients), so I don't re-type items that
   repeat.

**Filament stock**

10. As a user, I want to register a filament with color, material, brand and
    weight, to identify the raw material I have.
11. As a user, I want to record the quantity in stock per location, to know how
    much there is in each place.
12. As a user, I want to record the quantity on order/incoming, to know what has
    already been purchased and is on its way.
13. As a user, I want to increase/decrease the quantity of a filament with one
    tap, to update stock quickly when opening or using a package.
14. As a user, I want to register and manage the stock locations, to reflect where
    the material is stored.
15. As a user on the phone, I want the other person to see my stock update in real
    time, so that nobody works with an outdated number.
16. As a user, I want to see which filaments are low on stock, to buy before
    running out.

**Quotes / orders**

17. As an administrator, I want to create a quote linking client, seller, modeler
    and product (with the quantity ordered), to record the demand.
18. As an administrator, I want to enter the quote amount, to track revenue.
19. As a user, I want to record the payment status (paid / unpaid), to know what I
    still need to collect.
20. As a user, I want to list, search, edit and remove quotes, to keep the
    operation organized.

**Production**

21. As an administrator, I want to set the production status of each order
    (waiting / producing / done), to track progress.
22. As a user, I want to see all orders in production, to know what is in progress
    right now.

**Demand queue**

23. As an administrator, I want to order the demand queue (1st, 2nd, 3rd...), to
    define production priority.
24. As an administrator, I want to move an order to the front or to the end of the
    queue, to handle urgencies or deprioritize orders.

**Payment**

25. As a user, I want to mark an order as paid, to control the financial flow.
26. As a user, I want to see orders with pending payment, to follow up on
    collection.

**Dashboard**

27. As an administrator, I want a visual dashboard with low stock, current queue,
    production in progress and pending payments, to have an at-a-glance overview
    of the business.

**Audit log**

28. As an administrator, I want every important action (registrations, status
    changes, priority, stock and payment) to be recorded with author and date, to
    have history and traceability.
29. As an administrator, I want to query the action history, to understand what
    changed, when and by whom.

## Product decisions

**Nature of the product**
- Closed product (single-tenant) for one company. No multi-tenant, plans or
  billing.
- Web, mobile-first, with real-time updates between users.

**Authentication and users**
- Normal user registration/login via **Supabase Auth**. User CRUD.
- **System users are only the company's people** (~3, the partners/owners). The
  end client, the seller and the modeler **are not users** — they neither access
  nor log in; they are merely **data** on an order.
- **No role distinction (no RBAC).** All users have an **administrator** profile
  and **full access** — anyone can register clients, sellers, modelers, products
  and filaments, change production status, reorder the queue, mark payment, etc.
  The simplicity is intentional.

**Audit log**
- **Every important action is recorded** (who did it, what, and when):
  creation/edition/removal of registrations, production status change, queue
  priority change, stock movement and payment change. It serves as history and
  traceability. (It replaces the idea of an isolated "stock history" — it becomes
  a single log of system actions.)

**Modules (conceptual)**
- Registries: Clients, Sellers, Modelers, Products, Filaments, Stock locations.
- Operation: Quotes, Production (status), Demand queue, Stock, Payment.
- View: Dashboard.

**Fields of the people registries**
- **Client**: name (required), company (optional), phone (optional), email
  (optional).
- **Seller**: name (required), phone (optional), email (optional).
- **Modeler**: name (required), phone (optional), email (optional).

**Filament**
- Fields: color, material, brand, weight. **`color` and `material` are
  required**; `brand` and `weight` are optional.
- Stock measured by **number of rolls** per location.
- Two numbers per filament/location: **in stock** and **on order/incoming**.
- Stock locations are **registrable** (it starts with the real locations and you
  can create more).
- **Low stock is configurable**: each filament has a minimum threshold defined by
  the user; below it, it enters the dashboard alerts.

**Product**
- **Reusable catalog** of recurring products — the same product can be used in
  orders from **different clients** (it does not belong to a client).
- It is also possible to describe a new product directly on the order.

**Quote / order**
- Links client, seller, modeler and product, with the **quantity** of the product
  ordered.
- Has an **amount** (R$) and a **payment status** (paid / unpaid).
- Has a **production status**: waiting / producing / done.
- Has a **queue position**, reorderable.

**Dashboard**
- **Visual only** for now (no advanced exports/reports). Shows low stock, current
  queue, production in progress and pending payments.

**Out of scope (for now)**
- **End-client portal / self-service** — the client does not access the system,
  does not register or request a quote through it. It is the company's internal
  record.
- Automatic calculation of filament cost on the quote (the client considered it
  irrelevant).
- Automatic stock deduction when printing (stock is updated manually in the MVP;
  stock↔production integration is left for v2).
- Payment installments/split, tax invoicing.
- Native mobile app (the mobile-first web suffices).
- Push/email notifications (low-stock alert only on the dashboard).

## Success metrics

- The partners stop asking "how much is over there?" — the stock in the system is
  the source of truth and stays up to date.
- Every order in progress exists in the system with a clear status and queue
  position.
- It is possible, at a glance on the phone, to know what to buy, what to produce
  and what to collect.
- The system replaces the spreadsheet in daily use.

## Open questions

- [x] **Product**: **reusable** catalog of recurring products (in addition to
      being able to describe new items per order). Confirmed by the client.
- [x] **Roles/permissions**: no RBAC (Role-Based Access Control). ~3 users, all
      administrators with full access to all actions. Intentional simplicity.
- [x] **History**: single audit log recording every important action (who, what,
      when). In scope.
- [x] **Filament**: `color` and `material` required; `brand` and `weight`
      optional.
- [x] **Low stock**: **configurable** threshold per filament (defined by the
      user); below it, it enters the dashboard alerts.
