import { expect, test } from "bun:test";
import { buildAuditEntry } from "./audit";

test("buildAuditEntry monta a entrada com actor, ação e entidade", () => {
  const entry = buildAuditEntry({
    actorId: "user-1",
    action: "status",
    entityType: "order",
    entityId: "order-9",
    details: { from: "waiting", to: "producing" },
  });
  expect(entry).toEqual({
    actor_id: "user-1",
    action: "status",
    entity_type: "order",
    entity_id: "order-9",
    details: { from: "waiting", to: "producing" },
  });
});

test("buildAuditEntry usa details vazio por padrão", () => {
  const entry = buildAuditEntry({
    actorId: null,
    action: "create",
    entityType: "client",
    entityId: "c-1",
  });
  expect(entry.details).toEqual({});
});
