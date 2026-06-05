import { expect, test } from "bun:test";
import { orderSchema } from "./schema";

const valid = {
  clientId: "c-1",
  sellerId: "",
  modelerId: "",
  productId: "p-1",
  productDescription: "",
  quantity: 2,
  amount: 150.5,
  paymentStatus: "unpaid" as const,
};

test("orderSchema aceita um pedido válido com produto do catálogo", () => {
  expect(orderSchema.safeParse(valid).success).toBe(true);
});

test("orderSchema aceita produto ad-hoc (sem catálogo, com descrição)", () => {
  const result = orderSchema.safeParse({
    ...valid,
    productId: "",
    productDescription: "Peça sob medida",
  });
  expect(result.success).toBe(true);
});

test("orderSchema rejeita quando não há produto nem descrição", () => {
  const result = orderSchema.safeParse({
    ...valid,
    productId: "",
    productDescription: "",
  });
  expect(result.success).toBe(false);
});

test("orderSchema exige cliente", () => {
  expect(orderSchema.safeParse({ ...valid, clientId: "" }).success).toBe(false);
});

test("orderSchema coage quantidade/valor de string e valida limites", () => {
  const result = orderSchema.safeParse({
    ...valid,
    quantity: "3",
    amount: "99.9",
  });
  expect(result.success && result.data.quantity).toBe(3);
  expect(result.success && result.data.amount).toBe(99.9);

  expect(orderSchema.safeParse({ ...valid, quantity: 0 }).success).toBe(false);
  expect(orderSchema.safeParse({ ...valid, quantity: 1.5 }).success).toBe(false);
  expect(orderSchema.safeParse({ ...valid, amount: -1 }).success).toBe(false);
});

test("orderSchema preenche defaults dos opcionais", () => {
  const result = orderSchema.safeParse({
    clientId: "c-1",
    productId: "p-1",
    quantity: 1,
    amount: 0,
  });
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.data.sellerId).toBe("");
    expect(result.data.modelerId).toBe("");
    expect(result.data.paymentStatus).toBe("unpaid");
  }
});
