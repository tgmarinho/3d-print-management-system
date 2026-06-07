import { expect, test } from "bun:test";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isLocale,
  localeLabel,
  resolveRequestLocale,
  resolveLocale,
  t,
} from "./i18n";

test("resolveLocale accepts supported locales and falls back to Portuguese", () => {
  expect(resolveLocale("pt-BR")).toBe("pt-BR");
  expect(resolveLocale("en")).toBe("en");
  expect(resolveLocale("es")).toBe(DEFAULT_LOCALE);
  expect(resolveLocale(undefined)).toBe(DEFAULT_LOCALE);
});

test("isLocale narrows only supported locale values", () => {
  expect(isLocale("pt-BR")).toBe(true);
  expect(isLocale("en")).toBe(true);
  expect(isLocale("pt")).toBe(false);
});

test("locale labels and home copy are available in both languages", () => {
  expect(LOCALE_COOKIE).toBe("app_locale");
  expect(localeLabel("pt-BR")).toBe("PT");
  expect(localeLabel("en")).toBe("EN");

  expect(t["pt-BR"].home.heroTitle).toContain("Clientes");
  expect(t.en.home.heroTitle).toContain("Clients");
  expect(t["pt-BR"].nav.dashboard).toBe("Início");
  expect(t.en.nav.dashboard).toBe("Home");
});

test("resolveRequestLocale prefers cookie and falls back to Accept-Language", () => {
  expect(resolveRequestLocale("pt-BR", "en-US,en;q=0.9")).toBe("pt-BR");
  expect(resolveRequestLocale(undefined, "en-US,en;q=0.9,pt-BR;q=0.8")).toBe(
    "en",
  );
  expect(resolveRequestLocale(undefined, "fr-CA,pt-BR;q=0.7")).toBe("pt-BR");
});
