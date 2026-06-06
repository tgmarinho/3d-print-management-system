# Plano de Testes — Mobile Responsivo (QA)

Plano de QA para validar a qualidade da **versão mobile responsiva** do
3D Print SaaS Management System. O produto é **mobile-first** (bottom nav fixa,
container `max-w-3xl`, sem app nativo), então o celular é o cenário primário —
não um caso de borda.

> Como usar: execute por seção, marque ✅/❌/➖ (n/a) em cada item e registre o
> resultado real (print, comportamento observado). Bug encontrado → anote em
> "Registro de defeitos" no fim do doc.

---

## 1. Escopo e ambiente

**Build sob teste:** branch `_____` · commit `_____` · data `_____`
**Testador:** `_____`

**Como subir o app:**

```bash
bun install
bun run dev   # http://localhost:3000
```

**Pré-requisitos de dados:** ter no banco pelo menos — 3 clientes, 2 vendedores,
2 modeladores, 3 produtos, 3 filamentos (1 com estoque baixo), 2 locais e
5 pedidos em status variados (a pagar/pago, em espera/produzindo/concluído).
Isso garante listas com scroll, badges e filtros com conteúdo real.

### 1.1 Matriz de dispositivos e viewports

Testar em pelo menos **um aparelho real** (iOS Safari **e** Android Chrome se
possível) + DevTools para os breakpoints. Larguras-alvo:

| Faixa | Largura | Representa | Prioridade |
|---|---|---|---|
| Mobile pequeno | **320 px** | iPhone SE / Galaxy antigo | Alta |
| Mobile padrão | **375–390 px** | iPhone 12–15, Pixel | **Crítica** |
| Mobile grande | **414–430 px** | iPhone Pro Max | Alta |
| Tablet retrato | **768 px** | iPad | Média |
| Limite do container | **≥ 768 px** | desktop (`max-w-3xl` ativa) | Média |

**Navegadores:** Safari iOS, Chrome Android, Chrome desktop (DevTools device
mode). Bônus: Firefox.

**Condições:** retrato e paisagem; tema claro **e** escuro (next-themes segue o
sistema — alterne a preferência do SO); rede 3G lenta (DevTools throttling) para
ver loading/realtime.

---

## 2. Checklist transversal (vale para todas as telas)

Rodar este bloco em cada tela principal, no viewport crítico (375 px):

- [ ] **Sem scroll horizontal** — nada "vaza" da largura da tela em 320/375 px.
- [ ] **Alvos de toque ≥ 44×44 px** — botões, abas, ícones de ação, alça de drag.
- [ ] **Texto legível** sem zoom (≥ 14–16 px em corpo; sem truncamento que esconda info essencial).
- [ ] **Bottom nav não cobre conteúdo** — último item da lista/CTA acessível acima da barra fixa (padding inferior suficiente).
- [ ] **Safe area iOS** — bottom nav respeita o "notch"/home indicator (não fica colada na borda nem cortada).
- [ ] **Header sticky** funciona — fica fixo no scroll, com backdrop blur, sem sobrepor conteúdo.
- [ ] **Estados de foco/toque** visíveis (feedback ao tocar botões).
- [ ] **Tema escuro** — contraste OK, sem texto invisível, badges e inputs legíveis.
- [ ] **Loading/empty states** — listas vazias mostram mensagem amigável, não tela quebrada.
- [ ] **Toasts (sonner)** aparecem visíveis e não atrás da bottom nav.
- [ ] **Orientação paisagem** — layout não quebra ao girar.

---

## 3. Navegação (bottom nav + header)

Arquivos: `src/components/bottom-nav.tsx`, `src/app/(app)/layout.tsx`

- [ ] As 5 abas (Início, Estoque, Pedidos, Fila, Cadastros) cabem na largura de 320 px sem espremer/quebrar ícone+label.
- [ ] Aba ativa destacada corretamente em cada rota.
- [ ] **Item ativo por prefixo mais específico**: ao entrar em `/cadastros/filamentos/[id]`, destaca **Cadastros** (e "Estoque" quando vier por essa porta) de forma consistente.
- [ ] "Estoque" e "Cadastros" apontam para destinos corretos (Estoque → filamentos).
- [ ] Header: logo "3D·PRINT" visível; botão **Sair** acessível e com alvo de toque adequado.
- [ ] Botão **Sair** efetivamente desloga e redireciona para `/login`.
- [ ] Navegação entre abas é fluida (sem flash/recarregamento estranho).
- [ ] Voltar do navegador/gesto de voltar mantém a aba correta destacada.

