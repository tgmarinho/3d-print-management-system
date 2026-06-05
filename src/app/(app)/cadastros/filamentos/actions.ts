"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { applyStockDelta, type StockField } from "@/lib/filaments";
import { filamentSchema, type FilamentInput } from "./schema";

const LIST = "/cadastros/filamentos";

// Resultado das actions de form: o client (RHF) navega no sucesso e reflete a
// mensagem no erro. Validação de campo é rara aqui (o client já validou com o
// mesmo schema), então mensagem única basta.
export type FilamentActionResult = { ok: true; id: string } | { ok: false; message: string };

// Converte o input do form (com "" nos opcionais) na linha do banco.
function toRow(input: FilamentInput) {
  return {
    color: input.color,
    material: input.material,
    brand: input.brand.trim() === "" ? null : input.brand.trim(),
    weight: input.weight.trim() === "" ? null : input.weight.trim(),
    low_stock_threshold: input.lowStockThreshold,
  };
}

export async function createFilament(
  input: FilamentInput,
): Promise<FilamentActionResult> {
  // Fronteira de confiança: revalida com o mesmo schema do client.
  const parsed = filamentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Dados inválidos." };

  const supabase = await createClient();
  const row = toRow(parsed.data);
  const { data, error } = await supabase
    .from("filaments")
    .insert(row)
    .select("id")
    .single();
  if (error) return { ok: false, message: error.message };

  await logAudit({
    action: "create",
    entityType: "filament",
    entityId: data.id,
    details: { color: row.color, material: row.material },
  });

  revalidatePath(LIST);
  return { ok: true, id: data.id };
}

export async function updateFilament(
  id: string,
  input: FilamentInput,
): Promise<FilamentActionResult> {
  const parsed = filamentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Dados inválidos." };

  const supabase = await createClient();
  const row = toRow(parsed.data);
  const { error } = await supabase
    .from("filaments")
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, message: error.message };

  await logAudit({
    action: "update",
    entityType: "filament",
    entityId: id,
    details: { color: row.color, material: row.material },
  });

  revalidatePath(LIST);
  revalidatePath(`${LIST}/${id}`);
  return { ok: true, id };
}

// Delete via <form action>: redireciona de volta com ?error= quando bloqueado,
// espelhando o padrão de produtos/locais.
export async function deleteFilament(id: string) {
  const supabase = await createClient();

  // Bloqueia se ainda houver rolos (em estoque ou encomendados) em algum local —
  // o filament_stock cairia em cascata e perderíamos a contagem sem aviso.
  const { data: stock } = await supabase
    .from("filament_stock")
    .select("in_stock, on_order")
    .eq("filament_id", id);
  const hasStock = (stock ?? []).some((s) => s.in_stock > 0 || s.on_order > 0);
  if (hasStock) {
    redirect(
      `${LIST}/${id}?error=${encodeURIComponent(
        "Há rolos em estoque ou encomendados. Zere o estoque antes de excluir.",
      )}`,
    );
  }

  const { error } = await supabase.from("filaments").delete().eq("id", id);
  if (error) {
    redirect(`${LIST}/${id}?error=${encodeURIComponent(error.message)}`);
  }

  await logAudit({ action: "delete", entityType: "filament", entityId: id });

  revalidatePath(LIST);
  redirect(LIST);
}

export type AdjustStockResult =
  | { ok: true; value: number }
  | { ok: false; message: string };

// Ajuste rápido +/- de um toque: soma o delta ao campo (in_stock|on_order) do
// par filamento+local, sem deixar negativo, e registra a movimentação no audit.
export async function adjustStock(
  filamentId: string,
  locationId: string,
  field: StockField,
  delta: number,
): Promise<AdjustStockResult> {
  const supabase = await createClient();

  const { data: existing, error: readError } = await supabase
    .from("filament_stock")
    .select("in_stock, on_order")
    .eq("filament_id", filamentId)
    .eq("location_id", locationId)
    .maybeSingle();
  if (readError) return { ok: false, message: readError.message };

  const current = existing?.[field] ?? 0;
  const next = applyStockDelta(current, delta);
  if (next === current) return { ok: true, value: current };

  const payload = {
    filament_id: filamentId,
    location_id: locationId,
    in_stock: existing?.in_stock ?? 0,
    on_order: existing?.on_order ?? 0,
    [field]: next,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("filament_stock").upsert(payload);
  if (error) return { ok: false, message: error.message };

  await logAudit({
    action: "stock",
    entityType: "filament",
    entityId: filamentId,
    details: { locationId, field, delta, from: current, to: next },
  });

  revalidatePath(`${LIST}/${filamentId}`);
  return { ok: true, value: next };
}
