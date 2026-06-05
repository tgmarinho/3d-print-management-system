import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PEOPLE_KINDS, isPersonKind, type Person } from "@/lib/people";
import { buttonVariants } from "@/components/ui/button";

export default async function PeopleListPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  if (!isPersonKind(kind)) notFound();
  const { table, labelPlural, labelSingular } = PEOPLE_KINDS[kind];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("name", { ascending: true });
  const people = (data ?? []) as Person[];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">{labelPlural}</h1>
        <Link href={`/cadastros/${kind}/novo`} className={buttonVariants()}>
          Novo
        </Link>
      </div>

      {error ? (
        <p className="text-sm text-destructive">{error.message}</p>
      ) : people.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum {labelSingular.toLowerCase()} cadastrado ainda.
        </p>
      ) : (
        <ul className="space-y-2">
          {people.map((person) => (
            <li key={person.id}>
              <Link
                href={`/cadastros/${kind}/${person.id}`}
                className="block rounded-xl bg-card px-3 py-3 text-card-foreground ring-1 ring-foreground/10 transition-colors hover:bg-muted/50"
              >
                <div className="font-medium">{person.name}</div>
                <div className="text-sm text-muted-foreground">
                  {[person.phone, person.email].filter(Boolean).join(" · ") || "—"}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
