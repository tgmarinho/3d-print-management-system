import Link from "next/link";
import {
  AlertTriangle,
  ChevronRight,
  History,
  ListOrdered,
  PackageCheck,
  Printer,
  Wallet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  summarizeFilamentStock,
  sumInStockByFilament,
  type Filament,
} from "@/lib/filaments";
import {
  formatBRL,
  producingOrders,
  productLabel,
  queuedOrders,
  summarizePending,
  type OrderListItem,
} from "@/lib/orders";
import { Badge } from "@/components/ui/badge";
import { RealtimeRefresh } from "@/components/realtime-refresh";

export default async function DashboardPage() {
  const supabase = await createClient();
  const [{ data: filamentsData }, { data: stockData }, { data: ordersData }] =
    await Promise.all([
      supabase
        .from("filaments")
        .select("*")
        .order("material", { ascending: true })
        .order("color", { ascending: true }),
      supabase.from("filament_stock").select("filament_id, in_stock"),
      // Só o que ainda demanda atenção no painel: tudo que não foi concluído
      // (fila + produção) e tudo que não foi pago. Pedidos pagos e concluídos
      // não poluem o resumo de relance.
      supabase
        .from("orders")
        .select("*, client:clients(name), product:products(name)")
        .or("production_status.neq.done,payment_status.eq.unpaid"),
    ]);

  const filaments = (filamentsData ?? []) as Filament[];
  const inStockByFilament = sumInStockByFilament(stockData ?? []);
  const lowStock = summarizeFilamentStock(filaments, inStockByFilament).filter(
    (f) => f.low,
  );

  const orders = (ordersData ?? []) as OrderListItem[];
  const queue = queuedOrders(orders);
  const producing = producingOrders(orders);
  const pending = summarizePending(orders);
  const pendingOrders = orders.filter((o) => o.payment_status === "unpaid");

  return (
    <section className="space-y-8">
      {/* Tudo no painel reflete ajustes feitos em qualquer sessão, ao vivo. */}
      <RealtimeRefresh tables={["filament_stock", "filaments", "orders"]} />

      <h1 className="text-xl font-semibold">Dashboard</h1>

      {/* Estoque baixo */}
      <DashboardSection
        icon={<AlertTriangle className="size-4 text-destructive" />}
        title="Estoque baixo"
        count={lowStock.length}
        countTone="destructive"
        empty={
          <EmptyRow
            icon={<PackageCheck className="size-4 shrink-0" />}
            text="Nenhum filamento em estoque baixo."
          />
        }
      >
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
                  {filament.inStock} {filament.inStock === 1 ? "rolo" : "rolos"}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </DashboardSection>

      {/* Fila atual */}
      <DashboardSection
        icon={<ListOrdered className="size-4 text-muted-foreground" />}
        title="Fila atual"
        count={queue.length}
        empty={<EmptyRow text="Nenhum pedido na fila." />}
      >
        {queue.map((order, index) => (
          <li key={order.id}>
            <OrderRow order={order}>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-medium tabular-nums text-muted-foreground">
                {index + 1}
              </span>
            </OrderRow>
          </li>
        ))}
      </DashboardSection>

      {/* Produção em andamento */}
      <DashboardSection
        icon={<Printer className="size-4 text-muted-foreground" />}
        title="Produção em andamento"
        count={producing.length}
        empty={<EmptyRow text="Nada em produção agora." />}
      >
        {producing.map((order) => (
          <li key={order.id}>
            <OrderRow order={order}>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
                <Printer className="size-4" strokeWidth={1.75} />
              </span>
            </OrderRow>
          </li>
        ))}
      </DashboardSection>

      {/* Pagamentos pendentes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Wallet className="size-4 text-muted-foreground" />
            Pagamentos pendentes
          </h2>
          {pending.count > 0 ? (
            <Badge variant="destructive">{pending.count}</Badge>
          ) : null}
        </div>

        {pending.count === 0 ? (
          <EmptyRow
            icon={<PackageCheck className="size-4 shrink-0" />}
            text="Nenhum pagamento pendente."
          />
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 rounded-xl bg-card px-3 py-3 ring-1 ring-foreground/10">
              <span className="text-sm text-muted-foreground">A receber</span>
              <span className="font-semibold tabular-nums">
                {formatBRL(pending.total)}
              </span>
            </div>
            <ul className="space-y-2">
              {pendingOrders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/pedidos/${order.id}`}
                    className="flex items-center justify-between gap-2 rounded-xl bg-card px-3 py-3 text-card-foreground ring-1 ring-foreground/10 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {order.client?.name ?? "Cliente removido"}
                      </div>
                      <div className="truncate text-sm text-muted-foreground">
                        {order.quantity}× {productLabel(order)}
                      </div>
                    </div>
                    <span className="shrink-0 font-semibold tabular-nums">
                      {formatBRL(order.amount)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Histórico de ações */}
      <Link
        href="/auditoria"
        className="group flex items-center gap-3 rounded-xl bg-card px-3 py-3 text-card-foreground ring-1 ring-foreground/10 transition-colors hover:bg-muted/50"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
          <History className="size-4" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Histórico de ações</p>
          <p className="truncate text-sm text-muted-foreground">
            Quem fez o quê, em qual cadastro e quando.
          </p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </section>
  );
}

// Cabeçalho (ícone + título + badge de contagem) seguido pela lista de itens,
// ou um estado vazio quando não há nada. Mantém as quatro seções consistentes.
function DashboardSection({
  icon,
  title,
  count,
  countTone = "secondary",
  empty,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  countTone?: "secondary" | "destructive";
  empty: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          {icon}
          {title}
        </h2>
        {count > 0 ? <Badge variant={countTone}>{count}</Badge> : null}
      </div>
      {count === 0 ? empty : <ul className="space-y-2">{children}</ul>}
    </div>
  );
}

// Linha de pedido para fila/produção: marcador à esquerda (passado via children)
// + cliente e produto. Linka para a edição do pedido.
function OrderRow({
  order,
  children,
}: {
  order: OrderListItem;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={`/pedidos/${order.id}`}
      className="flex items-center gap-3 rounded-xl bg-card px-3 py-3 text-card-foreground ring-1 ring-foreground/10 transition-colors hover:bg-muted/50"
    >
      {children}
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">
          {order.client?.name ?? "Cliente removido"}
        </div>
        <div className="truncate text-sm text-muted-foreground">
          {order.quantity}× {productLabel(order)}
        </div>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" />
    </Link>
  );
}

// Estado vazio de uma seção: linha discreta com ícone opcional.
function EmptyRow({
  icon,
  text,
}: {
  icon?: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-card px-3 py-3 text-sm text-muted-foreground ring-1 ring-foreground/10">
      {icon}
      {text}
    </div>
  );
}
