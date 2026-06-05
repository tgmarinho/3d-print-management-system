"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";
import {
  AUDIT_ACTION_OPTIONS,
  AUDIT_ENTITY_OPTIONS,
  type AuditFilters,
} from "@/lib/audit-log";
import { cn } from "@/lib/utils";

const selectClass =
  "h-9 w-full appearance-none rounded-lg border border-input bg-card px-2.5 pr-8 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function AuditFilters({ filters }: { filters: AuditFilters }) {
  const router = useRouter();
  const params = useSearchParams();

  // Atualiza um filtro na URL preservando o outro; valor vazio remove a chave.
  function setParam(key: "entity" | "action", value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const query = next.toString();
    router.replace(query ? `/auditoria?${query}` : "/auditoria");
  }

  const hasFilters = filters.entityType !== null || filters.action !== null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="size-4" />
        <span>Filtrar</span>
        {hasFilters ? (
          <button
            type="button"
            onClick={() => router.replace("/auditoria")}
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
            Limpar
          </button>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <select
            aria-label="Filtrar por tipo de entidade"
            className={cn(selectClass)}
            value={filters.entityType ?? ""}
            onChange={(e) => setParam("entity", e.target.value)}
          >
            <option value="">Todas as entidades</option>
            {AUDIT_ENTITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <select
            aria-label="Filtrar por ação"
            className={cn(selectClass)}
            value={filters.action ?? ""}
            onChange={(e) => setParam("action", e.target.value)}
          >
            <option value="">Todas as ações</option>
            {AUDIT_ACTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
