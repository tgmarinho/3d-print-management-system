import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Client } from "@/lib/clients";

// Campos do formulário de cliente, reutilizados em criar e editar.
export function ClientFields({ client }: { client?: Client }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">
          Nome <span className="text-brand">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={client?.name}
          autoComplete="name"
          placeholder="Ex.: Karen Oliveira"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="company">Empresa</Label>
        <Input
          id="company"
          name="company"
          defaultValue={client?.company ?? ""}
          autoComplete="organization"
          placeholder="Opcional"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Celular</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          defaultValue={client?.phone ?? ""}
          autoComplete="tel"
          placeholder="(00) 00000-0000"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={client?.email ?? ""}
          autoComplete="email"
          placeholder="nome@exemplo.com"
        />
      </div>
    </div>
  );
}
