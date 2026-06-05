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
import { Button, buttonVariants } from "@/components/ui/button";
import { MATERIALS, type Filament, type Material } from "@/lib/filaments";
import { cn } from "@/lib/utils";
import {
  filamentSchema,
  type FilamentInput,
  type FilamentFormInput,
} from "./schema";
import { createFilament, updateFilament } from "./actions";

const LIST = "/cadastros/filamentos";

// Mesmas classes do Input (base-ui) para o <select> nativo — picker nativo é a
// melhor escolha mobile-first para um conjunto fixo e pequeno de materiais.
const selectClassName = cn(
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none",
  "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
  "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
  "md:text-sm dark:bg-input/30",
);

export function FilamentForm({ filament }: { filament?: Filament }) {
  const router = useRouter();
  const editing = Boolean(filament);

  const form = useForm<FilamentFormInput, unknown, FilamentInput>({
    resolver: zodResolver(filamentSchema),
    defaultValues: {
      color: filament?.color ?? "",
      material: filament?.material as Material | undefined,
      brand: filament?.brand ?? "",
      weight: filament?.weight ?? "",
      lowStockThreshold: filament?.low_stock_threshold ?? 0,
    },
  });

  async function onSubmit(values: FilamentInput) {
    const result = filament
      ? await updateFilament(filament.id, values)
      : await createFilament(values);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(editing ? "Filamento atualizado." : "Filamento cadastrado.");
    router.push(editing ? `${LIST}/${result.id}` : LIST);
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Cor <span className="text-brand">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Ex.: Preto, Vermelho fogo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="material"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Material <span className="text-brand">*</span>
              </FormLabel>
              <FormControl>
                <select
                  {...field}
                  value={field.value ?? ""}
                  className={selectClassName}
                >
                  <option value="" disabled>
                    Selecione…
                  </option>
                  {MATERIALS.map((material) => (
                    <option key={material} value={material}>
                      {material}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marca</FormLabel>
              <FormControl>
                <Input placeholder="Opcional (ex.: Voolt3D)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Peso do rolo</FormLabel>
              <FormControl>
                <Input placeholder="Opcional (ex.: 1kg, 500g)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lowStockThreshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Limite de estoque baixo</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={1}
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={(field.value ?? "") as string | number}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormDescription>
                Avisar quando o total em estoque ficar igual ou abaixo deste número
                de rolos. Use 0 para não avisar.
              </FormDescription>
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
