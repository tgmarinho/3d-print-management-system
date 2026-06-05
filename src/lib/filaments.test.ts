import { expect, test } from "bun:test";
import {
  applyStockDelta,
  filamentLabel,
  isLowStock,
  summarizeFilamentStock,
  sumInStockByFilament,
  type Filament,
} from "./filaments";

test("applyStockDelta soma o delta quando o resultado é positivo", () => {
  expect(applyStockDelta(3, 1)).toBe(4);
  expect(applyStockDelta(0, 2)).toBe(2);
});

test("applyStockDelta nunca deixa o estoque ficar negativo", () => {
  expect(applyStockDelta(0, -1)).toBe(0);
  expect(applyStockDelta(2, -5)).toBe(0);
});

test("applyStockDelta com delta zero mantém o valor", () => {
  expect(applyStockDelta(7, 0)).toBe(7);
});

test("filamentLabel combina cor e material", () => {
  expect(filamentLabel({ color: "Preto", material: "PLA" })).toBe("Preto · PLA");
});

test("isLowStock só sinaliza quando há limite configurado", () => {
  // Sem limite (0) nunca é estoque baixo, mesmo com 0 rolos.
  expect(isLowStock(0, 0)).toBe(false);
});

test("isLowStock sinaliza no limite ou abaixo dele", () => {
  expect(isLowStock(2, 3)).toBe(true);
  expect(isLowStock(3, 3)).toBe(true);
  expect(isLowStock(4, 3)).toBe(false);
});

test("sumInStockByFilament agrega o estoque de vários locais", () => {
  const total = sumInStockByFilament([
    { filament_id: "a", in_stock: 2 },
    { filament_id: "a", in_stock: 3 },
    { filament_id: "b", in_stock: 1 },
  ]);
  expect(total.get("a")).toBe(5);
  expect(total.get("b")).toBe(1);
  expect(total.get("c")).toBeUndefined();
});

test("summarizeFilamentStock resolve total e flag de estoque baixo", () => {
  const base = {
    color: "",
    material: "PLA",
    brand: null,
    weight: null,
    created_at: "",
    updated_at: "",
  } satisfies Partial<Filament>;
  const filaments: Filament[] = [
    { ...base, id: "a", color: "Preto", low_stock_threshold: 3 },
    { ...base, id: "b", color: "Branco", low_stock_threshold: 0 },
    { ...base, id: "c", color: "Azul", low_stock_threshold: 5 },
  ];
  const inStockById = new Map([
    ["a", 2],
    ["b", 0],
    // "c" sem estoque registrado → 0
  ]);

  const summary = summarizeFilamentStock(filaments, inStockById);
  expect(summary.map((s) => [s.id, s.inStock, s.low])).toEqual([
    ["a", 2, true],
    ["b", 0, false],
    ["c", 0, true],
  ]);
});
