// Consulta do log de auditoria: rótulos em PT-BR e validação de filtros.
// Lógica pura (sem I/O), testável isolada — espelha `audit.ts`, que escreve o log.
// A página de auditoria usa estes helpers para traduzir e filtrar as entradas.
import type { AuditAction } from "./audit";

// entity_type é text livre no banco; mapeamos os tipos que a app realmente grava.
export const AUDIT_ENTITY_LABELS: Record<string, string> = {
  client: "Cliente",
  product: "Produto",
  filament: "Filamento",
  stock_location: "Local de estoque",
  seller: "Vendedor",
  modeler: "Modelador",
  order: "Pedido",
};

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  create: "Criou",
  update: "Atualizou",
  delete: "Removeu",
  status: "Mudou status",
  priority: "Mudou prioridade",
  stock: "Ajustou estoque",
  payment: "Registrou pagamento",
};

export function entityTypeLabel(type: string): string {
  return AUDIT_ENTITY_LABELS[type] ?? type;
}

export function actionLabel(action: string): string {
  return AUDIT_ACTION_LABELS[action as AuditAction] ?? action;
}

export type AuditFilterOption = { value: string; label: string };

// Opções dos selects de filtro, derivadas dos mesmos rótulos.
export const AUDIT_ENTITY_OPTIONS: AuditFilterOption[] = Object.entries(
  AUDIT_ENTITY_LABELS,
).map(([value, label]) => ({ value, label }));

export const AUDIT_ACTION_OPTIONS: AuditFilterOption[] = Object.entries(
  AUDIT_ACTION_LABELS,
).map(([value, label]) => ({ value, label }));

export type AuditFilters = {
  entityType: string | null;
  action: string | null;
};

type RawParam = string | string[] | undefined;

function firstValue(param: RawParam): string | undefined {
  return Array.isArray(param) ? param[0] : param;
}

// Valida os searchParams contra os tipos/ações conhecidos; descarta o resto.
export function parseAuditFilters(params: {
  entity?: RawParam;
  action?: RawParam;
}): AuditFilters {
  const entity = firstValue(params.entity);
  const action = firstValue(params.action);
  return {
    entityType: entity && entity in AUDIT_ENTITY_LABELS ? entity : null,
    action: action && action in AUDIT_ACTION_LABELS ? action : null,
  };
}
