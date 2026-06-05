"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { parseProductForm } from "@/lib/products";

const LIST = "/cadastros/produtos";

function withError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createProduct(formData: FormData) {
  const parsed = parseProductForm(formData);
  if (!parsed.ok) withError(`${LIST}/novo`, parsed.error);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .insert(parsed.value)
    .select("id")
    .single();
  if (error) withError(`${LIST}/novo`, error.message);

  await logAudit({
    action: "create",
    entityType: "product",
    entityId: data.id,
    details: { name: parsed.value.name },
  });

  revalidatePath(LIST);
  redirect(LIST);
}

export async function updateProduct(id: string, formData: FormData) {
  const parsed = parseProductForm(formData);
  if (!parsed.ok) withError(`${LIST}/${id}`, parsed.error);

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ ...parsed.value, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) withError(`${LIST}/${id}`, error.message);

  await logAudit({
    action: "update",
    entityType: "product",
    entityId: id,
    details: { name: parsed.value.name },
  });

  revalidatePath(LIST);
  redirect(LIST);
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) withError(`${LIST}/${id}`, error.message);

  await logAudit({ action: "delete", entityType: "product", entityId: id });

  revalidatePath(LIST);
  redirect(LIST);
}
