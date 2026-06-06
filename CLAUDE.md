# CLAUDE.md

Guia para o **Claude Code** trabalhar neste repositório. As convenções gerais
(válidas para qualquer agente) estão em [`AGENTS.md`](./AGENTS.md); este arquivo
traz apenas o que é específico do Claude Code. A visão geral do produto está no
[`README.md`](./README.md).

## Projeto

**3D Print SaaS Management System** — gestão de **clientes**, **estoque de
filamento** e **produção** para uma operação de impressão 3D sob demanda. É um
**produto fechado (single-tenant)**, sistema de registro interno: só as pessoas
do negócio acessam, todas como administradores; o cliente final não acessa.
Escopo completo no [PRD](./docs/prd/001-gestao-impressao-3d.md).

Stack: **Next.js 16 (App Router) + React 19 + TypeScript**, **Supabase/PostgreSQL**
(Auth + RLS + Realtime), **Tailwind v4** + componentes shadcn (sobre `@base-ui/react`)
e ícones `lucide-react`, deploy na **Vercel**, **web mobile-first** (sem app nativo).
Package manager e runtime: **Bun**.

## Arquitetura

- **Rotas** em `src/app`:
  - `page.tsx` — landing pública (`/`) com a visão do produto e botão de login.
  - `(auth)/login` — sign in / sign up via Supabase Auth (Server Actions).
  - `(app)/*` — área autenticada (o `layout.tsx` redireciona para `/login` sem
    usuário): `dashboard`, `pedidos`, `fila` (drag-and-drop com `@dnd-kit`),
    `cadastros` (clientes, produtos, filamentos, locais, usuários) e `auditoria`.
- **Domínio** em `src/lib/*.ts` (ex.: `orders.ts`, `filaments.ts`, `clients.ts`,
  `queue.ts`, `audit.ts`) — cada um com `*.test.ts` ao lado.
- **Supabase** em `src/lib/supabase/`: `server.ts` (RSC/Server Actions),
  `client.ts` (browser), `middleware.ts` (refresh de sessão), `admin.ts`
  (service role — só servidor), `realtime.ts`.
- **Mutações** via **Server Actions** (`actions.ts` por rota); UI atualiza em
  tempo real via Realtime (`realtime-refresh.tsx`).
- **Schema** em `supabase/migrations/` (tabelas, RLS, índices, Realtime).

## Comandos

```bash
bun install     # instalar dependências
bun run dev     # ambiente de desenvolvimento (http://localhost:3000)
bun run build   # build de produção
bun test        # testes (bun test)
bunx tsc --noEmit  # typecheck (não há script de lint dedicado)
```

> Use **Bun** como package manager e runtime — não use `npm`/`yarn`/`pnpm`. O
> lockfile é o `bun.lock`. Os scripts reais estão no `package.json`
> (`dev`/`build`/`start`/`test`); não há `lint` — use `tsc --noEmit`.

## Fluxo de trabalho esperado

1. **Planeje** tarefas multi-etapas antes de codar.
2. **TDD**: teste primeiro, depois implementação.
3. **Verifique** com build/lint/testes e confirme o comportamento real.
4. **Debugging sistemático**: causa raiz antes da correção.
5. Trabalhe em **branch**; PRs têm como base `main`. Commit/push só quando
   solicitado.

## Skills

Há skills locais em `.agents/skills/` (lockfile em `skills-lock.json`) além das
skills do harness. Use-as quando aplicável — por exemplo `test-driven-development`,
`systematic-debugging`, `supabase-postgres-best-practices`,
`vercel-react-best-practices`, `deploy-to-vercel` e `ui-ux-pro-max` (design de
UI/UX; os scripts de busca por domínio precisam de Python 3). Leia o `SKILL.md`
antes de aplicar.

## Convenções específicas

- **TypeScript estrito**; evite `any`.
- **Formulários: React Hook Form + Zod** (`@hookform/resolvers`) onde fizer
  sentido — todo form com validação/estado/submit não-trivial. O schema Zod é a
  fonte de verdade (`z.infer` para o tipo); se o submit for Server Action,
  **revalide com o mesmo schema no servidor**. Inputs triviais não precisam do
  setup. Selects avançados → `react-select`; selects simples → `Select` do shadcn.
  Exemplo canônico em [`docs/conventions/forms.md`](./docs/conventions/forms.md).
- Espelhe o estilo do código vizinho (nomes, idioma, comentários).
- **Segredos**: use `.env.local`; nunca faça commit de chaves. Service keys do
  Supabase só no servidor.
- **`.context/`** é a área de colaboração entre agentes (gitignored) — use para
  notas/todos compartilhados.

## Idioma

Responda ao mantenedor em **português brasileiro** com acentuação correta.
Mantenha identificadores e termos técnicos em inglês.
