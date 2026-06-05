# 3D Print SaaS Management System

Sistema SaaS de gestão para operações de impressão 3D — gerenciamento de
**clientes**, **estoque** (filamentos, resinas e insumos) e **produção**
(pedidos, filas de impressão e acompanhamento de status).

> **Status:** projeto em estágio inicial. Esta é a base do repositório, com a
> documentação e a infraestrutura de agentes configuradas. O código da aplicação
> ainda será adicionado.

## Visão geral

O objetivo é oferecer a um negócio de impressão 3D uma plataforma única para:

- **Clientes** — cadastro, histórico de pedidos e relacionamento.
- **Estoque** — controle de filamentos/resinas, insumos e níveis mínimos.
- **Produção** — pedidos, fila de impressão, status de cada job e custos.

## Stack

O stack-alvo, inferido pela configuração do repositório (`.gitignore`, skills de
agentes e tooling), é:

| Camada              | Tecnologia                                   |
| ------------------- | -------------------------------------------- |
| Frontend/Web        | Next.js (App Router) + React + TypeScript    |
| Backend/Dados       | Supabase (PostgreSQL)                         |
| Deploy              | Vercel                                        |
| Mobile (opc.)       | React Native / Expo                          |
| Runtime / pkg mgr   | Bun                                          |

> Estas escolhas devem ser confirmadas/ajustadas conforme o código for sendo
> escrito. Atualize esta seção quando a implementação real começar.

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
