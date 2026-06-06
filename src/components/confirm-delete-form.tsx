"use client";

import { useId, type ReactNode } from "react";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Button } from "@/components/ui/button";

type ConfirmDeleteFormProps = {
  // Server action já com o id vinculado (ex.: deleteClient.bind(null, id)).
  action: () => void | Promise<void>;
  // Rótulo do botão que dispara a confirmação (ex.: "Excluir cliente").
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  className?: string;
};

// Botão de exclusão que abre um modal de confirmação antes de submeter a action.
// O <form> fica no fluxo normal, mas o popup do dialog é renderizado num portal
// (document.body); por isso o botão de confirmar se associa ao form pelo
// atributo `form={id}` em vez de estar aninhado nele.
export function ConfirmDeleteForm({
  action,
  trigger,
  title,
  description,
  confirmLabel = "Excluir",
  className,
}: ConfirmDeleteFormProps) {
  const formId = useId();
  return (
    <AlertDialog.Root>
      <form id={formId} action={action} className={className} />
      <AlertDialog.Trigger
        render={
          <Button type="button" variant="destructive" className="w-full">
            {trigger}
          </Button>
        }
      />
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <AlertDialog.Popup className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-popover p-5 text-popover-foreground shadow-lg">
          <AlertDialog.Title className="text-base font-semibold">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-1.5 text-sm text-muted-foreground">
            {description}
          </AlertDialog.Description>
          <div className="mt-5 flex justify-end gap-2">
            <AlertDialog.Close
              render={
                <Button type="button" variant="ghost">
                  Cancelar
                </Button>
              }
            />
            <Button type="submit" form={formId} variant="destructive">
              {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
