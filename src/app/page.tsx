import Link from "next/link";
import { Users, Boxes, Factory, LayoutDashboard, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

// Index pública: visão geral do produto + acesso ao login. Quem já está
// autenticado é levado direto ao painel pelo CTA.
const features = [
  {
    icon: Users,
    title: "Clientes",
    description:
      "Cadastro simples — só o nome é obrigatório — para vincular pedidos.",
  },
  {
    icon: Boxes,
    title: "Estoque",
    description:
      "Filamentos por local, com saldo em estoque e a chegar, e alerta de estoque baixo.",
  },
  {
    icon: Factory,
    title: "Produção",
    description:
      "Pedidos com valor e pagamento, fila priorizável e status de produção.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description:
      "Visão de relance: estoque baixo, fila, produção e pendências.",
  },
];

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 py-10">
      <header className="flex items-center justify-between">
        <span className="flex items-center gap-2 font-mono text-sm font-semibold tracking-tight">
          <span className="inline-block size-2.5 rounded-[3px] bg-brand" />
          3D<span className="text-muted-foreground">·</span>PRINT
        </span>
        <Button
          render={<Link href={user ? "/dashboard" : "/login"} />}
          size="sm"
        >
          {user ? "Ir para o painel" : "Entrar"}
          <ArrowRight />
        </Button>
      </header>

      <section className="flex flex-1 flex-col justify-center py-12">
        <p className="font-mono text-xs uppercase tracking-widest text-brand">
          Gestão de impressão 3D
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Clientes, estoque de filamento e produção em um só lugar.
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          Ferramenta interna, mobile-first e em tempo real para a operação de
          impressão 3D sob demanda — pensada para substituir a planilha.
        </p>
        <div className="mt-6">
          <Button render={<Link href={user ? "/dashboard" : "/login"} />}>
            {user ? "Ir para o painel" : "Entrar no sistema"}
            <ArrowRight />
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 pb-8 sm:grid-cols-2">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-lg border border-border bg-background/50 p-4"
          >
            <div className="flex items-center gap-2">
              <Icon className="size-4 text-brand" />
              <h2 className="text-sm font-semibold">{title}</h2>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
