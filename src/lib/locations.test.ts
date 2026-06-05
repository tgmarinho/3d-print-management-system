import { expect, test } from "bun:test";
import {
  LOCATION_NAME_MAX_LENGTH,
  isDuplicateName,
  normalizeLocationName,
  parseLocationName,
} from "./locations";

test("parseLocationName apara espaços e colapsa espaços internos", () => {
  const result = parseLocationName("  casa   da  Karen ");
  expect(result).toEqual({ ok: true, value: "casa da Karen" });
});

test("parseLocationName rejeita vazio ou só espaços", () => {
  expect(parseLocationName("   ").ok).toBe(false);
  expect(parseLocationName("").ok).toBe(false);
  expect(parseLocationName(null).ok).toBe(false);
  expect(parseLocationName(undefined).ok).toBe(false);
});

test("parseLocationName rejeita nome acima do limite", () => {
  const tooLong = "a".repeat(LOCATION_NAME_MAX_LENGTH + 1);
  expect(parseLocationName(tooLong).ok).toBe(false);
});

test("parseLocationName aceita nome no limite exato", () => {
  const exact = "a".repeat(LOCATION_NAME_MAX_LENGTH);
  expect(parseLocationName(exact)).toEqual({ ok: true, value: exact });
});

test("normalizeLocationName ignora caixa e espaços", () => {
  expect(normalizeLocationName("  Casa DA Karen ")).toBe(
    normalizeLocationName("casa da karen"),
  );
});

test("isDuplicateName detecta nome igual ignorando caixa", () => {
  const existing = [
    { id: "1", name: "casa da Karen" },
    { id: "2", name: "casa da Letícia" },
  ];
  expect(isDuplicateName("CASA DA KAREN", existing)).toBe(true);
  expect(isDuplicateName("casa do João", existing)).toBe(false);
});

test("isDuplicateName ignora o próprio registro ao editar", () => {
  const existing = [
    { id: "1", name: "casa da Karen" },
    { id: "2", name: "casa da Letícia" },
  ];
  // Renomear o id 1 mantendo o mesmo nome não conta como duplicata.
  expect(isDuplicateName("casa da Karen", existing, "1")).toBe(false);
  // Mas colidir com outro registro conta.
  expect(isDuplicateName("casa da Letícia", existing, "1")).toBe(true);
});
