import { expect, test } from "bun:test";
import {
  actionLabel,
  entityTypeLabel,
  parseAuditFilters,
  AUDIT_ACTION_OPTIONS,
  AUDIT_ENTITY_OPTIONS,
} from "./audit-log";

test("entityTypeLabel traduz tipos conhecidos e cai no próprio valor quando desconhecido", () => {
  expect(entityTypeLabel("client")).toBe("Cliente");
  expect(entityTypeLabel("stock_location")).toBe("Local de estoque");
  expect(entityTypeLabel("widget")).toBe("widget");
});

test("actionLabel traduz ações conhecidas e cai no próprio valor quando desconhecida", () => {
  expect(actionLabel("create")).toBe("Criou");
  expect(actionLabel("delete")).toBe("Removeu");
  expect(actionLabel("foo")).toBe("foo");
});

test("parseAuditFilters aceita valores conhecidos", () => {
  expect(parseAuditFilters({ entity: "filament", action: "stock" })).toEqual({
    entityType: "filament",
    action: "stock",
  });
});

test("parseAuditFilters descarta valores desconhecidos ou ausentes", () => {
  expect(parseAuditFilters({ entity: "hacker", action: undefined })).toEqual({
    entityType: null,
    action: null,
  });
  expect(parseAuditFilters({})).toEqual({ entityType: null, action: null });
});

test("parseAuditFilters usa o primeiro valor quando vem repetido", () => {
  expect(
    parseAuditFilters({ entity: ["client", "product"], action: ["create"] }),
  ).toEqual({ entityType: "client", action: "create" });
});

test("as opções de filtro cobrem os mesmos rótulos", () => {
  expect(AUDIT_ENTITY_OPTIONS.find((o) => o.value === "order")?.label).toBe(
    "Pedido",
  );
  expect(AUDIT_ACTION_OPTIONS.find((o) => o.value === "payment")?.label).toBe(
    "Registrou pagamento",
  );
});
