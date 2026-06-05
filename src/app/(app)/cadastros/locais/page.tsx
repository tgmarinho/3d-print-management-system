import { createClient } from "@/lib/supabase/server";
import { LocationsManager } from "./locations-client";

export default async function LocaisPage() {
  const supabase = await createClient();

  const { data: locations } = await supabase
    .from("stock_locations")
    .select("id, name")
    .order("name");

  // Quais locais têm estoque vinculado (para sinalizar e orientar a remoção).
  const { data: stock } = await supabase
    .from("filament_stock")
    .select("location_id, in_stock, on_order");
  const withStock = new Set(
    (stock ?? [])
      .filter((row) => (row.in_stock ?? 0) > 0 || (row.on_order ?? 0) > 0)
      .map((row) => row.location_id as string),
  );

  const items = (locations ?? []).map((location) => ({
    id: location.id as string,
    name: location.name as string,
    hasStock: withStock.has(location.id as string),
  }));

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Locais de estoque</h1>
        <p className="text-sm text-muted-foreground">
          Onde os filamentos ficam guardados (ex.: casa da Karen).
        </p>
      </div>
      <LocationsManager items={items} />
    </section>
  );
}
