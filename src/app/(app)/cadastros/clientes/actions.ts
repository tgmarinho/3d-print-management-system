"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { parseClientForm } from "@/lib/clients";

const LIST = "/cadastros/clientes";

function withError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createClient(formData: FormData) {
  const parsed = parseClientForm(formData);
  if (!parsed.ok) withError(`${LIST}/novo`, parsed.error);

  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("clients")
    .insert(parsed.value)
    .select("id")
    .single();
  if (error) withError(`${LIST}/novo`, error.message);

  await logAudit({
    action: "create",
    entityType: "client",
    entityId: data.id,
    details: { name: parsed.value.name },
  });

  revalidatePath(LIST);
  redirect(LIST);
}

export async function updateClient(id: string, formData: FormData) {
  const parsed = parseClientForm(formData);
  if (!parsed.ok) withError(`${LIST}/${id}`, parsed.error);

  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("clients")
    .update({ ...parsed.value, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) withError(`${LIST}/${id}`, error.message);

  await logAudit({
    action: "update",
    entityType: "client",
    entityId: id,
    details: { name: parsed.value.name },
  });

  revalidatePath(LIST);
  redirect(LIST);
}

export async function deleteClient(id: string) {
  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  // Cliente com pedidos: a FK (on delete restrict) bloqueia a remoção.
  if (error) withError(`${LIST}/${id}`, error.message);

  await logAudit({ action: "delete", entityType: "client", entityId: id });

  revalidatePath(LIST);
  redirect(LIST);
}
