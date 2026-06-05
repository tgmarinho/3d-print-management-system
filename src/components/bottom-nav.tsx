"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Início" },
  { href: "/estoque", label: "Estoque" },
  { href: "/pedidos", label: "Pedidos" },
  { href: "/cadastros", label: "Cadastros" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-4 border-t bg-background">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`py-3 text-center text-xs ${active ? "font-semibold" : "text-muted-foreground"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
