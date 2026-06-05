# Sistema de Gestão de Impressão 3D — PRD

> **Altura: produto.** O quê e porquê, pela ótica do usuário. Sem caminhos de
> arquivo nem snippets de código (envelhecem rápido). Gera um ou mais SPECs em
> `docs/specs/`. Skill: `to-prd`.

**Status:** proposta
**Autor:** Thiago Marinho
**Data:** 2026-06-04

## Definição do problema

A empresa faz **modelagem e impressão 3D sob demanda**: o cliente pede um
produto, alguém modela, alguém imprime e entrega. Hoje o controle é informal —
estoque de filamento e andamento dos pedidos vivem em planilha (ou na cabeça das
sócias), o que gera atrito no dia a dia:

- **Estoque de filamento** (a matéria-prima) só é conhecido perguntando "quanto
  você tem aí?" de uma pessoa para a outra. Não há uma fonte única e atualizada
  de quanto há de cada cor, em cada local, nem do que foi comprado e está por
  chegar.
- **Pedidos/orçamentos** não têm um lugar comum. Falta visibilidade de quem é o
  cliente, quem vendeu, quem está modelando, em que status está a produção, se
  está pago e qual a **ordem da fila** de demanda.
- Abrir planilha no computador é inconveniente — o trabalho acontece de pé, no
  celular, abrindo pacotes de filamento e tocando a produção.

## Solução

Um aplicativo **web, online e multiusuário** (mobile-first) que as pessoas da
empresa acessam pelo celular e enxergam em **tempo real**. É um **produto
fechado** para esta empresa (não um SaaS multi-cliente).

É um **sistema de registro interno (back-office)**: reflete o que já está
acontecendo no negócio, alimentado **apenas pelas pessoas da empresa**. O cliente
final **não acessa** o sistema — não cadastra a si mesmo nem solicita orçamento
por ele. As sócias já chegam com os dados em mãos (combinados por WhatsApp,
presencialmente, etc.) e os **lançam** aqui. "Cliente", "vendedor" e "modelador"
são **dados de um pedido**, não usuários que fazem login.

Ele cobre dois grandes fluxos do negócio:

1. **Controle de estoque de filamento** — saber, a qualquer momento e de qualquer
   lugar, quanto há de cada filamento por local, e o que está encomendado. A
   atualização é de um toque: abriu um pacote, ajusta o número, salva, e todos
   veem na hora.

2. **Gestão da demanda (orçamentos → produção)** — cada pedido vira um registro
   com cliente, vendedor, modelador, produto, valor, status de produção,
   situação de pagamento e **posição na fila** (priorizável arrastando).

Um **dashboard visual** resume o estado do negócio: estoque baixo, fila atual,
produção em andamento e pagamentos pendentes.

## Histórias de usuário

**Autenticação e pessoas**

1. Como usuário da empresa, quero me cadastrar e fazer login, para que apenas
   pessoas autorizadas acessem o sistema.
2. Como administrador, quero gerenciar (CRUD) os usuários do sistema, para que eu
   controle quem tem acesso.

**Cadastro de clientes**

3. Como administrador, quero cadastrar um cliente, para que eu possa vincular
   pedidos a ele.
4. Como usuário, quero listar, buscar, editar e remover clientes, para que o
   cadastro fique sempre atualizado.

**Cadastro de vendedores e modeladores**

5. Como administrador, quero cadastrar vendedores, para que eu saiba quem
   converteu cada venda.
6. Como administrador, quero cadastrar modeladores, para que eu saiba quem é
   responsável pela modelagem de cada pedido.
7. Como usuário, quero listar/editar/remover vendedores e modeladores, para
   manter os cadastros corretos.

**Cadastro de produtos**

8. Como usuário, quero registrar o produto que o cliente pediu, para que o pedido
   descreva o que será modelado e impresso.
9. Como usuário, quero reaproveitar produtos recorrentes de um catálogo (o mesmo
   produto pode ser usado em pedidos de clientes diferentes), para não redigitar
   itens que se repetem.

**Estoque de filamentos**

10. Como usuário, quero cadastrar um filamento com cor, material, marca e peso,
    para identificar a matéria-prima que tenho.
11. Como usuário, quero registrar a quantidade em estoque por local, para saber
    quanto há em cada lugar.
12. Como usuário, quero registrar a quantidade encomendada/a chegar, para saber o
    que já foi comprado e está a caminho.
13. Como usuário, quero aumentar/diminuir a quantidade de um filamento com um
    toque, para atualizar o estoque rapidamente ao abrir ou usar um pacote.
14. Como usuário, quero cadastrar e gerenciar os locais de estoque, para refletir
    onde o material fica guardado.
15. Como usuária no celular, quero que a outra pessoa veja minha atualização de
    estoque em tempo real, para que ninguém trabalhe com número desatualizado.
16. Como usuário, quero ver quais filamentos estão com estoque baixo, para
    comprar antes de faltar.

**Orçamentos / pedidos**

17. Como administrador, quero criar um orçamento vinculando cliente, vendedor,
    modelador e produto (com a quantidade pedida), para registrar a demanda.
18. Como administrador, quero informar o valor do orçamento, para acompanhar o
    faturamento.
19. Como usuário, quero registrar a situação de pagamento (pago / a pagar), para
    saber o que ainda preciso receber.
20. Como usuário, quero listar, buscar, editar e remover orçamentos, para manter a
    operação organizada.

**Produção**

21. Como administrador, quero definir o status de produção de cada pedido (em
    espera / produzindo / concluído), para acompanhar o andamento.
22. Como usuário, quero ver todos os pedidos em produção, para saber o que está em
    andamento agora.

**Fila de demanda**

