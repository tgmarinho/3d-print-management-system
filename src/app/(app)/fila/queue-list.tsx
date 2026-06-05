"use client";

import { useEffect, useState, useTransition } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronsDown, ChevronsUp, GripVertical } from "lucide-react";
import { toast } from "sonner";
import {
  formatBRL,
  productLabel,
  type OrderListItem,
} from "@/lib/orders";
import { moveToEnd, moveToFront } from "@/lib/queue";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { reorderQueue } from "./actions";

export function QueueList({ orders }: { orders: OrderListItem[] }) {
  // Estado local da ordem para refletir o arrasto na hora (otimista). Mantemos
  // os pedidos por id e a ordem separada para reordenar sem reembaralhar dados.
  const [items, setItems] = useState<OrderListItem[]>(orders);
  const [pending, startTransition] = useTransition();

  // Quando o servidor revalida (Realtime/refresh) e não há reordenação nossa em
  // andamento, sincroniza com os dados novos. Durante o `pending`, ignoramos o
  // eco para não desfazer o estado otimista no meio do caminho.
  useEffect(() => {
    if (!pending) setItems(orders);
  }, [orders, pending]);

  const sensors = useSensors(
    // distance: 6 evita iniciar o arrasto num toque/scroll acidental no mobile.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function persist(next: OrderListItem[], movedId: string) {
    const previous = items;
    setItems(next);
    startTransition(async () => {
      const result = await reorderQueue(
        next.map((o) => o.id),
        movedId,
      );
      if (!result.ok) {
        setItems(previous); // desfaz o otimista
        toast.error(result.message);
      }
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = items.findIndex((o) => o.id === active.id);
    const to = items.findIndex((o) => o.id === over.id);
    if (from < 0 || to < 0) return;
    persist(arrayMove(items, from, to), String(active.id));
  }

  function bumpToFront(id: string) {
    const ids = moveToFront(
      items.map((o) => o.id),
      id,
    );
    persist(reorderBy(items, ids), id);
  }

  function bumpToEnd(id: string) {
    const ids = moveToEnd(
      items.map((o) => o.id),
      id,
    );
    persist(reorderBy(items, ids), id);
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum pedido na fila. Pedidos concluídos saem da fila automaticamente.
      </p>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((o) => o.id)}
        strategy={verticalListSortingStrategy}
      >
        <ol className="space-y-2">
          {items.map((order, index) => (
            <QueueRow
              key={order.id}
              order={order}
              rank={index + 1}
              disabled={pending}
              isFirst={index === 0}
              isLast={index === items.length - 1}
              onFront={() => bumpToFront(order.id)}
              onEnd={() => bumpToEnd(order.id)}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}

// Reordena a lista de pedidos para casar com uma sequência de ids.
function reorderBy(orders: OrderListItem[], ids: string[]): OrderListItem[] {
  const byId = new Map(orders.map((o) => [o.id, o]));
  return ids
    .map((id) => byId.get(id))
    .filter((o): o is OrderListItem => o !== undefined);
}

function QueueRow({
  order,
  rank,
  disabled,
  isFirst,
  isLast,
  onFront,
  onEnd,
}: {
  order: OrderListItem;
  rank: number;
  disabled: boolean;
  isFirst: boolean;
  isLast: boolean;
  onFront: () => void;
  onEnd: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: order.id });

  const producing = order.production_status === "producing";

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-stretch gap-1 rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10",
        isDragging && "relative z-10 shadow-lg ring-foreground/20",
      )}
    >
      {/* Alça de arrasto: os listeners ficam só aqui, então tocar no resto da
          linha permite rolar a página normalmente no celular. */}
      <button
        type="button"
        aria-label="Arrastar para reordenar"
        className="flex shrink-0 touch-none items-center px-1.5 text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5" />
      </button>

      <span
        aria-hidden
        className="flex w-7 shrink-0 items-center justify-center font-mono text-sm font-semibold tabular-nums text-muted-foreground"
      >
        {rank}º
      </span>

      <div className="min-w-0 flex-1 py-3">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">
            {order.client?.name ?? "Cliente removido"}
          </span>
          {producing ? (
            <Badge variant="secondary" className="shrink-0">
              Produzindo
            </Badge>
          ) : null}
        </div>
        <div className="truncate text-sm text-muted-foreground">
          {order.quantity}× {productLabel(order)}
          <span className="mx-1.5">·</span>
          <span className="tabular-nums">{formatBRL(order.amount)}</span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-center justify-center pr-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={disabled || isFirst}
          onClick={onFront}
          aria-label="Mover para o início da fila"
          title="Mover para o início"
        >
          <ChevronsUp className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          disabled={disabled || isLast}
          onClick={onEnd}
          aria-label="Mover para o fim da fila"
          title="Mover para o fim"
        >
          <ChevronsDown className="size-4" />
        </Button>
      </div>
    </li>
  );
}
