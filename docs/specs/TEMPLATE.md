# [Feature Name] — Implementation SPEC

> **Altitude: technical.** How to build it. Assumes an agent with no context of
> the codebase. Volatile — disposable after merge. Derived from a PRD in
> `docs/prd/`. Skill: `writing-plans`. Execute with
> `subagent-driven-development` or `executing-plans`.

**Source PRD:** [docs/prd/YYYY-MM-DD-feature.md](../prd/YYYY-MM-DD-feature.md)
**Goal:** [one sentence on what this builds]
**Architecture:** [2–3 sentences on the approach]
**Tech Stack:** [main technologies/libraries]

---

## File Structure

Which files will be created/modified and the responsibility of each. One
responsibility per file; what changes together lives together.

| File | Responsibility |
| --- | --- |
| `path/to/file.ts` | … |

## Tasks

Each step is an action (2–5 min), in TDD order. Use checkboxes for tracking.

### Task 1: [name]

- [ ] Write the failing test
- [ ] Run it and confirm it fails
- [ ] Implement the minimum to pass
- [ ] Run the tests and confirm green
- [ ] Commit

### Task 2: [name]

- [ ] …

## Verification

How to prove it really works: commands (build/lint/test) and the expected
observable behavior.
