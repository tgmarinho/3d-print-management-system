import Link from "next/link";
import { Plus, Search, UsersRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/lib/clients";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = q?.trim() ?? "";

  const supabase = await createClient();
  let query = supabase
    .from("clients")
    .select("*")
    .order("name", { ascending: true });

  if (term !== "") {
    const like = `%${term}%`;
    query = query.or(
      `name.ilike.${like},company.ilike.${like},email.ilike.${like},phone.ilike.${like}`,
    );
  }

  const { data, error } = await query;
  const clients = (data ?? []) as Client[];

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="eyebrow text-muted-foreground">Cadastros</span>
          <div className="flex items-center gap-2">
            <h1 className="font-mono text-2xl font-semibold tracking-tight">
              Clientes
            </h1>
            {!error && clients.length > 0 ? (
              <Badge variant="outline" className="tabular-nums">
                {clients.length}
              </Badge>
            ) : null}
          </div>
        </div>
        <Link
          href="/cadastros/clientes/novo"
          className={buttonVariants({ size: "sm" })}
        >
          <Plus data-icon="inline-start" />
          Novo
        </Link>
      </header>

      <form className="relative flex gap-2">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          name="q"
          defaultValue={term}
          placeholder="Buscar por nome, empresa, e-mail…"
          aria-label="Buscar clientes"
          className="pl-9"
        />
        <Button type="submit" variant="outline">
          Buscar
        </Button>
      </form>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível carregar os clientes</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      ) : clients.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <UsersRound />
            </EmptyMedia>
            <EmptyTitle>
              {term ? "Nenhum cliente encontrado" : "Nenhum cliente ainda"}
            </EmptyTitle>
            <EmptyDescription>
              {term
                ? "Ajuste a busca ou cadastre um novo cliente."
                : "Cadastre o primeiro cliente para vinculá-lo aos pedidos."}
            </EmptyDescription>
          </EmptyHeader>
          <Link
            href="/cadastros/clientes/novo"
            className={buttonVariants({ size: "sm" })}
          >
            <Plus data-icon="inline-start" />
            Novo cliente
          </Link>
        </Empty>
      ) : (
        <ul className="flex flex-col gap-2">
          {clients.map((client) => {
            const meta =
              [client.company, client.phone, client.email]
                .filter(Boolean)
                .join(" · ") || "—";
            return (
              <li key={client.id}>
                <Link
                  href={`/cadastros/clientes/${client.id}`}
                  className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-brand/40 hover:bg-accent"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted font-mono text-xs font-medium text-muted-foreground transition-colors group-hover:border-brand/40 group-hover:text-brand">
                    {initials(client.name) || "—"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{client.name}</div>
                    <div className="truncate text-sm text-muted-foreground">
                      {meta}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
