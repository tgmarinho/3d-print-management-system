// Domínio do catálogo de produtos: tipos + validação pura (sem I/O), testável
// isolada. Produto é reutilizável entre clientes e pedidos (não pertence a
// cliente). As server actions usam `parseProductForm` antes de tocar no banco.

export type Product = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

// O que enviamos ao banco em create/update.
export type ProductInput = {
  name: string;
  description: string | null;
};

export type ParseResult =
  | { ok: true; value: ProductInput }
  | { ok: false; error: string };

const NAME_MAX = 120;
const DESCRIPTION_MAX = 1000;

// Vazio/whitespace vira null; o resto é trimado.
function optional(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function parseProductForm(formData: FormData): ParseResult {
  const name = String(formData.get("name") ?? "").trim();
  if (name === "") {
    return { ok: false, error: "Nome é obrigatório." };
  }
  if (name.length > NAME_MAX) {
    return { ok: false, error: `Nome deve ter no máximo ${NAME_MAX} caracteres.` };
  }

  const description = optional(formData.get("description"));
  if (description !== null && description.length > DESCRIPTION_MAX) {
    return {
      ok: false,
      error: `Descrição deve ter no máximo ${DESCRIPTION_MAX} caracteres.`,
    };
  }

  return { ok: true, value: { name, description } };
}
