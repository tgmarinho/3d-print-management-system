import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/products";
import { buttonVariants } from "@/components/ui/button";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("name", { ascending: true });
  const products = (data ?? []) as Product[];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">Produtos</h1>
          <p className="text-sm text-muted-foreground">
            Catálogo reutilizável entre clientes e pedidos.
          </p>
        </div>
        <Link href="/cadastros/produtos/novo" className={buttonVariants()}>
          Novo
        </Link>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum produto cadastrado ainda.
        </p>
      ) : (
        <ul className="space-y-2">
          {products.map((product) => (
            <li key={product.id}>
              <Link
                href={`/cadastros/produtos/${product.id}`}
                className="block rounded-xl bg-card px-3 py-3 text-card-foreground ring-1 ring-foreground/10 transition-colors hover:bg-muted/50"
              >
                <div className="font-medium">{product.name}</div>
                {product.description ? (
                  <div className="line-clamp-2 text-sm text-muted-foreground">
                    {product.description}
                  </div>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
