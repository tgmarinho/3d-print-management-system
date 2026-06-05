import { expect, test } from "bun:test";
import { parseClientForm } from "./clients";

function form(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) fd.set(key, value);
  return fd;
}

test("parseClientForm aceita nome e normaliza opcionais", () => {
  const result = parseClientForm(
    form({ name: " Karen ", company: "Acme", phone: "", email: "k@acme.com" }),
  );
  expect(result).toEqual({
    ok: true,
    value: { name: "Karen", company: "Acme", phone: null, email: "k@acme.com" },
  });
});

test("parseClientForm exige nome", () => {
  const result = parseClientForm(form({ name: "   " }));
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.error).toMatch(/nome/i);
});

test("parseClientForm rejeita e-mail sem @", () => {
  const result = parseClientForm(form({ name: "Karen", email: "invalido" }));
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.error).toMatch(/mail/i);
});

test("parseClientForm trata campos ausentes como null", () => {
  const result = parseClientForm(form({ name: "Karen" }));
  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.value).toEqual({
      name: "Karen",
      company: null,
      phone: null,
      email: null,
    });
  }
});
