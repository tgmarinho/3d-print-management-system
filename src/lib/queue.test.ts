import { expect, test } from "bun:test";
import {
  moveItem,
  moveToEnd,
  moveToFront,
  positionsToUpdate,
  rankInQueue,
} from "./queue";

test("moveItem move para frente e para trás sem mutar o original", () => {
  const base = ["a", "b", "c", "d"];
  expect(moveItem(base, 2, 0)).toEqual(["c", "a", "b", "d"]);
  expect(moveItem(base, 0, 3)).toEqual(["b", "c", "d", "a"]);
  expect(base).toEqual(["a", "b", "c", "d"]); // imutável
});

test("moveItem clampeia índices fora do intervalo", () => {
  expect(moveItem(["a", "b", "c"], 5, -2)).toEqual(["c", "a", "b"]);
});

test("moveToFront leva o id para o topo preservando o resto", () => {
  expect(moveToFront(["a", "b", "c"], "c")).toEqual(["c", "a", "b"]);
});

test("moveToFront é no-op quando já é o primeiro ou não existe", () => {
  expect(moveToFront(["a", "b", "c"], "a")).toEqual(["a", "b", "c"]);
  expect(moveToFront(["a", "b", "c"], "x")).toEqual(["a", "b", "c"]);
});

test("moveToEnd leva o id para o fim preservando o resto", () => {
  expect(moveToEnd(["a", "b", "c"], "a")).toEqual(["b", "c", "a"]);
});

test("moveToEnd é no-op quando já é o último ou não existe", () => {
  expect(moveToEnd(["a", "b", "c"], "c")).toEqual(["a", "b", "c"]);
  expect(moveToEnd(["a", "b", "c"], "x")).toEqual(["a", "b", "c"]);
});

test("positionsToUpdate permuta os mesmos valores de posição e retorna só os que mudaram", () => {
  // Posições atuais: a=1, b=2, c=3. Nova ordem: c, a, b.
  const current = { a: 1, b: 2, c: 3 };
  const updates = positionsToUpdate(["c", "a", "b"], current);
  // c -> 1, a -> 2, b -> 3 (todos mudaram).
  expect(updates).toEqual([
    { id: "c", position: 1 },
    { id: "a", position: 2 },
    { id: "b", position: 3 },
  ]);
});

test("positionsToUpdate preserva posições intercaladas (não renumera para 1..n)", () => {
  // Pedidos concluídos ocupam 2 e 4; a fila visível usa {1, 3, 5}.
  const current = { a: 1, b: 3, c: 5 };
  // Mover c para a frente: nova ordem c, a, b.
  const updates = positionsToUpdate(["c", "a", "b"], current);
  expect(updates).toEqual([
    { id: "c", position: 1 },
    { id: "a", position: 3 },
    { id: "b", position: 5 },
  ]);
});

test("positionsToUpdate retorna vazio quando a ordem não muda", () => {
  const current = { a: 1, b: 2, c: 3 };
  expect(positionsToUpdate(["a", "b", "c"], current)).toEqual([]);
});

test("rankInQueue devolve a posição 1-based pela ordem atual", () => {
  const current = { a: 5, b: 1, c: 3 };
  expect(rankInQueue(["a", "b", "c"], current, "b")).toBe(1);
  expect(rankInQueue(["a", "b", "c"], current, "c")).toBe(2);
  expect(rankInQueue(["a", "b", "c"], current, "a")).toBe(3);
});
