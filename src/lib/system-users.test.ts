import { expect, test } from "bun:test";
import {
  isValidEmail,
  parseNewUserForm,
  sortSystemUsers,
  toSystemUser,
  type SystemUser,
} from "./system-users";

function form(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

test("isValidEmail aceita e-mail comum e rejeita inválidos", () => {
  expect(isValidEmail("karen@empresa.com")).toBe(true);
  expect(isValidEmail("karen@empresa")).toBe(false);
  expect(isValidEmail("karen empresa.com")).toBe(false);
  expect(isValidEmail("")).toBe(false);
});

test("parseNewUserForm normaliza e-mail e nome", () => {
  const result = parseNewUserForm(
    form({ email: "  KAREN@Empresa.COM ", name: "  Karen   Souza ", password: "segredo" }),
  );
  expect(result).toEqual({
    ok: true,
    value: { email: "karen@empresa.com", name: "Karen Souza", password: "segredo" },
  });
});

test("parseNewUserForm exige e-mail válido", () => {
  const result = parseNewUserForm(
    form({ email: "invalido", name: "Karen", password: "segredo" }),
  );
  expect(result.ok).toBe(false);
});

test("parseNewUserForm exige nome", () => {
  const result = parseNewUserForm(
    form({ email: "karen@empresa.com", name: "  ", password: "segredo" }),
  );
  expect(result.ok).toBe(false);
});

test("parseNewUserForm exige senha provisória mínima", () => {
  const result = parseNewUserForm(
    form({ email: "karen@empresa.com", name: "Karen", password: "123" }),
  );
  expect(result.ok).toBe(false);
});

test("toSystemUser usa o nome do metadata e marca o usuário atual", () => {
  const user = toSystemUser(
    {
      id: "u1",
      email: "karen@empresa.com",
      last_sign_in_at: "2026-06-01T00:00:00Z",
      user_metadata: { name: "Karen Souza" },
    },
    "u1",
  );
  expect(user.name).toBe("Karen Souza");
  expect(user.isSelf).toBe(true);
  expect(user.pending).toBe(false);
});

test("toSystemUser cai para o e-mail quando não há nome e marca convite pendente", () => {
  const user = toSystemUser(
    { id: "u2", email: "novo@empresa.com", user_metadata: null },
    "u1",
  );
  expect(user.name).toBe("novo@empresa.com");
  expect(user.isSelf).toBe(false);
  expect(user.pending).toBe(true);
});

test("sortSystemUsers coloca o usuário atual no topo, depois por nome", () => {
  const users: SystemUser[] = [
    { id: "c", email: "", name: "Bruno", pending: false, isSelf: false, createdAt: null },
    { id: "a", email: "", name: "Ana", pending: false, isSelf: false, createdAt: null },
    { id: "b", email: "", name: "Zeca", pending: false, isSelf: true, createdAt: null },
  ];
  expect(sortSystemUsers(users).map((u) => u.name)).toEqual([
    "Zeca",
    "Ana",
    "Bruno",
  ]);
});
