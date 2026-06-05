"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Wallet, Check, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  filterOrders,
  formatBRL,
  productionStatusLabel,
  PRODUCTION_STATUSES,
  productLabel,
  summarizePending,
  type OrderListItem,
  type PaymentFilter,
  type ProductionFilter,
  type ProductionStatus,
} from "@/lib/orders";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { setPaymentStatus } from "./actions";

const FILTERS: { value: PaymentFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "unpaid", label: "A pagar" },
  { value: "paid", label: "Pagos" },
];

const PRODUCTION_FILTERS: { value: ProductionFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  ...PRODUCTION_STATUSES.map((s) => ({ value: s.value, label: s.label })),
];

// Variante do badge por status de produção: "produzindo" destaca-se (primary),
// "concluído" fica discreto (secondary) e "em espera" neutro (outline).
const PRODUCTION_BADGE: Record<
  ProductionStatus,
  "default" | "secondary" | "outline"
> = {
  waiting: "outline",
  producing: "default",
  done: "secondary",
};

export function OrdersList({ orders }: { orders: OrderListItem[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [payment, setPayment] = useState<PaymentFilter>("all");
  const [production, setProduction] = useState<ProductionFilter>("all");
  const [pending, startTransition] = useTransition();

  const pendingSummary = useMemo(() => summarizePending(orders), [orders]);
  const visible = useMemo(
    () => filterOrders(orders, { query, payment, production }),
    [orders, query, payment, production],
  );

  function togglePayment(order: OrderListItem) {
    const next = order.payment_status === "paid" ? "unpaid" : "paid";
    startTransition(async () => {
      const result = await setPaymentStatus(order.id, next);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(next === "paid" ? "Marcado como pago." : "Marcado como a pagar.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Pendências (a receber): soma dos pedidos não pagos. */}
      <div className="flex items-center justify-between gap-2 rounded-xl bg-card px-3 py-3 ring-1 ring-foreground/10">
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <Wallet className="size-4" />A receber
        </span>
        <span className="text-right">
          <span className="font-semibold tabular-nums">
            {formatBRL(pendingSummary.total)}
          </span>
          <span className="ml-2 text-xs text-muted-foreground">
            {pendingSummary.count}{" "}
            {pendingSummary.count === 1 ? "pedido" : "pedidos"}
          </span>
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por cliente ou produto…"
          className="pl-8"
        />
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setPayment(f.value)}
              aria-pressed={payment === f.value}
              className={cn(
                "rounded-full px-3 py-1 text-sm transition-colors",
                payment === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        {/* Filtro de produção: tocar "Produzindo" lista os pedidos em produção. */}
        <div className="flex flex-wrap gap-2">
          {PRODUCTION_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setProduction(f.value)}
              aria-pressed={production === f.value}
              className={cn(
                "rounded-full px-3 py-1 text-sm transition-colors",
                production === f.value
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {orders.length === 0
            ? "Nenhum pedido cadastrado ainda."
            : "Nenhum pedido encontrado para este filtro."}
        </p>
      ) : (
        <ul className="space-y-2">
          {visible.map((order) => {
            const paid = order.payment_status === "paid";
            return (
              <li
                key={order.id}
                className="flex items-stretch gap-2 rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10 transition-colors hover:bg-muted/50"
              >
                <Link
                  href={`/pedidos/${order.id}`}
                  className="min-w-0 flex-1 px-3 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-medium">
                        {order.client?.name ?? "Cliente removido"}
                      </div>
                      <div className="truncate text-sm text-muted-foreground">
                        {order.quantity}× {productLabel(order)}
                      </div>
                      <Badge
                        variant={PRODUCTION_BADGE[order.production_status]}
                        className="mt-1.5"
                      >
                        {productionStatusLabel(order.production_status)}
                      </Badge>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="font-semibold tabular-nums">
                        {formatBRL(order.amount)}
                      </span>
                      <Badge variant={paid ? "secondary" : "destructive"}>
                        {paid ? "Pago" : "A pagar"}
                      </Badge>
                    </div>
                  </div>
                </Link>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={pending}
                  onClick={() => togglePayment(order)}
                  aria-label={paid ? "Marcar como a pagar" : "Marcar como pago"}
                  title={paid ? "Marcar como a pagar" : "Marcar como pago"}
                  className="my-2 mr-2 self-center"
                >
                  {paid ? (
                    <RotateCcw className="size-4" />
                  ) : (
                    <Check className="size-4" />
                  )}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
