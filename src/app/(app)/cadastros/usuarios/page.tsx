import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { sortSystemUsers, toSystemUser } from "@/lib/system-users";
import { UsersManager } from "./users-client";

export default async function UsuariosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // A API de Admin (service_role) é a única fonte com e-mail + último acesso.
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });

  const items = sortSystemUsers(
    (data?.users ?? []).map((raw) => toSystemUser(raw, user?.id ?? "")),
  );

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Usuários do sistema</h1>
        <p className="text-sm text-muted-foreground">
          Quem acessa o sistema (todos administradores). Crie uma senha
          provisória e repasse à pessoa — ela entra pelo login e pode trocá-la.
        </p>
      </div>
      <UsersManager items={items} />
    </section>
  );
}
