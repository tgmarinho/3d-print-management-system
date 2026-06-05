"use server";

import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { isDuplicateName, parseLocationName } from "@/lib/locations";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error?: string; ok?: boolean };

const PATH = "/cadastros/locais";

export async function createLocation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseLocationName(formData.get("name"));
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("stock_locations")
    .select("id, name");
  if (existing && isDuplicateName(parsed.value, existing)) {
    return { error: "Já existe um local com esse nome." };
  }

  const { data, error } = await supabase
    .from("stock_locations")
    .insert({ name: parsed.value })
    .select("id")
    .single();
  if (error || !data) return { error: "Não foi possível criar o local." };

  await logAudit({
    action: "create",
    entityType: "stock_location",
    entityId: data.id,
    details: { name: parsed.value },
  });
  revalidatePath(PATH);
  return { ok: true };
}

export async function updateLocation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Local inválido." };

  const parsed = parseLocationName(formData.get("name"));
  if (!parsed.ok) return { error: parsed.error };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("stock_locations")
    .select("id, name");
  const current = existing?.find((location) => location.id === id);
  if (!current) return { error: "Local não encontrado." };
  if (isDuplicateName(parsed.value, existing ?? [], id)) {
    return { error: "Já existe um local com esse nome." };
  }
  // Nada mudou de fato: evita gravar/auditar sem necessidade.
  if (current.name === parsed.value) return { ok: true };

  const { error } = await supabase
    .from("stock_locations")
    .update({ name: parsed.value })
    .eq("id", id);
  if (error) return { error: "Não foi possível atualizar o local." };

  await logAudit({
    action: "update",
    entityType: "stock_location",
    entityId: id,
    details: { from: current.name, to: parsed.value },
  });
  revalidatePath(PATH);
  return { ok: true };
}

export async function deleteLocation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Local inválido." };

  const supabase = await createClient();

  // Remoção segura: bloqueia se houver estoque (em mãos ou encomendado) vinculado.
  const { data: linked } = await supabase
    .from("filament_stock")
    .select("in_stock, on_order")
    .eq("location_id", id);
  const hasStock = (linked ?? []).some(
    (row) => (row.in_stock ?? 0) > 0 || (row.on_order ?? 0) > 0,
  );
  if (hasStock) {
    return {
      error:
        "Não é possível remover: há estoque de filamento vinculado a este local.",
    };
  }

  const { data: location } = await supabase
    .from("stock_locations")
    .select("name")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("stock_locations")
    .delete()
    .eq("id", id);
  if (error) return { error: "Não foi possível remover o local." };

  await logAudit({
    action: "delete",
    entityType: "stock_location",
    entityId: id,
    details: { name: location?.name ?? null },
  });
  revalidatePath(PATH);
  return { ok: true };
}
