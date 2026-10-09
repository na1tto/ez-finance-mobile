# Transição lateral do piloto

08/10/2026. Usuário validou localmente a navegação e solicitou animação ao deslizar, pois a troca era imediata. Adendo autorizado ao recorte fechado: somente movimento das páginas principais, sem refinamento adicional de Minha conta, rotas/dependências novas ou publicação.

## Comportamento

Conteúdo acompanha o arraste horizontal após reconhecimento do gesto, limitado a85% da largura. Nas extremidades, resistência de14% e retorno, sem dar a volta. Gesto curto/cancelado retorna em180ms. Gesto completo sai lateralmente com fade de160ms; próxima página entra do lado correspondente, a28% da largura, com fade/desaceleração de240ms. Não renderiza duas páginas simultâneas como um pager: movimento/fade une a troca de rotas existente. Barra fica fixa; rolagem vertical continua independente. Dois dedos cancelam a troca. Cliques/teclado nos links continuam diretos e podem interromper uma animação pendente.

Formulários permanecem fora da barra/gesto. MainTransitionProvider compartilha apenas destino/direção/tempo da entrada, com validade de2s; não armazena páginas, dados financeiros ou sessão. Animated existente, transform/opacity, native driver no nativo; viewport recorta deslocamento para evitar overflow.

Preferência de movimento reduzido centralizada em um provider para gráficos e navegação, com um único listener de plataforma. Quando ativa ou ainda desconhecida, navegação sem animação; gráficos respeitam o mesmo valor. Mudança durante entrada/arraste interrompe movimento. Listener, valores e animações são limpos na desmontagem; reconhecedor do gesto mantém referência estável quando a preferência muda. Falha na consulta da preferência mantém resultado estático.

## Evidências

Chrome headless com toque via CDP, Router real e componentes MainNavigation/MonthlyOverview/OverviewChart reais em contexto isolado. Dados fictícios fixos; Minha conta substituída por conteúdo mínimo. Sem SDK/Auth/banco nesta revisão de movimento. Workflow integrado anterior continua registrado em [012](012-workflow-real-piloto.md), sem nova campanha de CRUD.

320/390/1280px: medido deslocamento durante o arraste; caixa da barra idêntica antes/durante; entrada nas duas direções observada antes de atingir0; retorno de gesto curto; recorte sem overflow. Conferidos cancelamento de toque, interrupção por link, limite final, resize durante entrada, Enter, ativação de movimento reduzido durante entrada e arraste, cancelamento ao adicionar segundo dedo. Barras/anel continuam progredindo após compartilhar a preferência. Zero exceções na execução final.

Durante a revisão, identificado comportamento da versão instalada de AccessibilityInfo web: registro de handlers indexado pela representação textual da função podia remover o listener da navegação ao desmontar o gráfico. Centralização de assinatura resolveu a atualização da preferência entre rotas. Reconhecedor recriado quando a preferência mudava perdia o gesto em andamento; estabilizado e conferido novamente. Primeira asserção de deslocamento ajustada para considerar distância inicial de reconhecimento, sem alterar limiar de navegação para satisfazer o teste.

Capturas de quadros intermediários, com transparência deliberada durante entrada (não avaliar contraste do estado final por esses quadros): arraste [320](assets/013-arraste-320.png), [390](assets/013-arraste-390.png), [1280](assets/013-arraste-1280.png); entrada [320](assets/013-entrada-320.png), [390](assets/013-entrada-390.png), [1280](assets/013-entrada-1280.png).

Harness/HTML/runner temporários removidos antes da exportação, servidor isolado8083 encerrado. Prévia normal8081 mantida para validação do usuário. TypeScript,53 testes existentes e exportação web de12rotas aprovados; diff sem erros. Sem assets/ícones/dependências novos. AuthPanel, TransactionForm, provider/controladores financeiros e suas regras não modificados.

Pendentes: sensação/velocidade avaliada pelo usuário na8081, aparelho Android (native driver/gestos do sistema), zoom real200%, teclado virtual e leitor de tela. Não declarar essas validações concluídas pela emulação web.
