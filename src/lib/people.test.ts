import { expect, test } from "bun:test";
import { isPersonKind, parsePersonForm } from "./people";

function formOf(entries: Record<string, string>): FormData {
  const form = new FormData();
  for (const [key, value] of Object.entries(entries)) form.set(key, value);
  return form;
}

test("parsePersonForm normaliza o nome e converte campos vazios em null", () => {
  const result = parsePersonForm(formOf({ name: "  Maria  ", phone: "", email: "   " }));
  expect(result).toEqual({ ok: true, value: { name: "Maria", phone: null, email: null } });
});

test("parsePersonForm preserva celular e e-mail quando informados", () => {
  const result = parsePersonForm(formOf({ name: "João", phone: "11 99999-0000", email: "j@x.com" }));
  expect(result).toEqual({
    ok: true,
    value: { name: "João", phone: "11 99999-0000", email: "j@x.com" },
  });
});

test("parsePersonForm rejeita nome vazio", () => {
  expect(parsePersonForm(formOf({ name: "   " }))).toEqual({
    ok: false,
    error: "Nome é obrigatório.",
  });
});

test("parsePersonForm rejeita e-mail sem @", () => {
  const result = parsePersonForm(formOf({ name: "Ana", email: "invalido" }));
  expect(result).toEqual({ ok: false, error: "E-mail inválido." });
});

test("isPersonKind aceita apenas vendedores e modeladores", () => {
  expect(isPersonKind("vendedores")).toBe(true);
  expect(isPersonKind("modeladores")).toBe(true);
  expect(isPersonKind("clientes")).toBe(false);
});
