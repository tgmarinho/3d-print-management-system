import { z } from "zod";

// Fonte de verdade do formulário de pedido: validado no client (RHF +
// zodResolver) e revalidado com o MESMO schema na server action.
// Campos opcionais usam default("") para casar com os inputs controlados do
// RHF; a action converte "" em null antes de gravar. O produto pode vir do
// catálogo (productId) OU como descrição ad-hoc (productDescription): o refine
// garante que ao menos um esteja presente, espelhando a constraint do banco.
export const orderSchema = z
  .object({
    clientId: z.string().min(1, "Selecione o cliente."),
    sellerId: z.string().default(""),
    modelerId: z.string().default(""),
    productId: z.string().default(""),
    productDescription: z
      .string()
      .trim()
      .max(500, "Descrição deve ter no máximo 500 caracteres.")
      .default(""),
    quantity: z.coerce
      .number({ message: "Informe a quantidade." })
      .int("Use um número inteiro.")
      .min(1, "Quantidade mínima é 1."),
    amount: z.coerce
      .number({ message: "Informe o valor." })
      .min(0, "O valor não pode ser negativo."),
    paymentStatus: z.enum(["unpaid", "paid"]).default("unpaid"),
  })
  .refine((v) => v.productId !== "" || v.productDescription !== "", {
    message: "Escolha um produto do catálogo ou descreva o produto.",
    path: ["productDescription"],
  });

// Saída validada (o que vai para a action) e entrada do form (antes de coerce/
// default) — diferem por causa de z.coerce/z.default, então o RHF precisa dos dois.
export type OrderInput = z.infer<typeof orderSchema>;
export type OrderFormInput = z.input<typeof orderSchema>;
