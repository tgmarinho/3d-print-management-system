import { OrderForm } from "../order-form";
import { loadOrderFormOptions } from "../options";

export default async function NewOrderPage() {
  const options = await loadOrderFormOptions();

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Novo pedido</h1>
      <OrderForm options={options} />
    </section>
  );
}
