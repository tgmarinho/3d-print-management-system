import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Client } from "@/lib/clients";
import { updateClient, deleteClient } from "../actions";
import { ClientFields } from "../client-fields";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function EditClientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const client = data as Client;

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Link
          href="/cadastros/clientes"
          className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Clientes
        </Link>
        <div className="flex flex-col gap-1">
          <span className="eyebrow text-muted-foreground">Editar registro</span>
          <h1 className="font-mono text-2xl font-semibold tracking-tight">
            {client.name}
          </h1>
        </div>
      </header>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível salvar</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <form action={updateClient.bind(null, client.id)}>
        <Card>
          <CardContent>
            <ClientFields client={client} />
          </CardContent>
          <CardFooter className="gap-2">
            <Button type="submit" className="flex-1">
              Salvar
            </Button>
            <Link
              href="/cadastros/clientes"
              className={buttonVariants({ variant: "outline" })}
            >
              Cancelar
            </Link>
          </CardFooter>
        </Card>
      </form>

      <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex flex-col gap-0.5">
          <span className="eyebrow text-destructive">Zona de risco</span>
          <p className="text-sm text-muted-foreground">
            Excluir remove o cliente permanentemente. Pedidos vinculados podem
            ser afetados.
          </p>
        </div>
        <form action={deleteClient.bind(null, client.id)}>
          <Button type="submit" variant="destructive" className="w-full">
            Excluir cliente
          </Button>
        </form>
      </div>
    </section>
  );
}
