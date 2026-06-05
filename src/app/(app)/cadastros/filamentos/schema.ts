import { z } from "zod";
import { MATERIALS } from "@/lib/filaments";

// Fonte de verdade do formulário de filamento: validado no client (RHF +
// zodResolver) e revalidado com o MESMO schema na server action.
// Campos opcionais usam default("") para casar com os inputs controlados do
// RHF; a action converte "" em null antes de gravar.
export const filamentSchema = z.object({
  color: z
    .string()
    .trim()
    .min(1, "Informe a cor.")
    .max(60, "Cor deve ter no máximo 60 caracteres."),
  material: z.enum(MATERIALS, { message: "Selecione o material." }),
  brand: z
    .string()
    .trim()
    .max(60, "Marca deve ter no máximo 60 caracteres.")
    .default(""),
  weight: z
    .string()
    .trim()
    .max(30, "Peso deve ter no máximo 30 caracteres.")
    .default(""),
  lowStockThreshold: z.coerce
    .number({ message: "Informe um número." })
    .int("Use um número inteiro.")
    .min(0, "O limite não pode ser negativo."),
});

// Saída validada (o que vai para a action) e entrada do form (antes de coerce/
// default) — diferem por causa de z.coerce/z.default, então o RHF precisa dos dois.
export type FilamentInput = z.infer<typeof filamentSchema>;
export type FilamentFormInput = z.input<typeof filamentSchema>;
