# Interações do piloto da inicial

08/10/2026. Usuário autorizou as sugestões de interação e compactação para o piloto. Implementação local, sem publicação, alteração no banco, assets novos ou dependências. Manutenção das duas visualizações e animações já aprovada; aceite da composição e expansão geral continuam pendentes.

## Entrega

- Toque numa semana destaca o intervalo e mostra receitas/despesas exatas. Disclosure de todos os valores preservado; selecionar valores não reinicia a entrada animada.
- Toque no anel ou numa categoria da legenda aplica o filtro à consulta existente. Legenda oferece a alternativa acessível por teclado. Limpar filtro retorna ao mês completo. Modo escolhido permanece após a atualização dos dados.
- Ações do gráfico usam o mês confirmado dos dados exibidos, inclusive após falha ao solicitar outro mês. Seleção solicitada divergente possui limpeza própria, evitando confundir consulta solicitada e resultado confirmado.
- Cabeçalho, resumo e controles mensais compactados; conta, novo lançamento e cards de edição preservados. Ajustes locais em MonthlyOverview/OverviewChart; nenhum token global ou consumidor de VisualSystem alterado.
- Falha ao consultar preferência de movimento reduzido apresenta gráficos completos sem animação. Seleção nativa do anel usa raio/ângulo e ignora centro, exterior e arco ainda não revelado.

## Validação

Chrome headless com componentes reais e FinanceController real, repository fictício em memória, sem Auth/SDK/banco. Conferidos 320/390/1280 px sem overflow, Enter em semanas e legenda, valores exatos, filtro/lista, limpar, permanência do modo, clique no SVG, mês vazio e recuperação de consulta após falha. Zero exceções de página. Toque em card invocou callback de edição; isso **não comprova navegação real, formulário, persistência e retorno**.

Capturas com dados fictícios: [320 px](assets/010-piloto-inicial-320.png), [390 px](assets/010-piloto-inicial-390.png), [1280 px](assets/010-piloto-inicial-1280.png). Barra auxiliar do harness oculta nas capturas. Harness temporário removido antes da exportação.

53/53 testes aprovados, incluindo geometria da seleção nativa do anel e testes existentes financeiros/Auth/controllers/formulários. TypeScript e exportação web de 11 rotas aprovados. Animações já verificadas na entrega anterior; nesta revisão navegador usou movimento reduzido. Evidências anteriores: [piloto e animações](008-piloto-overview-figma.md).

Pendentes: aceite humano da composição, workflow completo em sessão real, zoom real 200%, teclado virtual/formulários, leitor de tela e Android/aparelho. Teste de geometria não substitui revisão no aparelho. Refinamento geral somente após validação do piloto.
