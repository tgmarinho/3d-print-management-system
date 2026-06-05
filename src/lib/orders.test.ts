import { expect, test } from "bun:test";
import {
  filterOrders,
  formatBRL,
  nextQueuePosition,
  producingOrders,
  productionStatusLabel,
  productLabel,
  queuedOrders,
  summarizePending,
  summarizeProduction,
  type OrderListItem,
} from "./orders";

function makeOrder(overrides: Partial<OrderListItem> = {}): OrderListItem {
  return {
    id: "o-1",
    client_id: "c-1",
    seller_id: null,
    modeler_id: null,
    product_id: null,
    product_description: "Peça ad-hoc",
    quantity: 1,
    amount: 100,
    payment_status: "unpaid",
    production_status: "waiting",
    queue_position: 1,
    created_at: "2026-06-05T00:00:00Z",
    updated_at: "2026-06-05T00:00:00Z",
    client: { name: "Karen" },
    seller: null,
    modeler: null,
    product: null,
    ...overrides,
  };
}

test("formatBRL formata em reais com duas casas", () => {
  expect(formatBRL(1234.5).replace(/\s/g, "")).toBe("R$1.234,50");
  expect(formatBRL(0).replace(/\s/g, "")).toBe("R$0,00");
});

test("formatBRL aceita string (numeric do PostgREST) e valor inválido vira 0", () => {
  expect(formatBRL("10.9").replace(/\s/g, "")).toBe("R$10,90");
  expect(formatBRL(Number.NaN).replace(/\s/g, "")).toBe("R$0,00");
});

test("productLabel prefere o nome do catálogo e cai na descrição ad-hoc", () => {
  expect(
    productLabel({ product: { name: "Vaso" }, product_description: "x" }),
  ).toBe("Vaso");
  expect(
    productLabel({ product: null, product_description: "Suporte sob medida" }),
  ).toBe("Suporte sob medida");
});

test("nextQueuePosition começa em 1 e incrementa o máximo", () => {
  expect(nextQueuePosition(null)).toBe(1);
  expect(nextQueuePosition(undefined)).toBe(1);
  expect(nextQueuePosition(7)).toBe(8);
});

test("filterOrders filtra por situação de pagamento", () => {
  const orders = [
    makeOrder({ id: "a", payment_status: "unpaid" }),
    makeOrder({ id: "b", payment_status: "paid" }),
  ];
  expect(filterOrders(orders, { payment: "paid" }).map((o) => o.id)).toEqual([
    "b",
  ]);
  expect(filterOrders(orders, { payment: "all" })).toHaveLength(2);
});

test("filterOrders busca por cliente e por produto/descrição", () => {
  const orders = [
    makeOrder({ id: "a", client: { name: "Karen" } }),
    makeOrder({
      id: "b",
      client: { name: "Cassio" },
      product: { name: "Engrenagem" },
      product_description: null,
    }),
  ];
  expect(filterOrders(orders, { query: "kar" }).map((o) => o.id)).toEqual(["a"]);
  expect(filterOrders(orders, { query: "engren" }).map((o) => o.id)).toEqual([
    "b",
  ]);
  expect(filterOrders(orders, { query: "  " })).toHaveLength(2);
});

test("filterOrders filtra por status de produção", () => {
  const orders = [
    makeOrder({ id: "a", production_status: "waiting" }),
    makeOrder({ id: "b", production_status: "producing" }),
    makeOrder({ id: "c", production_status: "done" }),
  ];
  expect(
    filterOrders(orders, { production: "producing" }).map((o) => o.id),
  ).toEqual(["b"]);
  expect(filterOrders(orders, { production: "all" })).toHaveLength(3);
});

test("filterOrders combina pagamento, produção e busca", () => {
  const orders = [
    makeOrder({
      id: "a",
      client: { name: "Karen" },
      payment_status: "unpaid",
      production_status: "producing",
    }),
    makeOrder({
      id: "b",
      client: { name: "Karen" },
      payment_status: "paid",
      production_status: "producing",
    }),
    makeOrder({
      id: "c",
      client: { name: "Cassio" },
      payment_status: "unpaid",
      production_status: "producing",
    }),
  ];
  expect(
    filterOrders(orders, {
      query: "karen",
      payment: "unpaid",
      production: "producing",
    }).map((o) => o.id),
  ).toEqual(["a"]);
});

test("productionStatusLabel traduz cada status", () => {
  expect(productionStatusLabel("waiting")).toBe("Em espera");
  expect(productionStatusLabel("producing")).toBe("Produzindo");
  expect(productionStatusLabel("done")).toBe("Concluído");
});

test("summarizeProduction conta pedidos por status", () => {
  const orders = [
    makeOrder({ id: "a", production_status: "waiting" }),
    makeOrder({ id: "b", production_status: "producing" }),
    makeOrder({ id: "c", production_status: "producing" }),
    makeOrder({ id: "d", production_status: "done" }),
  ];
  expect(summarizeProduction(orders)).toEqual({
    waiting: 1,
    producing: 2,
    done: 1,
  });
});

test("summarizePending soma apenas os não pagos", () => {
  const orders = [
    makeOrder({ id: "a", payment_status: "unpaid", amount: 100 }),
    makeOrder({ id: "b", payment_status: "unpaid", amount: 50 }),
    makeOrder({ id: "c", payment_status: "paid", amount: 999 }),
  ];
  expect(summarizePending(orders)).toEqual({ count: 2, total: 150 });
});

test("queuedOrders pega só os em espera, ordenados pela posição na fila", () => {
  const orders = [
    makeOrder({ id: "a", production_status: "waiting", queue_position: 3 }),
    makeOrder({ id: "b", production_status: "producing", queue_position: 1 }),
    makeOrder({ id: "c", production_status: "waiting", queue_position: 1 }),
    makeOrder({ id: "d", production_status: "done", queue_position: 2 }),
    makeOrder({ id: "e", production_status: "waiting", queue_position: 2 }),
  ];
  expect(queuedOrders(orders).map((o) => o.id)).toEqual(["c", "e", "a"]);
});

test("queuedOrders não muta o array recebido", () => {
  const orders = [
    makeOrder({ id: "a", production_status: "waiting", queue_position: 2 }),
    makeOrder({ id: "b", production_status: "waiting", queue_position: 1 }),
  ];
  queuedOrders(orders);
  expect(orders.map((o) => o.id)).toEqual(["a", "b"]);
});

test("producingOrders pega só os em produção", () => {
  const orders = [
    makeOrder({ id: "a", production_status: "producing" }),
    makeOrder({ id: "b", production_status: "waiting" }),
    makeOrder({ id: "c", production_status: "producing" }),
    makeOrder({ id: "d", production_status: "done" }),
  ];
  expect(producingOrders(orders).map((o) => o.id)).toEqual(["a", "c"]);
});
