export const LOCALES = ["pt-BR", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "pt-BR";
export const LOCALE_COOKIE = "app_locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && LOCALES.includes(value as Locale);
}

export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function resolveRequestLocale(
  cookieLocale: unknown,
  acceptLanguage: string | null | undefined,
): Locale {
  if (isLocale(cookieLocale)) return cookieLocale;

  const accepted = acceptLanguage
    ?.split(",")
    .flatMap((entry) => {
      const [language] = entry.trim().split(";");
      return language ? [language.toLowerCase()] : [];
    });

  if (accepted?.some((entry) => entry === "en" || entry.startsWith("en-"))) {
    return "en";
  }

  if (
    accepted?.some(
      (entry) => entry === "pt-br" || entry === "pt" || entry.startsWith("pt-"),
    )
  ) {
    return "pt-BR";
  }

  return DEFAULT_LOCALE;
}

export function localeLabel(locale: Locale) {
  return locale === "pt-BR" ? "PT" : "EN";
}

export const t = {
  "pt-BR": {
    metadata: {
      title: "3D Print · Gestão",
      description:
        "Sistema interno de gestão de impressão 3D — clientes, estoque de filamento e produção.",
    },
    common: {
      productName: "3D·PRINT",
      signOut: "Sair",
      language: "Idioma",
    },
    nav: {
      dashboard: "Início",
      stock: "Estoque",
      orders: "Pedidos",
      queue: "Fila",
      records: "Cadastros",
    },
    home: {
      eyebrow: "Gestão de impressão 3D",
      heroTitle: "Clientes, estoque de filamento e produção em um só lugar.",
      heroDescription:
        "Ferramenta interna, mobile-first e em tempo real para a operação de impressão 3D sob demanda — pensada para substituir a planilha.",
      signedInCta: "Ir para o painel",
      signedOutCta: "Entrar",
      signedOutPrimaryCta: "Entrar no sistema",
      features: [
        {
          title: "Clientes",
          description:
            "Cadastro simples — só o nome é obrigatório — para vincular pedidos.",
        },
        {
          title: "Estoque",
          description:
            "Filamentos por local, com saldo em estoque e a chegar, e alerta de estoque baixo.",
        },
        {
          title: "Produção",
          description:
            "Pedidos com valor e pagamento, fila priorizável e status de produção.",
        },
        {
          title: "Dashboard",
          description:
            "Visão de relance: estoque baixo, fila, produção e pendências.",
        },
      ],
    },
    login: {
      title: "Entrar",
      name: "Nome (apenas no cadastro)",
      email: "E-mail",
      password: "Senha",
      signIn: "Entrar",
      signUp: "Cadastrar",
    },
  },
  en: {
    metadata: {
      title: "3D Print · Management",
      description:
        "Internal 3D print management system for clients, filament stock, and production.",
    },
    common: {
      productName: "3D·PRINT",
      signOut: "Sign out",
      language: "Language",
    },
    nav: {
      dashboard: "Home",
      stock: "Stock",
      orders: "Orders",
      queue: "Queue",
      records: "Records",
    },
    home: {
      eyebrow: "3D print management",
      heroTitle: "Clients, filament inventory, and production in one place.",
      heroDescription:
        "A mobile-first, realtime internal tool for on-demand 3D printing operations, designed to replace the spreadsheet.",
      signedInCta: "Go to dashboard",
      signedOutCta: "Sign in",
      signedOutPrimaryCta: "Sign in to the system",
      features: [
        {
          title: "Clients",
          description:
            "Simple records, with only the name required, connected to every order.",
        },
        {
          title: "Stock",
          description:
            "Filaments by location, with on-hand and incoming quantities plus low-stock alerts.",
        },
        {
          title: "Production",
          description:
            "Orders with amount, payment, prioritizable queue, and production status.",
        },
        {
          title: "Dashboard",
          description:
            "At-a-glance view of low stock, queue, production, and pending items.",
        },
      ],
    },
    login: {
      title: "Sign in",
      name: "Name (sign up only)",
      email: "Email",
      password: "Password",
      signIn: "Sign in",
      signUp: "Sign up",
    },
  },
} satisfies Record<Locale, Record<string, unknown>>;
