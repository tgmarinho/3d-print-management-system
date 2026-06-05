# AGENTS.md

Convenções para agentes de IA (Claude Code, Codex, Copilot, Gemini etc.)
trabalhando neste repositório. Para orientações específicas do Claude Code, veja
também [`CLAUDE.md`](./CLAUDE.md).

## Sobre o projeto

**3D Print SaaS Management System** — plataforma de gestão para operações de
impressão 3D, cobrindo **clientes**, **estoque** e **produção**. Consulte o
[`README.md`](./README.md) para a visão geral e o stack-alvo.

> O repositório está em estágio inicial: ainda não há código de aplicação. Ao
> introduzir o app, atualize este arquivo e o README com os comandos reais.

## Stack-alvo

- **Next.js (App Router)** + React + **TypeScript**
- **Supabase / PostgreSQL** para dados e autenticação
- Deploy na **Vercel**
- Mobile opcional com **React Native / Expo**

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

Consulte o `SKILL.md` correspondente antes de aplicar cada uma.

## Idioma

Comunique-se com o mantenedor em **português brasileiro** (com acentuação
correta). Identificadores de código e termos técnicos permanecem em inglês.
