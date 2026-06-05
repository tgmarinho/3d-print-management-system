import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/lib/products";

// Campos do formulário de produto, reutilizados em criar e editar.
export function ProductFields({ product }: { product?: Product }) {
  return (
    <>
      <div className="space-y-1">
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          name="name"
          required
          maxLength={120}
          defaultValue={product?.name}
          placeholder="Ex.: Vaso geométrico"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          maxLength={1000}
          defaultValue={product?.description ?? ""}
          placeholder="Detalhes, material padrão, tamanho…"
        />
      </div>
    </>
  );
}
