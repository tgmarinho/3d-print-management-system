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

// Lazy: valida só quando uma propriedade é acessada (runtime), não no import.
// Assim o build/testes não exigem as variáveis presentes só por importar o módulo.
export const env = {
  get supabaseUrl() {
    return parseEnv().supabaseUrl;
  },
  get supabaseAnonKey() {
    return parseEnv().supabaseAnonKey;
  },
};
