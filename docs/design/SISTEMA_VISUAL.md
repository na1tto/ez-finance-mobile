# Sistema visual

## 08/10/2026 — verdes nas legendas e despesas

Usuário solicitou distinção claro/escuro nas referências dos gráficos e despesa escura na lista. Legenda de receitas usa Jade11 (variante legível de texto do verde das barras Jade9), despesas Jade12 igual à barra escura. ExpenseCard aplica Jade12 também a tipo/categoria/data de despesas; descrição/valor já escuros. Receitas, valores e gráficos preservados. Motivo: associar a legenda às séries e melhorar leitura de despesas. Somente OverviewChart/ExpenseCard, reutilizados em MonthlyOverview/previews; sem tokens novos. [Evidências](../validacoes/018-cores-graficos-lancamentos.md): web320/390/1280, cores computadas/contraste e tipos. Alteração autorizada, revisão humana/aparelho/zoom pendentes.

## 08/10/2026 — entrada dos gráficos por visibilidade

Usuário solicitou animação durante rolagem. OverviewChart aguarda25% do desenho visível antes da entrada650ms; sair/reentrar repete. Movimento reduzido/previews continuam completos. MonthlyOverview fornece viewport/avisos de rolagem ao hook, sem renders a cada evento, dependências ou tokens novos. Motivo: usuário ver a animação ao chegar ao gráfico. [Evidências](../validacoes/017-graficos-ao-rolar.md): web320/390/1280, progresso/espera/reentrada/anel/redução, tipos/exportação. Implementação autorizada; limiar/sensação, Android/zoom pendentes.

## 08/10/2026 — correção responsiva dos valores semanais

Reportada quebra irregular de receitas/despesas na lista expandida. OverviewChart agora usa período acima e duas colunas iguais, rótulos separados dos valores, minWidth0 e separadores entre semanas. Motivo: alinhamento consistente independentemente do valor. Somente composição local da lista; MonthlyOverview/previews reutilizam o componente, sem tokens ou outros consumidores alterados. Correção autorizada; [evidências](../validacoes/016-valores-semanais-responsivos.md) em320/390/490/1280, zeros/valores longos, teclado e tipos. Zoom/aparelho pendentes.

## 08/10/2026 — navegação lateral contínua

Solicitação explícita de mostrar a próxima tela desde o arraste: MainNavigation usa páginas lado a lado com transform compartilhado, sem fade; conclusão240ms, retorno180ms, barra fixa e extremos sem espaço vazio. MainPageContent reutiliza os adapters das três páginas; sem tokens ou composição novos. Previews completos e inativos (inert/ocultação acessível), preferência compartilhada sem listener extra; formulários preservados. Substitui a sequência da entrega013. [Evidências](../validacoes/015-pager-continuo.md): web320/390/1280, contiguidade/opacidade, interrupção/cancelamento/resize/redução,53 testes/tipos/exportação. Implementação autorizada; sensação/aparelho/performance nativa e zoom pendentes.

## 08/10/2026 — Minha conta em nova iteração autorizada

Usuário autorizou refinar Minha conta e forneceu User Profile Community como exemplo. Identificação centralizada, lista de acesso com círculos e sessão separada adaptadas à Jade/Manrope/EZ$ e Phosphor existente: max720/p20, identidade r28, lista r24, ícones de acesso20/círculos40 e perfil40/círculo80. Motivo: leitura e acesso coerentes com o piloto. AccountSettings e adapter auth/account; tokens globais/AuthPanel/outros consumidores preservados. Google/senha/saída/cancelamento conservados; sem novas funções de perfil/ajuda/configurações. Implementação autorizada, composição aguardando aceite. [Evidências](../validacoes/014-refinamento-minha-conta.md): web320/390/1280, email longo, foco/Enter e estados; tipos/exportação. Zoom/aparelho/novo fluxo Auth integrado pendentes. Supera somente a exclusão histórica de refinamento desta tela no escopo fechado.

## 08/10/2026 — movimento lateral das páginas principais

Adendo solicitado pelo usuário após revisão na8081: conteúdo acompanha gesto, retorno curto/cancelado180ms e troca lateral com saída/fade160ms + entrada/fade240ms; barra fixa e extremos sem circular. Links/teclado interrompem movimento e navegam diretamente. Dois dedos cancelam; preferência reduzida desativa deslocamento e fade, inclusive durante gesto. MainNavigation/MainTransitionProvider e preferência compartilhada atendem Início/Lançamentos/Minha conta; OverviewChart reutiliza a preferência, com animações conferidas. Sem tokens/ícones/dependências novos ou refinamento de conta/formulários. [Evidências](../validacoes/013-transicao-lateral-piloto.md):320/390/1280, cancelamento/interrupção/direções/redução/resize,53 testes,tipos e12rotas. Native driver/aparelho e aceite da sensação permanecem pendentes. Amplia escopo fechado somente para esta animação autorizada.

## 08/10/2026 — integração do recorte fechado

Workflow básico do piloto conferido em sessão real local, incluindo filtro→lista→edição/criação→descarte/salvar/excluir→retorno e Minha conta autenticada. “Cancelar e voltar à lista” corrigido para Lançamentos, coerente com separação aprovada; askLeave preservado. Único consumidor afetado é TransactionForm (criação/edição); sem composição/token/ícone novo. Lista real em320/390/1280,53 testes,tipos e exportação aprovados. [Evidências e limites](../validacoes/012-workflow-real-piloto.md). Não amplia escopo fechado nem refina Minha conta; zoom/aparelho/aceite visual seguem pendentes.

## 08/10/2026 — fechamento do escopo do piloto

