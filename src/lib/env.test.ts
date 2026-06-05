import { expect, test } from "bun:test";
import { parseEnv } from "./env";

test("parseEnv retorna as URLs/keys quando presentes", () => {
  const result = parseEnv({
    NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  });
  expect(result.supabaseUrl).toBe("https://x.supabase.co");
  expect(result.supabaseAnonKey).toBe("anon-key");
});

test("parseEnv lança erro quando falta variável", () => {
  expect(() => parseEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co" })).toThrow(
    /NEXT_PUBLIC_SUPABASE_ANON_KEY/,
  );
});
