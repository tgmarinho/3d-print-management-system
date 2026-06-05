"use server";

import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import { PEOPLE_KINDS, isPersonKind, parsePersonForm, type PersonKind } from "@/lib/people";

function listPath(kind: PersonKind): string {
  return `/cadastros/${kind}`;
}

function withError(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

export async function createPerson(kind: PersonKind, formData: FormData) {
  if (!isPersonKind(kind)) notFound();
  const { table, entityType } = PEOPLE_KINDS[kind];

  const parsed = parsePersonForm(formData);
  if (!parsed.ok) withError(`${listPath(kind)}/novo`, parsed.error);

  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from(table)
    .insert(parsed.value)
    .select("id")
    .single();
  if (error) withError(`${listPath(kind)}/novo`, error.message);

  await logAudit({
    action: "create",
    entityType,
    entityId: data.id,
    details: { name: parsed.value.name },
  });

  revalidatePath(listPath(kind));
  redirect(listPath(kind));
}

export async function updatePerson(kind: PersonKind, id: string, formData: FormData) {
  if (!isPersonKind(kind)) notFound();
  const { table, entityType } = PEOPLE_KINDS[kind];

  const parsed = parsePersonForm(formData);
  if (!parsed.ok) withError(`${listPath(kind)}/${id}`, parsed.error);

  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from(table)
    .update({ ...parsed.value, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) withError(`${listPath(kind)}/${id}`, error.message);

  await logAudit({
    action: "update",
    entityType,
    entityId: id,
    details: { name: parsed.value.name },
  });

  revalidatePath(listPath(kind));
  redirect(listPath(kind));
}

export async function deletePerson(kind: PersonKind, id: string) {
  if (!isPersonKind(kind)) notFound();
  const { table, entityType } = PEOPLE_KINDS[kind];

  const supabase = await createSupabaseClient();
  const { error } = await supabase.from(table).delete().eq("id", id);
  // Pedidos referenciam vendedor/modelador com `on delete set null`: a remoção
  // não é bloqueada, apenas desvincula dos pedidos existentes.
  if (error) withError(`${listPath(kind)}/${id}`, error.message);

  await logAudit({ action: "delete", entityType, entityId: id });

  revalidatePath(listPath(kind));
  redirect(listPath(kind));
}
