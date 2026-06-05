import { createClient } from "@/lib/supabase/server";
import type { OrderListItem } from "@/lib/orders";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { QueueList } from "./queue-list";

// Fila de demanda: pedidos ainda em produção (não concluídos), ordenados pela
// posição. Concluídos saem da fila. Mobile-first, reordenável arrastando.
export default async function QueuePage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "*, client:clients(name), seller:sellers(name), modeler:modelers(name), product:products(name)",
    )
    .neq("production_status", "done")
    .order("queue_position", { ascending: true });

  const orders = (data ?? []) as OrderListItem[];

  return (
    <section className="space-y-4">
      {/* A fila atualiza ao vivo entre sessões (Realtime na tabela orders). */}
      <RealtimeRefresh tables={["orders"]} />
      <div>
        <h1 className="text-xl font-semibold">Fila de demanda</h1>
        <p className="text-sm text-muted-foreground">
          Arraste pela alça para priorizar; use as setas para urgências.
        </p>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : (
        <QueueList orders={orders} />
      )}
    </section>
  );
}
