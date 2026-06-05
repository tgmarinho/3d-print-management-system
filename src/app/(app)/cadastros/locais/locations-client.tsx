"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LOCATION_NAME_MAX_LENGTH } from "@/lib/locations";
import {
  type ActionState,
  createLocation,
  deleteLocation,
  updateLocation,
} from "./actions";

type Item = { id: string; name: string; hasStock: boolean };

const INITIAL: ActionState = {};

export function LocationsManager({ items }: { items: Item[] }) {
  return (
    <div className="space-y-4">
      <NewLocationForm />
      <ul className="space-y-2">
        {items.length === 0 ? (
          <li className="text-sm text-muted-foreground">
            Nenhum local cadastrado ainda.
          </li>
        ) : (
          items.map((item) => <LocationRow key={item.id} item={item} />)
        )}
      </ul>
    </div>
  );
}

function NewLocationForm() {
  const [state, action, pending] = useActionState(createLocation, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-1">
      <div className="flex gap-2">
        <Input
          name="name"
          placeholder="Novo local (ex.: casa da Letícia)"
          aria-label="Nome do local"
          maxLength={LOCATION_NAME_MAX_LENGTH}
          autoComplete="off"
        />
        <Button type="submit" disabled={pending}>
          <Plus />
          Adicionar
        </Button>
      </div>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}

function LocationRow({ item }: { item: Item }) {
  const [editing, setEditing] = useState(false);
  return (
    <li className="rounded-lg p-3 ring-1 ring-foreground/10">
      {editing ? (
        <EditForm item={item} onDone={() => setEditing(false)} />
      ) : (
        <ViewRow item={item} onEdit={() => setEditing(true)} />
      )}
    </li>
  );
}

function ViewRow({ item, onEdit }: { item: Item; onEdit: () => void }) {
  const [state, action, pending] = useActionState(deleteLocation, INITIAL);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{item.name}</p>
          {item.hasStock ? (
            <p className="text-xs text-muted-foreground">
              Com estoque vinculado
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Editar"
            onClick={onEdit}
          >
            <Pencil />
          </Button>
          <form action={action}>
            <input type="hidden" name="id" value={item.id} />
            <Button
              variant="destructive"
              size="icon-sm"
              type="submit"
              aria-label="Remover"
              disabled={pending}
            >
              <Trash2 />
            </Button>
          </form>
        </div>
      </div>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
    </div>
  );
}

function EditForm({ item, onDone }: { item: Item; onDone: () => void }) {
  const [state, action, pending] = useActionState(updateLocation, INITIAL);

  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={action} className="space-y-1">
      <div className="flex gap-2">
        <input type="hidden" name="id" value={item.id} />
        <Input
          name="name"
          defaultValue={item.name}
          aria-label="Nome do local"
          maxLength={LOCATION_NAME_MAX_LENGTH}
          autoComplete="off"
          autoFocus
        />
        <Button type="submit" size="icon" aria-label="Salvar" disabled={pending}>
          <Check />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Cancelar"
          onClick={onDone}
        >
          <X />
        </Button>
      </div>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
