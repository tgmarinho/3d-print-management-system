import { expect, test } from "bun:test";
import { applyStockDelta, filamentLabel } from "./filaments";

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
