# 3D Print SaaS Management System

Sistema de gestão para uma operação de **modelagem e impressão 3D sob demanda** —
controle de **clientes**, **estoque de filamento** e **produção** (orçamentos,
fila de demanda e status).

> Apesar do "SaaS" no nome, o escopo é um **produto fechado (single-tenant)**:
> um app interno para **uma** empresa. É um **sistema de registro** operado só
> pelas pessoas do negócio — o cliente final **não acessa**. Não há multi-tenant,
> planos nem cobrança.

> **Status:** documentação de produto pronta (veja o
> [PRD](./docs/prd/001-gestao-impressao-3d.md)); o código da aplicação ainda será
> adicionado. A base do repositório e a infraestrutura de agentes já estão
> configuradas.

## Visão geral

O objetivo é dar ao negócio uma ferramenta única, **no celular e em tempo real**,
que substitua a planilha:

- **Clientes** — cadastro simples (só o nome é obrigatório) para vincular pedidos.
- **Estoque** — filamentos por local, com quantidade **em estoque** e
  **encomendada/a chegar**, atualização de um toque e alerta de estoque baixo.
- **Produção** — orçamentos/pedidos com valor e pagamento, **fila de demanda
  priorizável** e status (em espera / produzindo / concluído).
- **Dashboard** — visão de relance: estoque baixo, fila, produção e pendências.

O detalhamento completo está no [PRD](./docs/prd/001-gestao-impressao-3d.md).

## Stack

O stack-alvo (definido no PRD/proposta e refletido na configuração do repositório)
é:

| Camada              | Tecnologia                                   |
| ------------------- | -------------------------------------------- |
| Frontend/Web        | Next.js (App Router) + React + TypeScript    |
| Backend/Dados       | Supabase (PostgreSQL)                         |
| Deploy              | Vercel                                        |
| Runtime / pkg mgr   | Bun                                          |

> Atualize esta seção (versões e comandos reais) quando a implementação começar.

## Começando

Pré-requisito: [Bun](https://bun.sh) instalado (`curl -fsSL https://bun.sh/install | bash`).

```bash
# instalar dependências (quando o app existir)
bun install

# rodar em desenvolvimento
bun run dev
```

A aplicação ficará disponível em `http://localhost:3000`.

### Variáveis de ambiente

Crie um arquivo `.env.local` (não versionado) com as credenciais necessárias —
por exemplo as chaves do Supabase. Nunca faça commit de segredos.

## Estrutura do repositório

```
.
├── .agents/         # Skills disponíveis para agentes de IA (Superpowers, Vercel, Supabase…)
├── .context/        # Arquivos de colaboração entre agentes (gitignored)
├── docs/            # Documentação de produto
│   ├── prd/         # PRDs (produto: o quê e porquê) + versões HTML para apresentar
│   ├── specs/       # SPECs técnicos (como implementar)
│   └── proposta-comercial.md
├── skills-lock.json # Lockfile das skills instaladas
├── AGENTS.md        # Convenções para agentes de IA trabalhando neste repo
├── CLAUDE.md        # Guia específico do Claude Code
├── LICENSE          # MIT
└── README.md        # Este arquivo
```

## Contribuindo

- Trabalhe em branches; o branch-alvo para PRs é `main`.
- Siga as convenções descritas em [`AGENTS.md`](./AGENTS.md).
- Escreva testes (TDD) e verifique antes de concluir uma tarefa.

## Licença

[MIT](./LICENSE) © 2026 Thiago Marinho
