// Domínio de pedidos/orçamentos: tipos + lógica pura (sem I/O), testável
// isolada. Um pedido vincula cliente, vendedor, modelador e produto (do catálogo
// OU descrição ad-hoc), com quantidade e valor (R$) e situação de pagamento.
// As server actions revalidam o schema (em ./pedidos/schema) antes de gravar.

export type PaymentStatus = "unpaid" | "paid";
export type ProductionStatus = "waiting" | "producing" | "done";

export type Order = {
  id: string;
  client_id: string;
  seller_id: string | null;
  modeler_id: string | null;
  product_id: string | null;
  product_description: string | null;
  quantity: number;
  amount: number;
  payment_status: PaymentStatus;
  production_status: ProductionStatus;
  queue_position: number;
  created_at: string;
  updated_at: string;
};

// Relações embutidas (nome) que vêm do join do Supabase na listagem.
export type NamedRef = { name: string } | null;

export type OrderRelations = {
  client: NamedRef;
  seller: NamedRef;
  modeler: NamedRef;
  product: NamedRef;
};

// Item da listagem: o pedido + os nomes das entidades relacionadas.
export type OrderListItem = Order & OrderRelations;

// Opção genérica para os <select> do formulário.
export type Option = { id: string; name: string };

// Formata um valor em reais. Normaliza para número (numeric pode chegar como
// string do PostgREST) e usa o locale pt-BR.
const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatBRL(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return brl.format(Number.isFinite(value) ? value : 0);
}

// Rótulo do produto: nome do catálogo quando houver, senão a descrição ad-hoc.
export function productLabel(order: {
  product: NamedRef;
  product_description: string | null;
}): string {
  return order.product?.name ?? order.product_description ?? "Produto sem nome";
}

// Próxima posição na fila: o maior valor atual + 1 (começa em 1 quando vazio).
export function nextQueuePosition(currentMax: number | null | undefined): number {
  return (currentMax ?? 0) + 1;
}

export type PaymentFilter = "all" | "unpaid" | "paid";

// Filtra por situação de pagamento e por texto livre (nome do cliente ou
// produto/descrição). Pura para ser testável e rodar no client sobre a lista
// já carregada — mantém a busca instantânea no mobile.
export function filterOrders(
  orders: OrderListItem[],
  options: { query?: string; payment?: PaymentFilter },
): OrderListItem[] {
  const query = (options.query ?? "").trim().toLowerCase();
  const payment = options.payment ?? "all";

  return orders.filter((order) => {
    if (payment !== "all" && order.payment_status !== payment) return false;
    if (query === "") return true;

    const haystack = [
      order.client?.name,
      productLabel(order),
      order.seller?.name,
      order.modeler?.name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

// Resumo de pendências (a receber): quantidade e soma dos pedidos não pagos.
export function summarizePending(orders: OrderListItem[]): {
  count: number;
  total: number;
} {
  const pending = orders.filter((o) => o.payment_status === "unpaid");
  return {
    count: pending.length,
    total: pending.reduce((sum, o) => sum + Number(o.amount), 0),
  };
}
