import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "../actions";
import { ClientFields } from "../client-fields";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function NewClientPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

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
          <span className="eyebrow text-muted-foreground">Novo registro</span>
          <h1 className="font-mono text-2xl font-semibold tracking-tight">
            Novo cliente
          </h1>
        </div>
      </header>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível salvar</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <form action={createClient}>
        <Card>
          <CardContent>
            <ClientFields />
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
    </section>
  );
}
