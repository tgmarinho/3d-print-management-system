// Domínio de vendedores e modeladores: entidades separadas com os mesmos campos.
// Tipos + validação pura (sem I/O), testável isolada — espelha `clients.ts`.
// As server actions usam `parsePersonForm` antes de tocar no banco.

// `kind` é o slug da rota (/cadastros/<kind>) e mapeia para a tabela do banco.
export type PersonKind = "vendedores" | "modeladores";

type KindConfig = {
  table: "sellers" | "modelers";
  entityType: string; // usado no audit_log
  labelSingular: string;
  labelPlural: string;
};

export const PEOPLE_KINDS: Record<PersonKind, KindConfig> = {
  vendedores: {
    table: "sellers",
    entityType: "seller",
    labelSingular: "Vendedor",
    labelPlural: "Vendedores",
  },
  modeladores: {
    table: "modelers",
    entityType: "modeler",
    labelSingular: "Modelador",
    labelPlural: "Modeladores",
  },
};

export function isPersonKind(value: string): value is PersonKind {
  return value === "vendedores" || value === "modeladores";
}

export type Person = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
};

// O que enviamos ao banco em create/update.
export type PersonInput = {
  name: string;
  phone: string | null;
  email: string | null;
};

export type ParseResult =
  | { ok: true; value: PersonInput }
  | { ok: false; error: string };

// Vazio/whitespace vira null; o resto é trimado.
function optional(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function parsePersonForm(formData: FormData): ParseResult {
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
      phone: optional(formData.get("phone")),
      email,
    },
  };
}
