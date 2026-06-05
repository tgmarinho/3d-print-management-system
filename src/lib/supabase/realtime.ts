"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { createClient } from "./client";

// Hooks de Supabase Realtime para refletir mudanças entre sessões sem reload.
// As tabelas precisam estar na publication `supabase_realtime` (migration 0003)
// e o usuário autenticado precisa de SELECT por RLS (migration 0002).

// Assina mudanças (INSERT/UPDATE/DELETE) de uma tabela e chama `onChange` com o
// payload. Mantém a callback num ref para não reabrir o canal a cada render.
export function useTableChanges<T extends Record<string, unknown>>(
  table: string,
  onChange: (payload: RealtimePostgresChangesPayload<T>) => void,
  options?: { filter?: string },
) {
  const handler = useRef(onChange);
  handler.current = onChange;

  const filter = options?.filter;

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`table-changes:${table}:${filter ?? "all"}`)
      .on(
        // @supabase/supabase-js tipa o filtro de postgres_changes de forma estrita;
        // montamos o objeto dinamicamente por causa do `filter` opcional.
        "postgres_changes",
        { event: "*", schema: "public", table, ...(filter ? { filter } : {}) } as never,
        (payload: RealtimePostgresChangesPayload<T>) => handler.current(payload),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [table, filter]);
}

// Conveniência para Server Components: assina uma ou mais tabelas e dá um
// `router.refresh()` (debounced) a cada mudança, re-buscando os dados no servidor.
// Mantém o servidor como fonte de verdade (RLS, agregação) sem duplicar lógica.
export function useRealtimeRefresh(tables: string[]) {
  const router = useRouter();
  const key = tables.join(",");

  useEffect(() => {
    const supabase = createClient();
    let timer: ReturnType<typeof setTimeout> | null = null;
    const refresh = () => {
      if (timer) clearTimeout(timer);
      // Pequeno debounce: agrupa rajadas de eventos num único refresh.
      timer = setTimeout(() => router.refresh(), 150);
    };

    const channel = supabase.channel(`realtime-refresh:${key}`);
    for (const table of tables) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        refresh,
      );
    }
    channel.subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [key, router]);
}
