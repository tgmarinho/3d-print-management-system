import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { OrderListItem } from "@/lib/orders";
import { buttonVariants } from "@/components/ui/button";
import { RealtimeRefresh } from "@/components/realtime-refresh";
import { OrdersList } from "./orders-list";

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "*, client:clients(name), seller:sellers(name), modeler:modelers(name), product:products(name)",
    )
    .order("created_at", { ascending: false });

  const orders = (data ?? []) as OrderListItem[];

  return (
    <section className="space-y-4">
      {/* Pedidos atualizam ao vivo entre sessões (Realtime na tabela orders). */}
      <RealtimeRefresh tables={["orders"]} />
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Pedidos</h1>
          <p className="text-sm text-muted-foreground">
            Orçamentos e produção sob demanda.
          </p>
        </div>
        <Link href="/pedidos/novo" className={buttonVariants()}>
          Novo
        </Link>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : (
        <OrdersList orders={orders} />
      )}
    </section>
  );
}
