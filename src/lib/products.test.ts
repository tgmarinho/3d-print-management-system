import { expect, test } from "bun:test";
import { parseProductForm } from "./products";

function form(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(entries)) fd.set(key, value);
  return fd;
}

test("parseProductForm normaliza nome e descrição", () => {
  const result = parseProductForm(
    form({ name: " Vaso geométrico ", description: " PLA 20cm " }),
  );
  expect(result).toEqual({
    ok: true,
    value: { name: "Vaso geométrico", description: "PLA 20cm" },
  });
});

test("parseProductForm trata descrição vazia/ausente como null", () => {
  expect(parseProductForm(form({ name: "Vaso", description: "   " }))).toEqual({
    ok: true,
    value: { name: "Vaso", description: null },
  });
  expect(parseProductForm(form({ name: "Vaso" }))).toEqual({
    ok: true,
    value: { name: "Vaso", description: null },
  });
});

test("parseProductForm exige nome", () => {
  const result = parseProductForm(form({ name: "   ", description: "x" }));
  expect(result.ok).toBe(false);
  if (!result.ok) expect(result.error).toMatch(/nome/i);
});

test("parseProductForm rejeita nome muito longo", () => {
  const result = parseProductForm(form({ name: "a".repeat(121) }));
  expect(result.ok).toBe(false);
});

test("parseProductForm rejeita descrição muito longa", () => {
  const result = parseProductForm(
    form({ name: "ok", description: "a".repeat(1001) }),
  );
  expect(result.ok).toBe(false);
});
