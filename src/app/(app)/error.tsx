"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

// Error boundary do app: em vez de tela branca quando uma página falha ao
// carregar (ex.: configuração ausente, falha de rede com o Supabase), mostra uma
// mensagem clara com opção de tentar de novo.
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlert className="size-6" />
      </span>
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">
          Não foi possível carregar esta tela
        </h1>
        <p className="mx-auto max-w-xs text-sm text-muted-foreground">
          Ocorreu um erro ao buscar os dados. Tente novamente; se persistir,
          verifique a configuração do ambiente.
        </p>
      </div>
      <Button onClick={reset}>Tentar novamente</Button>
    </section>
  );
}
