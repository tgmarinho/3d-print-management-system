import { expect, test } from "bun:test";
import { filamentSchema } from "./schema";

const valid = {
  color: "Preto",
  material: "PLA",
  brand: "Voolt3D",
  weight: "1kg",
  lowStockThreshold: 2,
};

test("filamentSchema aceita um filamento completo e válido", () => {
  const result = filamentSchema.safeParse(valid);
  expect(result.success).toBe(true);
});

test("filamentSchema apara a cor e exige preenchimento", () => {
  expect(filamentSchema.safeParse({ ...valid, color: "  " }).success).toBe(false);
  const trimmed = filamentSchema.safeParse({ ...valid, color: "  Azul  " });
  expect(trimmed.success && trimmed.data.color).toBe("Azul");
});

test("filamentSchema trata marca e peso como opcionais (default vazio)", () => {
  const result = filamentSchema.safeParse({
    color: "Branco",
    material: "PETG",
    lowStockThreshold: 0,
  });
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.brand).toBe("");
    expect(result.data.weight).toBe("");
  }
});

test("filamentSchema rejeita material fora da lista", () => {
  expect(filamentSchema.safeParse({ ...valid, material: "Madeira" }).success).toBe(
    false,
  );
});

test("filamentSchema coage o limite de string para inteiro", () => {
  const result = filamentSchema.safeParse({ ...valid, lowStockThreshold: "5" });
  expect(result.success && result.data.lowStockThreshold).toBe(5);
});

test("filamentSchema rejeita limite negativo ou fracionário", () => {
  expect(filamentSchema.safeParse({ ...valid, lowStockThreshold: -1 }).success).toBe(
    false,
  );
  expect(filamentSchema.safeParse({ ...valid, lowStockThreshold: 1.5 }).success).toBe(
    false,
  );
});
