// Regras de validação/normalização de locais de estoque (lógica pura, testável).

export const LOCATION_NAME_MAX_LENGTH = 80;

export type ParseLocationNameResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

// Apara as pontas e colapsa espaços internos antes de validar.
export function parseLocationName(raw: unknown): ParseLocationNameResult {
  const value =
    typeof raw === "string" ? raw.trim().replace(/\s+/g, " ") : "";
  if (!value) return { ok: false, error: "Informe o nome do local." };
  if (value.length > LOCATION_NAME_MAX_LENGTH) {
    return {
      ok: false,
      error: `Nome muito longo (máximo ${LOCATION_NAME_MAX_LENGTH} caracteres).`,
    };
  }
  return { ok: true, value };
}

// Forma canônica para comparar nomes sem diferenças de caixa/espaço.
export function normalizeLocationName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
}

// Há outro local com o mesmo nome? `ignoreId` exclui o próprio registro (edição).
export function isDuplicateName(
  candidate: string,
  existing: ReadonlyArray<{ id: string; name: string }>,
  ignoreId?: string,
): boolean {
  const normalized = normalizeLocationName(candidate);
  return existing.some(
    (location) =>
      location.id !== ignoreId &&
      normalizeLocationName(location.name) === normalized,
  );
}
