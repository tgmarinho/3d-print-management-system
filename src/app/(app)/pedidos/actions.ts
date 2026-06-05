"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/audit";
import {
  nextQueuePosition,
  type PaymentStatus,
  type ProductionStatus,
} from "@/lib/orders";
import { orderSchema, type OrderInput } from "./schema";

const LIST = "/pedidos";

// Resultado das actions de form: o client (RHF) navega no sucesso e reflete a
// mensagem no erro. O client já validou com o mesmo schema, então mensagem
// única basta.
export type OrderActionResult =
  | { ok: true; id: string }
  | { ok: false; message: string };

// Converte o input do form (com "" nos opcionais) na linha do banco. Catálogo
// tem precedência: com produto do catálogo, a descrição ad-hoc é descartada.
function toRow(input: OrderInput) {
  const hasCatalog = input.productId !== "";
  return {
    client_id: input.clientId,
    seller_id: input.sellerId === "" ? null : input.sellerId,
    modeler_id: input.modelerId === "" ? null : input.modelerId,
    product_id: hasCatalog ? input.productId : null,
    product_description: hasCatalog
      ? null
      : input.productDescription.trim() === ""
        ? null
        : input.productDescription.trim(),
    quantity: input.quantity,
    amount: input.amount,
    payment_status: input.paymentStatus,
  };
}

export async function createOrder(
  input: OrderInput,
): Promise<OrderActionResult> {
  // Fronteira de confiança: revalida com o mesmo schema do client.
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Dados inválidos." };

  const supabase = await createClient();

  // Próxima posição na fila: maior atual + 1 (a fila em si é gerida em outro
  // slice, mas o schema exige queue_position ao criar).
  const { data: last } = await supabase
    .from("orders")
    .select("queue_position")
    .order("queue_position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const row = {
    ...toRow(parsed.data),
    queue_position: nextQueuePosition(last?.queue_position),
  };

  const { data, error } = await supabase
    .from("orders")
    .insert(row)
    .select("id")
    .single();
  if (error) return { ok: false, message: error.message };

  await logAudit({
    action: "create",
    entityType: "order",
    entityId: data.id,
    details: { amount: row.amount, quantity: row.quantity },
  });

  revalidatePath(LIST);
  return { ok: true, id: data.id };
}

export async function updateOrder(
  id: string,
  input: OrderInput,
): Promise<OrderActionResult> {
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Dados inválidos." };

  const supabase = await createClient();
  const row = toRow(parsed.data);
  const { error } = await supabase
    .from("orders")
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, message: error.message };

  await logAudit({
    action: "update",
    entityType: "order",
    entityId: id,
    details: { amount: row.amount, quantity: row.quantity },
  });

  revalidatePath(LIST);
  revalidatePath(`${LIST}/${id}`);
  return { ok: true, id };
}

// Marca pago / a pagar num toque. Action dedicada (não passa pelo form) para
// usar na listagem e no detalhe; registra a mudança como "payment" no audit.
export async function setPaymentStatus(
  id: string,
  status: PaymentStatus,
): Promise<OrderActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, message: error.message };

  await logAudit({
    action: "payment",
    entityType: "order",
    entityId: id,
    details: { to: status },
  });

  revalidatePath(LIST);
  revalidatePath(`${LIST}/${id}`);
  return { ok: true, id };
}

// Avança/altera o status de produção (em espera → produzindo → concluído) num
// toque. Lê o status atual para registrar a transição no audit como "status".
export async function setProductionStatus(
  id: string,
  status: ProductionStatus,
): Promise<OrderActionResult> {
  const supabase = await createClient();

  const { data: current } = await supabase
    .from("orders")
    .select("production_status")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("orders")
    .update({ production_status: status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { ok: false, message: error.message };

  await logAudit({
    action: "status",
    entityType: "order",
    entityId: id,
    details: { from: current?.production_status ?? null, to: status },
  });

  revalidatePath(LIST);
  revalidatePath(`${LIST}/${id}`);
  return { ok: true, id };
}

// Delete via <form action>: redireciona de volta com ?error= quando bloqueado,
// espelhando o padrão de produtos/filamentos.
export async function deleteOrder(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) {
    redirect(`${LIST}/${id}?error=${encodeURIComponent(error.message)}`);
  }

  await logAudit({ action: "delete", entityType: "order", entityId: id });

  revalidatePath(LIST);
  redirect(LIST);
}
