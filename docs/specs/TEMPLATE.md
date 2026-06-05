# [Nome da Feature] — SPEC de Implementação

> **Altura: técnica.** Como construir. Assume um agente sem contexto do codebase.
> Volátil — descartável após o merge. Deriva de um PRD em `docs/prd/`. Skill:
> `writing-plans`. Executar com `subagent-driven-development` ou `executing-plans`.

**PRD de origem:** [docs/prd/YYYY-MM-DD-feature.md](../prd/YYYY-MM-DD-feature.md)
**Goal:** [uma frase do que isto constrói]
**Architecture:** [2–3 frases sobre a abordagem]
**Tech Stack:** [tecnologias/libs principais]

---

## Estrutura de arquivos

Quais arquivos serão criados/modificados e a responsabilidade de cada um. Uma
responsabilidade por arquivo; o que muda junto vive junto.

| Arquivo | Responsabilidade |
| --- | --- |
| `path/to/file.ts` | … |

## Tarefas

Cada passo é uma ação (2–5 min), em ordem TDD. Use checkbox para rastreio.

### Tarefa 1: [nome]

- [ ] Escrever o teste que falha
- [ ] Rodar e confirmar que falha
- [ ] Implementar o mínimo para passar
- [ ] Rodar os testes e confirmar verde
- [ ] Commit

### Tarefa 2: [nome]

- [ ] …

## Verificação

Como provar que funciona de verdade: comandos (build/lint/test) e comportamento
observável esperado.
