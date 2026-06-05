import Link from "next/link";
import { notFound } from "next/navigation";
import { createPerson } from "../actions";
import { PersonFields } from "../person-fields";
import { PEOPLE_KINDS, isPersonKind } from "@/lib/people";
import { Button, buttonVariants } from "@/components/ui/button";

export default async function NewPersonPage({
  params,
  searchParams,
}: {
  params: Promise<{ kind: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { kind } = await params;
  if (!isPersonKind(kind)) notFound();
  const { error } = await searchParams;
  const { labelSingular } = PEOPLE_KINDS[kind];

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Novo {labelSingular.toLowerCase()}</h1>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <form action={createPerson.bind(null, kind)} className="space-y-3">
        <PersonFields />
        <div className="flex gap-2 pt-2">
          <Button type="submit" className="flex-1">
            Salvar
          </Button>
          <Link href={`/cadastros/${kind}`} className={buttonVariants({ variant: "outline" })}>
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  );
}