23. Como administrador, quero ordenar a fila de demanda (1º, 2º, 3º...), para
    definir a prioridade de produção.
24. Como administrador, quero mover um pedido para a frente ou para o fim da
    fila, para atender urgências ou despriorizar pedidos.

**Pagamento**

25. Como usuário, quero marcar um pedido como pago, para controlar o fluxo
    financeiro.
26. Como usuário, quero ver os pedidos com pagamento pendente, para cobrar.

**Dashboard**

27. Como administrador, quero um dashboard visual com estoque baixo, fila atual,
    produção em andamento e pagamentos pendentes, para ter uma visão geral do
    negócio de relance.

**Log de auditoria**

28. Como administrador, quero que toda ação importante (cadastros, mudança de
    status, prioridade, estoque e pagamento) seja registrada com autor e data,
    para ter histórico e rastreabilidade.
29. Como administrador, quero consultar o histórico de ações, para entender o que
    mudou, quando e por quem.

## Decisões de produto

**Natureza do produto**
- Produto fechado (single-tenant) para uma empresa. Sem multi-tenant, planos ou
  cobrança.
- Web, mobile-first, com atualização em tempo real entre usuários.

**Autenticação e usuários**
- Cadastro/login normais de pessoas via **Supabase Auth**. CRUD de usuários.
- **Usuários do sistema são só as pessoas da empresa** (~3, as sócias/donos). O
  cliente final, o vendedor e o modelador **não são usuários** — não acessam nem
  fazem login; são apenas **dados** de um pedido.
- **Sem distinção de papéis (sem RBAC).** Todos os usuários têm perfil de
  **administrador** e **acesso total** — qualquer um cadastra clientes,
  vendedores, modeladores, produtos e filamentos, muda status de produção,
  reordena a fila, marca pagamento, etc. A simplicidade é proposital.

**Log de auditoria**
- **Toda ação importante fica registrada** (quem fez, o quê e quando): criação/
  edição/remoção de cadastros, mudança de status de produção, mudança de
  prioridade na fila, movimentação de estoque e alteração de pagamento. Serve de
  histórico e rastreabilidade. (Substitui a ideia de um "histórico de estoque"
  isolado — vira um log único de ações do sistema.)

**Módulos (conceituais)**
- Cadastros: Clientes, Vendedores, Modeladores, Produtos, Filamentos, Locais de
  estoque.
- Operação: Orçamentos, Produção (status), Fila de demanda, Estoque, Pagamento.
- Visão: Dashboard.

**Campos dos cadastros de pessoas**
- **Cliente**: nome (obrigatório), empresa (opcional), celular (opcional),
  email (opcional).
- **Vendedor**: nome (obrigatório), celular (opcional), email (opcional).
- **Modelador**: nome (obrigatório), celular (opcional), email (opcional).

**Filamento**
- Campos: cor, material, marca, peso. **`cor` e `material` são obrigatórios**;
  `marca` e `peso` são opcionais.
- Estoque medido por **quantidade de rolos** por local.
- Dois números por filamento/local: **em estoque** e **encomendado/a chegar**.
- Locais de estoque são **cadastráveis** (começa com os locais reais e dá para
  criar mais).
- **Estoque baixo é configurável**: cada filamento tem um limite mínimo definido
  pelo usuário; abaixo dele, entra nos alertas do dashboard.

**Produto**
- **Catálogo reutilizável** de produtos recorrentes — o mesmo produto pode ser
  usado em pedidos de **clientes diferentes** (não pertence a um cliente).
- Também é possível descrever um produto novo direto no pedido.

**Orçamento / pedido**
- Vincula cliente, vendedor, modelador e produto, com a **quantidade** do produto
  pedido.
- Tem **valor** (R$) e **situação de pagamento** (pago / a pagar).
- Tem **status de produção**: em espera / produzindo / concluído.
- Tem **posição na fila**, reordenável.

**Dashboard**
- Apenas **visual** por enquanto (sem exportações/relatórios avançados). Mostra
  estoque baixo, fila atual, produção em andamento e pagamentos pendentes.

**Fora de escopo (agora)**
- **Portal / autoatendimento do cliente final** — o cliente não acessa o sistema,
  não se cadastra nem pede orçamento por ele. É registro interno da empresa.
- Cálculo automático do custo de filamento no orçamento (o cliente considerou
  irrelevante).
- Baixa automática de estoque ao imprimir (estoque é atualizado manualmente no
  MVP; integração estoque↔produção fica para a v2).
- Parcelamento/split de pagamento, emissão fiscal.
- App mobile nativo (a web mobile-first atende).
- Notificações por push/e-mail (alerta de estoque baixo só no dashboard).

## Métricas de sucesso

- As sócias param de perguntar "quanto tem aí?" — o estoque no sistema é a fonte
  de verdade e fica atualizado.
- Todo pedido em andamento existe no sistema com status e posição na fila claros.
- É possível, em um relance no celular, saber o que comprar, o que produzir e o
  que cobrar.
- O sistema substitui a planilha no uso diário.

## Questões em aberto

- [x] **Produto**: catálogo **reutilizável** de produtos recorrentes (além de
      poder descrever itens novos por pedido). Confirmado pelo cliente.
- [x] **Papéis/permissões**: sem RBAC (Role-Based Access Control). ~3 usuários, todos administradores com
      acesso total a todas as ações. Simplicidade proposital.
- [x] **Histórico**: log de auditoria único registrando toda ação importante
      (quem, o quê, quando). Entra no escopo.
- [x] **Filamento**: `cor` e `material` obrigatórios; `marca` e `peso` opcionais.
- [x] **Estoque baixo**: limite **configurável** por filamento (definido pelo
      usuário); abaixo dele, entra nos alertas do dashboard.
