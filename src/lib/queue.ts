// Lógica pura da fila de demanda (reordenação) — sem I/O, testável isolada.
// O componente client compõe estes helpers para reordenar arrastando e para
// mover um pedido para a frente/fim; a server action usa `positionsToUpdate`
// para gravar só o que mudou, registrando a mudança como `priority` no audit.

// Move um item da posição `from` para `to`, devolvendo um novo array (não muta
// o original). Índices fora do intervalo são clampeados; equivale ao
// arrayMove do dnd-kit, mas mantido aqui para ser testável sem o browser.
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  const result = items.slice();
  if (result.length === 0) return result;
  const max = result.length - 1;
  const f = Math.max(0, Math.min(from, max));
  const t = Math.max(0, Math.min(to, max));
  const [moved] = result.splice(f, 1) as [T];
  result.splice(t, 0, moved);
  return result;
}

// Reposiciona `id` no topo da fila (1º), preservando a ordem dos demais.
// Se o id não existir, devolve a lista inalterada (cópia).
export function moveToFront(ids: string[], id: string): string[] {
  const index = ids.indexOf(id);
  if (index <= 0) return ids.slice();
  return moveItem(ids, index, 0);
}

// Reposiciona `id` no fim da fila, preservando a ordem dos demais.
export function moveToEnd(ids: string[], id: string): string[] {
  const index = ids.indexOf(id);
  if (index < 0 || index === ids.length - 1) return ids.slice();
  return moveItem(ids, index, ids.length - 1);
}

// Dado o novo ordenamento (`orderedIds`) e as posições atuais de cada pedido
// (`current`, vindo do banco), calcula as atualizações de `queue_position`
// necessárias. Reaproveita o MESMO conjunto de valores de posição já existentes
// — só os permuta entre os ids — para não renumerar a fila inteira nem colidir
// com pedidos fora da fila (ex.: concluídos) que tenham posições intercaladas.
// Devolve apenas os pares {id, position} que de fato mudaram.
export function positionsToUpdate(
  orderedIds: string[],
  current: Record<string, number>,
): { id: string; position: number }[] {
  // Valores de posição disponíveis (os mesmos de antes), em ordem crescente.
  const slots = orderedIds
    .map((id) => current[id])
    .filter((pos): pos is number => typeof pos === "number")
    .sort((a, b) => a - b);

  const updates: { id: string; position: number }[] = [];
  orderedIds.forEach((id, index) => {
    const position = slots[index];
    if (position === undefined) return;
    if (current[id] !== position) updates.push({ id, position });
  });
  return updates;
}

// Posição (rank) de um pedido na ordem atual da fila — 1-based, para o audit.
// Ordena os ids pelas posições atuais e devolve onde `id` cai.
export function rankInQueue(
  ids: string[],
  current: Record<string, number>,
  id: string,
): number {
  const sorted = ids
    .slice()
    .sort((a, b) => (current[a] ?? 0) - (current[b] ?? 0));
  return sorted.indexOf(id) + 1;
}
