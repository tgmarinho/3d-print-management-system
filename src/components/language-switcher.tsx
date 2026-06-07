"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { setLocale } from "@/lib/i18n/actions";
import { LOCALES, localeLabel, type Locale, t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const next = query ? `${pathname}?${query}` : pathname;

  return (
    <form
      action={setLocale}
      aria-label={t[locale].common.language}
      className="flex items-center rounded-md border border-border bg-background p-0.5"
    >
      <input type="hidden" name="next" value={next} />
      {LOCALES.map((option) => {
        const active = option === locale;
        return (
          <button
            key={option}
            type="submit"
            name="locale"
            value={option}
            aria-pressed={active}
            className={cn(
              "min-h-8 min-w-10 rounded-sm px-2 text-xs font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {localeLabel(option)}
          </button>
        );
      })}
    </form>
  );
}
