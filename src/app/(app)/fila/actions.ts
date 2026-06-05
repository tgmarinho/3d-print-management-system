"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { positionsToUpdate, rankInQueue } from "@/lib/queue";

const LIST = "/fila";

// Resultado da reordenação: o client reflete a mensagem no erro (e desfaz o
// estado otimista). O sucesso não precisa de payload — o Realtime/refresh já
// traz a fila atualizada.
export type QueueActionResult = { ok: true } | { ok: false; message: string };

// Persiste a nova ordem da fila. Recebe os ids JÁ na ordem desejada e o id que
// o usuário moveu (arrastando ou via "para frente/fim"). Reaproveita os mesmos
// valores de `queue_position` que já existiam, apenas permutando-os, e grava só
// o que mudou. Registra a mudança de prioridade no audit_log (action=priority).
export async function reorderQueue(
  orderedIds: string[],
  movedId: string,
): Promise<QueueActionResult> {
  if (orderedIds.length < 2) return { ok: true };

  const supabase = await createClient();

  // Posições atuais dos pedidos da fila — fonte de verdade para o diff.
  const { data, error } = await supabase
    .from("orders")
    .select("id, queue_position")
    .in("id", orderedIds);
  if (error) return { ok: false, message: error.message };

  const current: Record<string, number> = {};
  for (const row of data ?? []) current[row.id] = row.queue_position;

  const updates = positionsToUpdate(orderedIds, current);
  if (updates.length === 0) return { ok: true };

  // Posições (rank) antes/depois do pedido movido, para o audit ficar legível.
  const fromRank = rankInQueue(orderedIds, current, movedId);
  const toRank = orderedIds.indexOf(movedId) + 1;

  const now = new Date().toISOString();
  for (const { id, position } of updates) {
    const { error: upErr } = await supabase
      .from("orders")
      .update({ queue_position: position, updated_at: now })
      .eq("id", id);
    if (upErr) return { ok: false, message: upErr.message };
  }

  await logAudit({
    action: "priority",
    entityType: "order",
    entityId: movedId,
    details: { from: fromRank, to: toRank },
  });

  revalidatePath(LIST);
  return { ok: true };
}
