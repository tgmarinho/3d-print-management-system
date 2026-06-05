import { createClient } from "@/lib/supabase/server";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "status"
  | "priority"
  | "stock"
  | "payment";

export type AuditInput = {
  actorId: string | null;
  action: AuditAction;
  entityType: string;
  entityId: string | null;
  details?: Record<string, unknown>;
};

export type AuditEntry = {
  actor_id: string | null;
  action: AuditAction;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
};

export function buildAuditEntry(input: AuditInput): AuditEntry {
  return {
    actor_id: input.actorId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId,
    details: input.details ?? {},
  };
}

// Persiste a entrada. Chame de server actions após a ação principal.
export async function logAudit(input: Omit<AuditInput, "actorId">): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const entry = buildAuditEntry({ ...input, actorId: user?.id ?? null });
  await supabase.from("audit_log").insert(entry);
}
