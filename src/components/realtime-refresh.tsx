"use client";

import { useRealtimeRefresh } from "@/lib/supabase/realtime";

// Componente "invisível" para deixar um Server Component vivo: monte-o como
// filho passando as tabelas que, ao mudar, devem disparar um refresh dos dados.
export function RealtimeRefresh({ tables }: { tables: string[] }) {
  useRealtimeRefresh(tables);
  return null;
}