---

## 4. Login (`/login`)

- [ ] Formulário centralizado e legível em 320/375 px.
- [ ] Alternância **sign-in ↔ sign-up** funciona e não quebra layout.
- [ ] Teclado virtual não cobre o botão de submit (campo rola para a vista ao focar).
- [ ] Inputs de e-mail/senha com `type` correto (teclado de e-mail; senha mascarada).
- [ ] Erros de credencial exibidos de forma legível.
- [ ] Autofill/gerenciador de senhas do navegador funciona.

---

## 5. Dashboard (`/dashboard`)

Realtime: `filament_stock`, `filaments`, `orders`

- [ ] Cards/seções (estoque baixo, fila, produção, pagamentos pendentes, histórico) empilham bem em 1 coluna no mobile.
- [ ] Números/valores não estouram o card; valores em R$ formatados.
- [ ] Badges de status legíveis (claro e escuro).
- [ ] Listas longas têm scroll adequado; nada cortado pela bottom nav.
- [ ] **Realtime**: alterar estoque/pedido em outra aba/sessão reflete aqui sem reload manual (testar com throttling para observar).
- [ ] Links dos cards levam à tela correta (ex: estoque baixo → filamentos).

---

## 6. Pedidos

### 6.1 Lista (`/pedidos`) — `orders-list.tsx`

- [ ] Filtro por **pagamento** (Todos / A pagar / Pagos) usável com o polegar.
- [ ] Filtro por **status de produção** (Todos / Em espera / Produzindo / Concluído) cabe na largura sem quebrar.
- [ ] Busca por cliente/produto filtra em tempo real.
- [ ] Cards de pedido legíveis: cliente, produto, valor, badges de status.
- [ ] Toggle **marcar como pago/a pagar** (Check/RotateCcw) com alvo de toque OK e feedback (toast).
- [ ] Resumo **"A receber"** soma correta e visível.
- [ ] Combinar filtros + busca não quebra (resultado coerente / empty state).

### 6.2 Novo / Editar (`/pedidos/novo`, `/pedidos/[id]`) — `order-form.tsx`

- [ ] **EntityCombobox (Cliente)**: abre, busca, e o **menu não é cortado** pelo container nem pela bottom nav (menu portal).
- [ ] **Quick-create inline**: cadastrar cliente novo dentro do combobox; valida nome duplicado; volta selecionado.
- [ ] Mesmo comportamento para **Vendedor** e **Modelador** (clearable funciona).
- [ ] **Select de Produto** abre o picker nativo do celular corretamente.
- [ ] Teclado numérico aparece em **Quantidade** e **Valor** (inputs number).
- [ ] Textarea de descrição expande/rola bem; teclado não cobre o campo.
- [ ] Botão de **salvar** sempre acessível (não atrás do teclado/bottom nav).
- [ ] Validação (RHF + Zod) exibe erros legíveis abaixo dos campos.
- [ ] **ProductionStatusControl** (Em espera/Produzindo/Concluído) — segmentos tocáveis, estado otimista, toast.
- [ ] Botão **excluir** (em editar) com confirmação; alvo de toque OK.
- [ ] Salvar redireciona/atualiza a lista corretamente.

---

## 7. Fila (`/fila`) — `queue-list.tsx`

Crítico para mobile (drag & drop por toque).

- [ ] **Drag & drop por toque** reordena (PointerSensor, distância 6 px evita ativar em toque acidental/scroll).
- [ ] Scroll vertical da lista **não** dispara drag por engano.
- [ ] Alça de arraste (GripVertical) com alvo de toque ≥ 44 px.
- [ ] Botões **"Mover para início"** (ChevronsUp) e **"Mover para fim"** (ChevronsDown) funcionam como alternativa ao drag.
- [ ] Botões corretos ficam **desabilitados** no 1º/último item.
- [ ] **Estado otimista**: ordem muda na hora; não "pula" de volta.
- [ ] **Realtime**: reordenar em outra sessão reflete aqui sem sobrescrever um drag em andamento.
- [ ] Rank/posição exibido corretamente após reordenar.
- [ ] Lista longa: itens não ficam sob a bottom nav; scroll suave.

---

## 8. Cadastros (hub e entidades)

### 8.1 Hub (`/cadastros`)

- [ ] Menu com as 7 entidades em cards/lista tocáveis; sem overflow.
- [ ] Cada item leva à tela correta.

