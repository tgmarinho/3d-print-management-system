// Domínio de clientes: tipos + validação pura (sem I/O), testável isolada.
// As server actions usam `parseClientForm` antes de tocar no banco.

export type Client = {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
};

// O que enviamos ao banco em create/update.
export type ClientInput = {
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
};

export type ParseResult =
  | { ok: true; value: ClientInput }
  | { ok: false; error: string };

// Vazio/whitespace vira null; o resto é trimado.
function optional(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function parseClientForm(formData: FormData): ParseResult {
  const name = String(formData.get("name") ?? "").trim();
  if (name === "") {
    return { ok: false, error: "Nome é obrigatório." };
  }

  const email = optional(formData.get("email"));
  if (email !== null && !email.includes("@")) {
    return { ok: false, error: "E-mail inválido." };
  }

  return {
    ok: true,
    value: {
      name,
      company: optional(formData.get("company")),
      phone: optional(formData.get("phone")),
      email,
    },
  };
}
