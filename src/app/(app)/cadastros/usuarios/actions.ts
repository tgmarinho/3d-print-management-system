"use server";

import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { parseNewUserForm } from "@/lib/system-users";

export type ActionState = { error?: string; ok?: boolean };

const PATH = "/cadastros/usuarios";

export async function createUser(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = parseNewUserForm(formData);
  if (!parsed.ok) return { error: parsed.error };
  const { email, name, password } = parsed.value;

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // já pode entrar pelo login normal
    user_metadata: { name },
  });

  if (error || !data.user) {
    // Mensagem amigável para o caso mais comum (e-mail já existente).
    const message = /already|exist|registered/i.test(error?.message ?? "")
      ? "Já existe um usuário com esse e-mail."
      : "Não foi possível criar o usuário.";
    return { error: message };
  }

  await logAudit({
    action: "create",
    entityType: "system_user",
    entityId: data.user.id,
    details: { email, name },
  });
  revalidatePath(PATH);
  return { ok: true };
}

export async function deleteUser(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Usuário inválido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Salvaguarda: ninguém remove o próprio acesso (evita ficar sem admins ativos).
  if (user?.id === id) {
    return { error: "Você não pode remover o seu próprio acesso." };
  }

  const admin = createAdminClient();
  const { data: target } = await admin.auth.admin.getUserById(id);

  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return { error: "Não foi possível remover o usuário." };

  await logAudit({
    action: "delete",
    entityType: "system_user",
    entityId: id,
    details: { email: target.user?.email ?? null },
  });
  revalidatePath(PATH);
  return { ok: true };
}
