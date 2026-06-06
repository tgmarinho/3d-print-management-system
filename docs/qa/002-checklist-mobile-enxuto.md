# Checklist Mobile Responsivo (enxuto)

Versão curta para colar em issue/Notion. Marque `[x]`. Detalhes e critérios de
aceite no [plano completo](./001-plano-testes-mobile-responsivo.md).

**Build:** `_____` · **Aparelho/viewport:** `_____` · **Testador:** `_____`

### Transversal (toda tela, 375 px)
- [ ] Sem scroll horizontal (320/375/430 px)
- [ ] Alvos de toque ≥ 44px
- [ ] Bottom nav não cobre conteúdo (+ safe area iOS)
- [ ] Header sticky OK
- [ ] Tema claro e escuro legíveis
- [ ] Toasts visíveis (não atrás da nav)
- [ ] Paisagem não quebra

### Navegação
- [ ] 5 abas cabem em 320 px, aba ativa correta
- [ ] "Sair" desloga → `/login`

### Login
- [ ] Teclado não cobre submit; sign-in ↔ sign-up OK

### Dashboard
- [ ] Cards empilham; valores não estouram
- [ ] Realtime atualiza sem reload

### Pedidos
- [ ] Filtros (pagamento/produção) + busca usáveis
- [ ] Toggle pago/a pagar com toast; "A receber" correto
- [ ] Form: combobox cliente com menu não-cortado + quick-create
- [ ] Teclado numérico em quantidade/valor; salvar acessível
- [ ] Status produção (Em espera/Produzindo/Concluído) tocável

### Fila
- [ ] Drag por toque reordena; scroll não dispara drag
- [ ] Botões início/fim funcionam (disabled no 1º/último)
- [ ] Estado otimista + realtime sem "pular"

### Cadastros
- [ ] Hub: 7 itens tocáveis
- [ ] Clientes: busca + form (teclado e-mail/tel)
- [ ] Filamentos/Estoque: badge "estoque baixo", realtime, gestão por local
- [ ] Produtos / Locais / Usuários: forms usáveis

### Auditoria
- [ ] Lista legível em 1 coluna (sem tabela larga)

### Não-funcional
- [ ] Sem erros no console ao navegar
- [ ] Carrega < ~3s em 3G simulado

### Gate de release
- [ ] Fluxos críticos completáveis só com o polegar em aparelho real
- [ ] Nenhum P0/P1 em aberto
