import Link from "next/link";
import {
  Box,
  ChevronRight,
  MapPin,
  Spool,
  UserRound,
  UsersRound,
} from "lucide-react";

const entries = [
  {
    href: "/cadastros/clientes",
    label: "Clientes",
    description: "Contatos e empresas para vincular aos pedidos.",
    icon: UsersRound,
  },
  {
    href: "/cadastros/vendedores",
    label: "Vendedores",
    description: "Quem converteu cada venda.",
    icon: UserRound,
  },
  {
    href: "/cadastros/modeladores",
    label: "Modeladores",
    description: "Responsáveis pela modelagem dos pedidos.",
    icon: UserRound,
  },
  {
    href: "/cadastros/produtos",
    label: "Produtos",
    description: "Catálogo reutilizável entre clientes e pedidos.",
    icon: Box,
  },
  {
    href: "/cadastros/filamentos",
    label: "Filamentos",
    description: "Cores e materiais, com estoque por local.",
    icon: Spool,
  },
  {
    href: "/cadastros/locais",
    label: "Locais de estoque",
    description: "Onde os filamentos ficam guardados.",
    icon: MapPin,
  },
];

export default function CadastrosPage() {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <span className="eyebrow text-muted-foreground">Registros base</span>
        <h1 className="font-mono text-2xl font-semibold tracking-tight">
          Cadastros
        </h1>
        <p className="text-sm text-muted-foreground">
          As entidades que alimentam pedidos, estoque e produção.
        </p>
      </header>

      <ul className="flex flex-col gap-2.5">
        {entries.map((entry) => {
          const Icon = entry.icon;
          return (
            <li key={entry.href}>
              <Link
                href={entry.href}
                className="group flex items-center gap-4 rounded-lg border border-border bg-card p-3.5 transition-colors hover:border-brand/40 hover:bg-accent"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground transition-colors group-hover:border-brand/40 group-hover:text-brand">
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm font-medium">{entry.label}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {entry.description}
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground/60 transition-all group-hover:translate-x-0.5 group-hover:text-brand" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
