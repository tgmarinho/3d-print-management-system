import { History } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  actionLabel,
  entityTypeLabel,
  parseAuditFilters,
} from "@/lib/audit-log";
import { Badge } from "@/components/ui/badge";
import { AuditFilters } from "./audit-filters";

// Quantas entradas trazer por vez — log cresce indefinidamente; sem paginação no MVP.
const PAGE_SIZE = 200;

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
});

type AuditRow = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ entity?: string | string[]; action?: string | string[] }>;
}) {
  const filters = parseAuditFilters(await searchParams);
  const supabase = await createClient();

  let query = supabase
    .from("audit_log")
    .select("id, actor_id, action, entity_type, entity_id, details, created_at")
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE);

  if (filters.entityType) query = query.eq("entity_type", filters.entityType);
  if (filters.action) query = query.eq("action", filters.action);

  const { data, error } = await query;
  const rows = (data ?? []) as AuditRow[];

  // audit_log.actor_id aponta para auth.users; o nome vive em profiles.
  // Não há FK direta para embedding, então resolvemos os nomes num passo à parte.
  const actorIds = [...new Set(rows.map((r) => r.actor_id).filter(Boolean))];
  const namesById = new Map<string, string>();
  if (actorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name")
      .in("id", actorIds as string[]);
    for (const profile of profiles ?? []) {
      namesById.set(profile.id as string, profile.name as string);
    }
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Histórico de ações</h1>
        <p className="text-sm text-muted-foreground">
          Quem fez o quê, em qual cadastro e quando.
        </p>
      </div>

      <AuditFilters filters={filters} />

      {error ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-10 text-center">
          <History className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {filters.entityType || filters.action
              ? "Nenhuma ação para esse filtro."
              : "Nenhuma ação registrada ainda."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((row) => {
            const actor =
              row.actor_id !== null
                ? (namesById.get(row.actor_id) ?? "Usuário removido")
                : "Sistema";
            return (
              <li
                key={row.id}
                className="rounded-xl bg-card px-3 py-3 text-card-foreground ring-1 ring-foreground/10"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-sm">
                      <span className="font-medium">{actor}</span>
                      <Badge variant="secondary" className="font-normal">
                        {actionLabel(row.action)}
                      </Badge>
                      <span className="text-muted-foreground">
                        {entityTypeLabel(row.entity_type)}
                      </span>
                    </div>
                    {row.details && Object.keys(row.details).length > 0 ? (
                      <p className="truncate text-xs text-muted-foreground">
                        {Object.entries(row.details)
                          .map(([key, value]) => `${key}: ${String(value)}`)
                          .join(" · ")}
                      </p>
                    ) : null}
                  </div>
                  <time
                    dateTime={row.created_at}
                    className="shrink-0 whitespace-nowrap text-xs tabular-nums text-muted-foreground"
                  >
                    {dateFormatter.format(new Date(row.created_at))}
                  </time>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
