import { signIn, signUp } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-sm space-y-4 p-6">
        <h1 className="text-xl font-semibold">Entrar</h1>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <form className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name">Nome (apenas no cadastro)</Label>
            <Input id="name" name="name" autoComplete="name" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" required minLength={6} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" formAction={signIn} className="flex-1">
              Entrar
            </Button>
            <Button
              type="submit"
              formAction={signUp}
              variant="outline"
              className="flex-1"
            >
              Cadastrar
            </Button>
          </div>
        </form>
      </Card>
    </main>
  );
}
