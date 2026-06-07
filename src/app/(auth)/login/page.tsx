import { signIn, signUp } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getCurrentLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, locale] = await Promise.all([
    searchParams,
    getCurrentLocale(),
  ]);
  const copy = t[locale].login;
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-sm space-y-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">{copy.title}</h1>
          <LanguageSwitcher locale={locale} />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <form className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="name">{copy.name}</Label>
            <Input id="name" name="name" autoComplete="name" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">{copy.email}</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">{copy.password}</Label>
            <Input id="password" name="password" type="password" required minLength={6} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" formAction={signIn} className="flex-1">
              {copy.signIn}
            </Button>
            <Button
              type="submit"
              formAction={signUp}
              variant="outline"
              className="flex-1"
            >
              {copy.signUp}
            </Button>
          </div>
        </form>
      </Card>
    </main>
  );
}
