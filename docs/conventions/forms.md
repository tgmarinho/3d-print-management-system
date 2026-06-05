# Formulários — React Hook Form + Zod

Convenção para **todo formulário com validação, estado ou submit não-trivial**
neste projeto. Para um `<input>` solto, sem validação, não force o setup.

## Princípios

1. **O schema Zod é a fonte de verdade.** Defina o schema uma vez, derive o tipo
   com `z.infer` e use o mesmo schema no client (UX) e no servidor (segurança).
2. **Valide no client _e_ revalide no servidor.** RHF + `zodResolver` dá o
   feedback instantâneo; a Server Action **revalida com o mesmo schema** — o
   client é conveniência, o servidor é a fronteira de confiança.
3. **Schema compartilhado** mora junto da feature (ex.:
   `src/app/(app)/filamentos/schema.ts`), importado pelo form e pela action.
4. **Selects:** avançados (busca/async/multi) → `react-select`; simples →
   `Select` do shadcn.

Pacotes (já instalados): `react-hook-form`, `@hookform/resolvers`, `zod`.
Componentes de UI: `src/components/ui/form.tsx` (shadcn, sobre RHF).

## Exemplo de referência

### 1. Schema compartilhado — `schema.ts`

```ts
import { z } from "zod";

export const filamentoSchema = z.object({
  nome: z.string().min(1, "Informe o nome"),
  material: z.enum(["PLA", "PETG", "ABS", "TPU"]),
  cor: z.string().min(1, "Informe a cor"),
  pesoGramas: z.coerce.number().int().positive("Peso deve ser positivo"),
});

export type FilamentoInput = z.infer<typeof filamentoSchema>;
```

### 2. Server Action — `actions.ts` (revalida com o MESMO schema)

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { filamentoSchema, type FilamentoInput } from "./schema";

export async function criarFilamento(input: FilamentoInput) {
  // Fronteira de confiança: nunca confie no client.
  const parsed = filamentoSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, errors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("filamentos").insert(parsed.data);
  if (error) return { ok: false as const, message: error.message };

  revalidatePath("/filamentos");
  return { ok: true as const };
}
```

### 3. Form no client — `filamento-form.tsx`

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { criarFilamento } from "./actions";
import { filamentoSchema, type FilamentoInput } from "./schema";

export function FilamentoForm() {
  const form = useForm<FilamentoInput>({
    resolver: zodResolver(filamentoSchema),
    defaultValues: { nome: "", material: "PLA", cor: "", pesoGramas: 1000 },
  });

  async function onSubmit(values: FilamentoInput) {
    const res = await criarFilamento(values);
    if (!res.ok) {
      // Reflete erros vindos do servidor nos campos.
      if (res.errors) {
        for (const [field, msgs] of Object.entries(res.errors)) {
          form.setError(field as keyof FilamentoInput, { message: msgs?.[0] });
        }
      }
      return;
    }
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* demais campos seguem o mesmo padrão */}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Salvar
        </Button>
      </form>
    </Form>
  );
}
```

## Notas

- **`z.coerce`** em campos numéricos: inputs HTML entregam string; `coerce`
  converte antes de validar.
- **Estado de submit:** use `form.formState.isSubmitting` para desabilitar o
  botão — não crie um `useState` paralelo.
- **Server Action vs `FormData`:** prefira passar o objeto tipado (validado pelo
  RHF) para a action, como acima. A action revalida com Zod de qualquer forma.
  O padrão `<form action={...}>` com `FormData` (ver
  `src/app/(auth)/login/`) é aceitável para forms triviais sem validação rica.
- **TDD:** teste o schema (casos válidos/inválidos) e a action separadamente do
  componente; são a parte com regra de negócio.
