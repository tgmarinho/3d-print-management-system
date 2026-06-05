import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

// Cliente com a service_role: ignora RLS e libera a API de Admin do Auth
// (listar/convidar/remover usuários). Use SOMENTE em Server Actions/rotas de
// servidor — a service_role nunca pode chegar ao browser.
export function createAdminClient() {
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
