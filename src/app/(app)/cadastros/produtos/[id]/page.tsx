import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/products";
import { updateProduct, deleteProduct } from "../actions";
import { ProductFields } from "../product-fields";
import { Button, buttonVariants } from "@/components/ui/button";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const product = data as Product;

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Editar produto</h1>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <form action={updateProduct.bind(null, product.id)} className="space-y-3">
        <ProductFields product={product} />
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

      <form
        action={deleteProduct.bind(null, product.id)}
        className="border-t pt-4"
      >
        <Button type="submit" variant="destructive" className="w-full">
          Excluir produto
        </Button>
      </form>
    </section>
  );
}
