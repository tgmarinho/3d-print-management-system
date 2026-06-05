import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  summarizeFilamentStock,
  sumInStockByFilament,
  type Filament,
} from "@/lib/filaments";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RealtimeRefresh } from "@/components/realtime-refresh";

export default async function FilamentsPage() {
  const supabase = await createClient();
  const [{ data: filamentsData, error }, { data: stockData }] = await Promise.all([
    supabase
      .from("filaments")
      .select("*")
      .order("material", { ascending: true })
      .order("color", { ascending: true }),
    supabase.from("filament_stock").select("filament_id, in_stock"),
  ]);

  const filaments = (filamentsData ?? []) as Filament[];

  // Total em estoque por filamento + flag de estoque baixo (mesmo critério da
  // página de detalhe e do dashboard).
  const inStockByFilament = sumInStockByFilament(stockData ?? []);
  const summaries = summarizeFilamentStock(filaments, inStockByFilament);

  return (
    <section className="space-y-4">
      {/* Estoque e limites mudam ao vivo entre sessões. */}
      <RealtimeRefresh tables={["filament_stock", "filaments"]} />
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Filamentos</h1>
          <p className="text-sm text-muted-foreground">
            Cores e materiais, com estoque por local.
          </p>
        </div>
        <Link href="/cadastros/filamentos/novo" className={buttonVariants()}>
          Novo
        </Link>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : filaments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum filamento cadastrado ainda.
        </p>
      ) : (
        <ul className="space-y-2">
          {summaries.map((filament) => {
            const { inStock, low } = filament;
            return (
              <li key={filament.id}>
                <Link
                  href={`/cadastros/filamentos/${filament.id}`}
                  className="block rounded-xl bg-card px-3 py-3 text-card-foreground ring-1 ring-foreground/10 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium">
                        {filament.color}{" "}
                        <span className="text-muted-foreground">
                          · {filament.material}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {[filament.brand, filament.weight]
                          .filter(Boolean)
                          .join(" · ") || "Sem marca/peso"}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {low ? <Badge variant="destructive">Estoque baixo</Badge> : null}
                      <span className="text-sm tabular-nums text-muted-foreground">
                        {inStock} {inStock === 1 ? "rolo" : "rolos"}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
