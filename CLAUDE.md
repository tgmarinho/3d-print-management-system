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

Stack-alvo: **Next.js (App Router) + TypeScript**, **Supabase/PostgreSQL**
(com Realtime), deploy na **Vercel**, **web mobile-first** (sem app nativo).
Package manager e runtime: **Bun**.

> Estágio inicial: ainda sem código de aplicação. Atualize este guia (comandos,
> arquitetura) assim que o app for criado.

## Comandos

Quando a aplicação existir, os comandos esperados são:

```bash
bun install     # instalar dependências
bun run dev     # ambiente de desenvolvimento (http://localhost:3000)
bun run build   # build de produção
bun run lint    # lint
bun test        # testes
```

> Use **Bun** como package manager e runtime — não use `npm`/`yarn`/`pnpm`. O
> lockfile é o `bun.lock`. Confirme os scripts reais no `package.json` antes de
> usá-los — ele ainda não existe.

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
- Espelhe o estilo do código vizinho (nomes, idioma, comentários).
- **Segredos**: use `.env.local`; nunca faça commit de chaves. Service keys do
  Supabase só no servidor.
- **`.context/`** é a área de colaboração entre agentes (gitignored) — use para
  notas/todos compartilhados.

## Idioma

Responda ao mantenedor em **português brasileiro** com acentuação correta.
Mantenha identificadores e termos técnicos em inglês.
