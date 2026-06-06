# 3D Print SaaS Management System

Sistema de gestão para uma operação de **modelagem e impressão 3D sob demanda** —
controle de **clientes**, **estoque de filamento** e **produção** (orçamentos,
fila de demanda e status).

> Apesar do "SaaS" no nome, o escopo é um **produto fechado (single-tenant)**:
> um app interno para **uma** empresa. É um **sistema de registro** operado só
> pelas pessoas do negócio — o cliente final **não acessa**. Não há multi-tenant,
> planos nem cobrança. Todos os usuários são administradores (sem RBAC).

> **Status:** aplicação em desenvolvimento ativo. Já existem login, dashboard,
> cadastros (clientes, produtos, filamentos, locais, usuários), pedidos com fila
> priorizável e log de auditoria. Detalhamento de produto no
> [PRD](./docs/prd/001-gestao-impressao-3d.md).

## Visão geral

O objetivo é dar ao negócio uma ferramenta única, **no celular e em tempo real**,
que substitua a planilha:

- **Clientes** — cadastro simples (só o nome é obrigatório) para vincular pedidos.
- **Estoque** — filamentos por local, com quantidade **em estoque** e
  **encomendada/a chegar**, atualização de um toque e alerta de estoque baixo.
- **Produção** — orçamentos/pedidos com valor e pagamento, **fila de demanda
  priorizável** (drag-and-drop) e status (em espera / produzindo / concluído).
- **Dashboard** — visão de relance: estoque baixo, fila, produção e pendências.
- **Auditoria** — log único de ações (criação, edição, status, pagamento, estoque…).

A raiz (`/`) é uma landing pública com a visão do produto e um botão de **Entrar**;
as telas operacionais ficam atrás de login. O detalhamento completo está no
[PRD](./docs/prd/001-gestao-impressao-3d.md).

## Stack

| Camada              | Tecnologia                                            |
| ------------------- | ----------------------------------------------------- |
| Frontend/Web        | Next.js 16 (App Router) + React 19 + TypeScript        |
| Estilo/UI           | Tailwind CSS v4 + componentes shadcn (base-ui), lucide |
| Backend/Dados       | Supabase (PostgreSQL) com Auth, RLS e Realtime         |
| Formulários         | React Hook Form + Zod                                  |
| Deploy              | Vercel                                                 |
| Runtime / pkg mgr   | Bun                                                   |

## Começando

Pré-requisito: [Bun](https://bun.sh) instalado (`curl -fsSL https://bun.sh/install | bash`).

```bash
bun install     # instalar dependências
bun run dev     # ambiente de desenvolvimento (http://localhost:3000)
bun run build   # build de produção
bun test        # testes (bun test)
```

A aplicação ficará disponível em `http://localhost:3000`.

### Variáveis de ambiente

Copie `.env.local.example` para `.env.local` (não versionado) e preencha as
chaves do Supabase. Nunca faça commit de segredos.

```bash
NEXT_PUBLIC_SUPABASE_URL=            # URL do projeto Supabase
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY= # chave pública (browser) — sb_publishable_…
SUPABASE_SERVICE_ROLE_KEY=           # chave secreta — SOMENTE no servidor
```

> A chave secreta (`service_role` / `sb_secret_…`) é usada só no servidor
> (ex.: cadastro de usuários). Nunca a exponha no client.

### Banco de dados

O schema vive em [`supabase/migrations/`](./supabase/migrations) (tabelas, RLS,
índices, Realtime). Aplique as migrations no seu projeto Supabase antes de rodar.

## Estrutura do repositório

```
.
├── src/
│   ├── app/
│   │   ├── page.tsx          # landing pública (/) com botão de login
│   │   ├── (auth)/login/     # autenticação (sign in / sign up via Supabase)
│   │   └── (app)/            # área autenticada
│   │       ├── dashboard/    # visão de relance
│   │       ├── pedidos/      # orçamentos/pedidos
│   │       ├── fila/         # fila de produção priorizável
│   │       ├── cadastros/    # clientes, produtos, filamentos, locais, usuários
│   │       └── auditoria/    # log de ações
│   ├── components/           # UI compartilhada (ui/, bottom-nav, combobox…)
│   └── lib/                  # domínio (orders, filaments, clients…) + supabase/
├── supabase/migrations/      # schema, RLS, índices e Realtime
├── docs/                     # PRDs, SPECs, QA, convenções e proposta comercial
├── .agents/                  # skills disponíveis para agentes de IA
├── .context/                 # colaboração entre agentes (gitignored)
├── AGENTS.md                 # convenções para agentes de IA
├── CLAUDE.md                 # guia específico do Claude Code
├── LICENSE                   # MIT
└── README.md                 # este arquivo
```

## Contribuindo

- Trabalhe em branches; o branch-alvo para PRs é `main`.
- Siga as convenções descritas em [`AGENTS.md`](./AGENTS.md).
- Escreva testes (TDD) e verifique com `tsc`/`bun test` antes de concluir.

## Licença

[MIT](./LICENSE) © 2026 Thiago Marinho
