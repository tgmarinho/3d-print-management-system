import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/login/actions";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-dvh pb-16">
      <header className="flex items-center justify-between border-b p-4">
        <span className="font-semibold">3D Print</span>
        <form action={signOut}>
          <Button variant="ghost" size="sm">
            Sair
          </Button>
        </form>
      </header>
      <main className="p-4">{children}</main>
      <BottomNav />
    </div>
  );
}
