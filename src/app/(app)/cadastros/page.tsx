import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";

const entries = [
  {
    href: "/cadastros/locais",
    label: "Locais de estoque",
    description: "Onde os filamentos ficam guardados.",
    icon: MapPin,
  },
];

export default function CadastrosPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Cadastros</h1>
      <ul className="space-y-2">
        {entries.map((entry) => (
          <li key={entry.href}>
            <Link
              href={entry.href}
              className="flex items-center gap-3 rounded-lg p-3 ring-1 ring-foreground/10 hover:bg-muted"
            >
              <entry.icon className="size-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{entry.label}</p>
                <p className="text-sm text-muted-foreground">
                  {entry.description}
                </p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