Usuário encerrou o escopo após confirmar que Minha conta recebeu somente barra/gesto, sem refinamento visual próprio. Recorte implementado: Início e Lançamentos, duas representações animadas/interativas e navegação Phosphor entre as três páginas principais. Minha conta mantém apresentação anterior; seu refinamento e expansão geral ficam para outra iteração. Registro de escopo, sem alterar tokens/componentes nesta etapa e sem declarar aceite visual integral ou validações pendentes concluídas. [Fechamento/evidências](../validacoes/011-navegacao-principal.md#fechamento-do-escopo).

## 08/10/2026 — navegação principal do piloto

**Implementação aprovada:** barra inferior e gesto lateral entre Início, Lançamentos e Minha conta; lista separada do resumo. Phosphor oficial regular com rótulos, 24px, área mínima60px e seleção em superfície Jade/texto forte. Motivo: acesso constante aos destinos e validação da organização antes de expansão. MainNavigation atende as três páginas; MonthlyOverview reutiliza filtros/controller em duas composições; AuthPanel permanece compartilhado sem mudança. Formulários não recebem barra/gesto; recuperação “Voltar à lista” aponta novo destino. Safe area e barra em fluxo, sem cobrir conteúdo; sem tokens globais/dependências novas. [Capturas/checks/limites](../validacoes/011-navegacao-principal.md). Composição aguardando aceite; gesto nativo/aparelho, zoom e workflow real ainda pendentes.

## 08/10/2026 — interações e compactação do piloto

**Implementação autorizada pelo usuário:** semanas selecionáveis com valores exatos; anel/legenda aplicam filtro de categoria com limpeza próxima ao gráfico; visualização escolhida permanece durante atualização; cabeçalho/resumo/controles mensais compactados para aproximar o gráfico do início. Motivo: validar leitura → seleção → lançamento no piloto. Alterações locais em MonthlyOverview/OverviewChart, sem mudar tokens compartilhados ou outros consumidores. Duas visualizações e animações preservadas; aceite visual e expansão geral ainda pendentes. Conferidos teclado, erros/vazio e larguras 320/390/1280, 53 testes, tipos e exportação. [Evidências e limites](../validacoes/010-interacoes-piloto-inicial.md); fluxo real de edição/retorno, zoom e aparelho ainda pendentes.

## 08/10/2026 — duas visualizações mantidas e entrada animada

**Aprovado pelo usuário:** manter Por semana e Por categoria na inicial; adicionar barras entrando de baixo para cima e anel preenchendo de um ponto até completar. Implementado em `OverviewChart`: entrada de 650 ms com desaceleração, barras com scaleY ancorado na base e anel com revelação sequencial no sentido horário a partir de12h. Entrada se repete ao abrir/trocar a visualização e quando seus dados mudam; expansão de detalhes não reinicia a animação. Totais/rótulos/legendas não são animados. Movimento reduzido apresenta o gráfico completo, inclusive quando a preferência muda durante a sessão; animações/listeners são encerrados na saída/interrupção.

Sem dependências/tokens ou outros consumidores alterados. Web: SVG nativo ao DOM para animar arcos sem recarregar imagens por quadro; Android: SVG dinâmico via expo-image existente, sem cache de quadros/transition. NativeDriver nas barras; anel com progressão isolada em componente próprio, sem recalcular a consulta financeira por quadro. Chrome em320/390/1280 confirmou progressão/finalização, troca rápida e movimento reduzido. Android/aparelho ainda não validado; demais limites do piloto permanecem. [Demonstrações e checks](../validacoes/008-piloto-overview-figma.md#animação-de-entrada-e-manutenção-das-duas-visualizações).

## 08/10/2026 — piloto da inicial inspirado no Figma, em validação

Usuário autorizou adaptar My Balance/Analytics (Light/Balance) e comparar gráficos na inicial. **Proposta local, sem aceite da composição/gráfico principal ou expansão geral.** Saldo do período dominante, Novo lançamento no resumo, filtro expansível e gráfico semanal/categorias usando o resultado confirmado. Motivo: validar utilidade do gráfico e workflow antes de refinar outras telas.

Jade/Manrope/EZ$ preservadas. Composição local em `MonthlyOverview`/`OverviewChart`: max960/p20; resumo r28/p24; seção gráfica r24/p20; saldo36/48 (24/32 para valor longo abaixo de400px); seleção gráfica Jade12/Jade1. Barras Jade9/Jade12 e anel com gradações Jade, acompanhados de valores/texto. Nenhum token compartilhado alterado, portanto demais consumidores conservam a direção vigente. ExpenseCard/FlatList reutilizados; sem novos assets/dependências ou alterações de formulário/Auth/diálogos.

[Evidências/checks/limites](../validacoes/008-piloto-overview-figma.md). 320/390/1280, teclado e estados conferidos em harness isolado; zoom real, teclado virtual, leitor de tela, Android e novo workflow integrado pendentes. Refinamento geral depende do aceite humano; autorização deste piloto não se estende às demais telas.

Registro canônico iniciado em **08/10/2026**. Composição Jade do piloto aprovada explicitamente, direção consolidada e aplicada na fase B. Manrope 400/600/700 em todas as telas existentes. Registro atual ao final; inventário e propostas iniciais abaixo são históricos. SPEC-007 parcial pelo limite não textual de R03, sem declarar WCAG integral ou V1 concluída.

## Inventário de implementação

| Aspecto | Existe no código lido | Pendência |
| --- | --- | --- |
| Estilos | `StyleSheet` local; alguns objetos no layout. | Consolidar valores repetidos após validar piloto; não adicionar Tailwind/CSS paralelo. |
| Tipografia | Fonte do sistema, sem `fontFamily` explícita; autenticação 26/bold, cadastro 24/bold, valor total 28/bold; cards 16 e metadados 14. | Família, pesos, entrelinha e escala coerente. `expo-font` instalado não é fonte carregada. |
| Cores | Auth: fundo `#f4f6f8`, superfície `#fff`, título `#193149`, texto de input `#172b40`, link `#15549b`, borda `#8293a4`. Finanças: `#eeeeee`, `#cccccc`, `#dddddd`, com vários textos herdados. | Papéis semânticos, contraste medido e coerência entre áreas. Essas cores são inventário, não paleta aprovada. |
| Espaçamento/densidade | Padding de página 24, card 16 ou 24; gaps 8/16/18; categorias padding 10; total padding 20. | Ritmo, densidade financeira e área de toque. |
| Formas/bordas | Raios 6 nos inputs Auth, 8 no cadastro, 12 em cards; bordas 1 e seleção 2. | Escala por função; estados sem alterar layout. |
| Sombras | Não há estratégia compartilhada nas telas inspecionadas. | Escolher profundidade com parcimônia; screenshot não define valores de execução. |
| Layout | Auth centralizado com card de largura máxima 440; cadastro rolável; lista virtualizada `FlatList`. | Larguras, texto longo, zoom, safe areas e teclado verificados em tela. |
| Componentes | `AuthPanel`, `AuthField`, `authStyles`, `ExpenseCard`, e agora `TransactionForm`/`FinancialConfirmation`; `Button` nativo e `Pressable`. | Evoluir os existentes antes de novos wrappers; reinspecionar trabalho da SPEC-005 antes de integrar estilos. |
| Estados | Mensagens de sessão/rede, carregamento textual, vazio e bloqueios operacionais existem. | Apresentação consistente de foco, hover, pressionado, erro de campo, carregamento e desabilitado. |

## Brief para a direção proposta

### Logo aprovada

**Decisão do usuário em 08/10/2026:** a logo da Ez Finance é exclusivamente o texto **`EZ$`**, em verde **`#44BA5D`**. Preservar as letras maiúsculas e o símbolo `$`; não acrescentar símbolo gráfico, ilustração ou ícone Phosphor à logo.

Manrope é a família tipográfica aprovada para o aplicativo. Proposta para a apresentação da logo: usar essa mesma família; peso, tamanho, espaçamento entre caracteres e posição serão validados no piloto. Esses detalhes ainda não foram aprovados.

Implementar como texto, sem necessidade de arquivo de imagem. Quando houver reutilização real, centralizar sua apresentação em componente compartilhado, seguindo a estratégia existente. Verificar leitura sobre os fundos escolhidos e nome acessível “Ez Finance” quando necessário, especialmente se a marca funcionar como link.

O verde informado define **a cor da logo**. Não constitui aprovação automática de cor dos botões, indicadores de receita/sucesso ou da paleta completa. Ícone de instalação, favicon e splash permanecem nos assets atuais até uma alteração específica; a logo textual não define sozinha esses formatos.

**Público aprovado:** pessoas usando conta individual, teste web primeiro e Android posteriormente. **Tarefas:** entrar com segurança, registrar gasto/recebimento, corrigir lançamento e entender a consulta financeira. **Sensação proposta:** acolhedora como um caderno de contas, com confirmação inequívoca do que foi salvo e números fáceis de comparar. Não é uma decisão estética aprovada.

Exploração antes de escolher valores:

- **Domínio:** recibo, lançamento, calendário, categoria, entrada, saída, conciliação, saldo da consulta.
- **Cores do mundo proposto:** papel creme, tinta grafite, cinza de recibo, verde de confirmação, coral de marcação, violeta de separador. São associações para explorar, não uma paleta para usar simultaneamente.
- **Assinatura proposta:** lançamento apresentado como uma anotação clara de recibo: valor alinhado, tipo escrito, categoria/data secundárias e situação de gravação explícita. No piloto de entrada, a linguagem de papel/tinta prepara esse mesmo ambiente sem inventar números ou promessas financeiras.
- **Padrões a evitar:** grande grade de métricas sem contexto → priorizar tarefa e período realmente consultado; cor vermelha como única pista de despesa → escrever tipo e valor; onboarding promocional obrigatório → entrada direta com métodos já aprovados.

**Limite aprovado em 08/10/2026:** Mobbin serve apenas como inspiração estética (figuras, ícones, fontes, cores etc.), pois o fluxo não corresponde à proposta do produto. Não tomar o onboarding do Buddy como base da navegação ou arquitetura de telas. Phosphor é a família de ícones aprovada; peso/variante e integração ainda serão avaliados.

**Direção recomendada, pendente:** identidade própria, leitura financeira clara e superfícies acolhedoras, com decoração moderada nas tarefas frequentes. Não há obrigação de manter roxo, formas ou fonte do Buddy. Apresentar alternativas visualmente antes da escolha.

**Referência complementar M01:** incluída a pedido do usuário para login/cadastro e overview. [Análise e arquivo no catálogo](REFERENCIAS.md). A composição clara com menta, texto escuro e cards arredondados é viável em Expo/RN Web e Android por layout e estilos comuns, sem exigir efeitos nativos de vidro. Recomendação ainda não aprovada: experimentar essa família de superfícies e uma ação escura no piloto; aplicar Manrope e Phosphor independentemente da fonte/ícones originais. Cores exatas, raios, efeitos e barra inferior permanecem em aberto.

## Propostas para a tela piloto

Estes valores são pontos de partida para comparar em tela, não requisitos ou tokens aprovados.

| Tema | Proposta inicial | O que validar |
| --- | --- | --- |
| Fonte | Manrope aprovada; começar a avaliação por pesos estáticos, com fallback durante carregamento. | Acentos pt-BR, pesos, legibilidade de números e equivalência web/Android. Não identificar a fonte das referências por suposição. |
| Escala | Corpo 16, apoio 14, título 28–32; pesos 400/500/600–700 e entrelinha confortável. | Título não competir com formulário; nada essencial pequeno para caber; número tabular quando suportado. |
| Cor | Fundo claro suave, superfície clara, texto escuro; uma cor de ação escolhida entre alternativas. | Contraste e distinção ação/seleção/erro; não reutilizar cor de receita como confirmação de commit. |
| Espaçamento | Base 4; passos 4/8/12/16/24/32; manter página próxima dos 24 atuais. | Mais proximidade dentro do campo, mais separação entre grupos; estreito não pode virar tela apertada. |
| Densidade | Login confortável; formulário e lista mais compactos que o onboarding. | Rolagem, teclado e operação repetida; não copiar grandes ilustrações para cadastro financeiro. |
| Formas | Explorar raio 8 em campos e 12–16 em superfícies; pill apenas se a direção justificar CTA. | Coerência, leitura de estados e ausência de variação arbitrária. |
| Bordas/sombras | Borda discreta para campo; sombra suave somente quando indicar camada. | Foco destacado, limite de input visível, contraste dos controles; não copiar sombra forte de CTA automaticamente. |
| Hierarquia | Google principal, email/senha secundário e recuperação/criação como navegação. | Requisito de acesso preservado; alternativa secundária continua descoberta e operável. |
| Movimento | Dispensar movimento decorativo no piloto; feedback imediato de ação. | Se houver animação depois, curta, interruptível e com alternativa para movimento reduzido. |

Tema escuro e modo de troca permanecem **em aberto**. A configuração automática do Expo exige avaliar renderização em sistema escuro; não prometer tema completo ou alterar configuração de plataforma silenciosamente.

## Estratégia de componentes — recomendação pendente

**Recomendação para este projeto:** uma camada pequena de componentes próprios, construída sobre controles e comportamento de plataforma existentes, com bibliotecas pontuais para interações complexas. O agente implementa a apresentação e composição; não reinventa input, navegação, gestão de sessão, foco/modal ou seleção complexa do zero. Essa recomendação não autoriza instalar uma nova biblioteca nem substituir os controles em andamento.

Justificativa: V1 tem poucas famílias de controles, já existem formulário/diálogo compartilhados e a direção M01 pede aparência própria. Adotar agora um kit completo teria custo de integração e de adequação estética, sem necessidade demonstrada. Componentes próprios também têm custo: manter todos os estados, semântica, foco, teclado, testes e equivalência entre plataformas; não basta estilizar `Pressable`.

| Opção | Benefício | Consequência para este projeto | Recomendação |
| --- | --- | --- | --- |
| React Native + componentes atuais + tokens | Mantém convenções, permite identidade própria e evita migração ampla. | O projeto deve validar acessibilidade e comportamento web/native; estados comuns passam a ser responsabilidade dos componentes compartilhados. | Base recomendada para o piloto. |
| `@expo/ui` existente | API universal documentada para Android/iOS/web; versão local 57.0.18 expõe entrada universal. | Seu visual segue ferramentas nativas por plataforma; integração usa Host e precisa testar fonte, Phosphor, foco e personalização. Instalado não significa já validado no app. | Avaliar primeiro quando faltar um controle adequado, especialmente picker/sheet; não migrar tudo automaticamente. |
| React Native Paper | Kit de componentes com base Material Design e suporte documentado à web. | Requer provider/tema, integrar ícones e ajustar visual Material para Manrope/Phosphor/M01. Compatibilidade exata com React 19/RN 0.86/Expo 57 não foi testada nesta análise. | Alternativa se priorizar amplitude de controles prontos e aceitar adaptação Material. |
| Tamagui | Componentes e sistema de estilos para React Native/web. | Introduz sua própria configuração de tokens/tema e possivelmente ferramentas de build; se adotado, deve substituir a fonte de estilos correspondente, não coexistir como sistema paralelo. Versão exata ainda não avaliada. | Considerar se a aplicação exigir kit universal mais amplo; custo inicial maior para este recorte. |

Fontes consultadas em 08/10/2026: [Expo UI Universal](https://docs.expo.dev/versions/latest/sdk/ui/universal/), [Paper — projeto oficial](https://github.com/callstack/react-native-paper/blob/main/README.md), [Paper na web](https://oss.callstack.com/react-native-paper/docs/guides/react-native-web), [Tamagui — introdução](https://tamagui.dev/docs/intro/introduction) e [instalação](https://tamagui.dev/docs/intro/installation). São capacidades documentadas; nenhuma prova de integração dessas bibliotecas foi executada neste workspace. Kits apenas DOM não devem se tornar a camada compartilhada de um app Android sem estratégia de plataforma avaliada.

### Responsabilidade do agente no piloto

- Reinspecionar `AuthPanel`/`AuthField`, `TransactionForm`, `FinancialConfirmation` e `ExpenseCard`; evoluir os existentes e preservar comportamento funcional. Não criar segunda versão do mesmo formulário.
- Compartilhar botão, campo e superfície quando houver reutilização real; centralizar estados e tokens após aprovação do piloto. Componente de domínio e controle visual devem ter responsabilidades claras, sem mover regras monetárias/identidade para o tema.
- Usar controles nativos/implementação estabelecida quando suficientes; para menu, picker, sheet ou diálogo que exija foco/teclado complexos, avaliar biblioteca antes de escrever comportamento novo. Avaliar o diálogo existente, não presumir que API nativa garante toda acessibilidade web.
- Manter imports restritos ao necessário, evitar catálogo inteiro de ícones, preservar virtualização e manter digitação barata; não adicionar arquitetura de estado/estilos só para reproduzir o screenshot.
- Antes de escolher biblioteca pontual: comparar dois controles reais, testar web por teclado/foco e Android posteriormente, medir personalização e registrar dependências/licença/versão. Se a solução exigir troca significativa do sistema de estilos, levar a decisão ao usuário.

**Resultado esperado:** componentes reutilizáveis com a identidade do Ez Finance, sobre uma base funcional existente. “Próprios” significa propriedade da apresentação, não reimplementação indiscriminada de infraestrutura de interface.

## Critérios técnicos para revisão

### Tipografia aprovada e alternativas avaliadas

**Manrope aprovada pelo usuário em 08/10/2026**, como família tipográfica do aplicativo. Usar a distribuição Google Fonts indicada abaixo. Aprovação da família não fixa pesos, tamanhos, entrelinhas ou tokens; essas medidas serão validadas no piloto. Nenhuma fonte foi instalada nesta etapa documental.

Comparação recomendada em 08/10/2026:

| Família | Avaliação de direção para o produto | Consequência |
| --- | --- | --- |
| [Manrope — Google Fonts](https://fonts.google.com/specimen/Manrope) | Família escolhida; aparência geométrica com personalidade moderada. | Aplicar como família do aplicativo; validar números pequenos, pesos e densidade real no piloto. |
| [Nunito Sans](https://github.com/googlefonts/NunitoSans) | Alternativa para sensação mais amigável e suave. | Pode tornar o produto mais informal; comparar com os ícones e evitar excesso de arredondamento. |
| [Source Sans 3](https://github.com/adobe-fonts/source-sans) | Alternativa mais discreta, concebida para interfaces. | Privilegia leitura e densidade; identidade menos expressiva pode ser construída por cor, ritmo e iconografia. |

As avaliações visuais são recomendações de design; não foram medidas em uma tela renderizada. As distribuições consultadas têm SIL Open Font License 1.1: [Manrope no Google Fonts](https://github.com/google/fonts/blob/main/ofl/manrope/OFL.txt), [Nunito Sans no Google Fonts](https://github.com/google/fonts/blob/main/ofl/nunitosans/OFL.txt) e [Source Sans da Adobe](https://github.com/adobe-fonts/source-sans/blob/release/LICENSE.md). Para Manrope, fixar a origem Google Fonts indicada nesta proposta, sem presumir que arquivos de outras distribuições/versões tenham a mesma licença.

Proposta para o piloto: **uma família apenas**, pesos 400 para corpo, 500/600 para rótulos/ações e 700 para títulos/valores destacados. Não usar peso leve para informação financeira pequena. Testar `R$ 1.250,50`, `R$ 999.999,99`, saldo negativo, datas, acentos e descrições longas; verificar suporte e renderização de números tabulares antes de adotá-los.

A integração posterior aproveita `expo-font` existente e arquivos locais aprovados; não depende de baixar fonte em cada uso. Preferir pesos estáticos inicialmente para previsibilidade entre plataformas e validar fallback/carregamento. Fonte: [documentação de fontes do Expo](https://docs.expo.dev/develop/user-interface/fonts/). Nenhuma fonte foi instalada; a família foi aprovada e sua aplicação será validada no piloto.

São critérios de validação do trabalho de interface, não aprovação da identidade. Adaptar HTML/ARIA/CSS à saída real do React Native Web; não presumir que props nativas resolvem todos os requisitos web.

### Responsividade e conteúdo

- Usar layout por flex e restrições de largura existentes, evitando medir DOM/estado JS só para posicionar conteúdo.
- Validar 320/390 CSS px e 768/1280 CSS px como amostras, não breakpoints aprovados; incluir zoom de 200%, título/descrição longos e maior valor permitido.
- Permitir rolagem e quebra de texto sem ocultar valor, mensagens ou ação; teclado/safe area não podem cobrir campo focado. Não travar escala de fonte para preservar desenho.
- Não converter a web automaticamente em dashboard com sidebar; adaptar largura à tarefa. Android requer verificação própria posterior, inclusive teclado e áreas seguras.

### Acessibilidade, teclado e formulários

- Ações têm semântica de botão e navegação usa `Link`; nome acessível para ação com ícone. Verificar Enter/Espaço conforme controle, Tab/Shift+Tab, ordem de foco e ausência de armadilhas.
- Foco visível em todos os interativos, sem contorno removido sem substituto e sem elemento encoberto por cabeçalho/CTA fixo. Modal deve gerenciar foco inicial, contenção e retorno; Escape/cancelamento respeitam operações pendentes.
- Campos com rótulo visível e nome acessível, associação ao input na web, autocomplete apropriado e erro relacionado ao campo. Validar submissão por teclado, foco no erro e anúncio de mensagens assíncronas; não bloquear colar/senhas gerenciadas.
- Dinheiro continua texto compatível com vírgula/ponto e validado pelo domínio; não mudar para parsing `float` ou `type=number` que descarte a entrada aprovada. Data continua civil, sem deslocamento por timezone na apresentação.
- Contraste de texto: verificar 4,5:1 normalmente e 3:1 para texto grande conforme definição do critério, não por impressão visual. Fonte: [W3C — contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
- Para alvos web, verificar mínimo 24×24 CSS px ou exceções/espaçamento previstos na [W3C — tamanho mínimo de alvo](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). **Proposta de conforto para mobile:** próximo de 44–48 unidades lógicas; não confundir desenho pequeno do ícone com área clicável.
- Seleção, erro, receita e despesa precisam de texto/semântica além de cor. Respeitar preferências de movimento reduzido. Não afirmar conformidade WCAG integral sem avaliação correspondente.

### Estados de interação

| Estado | Contrato a validar |
| --- | --- |
| Padrão | Ação/alternativa e conteúdo legíveis; sem decoração que concorra com a tarefa. |
| Hover/pressionado/foco | Feedback coerente e contraste suficiente; foco funciona sem mouse, hover não é condição para descobrir ação. |
| Selecionado | Sinal persistente e semântico; texto/ícone complementar, não só mudança de cor. |
| Desabilitado | Bloqueio real e nome/estado acessível; explicar motivo quando necessário; não habilitar envio para melhorar aparência. |
| Carregamento | Texto específico e estado ocupado; manter geometria razoavelmente estável, evitar clique repetido e anúncio excessivo. |
| Vazio | Informar ausência confirmada, com ação útil. No login esse estado não se aplica à coleção; validar na lista quando ela for refinada. |
| Erro | Mensagem junto à tarefa, correção/retry disponível; preservar campos e dados conforme regras existentes. |
| Resultado incerto | Não representar como sucesso, vazio ou duplicar operação. Preservar mecanismo de reconciliação; traduzir mensagem técnica sem ocultar consequência. |
| Confirmação/descarte | Ação destrutiva identificada, cancelamento visível; nenhum descarte ou logout involuntário por efeito visual. |

## Sequência de consolidação

1. **Agora, concluído:** inventariar estrutura e catalogar referências; registrar lacunas/hipóteses. Nenhuma expansão visual.
2. **Piloto proposto:** `/auth/sign-in`, reaproveitando `AuthPanel` e `AuthField`. Reinspecionar código, declarar intenção/hierarquia/paleta/profundidade/tipografia/espaçamento; mostrar direção e tela real em larguras distintas. Não mudar regras de login, confirmação, vínculo ou callbacks.
3. **Validação do usuário:** registrar o que foi aprovado e o que precisa mudar; silêncio não aprova. Critérios técnicos podem exigir ajustes mesmo quando aparência for aprovada.
4. **Depois da validação:** extrair tokens realmente usados para um único módulo na estrutura `src/` vigente (sugestão de caminho, se continuar inexistente: `src/theme/tokens.ts`). Manter `StyleSheet` consumidor e migrar valores repetidos; nomes semânticos como texto principal, superfície, ação, borda e foco. Não criar módulo vazio nesta etapa.
5. Evoluir componentes existentes. Se botão/campo compartilhado novo for necessário, implementá-lo uma vez em `src/components/`, preservando semântica e comportamento por plataforma. Avaliar todos os consumidores de `AuthPanel`/`AuthField`: entrar, criar conta, receber link, callback, conta e recuperar senha.
6. Expandir para telas financeiras usando a versão funcional entregue das specs 005/006. Não antecipar controles mensais só para reproduzir uma referência. Preservar virtualização, isolamento e precisão monetária.
7. Registrar evidências da entrega visual em `docs/validacoes/` (criar arquivo/prints somente quando executar). Registrar tamanho de viewport, estado, navegação por teclado, foco, contraste, data e limites; nenhuma senha/token/dado humano nas capturas.

Validação proporcional no piloto: tipos e exportação web; regressão Auth quando mudar controles/eventos/navegação. Testes financeiros quando afetar formulário/lista, além de navegador real. No compartilhamento de estilos, verificar telas afetadas; não repetir banco/fixtures sem comportamento relevante.

## Decisões visuais e histórico

| ID | Decisão | Estado | Próxima ação |
| --- | --- | --- | --- |
| V01 | Catálogo e regras em `docs/design/`; capturas nos caminhos existentes. | Organização executada nesta solicitação. | Manter uma fonte documental de regras. |
| V02 | Mobbin apenas como inspiração estética; seu fluxo não corresponde ao produto. | Aprovado pelo usuário em 08/10/2026. | Propor identidade própria sem copiar fluxo, navegação ou funcionalidades. |
| V03 | Piloto de entrada Jade. | Composição aprovada explicitamente pelo usuário em 08/10/2026, antes da fase B. | Cadastro/overview e coesão aplicados; R03 parcial. |
| V04 | Phosphor regular. | Família e composição do piloto aprovadas. | Envelope/lock core 2.1.1, 20 px/Jade 11 via expo-image, reutilizados em AuthField. |
| V05 | Jade clara/sRGB e hierarquia Radix. | Paleta/hierarquia e composição do piloto aprovadas. | Tokens consolidados; contraste não textual 7–8 é limite R03. Tema escuro/efeitos adicionais não aprovados. |
| V06 | Manrope Google Fonts 400/600/700. | Família e apresentação do piloto aprovadas; usuário reforçou uso nas demais telas. | Carregamento global único e faces reais, incluindo cabeçalhos/inputs. |
| V07 | Incluir M01 como inspiração para login/cadastro e overview. | Solicitado pelo usuário em 08/10/2026. | Propor adaptação ao conteúdo aprovado; paleta/layout finais ainda não aprovados. |
| V08 | Componentes próprios sobre RN, com bibliotecas pontuais para controles complexos. | Recomendação, sem aprovação de adoção/migração. | Avaliar no piloto; não instalar kit amplo nesta etapa. |
| V09 | Logo exclusivamente textual `EZ$`, verde `#44BA5D`. | Aprovado pelo usuário em 08/10/2026. | Aplicada no piloto; medidas/peso e uso do verde fora da logo em validação. |

**08/10/2026 — organização inicial:** catálogo B00–B09 e leitura das referências; inventário e revisão estática; caminhos de ícones; instruções no AGENTS. Nenhum componente de execução alterado, nenhuma família/fonte instalada e nenhuma tela renderizada validada nesta etapa.

**08/10/2026 — refinamento pelo usuário:** registradas V02 (inspiração estética apenas) e V04 (Phosphor). Documentadas candidatas Manrope, Nunito Sans e Source Sans 3 como sugestões; Manrope recomendada, ainda sem aprovação. Nenhuma alteração de código ou instalação.

**08/10/2026 — escolha tipográfica:** usuário confirmou Manrope; registrada V06 e atualizado o índice de design. Pesos, tamanhos e aplicação permanecem para validação no piloto. Apenas documentação alterada.

**08/10/2026 — referência e estratégia de componentes:** M01 organizada sem modificar imagem, análise de adaptação para entrada/cadastro/overview e comparação das bases RN, Expo UI, Paper e Tamagui. Inspecionados componentes atuais e exports do Expo UI instalado; nenhum pacote instalado, nenhuma tela modificada ou integração renderizada validada.

**08/10/2026 — logo:** registrada V09, texto `EZ$` e cor `#44BA5D` aprovados pelo usuário. Sem criação de asset ou alteração de código; tipografia específica da marca e demais usos da cor permanecem para validação.

Para cada mudança futura, acrescentar: data; motivo; observado/proposto/aprovado; confirmação do usuário quando aplicável; valores/variantes; arquivos e consumidores afetados; evidências e limitações. Evitar reproduzir decisões funcionais já mantidas no contexto/specs.


**08/10/2026 — usabilidade funcional da SPEC-005:** formulário financeiro compartilhado e confirmação sobre RN/StyleSheet, reutilizando cores/controles existentes; sem incorporar fontes/ícones nem consolidar tema/tokens nesta entrega. É implementação do comportamento autorizado, sem transformar referências ou direção estética em novos requisitos. Consumidores: `TransactionForm` em new/[id], `FinancialConfirmation`, `ExpenseCard`/lista e provider financeiro. Títulos 24/22, corpo 16, ações de confirmação com mínimo 44, formulário maxWidth 720, diálogo maxWidth 480/maxHeight 90%; mensagem longa rolável. O link do card inclui tipo/valor/categoria/data no nome acessível. Removida animação de fechamento do diálogo para não mostrar título transitório.

Navegador real em 320×720/1280×720, conteúdo longo/valor máximo, foco/Tab/Enter/Escape, estados loading/erro/desabilitado/vazio e Firefox externo com zoom 200% exercitados. [Matriz F01–F14 e limites](../validacoes/005-formularios-e-protecao-de-alteracoes.md), [captura 320 px](../validacoes/assets/005-dialogo-320.png). Isso não é aprovação estética do piloto nem auditoria completa de leitor de tela/contraste/WCAG; Android e refinamento visual seguem suas etapas. As decisões visuais registradas anteriormente continuam preservadas.

**08/10/2026 — controles funcionais SPEC-006:** index reutiliza RN/StyleSheet, FlatList, ExpenseCard, Link e Button existentes. Apenas layout necessário autorizado: mês/ano, ações anterior/próximo/atual, dez categorias/todas, rótulos receita/despesa e seleção textual/semântica, contexto solicitado/confirmado e indicadores antes da lista. MaxWidth 960, padding 24, ações/categorias flexWrap/gap 8, categoria minHeight 44/padding 12, cores já usadas #15549b/#dcecff/#eeeeee. Consumidor alterado: Home; cards/formulários mantidos. Não consolida tokens, fonte/ícone ou direção estética do piloto. Browser 320×720/1280×720, teclado/foco visível, conteúdo longo, loading/vazio/erro/desabilitado e CRUD/descarte conferidos; zoom real 200% confirmado manualmente pelo usuário após a correção de reabertura: filtros/totais/lista/rolagem legíveis, sem cortes ou sobreposição. Prova por relato explícito nesta conversa, sem captura/versão/dimensões registradas; não implica aprovação estética do piloto. [Matriz Q01–Q06 e limites](../validacoes/006-consulta-mensal-e-filtros.md).

## 08/10/2026 — SPEC-007, piloto implementado, aprovação pendente

**Autorizado:** fase A somente no login, preservando convenções/componentes. **Aprovado previamente:** família Manrope, Phosphor, logo textual `EZ$` verde `#44BA5D`, M01 como inspiração. **Proposto e aguardando validação:** todas as medidas/pesos/composição e cores de interface abaixo. Fase B não iniciada; nenhum módulo de tokens definitivos foi criado.

Intenção: entrada calma para uma pessoa consultar/registrar seu dinheiro. Domínio: mês, receita, despesa, lançamento, saldo e confirmação. Mundo de cor: papel branco, tinta escura, cinza de divisórias, verde da marca, menta de apoio. Assinatura: `EZ$` tipográfica sobre uma superfície simples, sem métricas fictícias. Entre os padrões óbvios avaliados, foram escolhidos composição única em vez de painel promocional, ícones discretos em vez de ilustração e acento na marca em vez de todas as ações verdes. Hierarquia: marca → título → Google escuro → alternativa email/senha → links. Profundidade por superfícies/borda, sem sombra/gradiente/animação. Base de espaço 4, card 24, página 16, gap 16, sem margem negativa.

| Papel experimental | Valor e motivo |
| --- | --- |
| Página / superfície / campo | `#EDF3EF` / `#FFFFFF` / `#F5F7F5`: aproximação sóbria do claro/menta de M01. |
| Texto / apoio / links e foco | `#18251E` / `#56645E` / `#315B46`: contraste medido, não reaproveitar verde da marca como texto pequeno. |
| Borda de controle / mensagem | `#7E8F84` / texto `#294738` em `#EDF3EF`: borda ajustada após medição para 3,17:1 contra campo. |
| Ação Google | Fundo `#18251E`, texto branco; email branco com borda. Proposta, não cor de ação aprovada. |
| Fonte | Manrope 400 corpo, 600 rótulos/ações, 700 título/logo, arquivos estáticos locais, sem chamada externa. |
| Medidas | Logo 44/56; título 28/36; corpo 15/24; rótulo 14/20; link de recuperação 12/20. Card maxWidth 448/radius 28; controles radius 12/minHeight 52; campo minHeight 48. |
| Ícones | Phosphor regular 20, envelope e lock, decorativos via `expo-image` instalado. Variante em validação. |

Arquivos: `src/app/auth/sign-in.tsx`, `src/components/AuthPanel.tsx`, `src/app/_layout.tsx` (oculta somente cabeçalho redundante do login), assets locais e avisos públicos de licença. `pilot`/`fontReady` limitam apresentação ao login. AuthField mantém TextInput; associação HTML label/input na web, foco nativo preservado e borda de foco adicional; Enter na senha usa a mesma ação/autorização, limpeza de senha e bloqueios. Pressable estabelecido do RN fornece a ação/teclado; não há modal/picker/foco complexo novo.

Consumidores avaliados: cadastro, receber link e conta mantêm composição anterior; cadastro/recuperação têm campos/ações legíveis e navegação conferida. Callback/reset-password continuam sem piloto; suíte Auth comprova seus contratos, revisão visual completa fica para fase B. Home, ExpenseCard, TransactionForm e FinancialConfirmation não alterados nesta fase.

Licenças/origens: [Manrope](../../assets/fonts/manrope/README.md), [Phosphor](../../assets/icons/phosphor/README.md), cópias de avisos em `public/licenses/` para exportação web. Integração documentada para Android, sem execução em aparelho ou prova de empacotamento nativo nesta fase.

[Capturas reais e checks](../validacoes/007-refinamento-visual.md). Sem aprovação explícita registrada, sem expansão. Zoom real 200% e critérios completos R01–R04 pendentes; SPEC-007/V1 não concluídas.

## 08/10/2026 — Jade escolhida pelo usuário

**Decisão aprovada:** utilizar Radix Colors **Jade** seguindo a hierarquia do site. Consulta visual do site e popup Jade 9, fonte oficial `src/light.ts`, versão declarada **3.0.0**. Aplicada a variante clara/sRGB coerente com o piloto atual; nenhuma implementação de tema escuro ou instalação Radix. Origem: https://www.radix-ui.com/colors e https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale. Licença MIT preservada em `public/licenses/Radix-Colors-MIT.txt`, copyright Modulz/WorkOS.

| Passos aprovados | Hierarquia oficial | Aplicação no login |
| --- | --- | --- |
| 1–2 | Fundos gerais e sutis | Card Jade 1; página Jade 2. |
| 3–5 | Fundo de componente normal, hover, pressionado/selecionado | Campos e ação secundária Jade 3; botão secundário hover 4/pressionado 5. Mensagem 3. |
| 6–8 | Separadores/bordas sutis, bordas de controle, bordas fortes/hover/foco | Divisórias/mensagem 6; controles 7; hover/foco 8, conservando contorno nativo. |
| 9–10 | Fundos sólidos e hover de sólidos | Google 9; hover/pressionado 10, texto branco conforme Radix. |
| 11–12 | Texto secundário e de alto contraste | Apoio/links/ícones 11; título/rótulos/inputs/mensagem/ação secundária 12. |

Fonte única de primitivos aprovados: `src/constants/jade.ts` (12 valores exatos). Usada nos dois arquivos do piloto; não consolida tokens de composição nem inicia B. A logo mantém a decisão específica `#44BA5D`, fora da escala Jade. Branco no texto da ação sólida é a combinação recomendada pelo Radix.

Google passou a 20/28, arquivo Manrope 700, por branco/Jade 9 resultar em 3,15:1 na fórmula WCAG (texto grande em negrito), diferente do APCA Lc 63,6 exibido pelo Radix. Esta medida ainda é proposta para validação. O fallback também usa negrito. Jade 11/1 = 4,59:1; Jade 12/1 = 12,02:1; Jade 12/3 = 10,97:1; branco/Jade 10 = 3,54:1. Não presumir WCAG integral pela origem Radix. Bordas oficiais 7/3 = 1,63:1 e 8/3 = 2,12:1, abaixo de 3:1 se usadas isoladamente como indicador obrigatório de limite; contornos nativos de foco preservados e contraste não textual completo continua limite da validação R03.

Cancelamento do login reutiliza o PilotAction existente como ação secundária, via slot de AuthPanel; mesmos bloqueios/handler, Enter conferido. Outros consumidores conservam Button/composição anteriores. Paleta aprovada; **composição/pesos/medidas e fase B continuam aguardando validação explícita**. [Evidência atualizada](../validacoes/007-refinamento-visual.md).


## 08/10/2026 — aceite do piloto e fase B aplicada

O usuário aprovou explicitamente a composição Jade: “a composição jade casa muito bem com a proposta da aplicação”, reforçando Manrope nas demais telas. Fase B começou somente após esse aceite. Valores do piloto usados como direção, sem aprovar tema escuro ou kit amplo.

**Código compartilhado:** `src/constants/jade.ts` contém os 12 primitivos oficiais; `src/components/VisualSystem.tsx` contém papéis de cor, raio 12, altura mínima 48, carregamento global de Manrope e Text/Button realmente reutilizados. Text resolve 400/600/700 para as faces locais correspondentes, sem negrito sintetizado; inputs usam 400. Header/title/back do Router usam Manrope. Autenticação não espera fonte para restaurar sessão e mantém fallback. Nenhuma dependência nova.

**Hierarquia:** Jade 2 página, 1 superfície; 3 controle, 4 hover, 5 seleção; 6 separadores, 7 bordas, 8 interação; 9 sólido, 10 hover sólido; 11 texto secundário sobre Jade 1, 12 principal. Links sobre Jade 2/3 usam 12 (11 teria apenas 4,43/4,19:1). Branco sobre 9 usa Manrope 700/20 px (3,15:1 para texto grande). Logo continua #44BA5D; destrutivo conserva #9f1239 anterior, fora do acento Jade e sempre com rótulo. Sem atribuir verde a receitas como única informação. Bordas 7/8 sobre 3 ficam em 1,63/2,12:1: limite não textual de R03; contorno nativo de foco preservado.

**Composição e consumidores:** AuthPanel/AuthField reutilizados no login/cadastro/conta/recuperação/retorno; cartão Auth max448/p24/r28, título28/36, campo16, mensagem14/22. Overview max960/p16: período → estados/contexto confirmado → indicadores e saldo32/44 → filtros → lista FlatList, sem gráfico. Receitas/despesas quebram para uma coluna em tela estreita. ExpenseCard dobra valor/descrição quando necessário. TransactionForm recebe fonte/cores/controles e seleção em texto/ARIA; FinancialConfirmation conserva Modal/foco/cancelamento nativos e destrutivo existente. Não recriar navegação, modal ou seleção complexa.

**Evidência e estado:** [capturas, aprovação, roteiro e checks](../validacoes/007-refinamento-visual.md). Zoom 200% confirmado pelo usuário nesta execução; R01/R02/R04 comprovados, R03 parcial por bordas. Android/aparelho, leitor de tela e falha de fonte não exercitados. Registros anteriores de espera de aprovação neste documento são histórico do piloto, superados pelo aceite acima.

### Aviso de ambiente na publicação — 08/10/2026

Correção técnica de conteúdo dentro da hospedagem autorizada: AuthPanel passou de “Ambiente local de testes.” para “Ambiente de avaliação.”, pois o mesmo componente já é servido por Firebase/Supabase hospedados. Não altera direção visual aprovada, tokens, ícones, estilos, controles ou comportamento Auth; todos os consumidores de AuthPanel recebem o mesmo texto. Aplicadas interface-design, recomendações React e web, delimitadas à cópia. Conferido login publicado em 390×844 e 1280×900, sem corte do aviso. Estados vazios/desabilitados e proteção sem sessão observados; zoom, teclado, foco, estados de erro/carregamento e demais consumidores não foram novamente exercitados nesta correção textual. Não substitui a validação da SPEC-007.


## 08/10/2026 — destaque de erros solicitado pelo usuário

Erros usam vermelho quente escuro **#B42318** (visual.danger), fundo rosado **#FFF1F0** (visual.errorSurface), faixa lateral 4 px e Manrope 600/14 px/22 px. Contraste texto/fundo **5,98:1**. ErrorFeedback reutilizado no AuthPanel, indisponibilidade da sessão, falha de fonte, consulta mensal e erros de campo/formulário/rede. Ações destrutivas acompanham o mesmo vermelho; confirmações informativas continuam Jade. AuthState recebe somente metadado de apresentação messageKind, atribuído na origem da mensagem, sem classificar pelo texto nem mudar política Auth. Medições antigas de #9f1239 são históricas; token atual substitui esse tom. [Evidência](../validacoes/007-refinamento-visual.md). Pendência R03 de bordas Jade permanece.


**08/10/2026 — alinhamento posterior com Radix autorizado pelo usuário:** vermelho de feedback/destrutivo passa a **Tomato 11 #D13415**; aviso usa fundo **Tomato 2 #FFF8F7** e faixa sólida **Tomato 9 #E54D2E**. Papéis oficiais: fundo sutil, sólido e texto de acento. Contraste 11/2 **4,75:1** e faixa9/2 **3,69:1**. Fundo3 teria 4,33:1 com o texto11; escolher 2 mantém texto pequeno legível. Primitivos selecionados em src/constants/tomato.ts, fonte [Radix oficial](https://github.com/radix-ui/colors/blob/main/src/light.ts), 3.0.0/MIT, aviso existente em public/licenses. Substitui #B42318/#FFF1F0 anteriores; Jade/Manrope/composição mantidos. Sem dependência nova.
