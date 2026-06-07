import Link from "next/link";
import { Users, Boxes, Factory, LayoutDashboard, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";

// Index pública: visão geral do produto + acesso ao login. Quem já está
// autenticado é levado direto ao painel pelo CTA.
const featureIcons = [
  Users,
  Boxes,
  Factory,
  LayoutDashboard,
] as const;

export default async function RootPage() {
  const [supabase, locale] = await Promise.all([createClient(), getCurrentLocale()]);
  const copy = t[locale].home;
  const features = copy.features.map((feature, index) => ({
    ...feature,
    icon: featureIcons[index] ?? LayoutDashboard,
  }));

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 py-10">
      <header className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-mono text-sm font-semibold tracking-tight">
          <span className="inline-block size-2.5 rounded-[3px] bg-brand" />
          3D<span className="text-muted-foreground">·</span>PRINT
        </span>
        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          <Button
            render={<Link href={user ? "/dashboard" : "/login"} />}
            nativeButton={false}
            size="sm"
          >
            {user ? copy.signedInCta : copy.signedOutCta}
            <ArrowRight />
          </Button>
        </div>
      </header>

      <section className="flex flex-1 flex-col justify-center py-12">
        <p className="font-mono text-xs uppercase tracking-widest text-brand">
          {copy.eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          {copy.heroTitle}
        </h1>
        <p className="mt-4 max-w-xl text-muted-foreground">
          {copy.heroDescription}
        </p>
        <div className="mt-6">
          <Button
            render={<Link href={user ? "/dashboard" : "/login"} />}
            nativeButton={false}
          >
            {user ? copy.signedInCta : copy.signedOutPrimaryCta}
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
