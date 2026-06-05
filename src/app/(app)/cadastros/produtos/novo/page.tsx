import Link from "next/link";
import { createProduct } from "../actions";
import { ProductFields } from "../product-fields";
import { Button, buttonVariants } from "@/components/ui/button";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Novo produto</h1>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <form action={createProduct} className="space-y-3">
        <ProductFields />
        <div className="flex gap-2 pt-2">
          <Button type="submit" className="flex-1">
            Salvar
          </Button>
          <Link
            href="/cadastros/produtos"
            className={buttonVariants({ variant: "outline" })}
          >
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  );
}
