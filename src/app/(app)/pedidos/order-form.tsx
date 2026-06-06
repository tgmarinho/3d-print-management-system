"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button, buttonVariants } from "@/components/ui/button";
import { EntityCombobox } from "@/components/entity-combobox";
import type { Option, Order } from "@/lib/orders";
import { cn } from "@/lib/utils";
import { orderSchema, type OrderFormInput, type OrderInput } from "./schema";
import {
  createOrder,
  quickCreateClient,
  quickCreateModeler,
  quickCreateSeller,
  updateOrder,
} from "./actions";

const LIST = "/pedidos";

// Mesmas classes do Input (base-ui) para os <select> nativos — picker nativo é a
// melhor escolha mobile-first para escolher cliente/vendedor/modelador/produto.
const selectClassName = cn(
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
  "md:text-sm dark:bg-input/30",
);

export type OrderFormOptions = {
  clients: Option[];
  sellers: Option[];
  modelers: Option[];
  products: Option[];
};

export function OrderForm({
  order,
  options,
}: {
  order?: Order;
  options: OrderFormOptions;
}) {
  const router = useRouter();
  const editing = Boolean(order);

  const form = useForm<OrderFormInput, unknown, OrderInput>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      clientId: order?.client_id ?? "",
      sellerId: order?.seller_id ?? "",
      modelerId: order?.modeler_id ?? "",
      productId: order?.product_id ?? "",
      productDescription: order?.product_description ?? "",
      quantity: order?.quantity ?? 1,
      amount: order?.amount ?? 0,
      paymentStatus: order?.payment_status ?? "unpaid",
    },
  });

  async function onSubmit(values: OrderInput) {
    const result = order
      ? await updateOrder(order.id, values)
      : await createOrder(values);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(editing ? "Pedido atualizado." : "Pedido criado.");
    router.push(editing ? `${LIST}/${result.id}` : LIST);
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Cliente <span className="text-brand">*</span>
              </FormLabel>
              <FormControl>
                <EntityCombobox
                  options={options.clients}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Buscar ou cadastrar cliente…"
                  onCreate={quickCreateClient}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sellerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendedor</FormLabel>
              <FormControl>
                <EntityCombobox
                  options={options.sellers}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Buscar ou cadastrar vendedor…"
                  isClearable
                  onCreate={quickCreateSeller}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="modelerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modelador</FormLabel>
              <FormControl>
                <EntityCombobox
                  options={options.modelers}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Buscar ou cadastrar modelador…"
                  isClearable
                  onCreate={quickCreateModeler}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Produto do catálogo</FormLabel>
              <FormControl>
                <select
                  {...field}
                  value={field.value ?? ""}
                  className={selectClassName}
                >
                  <option value="">— Outro (descrever abaixo) —</option>
                  {options.products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormDescription>
                Escolha um item do catálogo ou deixe em branco e descreva o
                produto.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="productDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição do produto</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Obrigatório quando não há produto do catálogo"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>
                  Quantidade <span className="text-brand">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={(field.value ?? "") as string | number}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>
                  Valor (R$) <span className="text-brand">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={0.01}
                    name={field.name}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    value={(field.value ?? "") as string | number}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="paymentStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pagamento</FormLabel>
              <FormControl>
                <select
                  {...field}
                  value={field.value ?? "unpaid"}
                  className={selectClassName}
                >
                  <option value="unpaid">A pagar</option>
                  <option value="paid">Pago</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            className="flex-1"
            disabled={form.formState.isSubmitting}
          >
            Salvar
          </Button>
          <Link href={LIST} className={buttonVariants({ variant: "outline" })}>
            Cancelar
          </Link>
        </div>
      </form>
    </Form>
  );
}
