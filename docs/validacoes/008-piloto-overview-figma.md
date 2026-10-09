# Piloto da inicial com referência Figma

08/10/2026. **Proposta implementada localmente, aguardando aceite humano da composição, gráfico principal e workflow.** Usuário autorizou adaptar a inicial e comparar My Balance/Analytics antes do refinamento geral. Amplia a exclusão anterior de gráficos somente para este piloto; não aprova outras funcionalidades do kit ou expansão às demais telas. Sem publicação, alterações no banco ou dependências novas.

## Referências e escolhas

[Balance Finance App UIKit — Light](https://www.figma.com/design/ZRrsaOE0anDeT1zZncBgUe/Balance?node-id=0-1). Contexto detalhado e renders consultados via conector: My balance `1:17` (saldo/ações/barras), Analytics `1:2353` (totais/anel de distribuição). Adaptação própria em React Native/StyleSheet, usando Jade, Manrope e EZ$ já aprovadas. Nenhum asset, retrato, fonte ou ícone do kit foi incorporado; autoria/licença de redistribuição desses assets não verificadas. Anel gerado pelos dados em SVG, exibido por expo-image existente.

Brief: pessoa que registra e consulta finanças individuais; domínio de lançamento, recibo, categoria, data civil, mês e saldo da consulta. Mundo cromático já aprovado: Jade claro de página, superfície quase branca, menta de controles, verde sólido, tinta Jade12 e Tomato de erros. Assinatura: saldo explicitamente associado ao período/filtro, entrada e saída legíveis e lançamento acessível para correção. Evitados saldo bancário sem origem, indicador fictício de saúde e navegação sem destinos reais.

## Entrega

- Marca/conta, seleção mensal, saldo dominante, receitas/despesas e ação Novo lançamento; categorias expansíveis; gráfico e lista FlatList existente. Categoria escolhida permanece visível com filtros recolhidos.
- Por semana (padrão provisório): pares de receitas/despesas na mesma escala, intervalos civis 1–7, 8–14, 15–21, 22–28 e restante do mês. Não são semanas de calendário/últimos sete dias. Escala é o maior total por tipo/intervalo. Valores exatos via rótulos acessíveis e disclosure operável por teclado. Nenhuma projeção futura.
- Por categoria: distribuição de despesas/receitas; categoria filtrada define o tipo. Legenda com categoria, valor e percentual; total explícito e quantidade de categorias no centro. Percentuais arredondados para uma casa podem não somar exatamente 100%; centavos/totais não arredondados.
- Ambos recebem somente `result.transactions` e `confirmedQuery`. Loading oculta gráficos/resultados; erro conserva o último resultado com contexto confirmado/aviso; vazio não produz gráfico fictício. Sem comparação com outro mês, orçamento ou saldo bancário inicial.
- `MonthlyOverview` separa a apresentação da ligação ao provider/Router em index; não cria store/cache. `VisualSystem`, `ExpenseCard`, Auth, repository, controller, formulários e proteção de alterações permanecem os existentes.

## Validação

Chrome headless renderizou os componentes reais em harness temporário com dados fictícios em memória/callbacks de navegação observados. Não usou Auth/SDK/rede financeira. Arquivos temporários removidos; páginas de diagnóstico excluídas da exportação. **Não equivale a nova prova integrada de login/CRUD/navegação entre rotas reais.**

320/390/1280 px: sem overflow horizontal na inicial; conferidos mês anterior, categoria Alimentação, semanal/categorias/receitas, vazio, loading, erro mantendo consulta anterior, saving/desabilitado e valores/descrições longos. Enter expandiu valores semanais; botão focado com `outline: auto`. Sem exceções de página. Saldo longo usa 24/32 abaixo de400px, em vez de36/48, evitando decimal isolado. Fonte local carregada na captura.

- Inicial: [390](assets/008-overview-semanas-390.png), [320](assets/008-overview-semanas-320.png), [1280](assets/008-overview-semanas-1280.png).
- Comparação gráfica: [semanas](assets/008-comparacao-semanas-390.png), [categorias](assets/008-comparacao-categorias-390.png).
- [Vazio](assets/008-overview-vazio-320.png), [loading](assets/008-overview-carregando-320.png), [erro](assets/008-overview-erro-320.png), [desabilitado](assets/008-overview-desabilitado-320.png), [valor longo](assets/008-overview-longo-320.png), [foco](assets/008-foco-320.png).

Capturas de elemento `008-grafico-*` podem incluir sobreposição da barra do harness; comparar preferencialmente `008-comparacao-*`. As capturas da inicial representam viewport/rolagem, não página inteira desenrolada.

**52/52 testes** aprovados, incluindo agregação semanal (limites, bissexto, mês externo, centavos) e categorias (tipo, filtro, vazio, proporção). TypeScript e exportação web de **11 rotas** aprovados. Revisão React/web aplicada a derivação sem efeitos/store, virtualização, importações, rótulos, seleção/expansão, foco, valores textuais e estados. Sem repetir SQL/Auth/finanças integrados: camadas não modificadas. `git diff --check` passou usando o executável Git do runtime; a primeira tentativa com outro executável encontrou limitação do ambiente. Servidores temporários encerrados e páginas de diagnóstico ausentes de public/dist.

## Pendências

Aceite da tela/gráfico e workflow integrado consulta → criação → edição/retorno em sessão real. Zoom real200%, teclado virtual/formulários nesta composição, Android/aparelho e leitor de tela não exercitados. Contraste não textual das bordas Jade permanece pendente da SPEC-007; não declarar WCAG integral/V1 concluída. Aceite anterior de zoom não transferido para este piloto. Refinamento geral e consolidação de padrões somente após validação humana.

## Animação de entrada e manutenção das duas visualizações

Continuação em08/10/2026: usuário aprovou expressamente **manter as duas representações** e autorizou animação de entrada para ambas. Substitui a pendência de escolher apenas um gráfico principal; avaliação do workflow integrado/zoom/expansão geral permanece.

Entrada de650ms, ease-out cúbica. Barras sobem da base por transform/scaleY, sem alterar layout. Anel se revela em sequência no sentido horário, do topo até completar os arcos proporcionais. Valores/legendas permanecem estáveis. Ao reabrir um modo ou trocar os dados, a entrada se repete; ao expandir detalhes, não. Interrupção/desmontagem encerra a execução/listeners; preference reduceMotion encerra movimento e mostra o resultado completo. Preferência consultada antes de iniciar, atualização tardia não sobrepõe evento mais recente.

Reutiliza Animated/AccessibilityInfo do React Native e expo-image existentes. SVG direto no DOM para web; expo-image com SVG progressivo no nativo, sem cache de cada quadro. Estado de progressão isolado do cálculo mensal/lista. Sem fonte/ícone novo, alteração financeira, publicação ou dependência nova.

Harness isolado com componentes reais e dados fictícios em memória: **320/390/1280**, crescimento das barras entre quadros, soma de arcos aumentando até2πr, trocas rápidas semana/categoria/receitas e preferência `prefers-reduced-motion: reduce` em sessão ativa. Todos passaram, zero exceções de página e sem overflow. Primeira tentativa do teste das barras buscava transformOrigin inline; a propriedade estava em classe CSS, e a busca foi corrigida para observar transform efetivo. Harness removido antes da exportação. Tipos e exportação web de11rotas aprovados; checks de52 testes da entrega anterior continuam pertinentes às regras financeiras inalteradas, sem nova campanha de lógica/SQL/Auth. Android/aparelho, zoom e workflow integrado não reexercitados.

Demonstrações derivadas de quadros reais capturados, com pausa e repetição somente nos GIFs: [barras](assets/009-barras-entrada.gif), [anel](assets/009-anel-entrada.gif). [Resultado com movimento reduzido](assets/009-motion-reduzido-390.png). A reprodução dos GIFs não obedece a preferência de movimento do SO; os componentes do aplicativo obedecem.
