# Forms — React Hook Form + Zod

Convention for **every form with non-trivial validation, state, or submit logic**
in this project. For a standalone `<input>` with no validation, don't force the setup.

## Principles

1. **The Zod schema is the source of truth.** Define the schema once, derive the
   type with `z.infer`, and use the same schema on the client (UX) and on the
   server (security).
2. **Validate on the client _and_ re-validate on the server.** RHF +
   `zodResolver` provides instant feedback; the Server Action **re-validates with
   the same schema** — the client is a convenience, the server is the trust
   boundary.
3. **Shared schema** lives alongside the feature (e.g.
   `src/app/(app)/filamentos/schema.ts`), imported by both the form and the action.
4. **Selects:** advanced (search/async/multi) → `react-select`; simple →
   shadcn's `Select`.

Packages (already installed): `react-hook-form`, `@hookform/resolvers`, `zod`.
UI components: `src/components/ui/form.tsx` (shadcn, on top of RHF).

## Reference example

### 1. Shared schema — `schema.ts`

```ts
import { z } from "zod";

export const filamentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  material: z.enum(["PLA", "PETG", "ABS", "TPU"]),
  color: z.string().min(1, "Color is required"),
  weightGrams: z.coerce.number().int().positive("Weight must be positive"),
});

export type FilamentInput = z.infer<typeof filamentSchema>;
```

### 2. Server Action — `actions.ts` (re-validates with the SAME schema)

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { filamentSchema, type FilamentInput } from "./schema";

export async function createFilament(input: FilamentInput) {
  // Trust boundary: never trust the client.
  const parsed = filamentSchema.safeParse(input);
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

### 3. Client form — `filamento-form.tsx`

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createFilament } from "./actions";
import { filamentSchema, type FilamentInput } from "./schema";

export function FilamentForm() {
  const form = useForm<FilamentInput>({
    resolver: zodResolver(filamentSchema),
    defaultValues: { name: "", material: "PLA", color: "", weightGrams: 1000 },
  });

  async function onSubmit(values: FilamentInput) {
    const res = await createFilament(values);
    if (!res.ok) {
      // Reflect server-side errors back onto the fields.
      if (res.errors) {
        for (const [field, msgs] of Object.entries(res.errors)) {
          form.setError(field as keyof FilamentInput, { message: msgs?.[0] });
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* remaining fields follow the same pattern */}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          Save
        </Button>
      </form>
    </Form>
  );
}
```

## Notes

- **`z.coerce`** on numeric fields: HTML inputs deliver strings; `coerce`
  converts before validating.
- **Submit state:** use `form.formState.isSubmitting` to disable the button —
  don't create a parallel `useState`.
- **Server Action vs `FormData`:** prefer passing the typed object (validated by
  RHF) to the action, as shown above. The action re-validates with Zod either
  way. The `<form action={...}>` pattern with `FormData` (see
  `src/app/(auth)/login/`) is acceptable for trivial forms without rich
  validation.
- **TDD:** test the schema (valid/invalid cases) and the action separately from
  the component; they hold the business logic.
