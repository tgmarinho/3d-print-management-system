"use client";

import { useId, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { toast } from "sonner";
import type { Option } from "@/lib/orders";
import { cn } from "@/lib/utils";

type SelectOption = { value: string; label: string };

// Resultado das actions de criação rápida (cadastrar inline a partir do combobox).
export type QuickCreateResult =
  | { ok: true; option: Option }
  | { ok: false; message: string };

type EntityComboboxProps = {
  options: Option[];
  value: string;
  onChange: (id: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  isClearable?: boolean;
  // Quando presente, habilita "cadastrar na hora" (Creatable): digita um nome
  // novo, cria a entidade pela action e já seleciona o resultado.
  onCreate?: (name: string) => Promise<QuickCreateResult>;
  createLabel?: (input: string) => string;
  // Injetados pelo <FormControl> via cloneElement.
  id?: string;
  "aria-invalid"?: boolean | "true" | "false";
};

export function EntityCombobox({
  options,
  value,
  onChange,
  onBlur,
  placeholder = "Buscar…",
  isClearable = false,
  onCreate,
  createLabel = (input) => `Cadastrar “${input}”`,
  id,
  "aria-invalid": ariaInvalid,
}: EntityComboboxProps) {
  // Lista local para refletir entidades recém-cadastradas sem recarregar.
  const [items, setItems] = useState<Option[]>(options);
  const [creating, setCreating] = useState(false);
  const generatedId = useId();

  const invalid = ariaInvalid === true || ariaInvalid === "true";

  const selectOptions: SelectOption[] = items.map((o) => ({
    value: o.id,
    label: o.name,
  }));
  const selected = selectOptions.find((o) => o.value === value) ?? null;

  async function handleCreate(input: string) {
    if (!onCreate) return;
    setCreating(true);
    const result = await onCreate(input);
    setCreating(false);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    setItems((prev) => [...prev, result.option]);
    onChange(result.option.id);
    toast.success(`“${result.option.name}” cadastrado.`);
  }

  return (
    <CreatableSelect<SelectOption>
      instanceId={id ?? generatedId}
      inputId={id}
      options={selectOptions}
      value={selected}
      onChange={(opt) => onChange(opt?.value ?? "")}
      onBlur={onBlur}
      onCreateOption={onCreate ? handleCreate : undefined}
      // No iOS o toque foca o input e abre o teclado, mas não dispara o "click"
      // que abriria a lista — `openMenuOnFocus` garante que as opções apareçam
      // assim que o campo é tocado. `menuShouldScrollIntoView` rola o menu para
      // a área visível acima do teclado.
      openMenuOnFocus
      menuShouldScrollIntoView
      isClearable={isClearable}
      isDisabled={creating}
      isLoading={creating}
      placeholder={placeholder}
      noOptionsMessage={() => "Nada encontrado"}
      loadingMessage={() => "Cadastrando…"}
      formatCreateLabel={createLabel}
      // Só oferece "Cadastrar" quando há onCreate, há texto e não há item igual.
      isValidNewOption={(input, _value, opts) =>
        Boolean(onCreate) &&
        input.trim().length > 0 &&
        !opts.some(
          (o) =>
            (o as SelectOption).label.toLowerCase() ===
            input.trim().toLowerCase(),
        )
      }
      // Portal evita que o menu seja cortado pelo card/overflow do formulário.
      menuPortalTarget={
        typeof document !== "undefined" ? document.body : undefined
      }
      menuPlacement="auto"
      unstyled
      styles={{ menuPortal: (base) => ({ ...base, zIndex: 50 }) }}
      classNames={{
        control: ({ isFocused }) =>
          cn(
            "flex min-h-8 w-full cursor-text items-center rounded-lg border bg-transparent text-base transition-colors md:text-sm dark:bg-input/30",
            isFocused ? "border-ring ring-3 ring-ring/50" : "border-input",
            invalid && "border-destructive ring-3 ring-destructive/20",
          ),
        valueContainer: () => "flex flex-wrap gap-1 px-2.5 py-1",
        placeholder: () => "text-muted-foreground",
        input: () => "text-foreground",
        singleValue: () => "text-foreground",
        indicatorsContainer: () => "flex items-center gap-0.5 pr-1",
        dropdownIndicator: () => "p-1 text-muted-foreground",
        clearIndicator: () => "p-1 text-muted-foreground hover:text-foreground",
        indicatorSeparator: () => "hidden",
        menu: () =>
          "mt-1 overflow-hidden rounded-lg border border-input bg-popover text-popover-foreground shadow-md",
        menuList: () => "p-1",
        option: ({ isFocused, isSelected }) =>
          cn(
            "cursor-pointer rounded-md px-2.5 py-1.5 text-base md:text-sm",
            isFocused && "bg-accent text-accent-foreground",
            isSelected && "font-medium",
          ),
        noOptionsMessage: () => "px-2.5 py-2 text-sm text-muted-foreground",
        loadingMessage: () => "px-2.5 py-2 text-sm text-muted-foreground",
      }}
    />
  );
}
