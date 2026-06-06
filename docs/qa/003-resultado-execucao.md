# Resultado da execução — QA Mobile (rodada 1)

Execução do [plano](./001-plano-testes-mobile-responsivo.md) via browser
automatizado (Chrome) + inspeção de DOM/código, em `http://localhost:3000`.
Sessão Supabase autenticada; dados de QA presentes. Viewport efetivo dos testes:
~485–500 px (mobile).

> **Nota de ambiente:** o controle de viewport e o dev server ficaram instáveis
> (resizes oscilando a largura, server reiniciado algumas vezes). A medição de
> overflow e a validação funcional foram feitas via DOM/JS — confiáveis e
> independentes do recorte de screenshot. A validação **visual pixel-fiel** em
> 320/375 px e o **drag-and-drop por toque** ainda devem ser confirmados em
> aparelho real / DevTools device mode.

## Telas testadas

| Tela | Overflow-X | Bottom nav | Resultado |
|---|---|---|---|
| Dashboard | ✅ não | ✅ | OK |
| Pedidos (lista) | ✅ não | ✅ | OK — filtros, busca e toggle pago funcionam |
| Pedidos / Novo | ✅ não | ✅ | OK — combobox, quick-create, inputs |
| Fila | ✅ não | ✅ | OK — reordenar por setas |
| Cadastros (hub) | ✅ não | ✅ | OK |
| Clientes (lista) | ✅ não | ✅ | OK — busca server-side |
| Produtos | ✅ não | ✅ | OK |
| Filamentos (lista) | ✅ não | ✅ | OK |
| Filamentos / Editar | ✅ não | ✅ | OK — estoque por local |
| Locais de estoque | ✅ não | ✅ | OK |
| **Usuários** | — | — | ❌ **não carrega** (ver ACH-06) |
| Auditoria | ✅ não | ✅ | OK — layout 1 coluna, filtros |

## Fluxos validados (funcionais, com reversão)
- **Pedidos — filtro de produção:** "Produzindo" filtra corretamente. ✅
- **Pedidos — toggle pago:** marcar pago atualiza o resumo "A receber"
  (R$ 630 → R$ 130) e o contador; **revertido** ao estado original. ✅
- **Novo Pedido — combobox de cliente:** abre, busca ("Cli" → "Cliente Inline
  QA"), oferece **quick-create** ("Cadastrar 'Cli'") e o **menu não é cortado**
  (`menuClipped:false`). ✅
- **Novo Pedido — inputs:** `quantity` (inputmode=numeric) e `amount`
  (inputmode=decimal) → teclado numérico no mobile; selects nativos. ✅
- **Fila — reordenar:** "mover para o fim" e "mover para o início" funcionam,
  ranks atualizam, estados `disabled` corretos (1º sem subir, último sem descer);
  **ordem restaurada**. ✅
- **Clientes — busca:** `?q=Cleide` filtra server-side para 1 resultado. ✅
- **Filamento — estoque por local:** "Estoque por local · 8 em estoque" com 3
  locais e steppers −/+ por local (Em estoque / Encomendado). ✅
- **Auditoria:** trilha registrou as próprias ações de teste ("Mudou prioridade",
  "Registrou pagamento to:paid/unpaid"). ✅

## Achados

### ACH-01 — Bottom nav presente e funcional ✅ (não é bug)
Investigado após a observação de "menu ausente no mobile". `<nav fixed bottom-0
z-20>`, 5 itens, clicáveis (hit-test). O item *Início* aparece coberto pelo
overlay **`NEXTJS-PORTAL`** (botão "N" do Next dev) — **some no build de
produção**. Confirmado também por screenshot. `src/components/bottom-nav.tsx`.

### ACH-02 — Bottom nav sem `safe-area-inset-bottom` (P2)
`bottom-nav.tsx:40` — `fixed bottom-0` sem `pb-[env(safe-area-inset-bottom)]`.
Em iPhones com *home indicator* os ícones podem encostar na borda / ficar sob a
home bar — **causa provável de "menu cortado/sumido" em aparelho real**. Fix:
adicionar safe-area-inset à `<nav>` e ao padding-bottom do container do layout.

### ACH-05 — Alvos de toque abaixo de 44 px (P2)
- Toggle de pagamento (Pedidos): **32×32 px**.
- Setas mover início/fim (Fila): **28×28 px**.
- Alça de arraste (Fila): **32 px** de largura.
Abaixo do mínimo recomendado (44×44). Aumentar área tocável (padding/hit-area).

### ACH-06 — `/cadastros/usuarios` não carrega: `SUPABASE_SERVICE_ROLE_KEY` vazia
Erro de **servidor**: `Falta SUPABASE_SERVICE_ROLE_KEY` (`env.ts:22` →
`createAdminClient` → `UsuariosPage`). A chave está **vazia** (len=0) em `.env` e
`.env.local`. É **configuração de ambiente local** (a página usa a Admin API do
Supabase), não bug de código — e a tela degrada com error boundary ("This page
couldn’t load"). Em produção (Vercel) com a chave configurada, deve funcionar.
**Ação:** preencher a service role key no ambiente local para testar Usuários.

### ACH-03 — Auditoria fora da navegação principal (P3 / UX)
`/auditoria` só é alcançável pelo card "Histórico de ações" no fim do Dashboard
(não está na bottom nav nem no hub Cadastros). Acessível, mas de baixa descoberta.

### Falso-alarme registrado — erro de env na edição de filamento
Durante a sessão, `/cadastros/filamentos/[id]` lançou `Falta
NEXT_PUBLIC_SUPABASE_URL` no client. **Causa: cache de build do Turbopack
inconsistente** após religamento abrupto do dev server (o `.env.local` surgiu no
meio). Resolvido com `rm -rf .next` + restart limpo. **Não é bug do código.**

## Console
Sem erros de hidratação ou warnings de React nas telas testadas. Único erro de
runtime: o `SUPABASE_SERVICE_ROLE_KEY` vazio (ACH-06).

## Pendências para aparelho real / DevTools
Validação visual em 320/375 px, drag-and-drop por toque na Fila, tema escuro
(suporte existe via next-themes + CSS variables), orientação paisagem, e teclado
virtual não cobrindo botões de submit.

## Resumo
Navegação e fluxos principais **funcionam bem no mobile**, sem overflow
horizontal em nenhuma tela. **Nenhum bug bloqueante de código.** Itens a tratar:
**ACH-02** (safe-area — prioritário, explica o "menu sumido" no aparelho),
**ACH-05** (alvos de toque), **ACH-06** (config: service role key local),
**ACH-03** (descoberta de Auditoria).
