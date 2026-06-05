"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  ClipboardList,
  FolderCog,
  LayoutGrid,
  ListOrdered,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Início", icon: LayoutGrid },
  // "Estoque" reaproveita a tela de filamentos (lista com total de rolos por
  // filamento e alerta de estoque baixo) — não há rota /estoque separada.
  { href: "/cadastros/filamentos", label: "Estoque", icon: Boxes },
  { href: "/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/fila", label: "Fila", icon: ListOrdered },
  { href: "/cadastros", label: "Cadastros", icon: FolderCog },
];

export function BottomNav() {
  const pathname = usePathname();
  // Item ativo = o de prefixo mais específico (mais longo) que casa com a rota.
  // Sem isso, /cadastros/filamentos acenderia "Estoque" e "Cadastros" ao mesmo
  // tempo, já que ambos são prefixos do caminho.
  const activeHref = items
    .filter(
      (item) =>
        pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .reduce<string | null>(
      (best, item) =>
        best && best.length >= item.href.length ? best : item.href,
      null,
    );
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto grid max-w-3xl grid-cols-5">
        {items.map((item) => {
          const active = item.href === activeHref;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-col items-center gap-1 py-2.5 text-[11px] transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "absolute inset-x-6 top-0 h-0.5 rounded-full transition-colors",
                  active ? "bg-brand" : "bg-transparent",
                )}
              />
              <Icon className="size-5" strokeWidth={active ? 2.25 : 1.75} />
              <span className={cn("font-mono", active && "font-medium")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
