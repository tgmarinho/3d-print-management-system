"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  PRODUCTION_STATUSES,
  productionStatusLabel,
  type ProductionStatus,
} from "@/lib/orders";
import { cn } from "@/lib/utils";
import { setProductionStatus } from "./actions";

// Controle segmentado (em espera / produzindo / concluído) para definir o status
// de produção de um pedido num toque. Otimista no feedback (toast + refresh) e
// registra a transição no audit via a server action.
export function ProductionStatusControl({
  orderId,
  status,
}: {
  orderId: string;
  status: ProductionStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function change(next: ProductionStatus) {
    if (next === status || pending) return;
    startTransition(async () => {
      const result = await setProductionStatus(orderId, next);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(`Produção: ${productionStatusLabel(next)}.`);
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label="Status de produção"
      className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1"
    >
      {PRODUCTION_STATUSES.map((s) => {
        const active = s.value === status;
        return (
          <button
            key={s.value}
            type="button"
            disabled={pending}
            onClick={() => change(s.value)}
            aria-pressed={active}
            className={cn(
              "rounded-lg px-2 py-2 text-sm font-medium transition-colors disabled:opacity-60",
              active
                ? "bg-background text-foreground shadow-sm ring-1 ring-foreground/10"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
