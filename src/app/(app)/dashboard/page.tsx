import Link from "next/link";
import { AlertTriangle, PackageCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  summarizeFilamentStock,
  sumInStockByFilament,
  type Filament,
} from "@/lib/filaments";
import { Badge } from "@/components/ui/badge";
import { RealtimeRefresh } from "@/components/realtime-refresh";

export default async function DashboardPage() {
  const supabase = await createClient();
  const [{ data: filamentsData }, { data: stockData }] = await Promise.all([
    supabase
      .from("filaments")
      .select("*")
      .order("material", { ascending: true })
      .order("color", { ascending: true }),
    supabase.from("filament_stock").select("filament_id, in_stock"),
  ]);

  const filaments = (filamentsData ?? []) as Filament[];
  const inStockByFilament = sumInStockByFilament(stockData ?? []);
  const lowStock = summarizeFilamentStock(filaments, inStockByFilament).filter(
    (f) => f.low,
  );

  return (
    <section className="space-y-6">
      {/* Estoque baixo reflete ajustes feitos em qualquer sessão, ao vivo. */}
      <RealtimeRefresh tables={["filament_stock", "filaments"]} />

      <h1 className="text-xl font-semibold">Dashboard</h1>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="size-4 text-destructive" />
            Estoque baixo
          </h2>
          {lowStock.length > 0 ? (
            <Badge variant="destructive">{lowStock.length}</Badge>
          ) : null}
        </div>

        {lowStock.length === 0 ? (
          <div className="flex items-center gap-2 rounded-xl bg-card px-3 py-3 text-sm text-muted-foreground ring-1 ring-foreground/10">
            <PackageCheck className="size-4 shrink-0 text-muted-foreground" />
            Nenhum filamento em estoque baixo.
          </div>
        ) : (
          <ul className="space-y-2">
            {lowStock.map((filament) => (
              <li key={filament.id}>
                <Link
                  href={`/cadastros/filamentos/${filament.id}`}
                  className="flex items-center justify-between gap-2 rounded-xl bg-card px-3 py-3 text-card-foreground ring-1 ring-foreground/10 transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <div className="font-medium">
                      {filament.color}{" "}
                      <span className="text-muted-foreground">
                        · {filament.material}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Limite: {filament.low_stock_threshold}{" "}
                      {filament.low_stock_threshold === 1 ? "rolo" : "rolos"}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="destructive">Estoque baixo</Badge>
                    <span className="text-sm tabular-nums text-muted-foreground">
                      {filament.inStock}{" "}
                      {filament.inStock === 1 ? "rolo" : "rolos"}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Em breve: fila, produção e pagamentos pendentes.
      </p>
    </section>
  );
}
