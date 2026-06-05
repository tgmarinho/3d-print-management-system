import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Person } from "@/lib/people";

// Campos do formulário, reutilizados em criar e editar (vendedor/modelador).
export function PersonFields({ person }: { person?: Person }) {
  return (
    <>
      <div className="space-y-1">
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={person?.name}
          autoComplete="name"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="phone">Celular</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          defaultValue={person?.phone ?? ""}
          autoComplete="tel"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={person?.email ?? ""}
          autoComplete="email"
        />
      </div>
    </>
  );
}
