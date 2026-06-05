# AGENTS.md

Convenções para agentes de IA (Claude Code, Codex, Copilot, Gemini etc.)
trabalhando neste repositório. Para orientações específicas do Claude Code, veja
também [`CLAUDE.md`](./CLAUDE.md).

## Sobre o projeto

**3D Print SaaS Management System** — gestão para uma operação de modelagem e
impressão 3D sob demanda, cobrindo **clientes**, **estoque de filamento** e
**produção** (orçamentos, fila de demanda, status). Consulte o
[`README.md`](./README.md) para a visão geral e o
[PRD](./docs/prd/001-gestao-impressao-3d.md) para o escopo completo.

> **Produto fechado (single-tenant)** para uma empresa — não é um SaaS
> multi-tenant (apesar do nome). É um **sistema de registro interno**: só as ~3
> pessoas do negócio acessam, todas como administradores (sem RBAC); o cliente
> final não acessa. Cliente, vendedor e modelador são **dados**, não usuários.

> O repositório está em estágio inicial: ainda não há código de aplicação. Ao
> introduzir o app, atualize este arquivo e o README com os comandos reais.

## Stack-alvo

- **Next.js (App Router)** + React + **TypeScript**
- **Supabase / PostgreSQL** para dados, autenticação e tempo real (Realtime)
- Deploy na **Vercel**
- **Web mobile-first** — app nativo (React Native/Expo) está **fora de escopo**;
  a web mobile-first atende
- **Bun** como package manager e runtime (use `bun`, não `npm`/`yarn`/`pnpm`;
  lockfile `bun.lock`)

## Princípios de trabalho

1. **TDD** — escreva o teste antes do código de produção. Não marque uma tarefa
   como concluída sem testes passando.
2. **Verifique antes de concluir** — rode build, lint e testes; confirme o
   comportamento real, não apenas que o código compila.
3. **Debugging sistemático** — encontre a causa raiz antes de corrigir; não
   aplique correções superficiais.
4. **Planeje antes de mudanças grandes** — para tarefas multi-etapas, esboce um
   plano antes de implementar.
5. **Mudanças pequenas e revisáveis** — prefira PRs focados.

## PRD & SPEC

Trabalho não-trivial passa por dois documentos, em alturas diferentes:

- **PRD** (produto) — *o quê* e *porquê*. Problem statement, solução pela ótica
  do usuário, user stories, decisões de produto. **Sem** caminhos de arquivo nem
  snippets. Estável; muda raramente. Vive em `docs/prd/`. Skill: `to-prd`.
- **SPEC** (técnico, para agentes) — *como*. Arquivos a tocar, interfaces,
  schema, e tarefas TDD bite-sized (2–5 min) prontas para um agente implementar.
  Volátil; descartável após o merge. Vive em `docs/specs/`. Skill: `writing-plans`.

Fluxo: `PRD → (fatiar em issues) → SPEC → executar`. Um PRD pode gerar vários
SPECs (um por subsistema). Cada SPEC deve produzir software funcional e testável
por si só.

Nomeie os PRDs com numeração sequencial — `NNN-<feature>.md` (o primeiro é
[`docs/prd/001-gestao-impressao-3d.md`](./docs/prd/001-gestao-impressao-3d.md)).
Use os templates em `docs/prd/TEMPLATE.md` e `docs/specs/TEMPLATE.md`. Uma versão
HTML do PRD (para apresentar ao cliente) pode acompanhar o `.md`.

Regra rápida: alinhar **escopo/valor** com stakeholder → PRD; já sei o quê,
quero **passo-a-passo de código** → SPEC.

## Convenções de código

- **Linguagem:** TypeScript em modo estrito; evite `any`.
- **Componentes:** siga padrões de composição do React (children em vez de
  render props, evite props booleanas excessivas, sem `forwardRef` no React 19).
- **Estilo:** mantenha a consistência com o código existente — espelhe nomes,
  densidade de comentários e idioma do arquivo ao redor.
- **Banco:** siga boas práticas de Postgres/Supabase (RLS, índices, pooling de
  conexões). Nunca exponha service keys no client.
- **Segredos:** nunca faça commit de `.env`/chaves. Use `.env.local`.

## Git e PRs

- Trabalhe em **branches**; nunca faça commit direto na `main`.
- Branch-alvo para diffs e PRs: `main` (`git diff origin/main...`,
  `gh pr create --base main`).
- Faça commit/push apenas quando solicitado.
- Mensagens de commit claras e no imperativo.

## Skills disponíveis

O diretório `.agents/skills/` traz skills reutilizáveis (registradas em
`skills-lock.json`). Destaques:

- **Superpowers** — `brainstorming`, `writing-plans`, `executing-plans`,
  `subagent-driven-development`, `dispatching-parallel-agents`,
  `systematic-debugging`, `test-driven-development`,
  `verification-before-completion`, `requesting-code-review`,
  `receiving-code-review`, `finishing-a-development-branch`,
  `using-git-worktrees`, `writing-guidelines`.
- **Vercel** — `deploy-to-vercel`, `vercel-react-best-practices`,
  `vercel-composition-patterns`, `vercel-react-native-skills`,
  `vercel-react-view-transitions`, `vercel-optimize`, `web-design-guidelines`.
- **Supabase** — `supabase`, `supabase-postgres-best-practices`.
- **Matt Pocock** — `to-prd`, `to-issues` (fluxo PRD/SPEC), `caveman` (modo de
  resposta comprimido).
- **UI/UX** — `ui-ux-pro-max` (inteligência de design para web/mobile: estilos,
  paletas, tipografia, regras de UX e charts). Os scripts de busca por domínio
  (`scripts/search.py --design-system`) exigem **Python 3**.

Consulte o `SKILL.md` correspondente antes de aplicar cada uma.

## Idioma

Comunique-se com o mantenedor em **português brasileiro** (com acentuação
correta). Identificadores de código e termos técnicos permanecem em inglês.