### 8.2 Clientes (`/cadastros/clientes` + novo/`[id]`)

- [ ] **Busca** filtra por nome, empresa, e-mail e telefone.
- [ ] Cards com avatar de iniciais + dados em linha legíveis (sem quebra feia em 320 px).
- [ ] Form novo/editar: campos (nome*, empresa, e-mail, telefone) com `type` e teclado corretos (e-mail/tel).
- [ ] Exclusão com confirmação.

### 8.3 Produtos (`/cadastros/produtos` + novo/`[id]`)

- [ ] Lista: nome + descrição truncada (2 linhas) sem quebrar layout.
- [ ] Form: nome*, descrição (textarea) usáveis no mobile.

### 8.4 Filamentos / Estoque (`/cadastros/filamentos` + novo/`[id]`)

Realtime: `filament_stock`, `filaments` · É também a aba **"Estoque"**.

- [ ] Lista mostra cor + material, marca + peso, **badge "Estoque baixo"**, contador de rolos.
- [ ] **Realtime** de estoque reflete mudanças ao vivo.
- [ ] Form: cor*, material*, marca, peso (number), limite estoque baixo (number) — teclados corretos.
- [ ] **Gerenciador de estoque por local** (em editar) usável no mobile: ajustar quantidade por local sem layout quebrado.

### 8.5 Locais (`/cadastros/locais`)

- [ ] Criar/editar/remover local de estoque (casa, loja) com alvos de toque OK.

### 8.6 Usuários (`/cadastros/usuarios`)

- [ ] Lista de usuários legível.
- [ ] Criar usuário com senha provisória — form usável no mobile.

---

## 9. Auditoria (`/auditoria`)

- [ ] Lista (ator, ação/badge, entidade, detalhes, timestamp) legível em 1 coluna no mobile — sem tabela larga que force scroll horizontal.
- [ ] Filtros usáveis com o polegar.
- [ ] Timestamps formatados de forma legível.

---

## 10. Não-funcional

- [ ] **Performance**: telas principais carregam < ~3 s em 3G simulado; sem travar ao rolar listas longas.
- [ ] **Sem erros no console** (warnings de hidratação, chaves React, layout shift) ao navegar pelo app.
- [ ] **Realtime resiliente**: perder/reconectar rede não duplica nem perde atualizações.
- [ ] **Acessibilidade básica**: navegação por leitor de tela nos botões de ação principais; ARIA labels presentes (fila, combobox); contraste AA.
- [ ] **Sem layout shift** perceptível ao carregar imagens/badges/realtime.
- [ ] **PWA/zoom**: pinch-to-zoom não quebra; viewport meta não bloqueia acessibilidade indevidamente.

---

## 11. Critérios de aceite (gate de release)

A versão mobile é aprovada quando:

1. **Zero** scroll horizontal e **zero** conteúdo coberto pela bottom nav nas larguras 320/375/430 px.
2. Todos os fluxos críticos completáveis **só com o polegar** em aparelho real: criar pedido (com quick-create de cliente), reordenar fila, marcar pago, ajustar estoque.
3. Combobox e selects abrem com menu **totalmente visível** (não cortado).
4. Realtime atualiza dashboard/estoque/fila sem reload manual.
5. Tema claro e escuro sem texto ilegível.
6. **Nenhum bug bloqueante (P0/P1)** em aberto. P2/P3 documentados e aceitos.

---

## 12. Registro de defeitos

| # | Tela / componente | Viewport | Severidade (P0–P3) | Descrição | Passos p/ reproduzir | Status |
|---|---|---|---|---|---|---|
| 1 |  |  |  |  |  |  |
| 2 |  |  |  |  |  |  |

**Severidade:** P0 = bloqueia uso · P1 = quebra fluxo importante · P2 = degrada UX ·
P3 = cosmético.

---

## Anexo — Roteiro rápido de smoke test (≈ 10 min)

Para um sanity check rápido a cada build, em **1 aparelho real (375 px)**:

1. Login → Dashboard carrega com dados e realtime.
2. Bottom nav: percorrer as 5 abas, sem overflow.
3. Pedidos → Novo → combobox de cliente + **quick-create** → salvar.
4. Fila → reordenar por **drag** e por **botões** de início/fim.
5. Pedidos → marcar um como **pago** (toast).
6. Estoque → abrir filamento → ajustar quantidade por local.
7. Alternar **tema escuro** e revisar contraste.
8. Girar para **paisagem** em uma tela de lista.
