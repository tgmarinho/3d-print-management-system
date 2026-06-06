type RawEnv = Record<string, string | undefined>;

export function parseEnv(raw: RawEnv = process.env) {
  const supabaseUrl = raw.NEXT_PUBLIC_SUPABASE_URL;
  // Supabase renomeou a chave pública de `anon` para `publishable` (sb_publishable_…);
  // preferimos a nova e mantemos fallback para a antiga.
  const supabaseAnonKey =
    raw.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? raw.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl) throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) {
    throw new Error(
      "Falta NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (ou NEXT_PUBLIC_SUPABASE_ANON_KEY)",
    );
  }
  return { supabaseUrl, supabaseAnonKey };
}

// Chave secreta (service_role / sb_secret_…): SOMENTE no servidor. Habilita as
// operações de Admin do Supabase (gestão de usuários do sistema).
export function requireServiceRoleKey(raw: RawEnv = process.env): string {
  const key = raw.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY");
  return key;
}

// Acesso LITERAL a `process.env.NEXT_PUBLIC_*`. No bundle do client o
// Turbopack/Next só substitui essas variáveis quando o acesso é literal —
// acesso via alias (ex.: `raw[key]`) não é inlinado e fica `undefined` no
// browser. Por isso montamos o objeto aqui com os literais e o repassamos.
function publicEnv(): RawEnv {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

// Lazy: valida só quando uma propriedade é acessada (runtime), não no import.
// Assim o build/testes não exigem as variáveis presentes só por importar o módulo.
export const env = {
  get supabaseUrl() {
    return parseEnv(publicEnv()).supabaseUrl;
  },
  get supabaseAnonKey() {
    return parseEnv(publicEnv()).supabaseAnonKey;
  },
  get supabaseServiceRoleKey() {
    return requireServiceRoleKey();
  },
};
