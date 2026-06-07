import { cookies, headers } from "next/headers";
import { LOCALE_COOKIE, resolveRequestLocale } from "@/lib/i18n";

export async function getCurrentLocale() {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  return resolveRequestLocale(
    cookieStore.get(LOCALE_COOKIE)?.value,
    headerStore.get("accept-language"),
  );
}
