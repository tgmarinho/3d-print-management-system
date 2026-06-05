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

test("parseEnv prefere a publishable key sobre a anon", () => {
  const result = parseEnv({
    NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_abc",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  });
  expect(result.supabaseAnonKey).toBe("sb_publishable_abc");
});

test("parseEnv lança erro quando falta a chave pública", () => {
  expect(() => parseEnv({ NEXT_PUBLIC_SUPABASE_URL: "https://x.supabase.co" })).toThrow(
    /PUBLISHABLE_KEY/,
  );
});
