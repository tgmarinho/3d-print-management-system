import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PEOPLE_KINDS, isPersonKind, type Person } from "@/lib/people";
import { deletePerson, updatePerson } from "../actions";
import { PersonFields } from "../person-fields";
import { Button, buttonVariants } from "@/components/ui/button";

export default async function EditPersonPage({
  params,
  searchParams,
}: {
  params: Promise<{ kind: string; id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { kind, id } = await params;
  if (!isPersonKind(kind)) notFound();
  const { error } = await searchParams;
  const { table, labelSingular } = PEOPLE_KINDS[kind];

  const supabase = await createClient();
  const { data } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  const person = data as Person;

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Editar {labelSingular.toLowerCase()}</h1>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <form action={updatePerson.bind(null, kind, person.id)} className="space-y-3">
        <PersonFields person={person} />
        <div className="flex gap-2 pt-2">
          <Button type="submit" className="flex-1">
            Salvar
          </Button>
          <Link href={`/cadastros/${kind}`} className={buttonVariants({ variant: "outline" })}>
            Cancelar
          </Link>
        </div>
      </form>

      <form action={deletePerson.bind(null, kind, person.id)} className="border-t pt-4">
        <Button type="submit" variant="destructive" className="w-full">
          Excluir {labelSingular.toLowerCase()}
        </Button>
      </form>
    </section>
  );
}
