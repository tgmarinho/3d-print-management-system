import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Filament } from "@/lib/filaments";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FilamentForm } from "../filament-form";
import { deleteFilament } from "../actions";
import { ConfirmDeleteForm } from "@/components/confirm-delete-form";
import { StockEditor } from "./stock-editor";

type Counts = { in_stock: number; on_order: number };

export default async function EditFilamentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();
  const [{ data }, { data: locations }, { data: stockRows }] = await Promise.all([
    supabase.from("filaments").select("*").eq("id", id).maybeSingle(),
    supabase.from("stock_locations").select("id, name").order("name"),
    supabase
      .from("filament_stock")
      .select("location_id, in_stock, on_order")
      .eq("filament_id", id),
  ]);
  if (!data) notFound();
  const filament = data as Filament;

  const initialStock: Record<string, Counts> = {};
  for (const row of stockRows ?? []) {
    initialStock[row.location_id] = {
      in_stock: row.in_stock,
      on_order: row.on_order,
    };
  }

  return (
    <section className="space-y-6">
      <h1 className="text-xl font-semibold">Editar filamento</h1>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <FilamentForm filament={filament} />

      <Separator />

      <StockEditor
        filamentId={filament.id}
        locations={locations ?? []}
        initial={initialStock}
        lowStockThreshold={filament.low_stock_threshold}
      />

      <Separator />

      <ConfirmDeleteForm
        action={deleteFilament.bind(null, filament.id)}
        trigger="Excluir filamento"
        title="Excluir filamento?"
        description="Esta ação remove o filamento e o estoque vinculado permanentemente."
        confirmLabel="Excluir filamento"
      />
    </section>
  );
}
