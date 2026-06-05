"use client";

import { useRef, useState, useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isLowStock, type StockField } from "@/lib/filaments";
import { useTableChanges } from "@/lib/supabase/realtime";
import { adjustStock } from "../actions";

// Linha de filament_stock como chega no payload do Realtime.
type StockRow = {
  filament_id: string;
  location_id: string;
  in_stock: number;
  on_order: number;
};

type Location = { id: string; name: string };
type Counts = { in_stock: number; on_order: number };

const ZERO: Counts = { in_stock: 0, on_order: 0 };

export function StockEditor({
  filamentId,
  locations,
  initial,
  lowStockThreshold,
}: {
  filamentId: string;
  locations: Location[];
  initial: Record<string, Counts>;
  lowStockThreshold: number;
}) {
  const [stock, setStock] = useState<Record<string, Counts>>(initial);
  const [pending, startTransition] = useTransition();

  // Locais com ajuste local em andamento (contador por local). Enquanto >0,
  // ignoramos o Realtime daquele local: o estado otimista é mais recente que o
  // eco do nosso próprio upsert e aplicá-lo causaria flicker no +/- rápido.
  const inFlight = useRef<Map<string, number>>(new Map());

  function markInFlight(locationId: string, delta: 1 | -1) {
    const map = inFlight.current;
    const next = (map.get(locationId) ?? 0) + delta;
    if (next > 0) map.set(locationId, next);
    else map.delete(locationId);
  }

  // Realtime: ajuste feito em outra sessão reflete aqui na hora, sem reload.
  useTableChanges<StockRow>(
    "filament_stock",
    (payload) => {
      const row = payload.new;
      if (!row || !("location_id" in row) || row.filament_id !== filamentId) return;
      if (inFlight.current.has(row.location_id)) return; // nosso próprio ajuste
      setStock((prev) => ({
        ...prev,
        [row.location_id]: { in_stock: row.in_stock, on_order: row.on_order },
      }));
    },
    { filter: `filament_id=eq.${filamentId}` },
  );

  function adjust(locationId: string, field: StockField, delta: number) {
    const current = stock[locationId]?.[field] ?? 0;
    const next = Math.max(0, current + delta);
    if (next === current) return;

    // Otimista: reflete já; reverte se a action falhar.
    setStock((prev) => ({
      ...prev,
      [locationId]: { ...(prev[locationId] ?? ZERO), [field]: next },
    }));

    markInFlight(locationId, 1);
    startTransition(async () => {
      const result = await adjustStock(filamentId, locationId, field, delta);
      if (!result.ok) {
        toast.error(result.message);
        setStock((prev) => ({
          ...prev,
          [locationId]: { ...(prev[locationId] ?? ZERO), [field]: current },
        }));
      }
      markInFlight(locationId, -1);
    });
  }

  const totalInStock = locations.reduce(
    (sum, loc) => sum + (stock[loc.id]?.in_stock ?? 0),
    0,
  );
  const low = isLowStock(totalInStock, lowStockThreshold);

  if (locations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum local de estoque cadastrado. Cadastre um local primeiro.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Estoque por local</h2>
        <div className="flex items-center gap-2">
          {low ? <Badge variant="destructive">Estoque baixo</Badge> : null}
          <span className="text-sm tabular-nums text-muted-foreground">
            {totalInStock} em estoque
          </span>
        </div>
      </div>

      <ul className="space-y-2">
        {locations.map((location) => {
          const counts = stock[location.id] ?? ZERO;
          return (
            <li
              key={location.id}
              className="space-y-2 rounded-lg p-3 ring-1 ring-foreground/10"
            >
              <p className="truncate font-medium">{location.name}</p>
              <Counter
                label="Em estoque"
                value={counts.in_stock}
                disabled={pending}
                onAdjust={(delta) => adjust(location.id, "in_stock", delta)}
              />
              <Counter
                label="Encomendado"
                value={counts.on_order}
                disabled={pending}
                onAdjust={(delta) => adjust(location.id, "on_order", delta)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Counter({
  label,
  value,
  disabled,
  onAdjust,
}: {
  label: string;
  value: number;
  disabled: boolean;
  onAdjust: (delta: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={`Diminuir ${label.toLowerCase()}`}
          disabled={disabled || value === 0}
          onClick={() => onAdjust(-1)}
        >
          <Minus />
        </Button>
        <span className="min-w-7 text-center text-base font-medium tabular-nums">
          {value}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label={`Aumentar ${label.toLowerCase()}`}
          disabled={disabled}
          onClick={() => onAdjust(1)}
        >
          <Plus />
        </Button>
      </div>
    </div>
  );
}
