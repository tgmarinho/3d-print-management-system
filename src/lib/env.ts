type RawEnv = Record<string, string | undefined>;

export function parseEnv(raw: RawEnv = process.env) {
  const supabaseUrl = raw.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = raw.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl) throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL");
  if (!supabaseAnonKey) throw new Error("Falta NEXT_PUBLIC_SUPABASE_ANON_KEY");
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
