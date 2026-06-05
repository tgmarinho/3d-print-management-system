import { createClient } from "@/lib/supabase/server";
import type { Option } from "@/lib/orders";
import type { OrderFormOptions } from "./order-form";

// Carrega as opções dos selects do formulário (cliente/vendedor/modelador/
// produto) num único round-trip. Util server-side compartilhado pelas páginas
// de criação e edição.
export async function loadOrderFormOptions(): Promise<OrderFormOptions> {
  const supabase = await createClient();
  const [clients, sellers, modelers, products] = await Promise.all([
    supabase.from("clients").select("id, name").order("name"),
    supabase.from("sellers").select("id, name").order("name"),
    supabase.from("modelers").select("id, name").order("name"),
    supabase.from("products").select("id, name").order("name"),
  ]);

  return {
    clients: (clients.data ?? []) as Option[],
    sellers: (sellers.data ?? []) as Option[],
    modelers: (modelers.data ?? []) as Option[],
    products: (products.data ?? []) as Option[],
  };
}
