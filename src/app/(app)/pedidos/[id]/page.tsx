import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/orders";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OrderForm } from "../order-form";
import { ProductionStatusControl } from "../production-status-control";
import { loadOrderFormOptions } from "../options";
import { deleteOrder } from "../actions";

export default async function EditOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();
  const [{ data }, options] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    loadOrderFormOptions(),
  ]);
  if (!data) notFound();
  const order = data as Order;

  return (
    <section className="space-y-6">
      <h1 className="text-xl font-semibold">Editar pedido</h1>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-muted-foreground">
          Status de produção
        </h2>
        <ProductionStatusControl
          orderId={order.id}
          status={order.production_status}
        />
      </div>

      <Separator />

      <OrderForm order={order} options={options} />

      <Separator />

      <form action={deleteOrder.bind(null, order.id)}>
        <Button type="submit" variant="destructive" className="w-full">
          Excluir pedido
        </Button>
      </form>
    </section>
  );
}
