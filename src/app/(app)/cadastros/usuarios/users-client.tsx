"use client";

import { useActionState, useEffect, useRef } from "react";
import { Plus, Trash2, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  USER_NAME_MAX_LENGTH,
  USER_PASSWORD_MIN_LENGTH,
  type SystemUser,
} from "@/lib/system-users";
import { type ActionState, createUser, deleteUser } from "./actions";

const INITIAL: ActionState = {};

export function UsersManager({ items }: { items: SystemUser[] }) {
  return (
    <div className="space-y-4">
      <NewUserForm />
      <ul className="space-y-2">
        {items.length === 0 ? (
          <li className="text-sm text-muted-foreground">
            Nenhum usuário cadastrado ainda.
          </li>
        ) : (
          items.map((item) => <UserRow key={item.id} item={item} />)
        )}
      </ul>
    </div>
  );
}

function NewUserForm() {
  const [state, action, pending] = useActionState(createUser, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      action={action}
      className="space-y-3 rounded-lg p-3 ring-1 ring-foreground/10"
    >
      <p className="text-sm font-medium">Novo usuário</p>
      <div className="space-y-1">
        <Label htmlFor="user-name">Nome</Label>
        <Input
          id="user-name"
          name="name"
          placeholder="Ex.: Karen Souza"
          maxLength={USER_NAME_MAX_LENGTH}
          autoComplete="off"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="user-email">E-mail</Label>
        <Input
          id="user-email"
          name="email"
          type="email"
          placeholder="pessoa@empresa.com"
          autoComplete="off"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="user-password">Senha provisória</Label>
        <Input
          id="user-password"
          name="password"
          type="text"
          placeholder={`Mínimo ${USER_PASSWORD_MIN_LENGTH} caracteres`}
          minLength={USER_PASSWORD_MIN_LENGTH}
          autoComplete="off"
        />
        <p className="text-xs text-muted-foreground">
          Repasse à pessoa; ela entra pelo login e pode trocar depois.
        </p>
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        <Plus />
        Adicionar usuário
      </Button>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}

function UserRow({ item }: { item: SystemUser }) {
  const [state, action, pending] = useActionState(deleteUser, INITIAL);
  return (
    <li className="space-y-1 rounded-lg p-3 ring-1 ring-foreground/10">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
            <UserRound className="size-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 truncate font-medium">
              {item.name}
              {item.isSelf ? <Badge variant="secondary">você</Badge> : null}
              {item.pending ? <Badge variant="outline">nunca entrou</Badge> : null}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {item.email}
            </p>
          </div>
        </div>
        {item.isSelf ? null : (
          <form action={action} className="shrink-0">
            <input type="hidden" name="id" value={item.id} />
            <Button
              variant="destructive"
              size="icon-sm"
              type="submit"
              aria-label={`Remover ${item.name}`}
              disabled={pending}
            >
              <Trash2 />
            </Button>
          </form>
        )}
      </div>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
    </li>
  );
}
