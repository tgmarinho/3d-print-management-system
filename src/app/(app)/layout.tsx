import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/login/actions";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getCurrentLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [supabase, locale] = await Promise.all([
    createClient(),
    getCurrentLocale(),
  ]);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const copy = t[locale];

  return (
    <div className="min-h-dvh pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <span className="flex items-center gap-2 font-mono text-sm font-semibold tracking-tight">
            <span className="inline-block size-2.5 rounded-[3px] bg-brand" />
            3D<span className="text-muted-foreground">·</span>PRINT
          </span>
          <div className="flex items-center gap-2">
            <LanguageSwitcher locale={locale} />
            <form action={signOut}>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                {copy.common.signOut}
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-4 py-6">{children}</main>
      <BottomNav locale={locale} />
      <Toaster position="top-center" />
    </div>
  );
}
