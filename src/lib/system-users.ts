// Domínio dos usuários do sistema (as pessoas da empresa, todas administradoras,
// sem RBAC). Lógica pura/testável: validação do convite e derivação dos campos de
// exibição a partir do registro do Supabase Auth. As Server Actions usam estas
// funções antes de tocar na API de Admin.

export const USER_NAME_MAX_LENGTH = 80;
export const USER_PASSWORD_MIN_LENGTH = 6;

export type NewUserInput = { email: string; name: string; password: string };

export type ParseNewUserResult =
  | { ok: true; value: NewUserInput }
  | { ok: false; error: string };

// E-mail é a identidade no Auth; nome vai para o user_metadata (e daí para o
// profile, via trigger handle_new_user). Sem SMTP/fluxo de convite por e-mail:
// o admin define uma senha provisória e a repassa à pessoa, que entra pelo login
// normal e pode trocá-la depois.
export function parseNewUserForm(formData: FormData): ParseNewUserResult {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!isValidEmail(email)) {
    return { ok: false, error: "Informe um e-mail válido." };
  }

  const name = String(formData.get("name") ?? "").replace(/\s+/g, " ").trim();
  if (name === "") {
    return { ok: false, error: "Informe o nome da pessoa." };
  }
  if (name.length > USER_NAME_MAX_LENGTH) {
    return {
      ok: false,
      error: `Nome muito longo (máximo ${USER_NAME_MAX_LENGTH} caracteres).`,
    };
  }

  const password = String(formData.get("password") ?? "");
  if (password.length < USER_PASSWORD_MIN_LENGTH) {
    return {
      ok: false,
      error: `Senha provisória precisa de ao menos ${USER_PASSWORD_MIN_LENGTH} caracteres.`,
    };
  }

  return { ok: true, value: { email, name, password } };
}

// Validação simples e suficiente: algo@algo.algo, sem espaços.
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Subconjunto do que a API de Admin (`listUsers`) devolve e que a UI consome.
export type RawAuthUser = {
  id: string;
  email?: string | null;
  created_at?: string | null;
  last_sign_in_at?: string | null;
  user_metadata?: { name?: unknown } | null;
};

export type SystemUser = {
  id: string;
  email: string;
  name: string;
  // Criado mas ainda nunca entrou (senha provisória não usada).
  pending: boolean;
  isSelf: boolean;
  createdAt: string | null;
};

// Normaliza um usuário do Auth para exibição, marcando quem é o usuário atual.
export function toSystemUser(raw: RawAuthUser, currentUserId: string): SystemUser {
  const email = raw.email ?? "";
  const metaName =
    typeof raw.user_metadata?.name === "string"
      ? raw.user_metadata.name.trim()
      : "";
  return {
    id: raw.id,
    email,
    name: metaName || email,
    pending: !raw.last_sign_in_at,
    isSelf: raw.id === currentUserId,
    createdAt: raw.created_at ?? null,
  };
}

// Ordena por nome (pt-BR), mantendo o usuário atual no topo para fácil referência.
export function sortSystemUsers(users: SystemUser[]): SystemUser[] {
  return [...users].sort((a, b) => {
    if (a.isSelf !== b.isSelf) return a.isSelf ? -1 : 1;
    return a.name.localeCompare(b.name, "pt-BR");
  });
}
