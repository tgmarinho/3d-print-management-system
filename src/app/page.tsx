import { redirect } from "next/navigation";

// Raiz do app: não há landing pública (sistema interno single-tenant). Manda
// direto para o painel, que por sua vez exige login no layout de (app).
export default function RootPage() {
  redirect("/dashboard");
}
