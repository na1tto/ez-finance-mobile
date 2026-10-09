# Piloto da navegação principal

**Atualização posterior,08/10/2026:** workflow básico e acesso a Minha conta com sessão real validados; cancelamento do formulário corrigido para Lançamentos. [Prova integrada e pendências restantes](012-workflow-real-piloto.md). As evidências isoladas e limites abaixo descrevem esta entrega original.

## Fechamento do escopo

Em08/10/2026, usuário confirmou encerrar o escopo do piloto neste ponto, após esclarecer que Minha conta não recebeu refinamento visual próprio. Recorte de implementação entregue localmente: Início/resumo/gráficos, Lançamentos/lista/filtros, interações/animações e barra Phosphor/gesto entre as três páginas principais. Minha conta conserva composição e ações anteriores, recebendo apenas navegação.

Refinamento de Minha conta e expansão às demais telas ficam para outra iteração. Fechar o escopo não equivale a teste integrado, validação em Android ou autorização de publicação; limites registrados abaixo permanecem. Nesta etapa somente documentação atualizada, sem alteração de código ou repetição de testes; evidências técnicas são as da entrega anterior.

08/10/2026. Usuário aprovou inserir no piloto a barra, o gesto lateral e a separação da lista em Lançamentos, utilizando Phosphor. Implementação local, composição aguardando validação humana; sem publicação, banco, Auth ou dependência nova.

## Comportamento

- Início (`/`): resumo mensal, duas representações animadas, filtros e ação Novo lançamento. Lista em Lançamentos (`/transactions`): consulta mensal, categorias, atualização, cards e acesso à edição. Minha conta mantém `/auth/account` e ações existentes.
- Barra inferior com ícones oficiais core2.1.1 regular: house, receipt, user-circle, 24px; nomes visíveis, seleção por texto/superfície, hover, foco nativo e áreas de60px. Barra participa do layout e respeita safe area, sem sobrepor o conteúdo rolável. Largura limitada a960px na web ampla. Links reais permitem navegação por teclado e URL.
- Gesto horizontal de um dedo nas páginas principais troca um destino por vez; movimento vertical, curto ou cancelado não troca. Extremidades não dão a volta. Sem gesto/barra nos formulários; sem animação de acompanhamento do dedo nesta entrega. Usa PanResponder e Router existentes.
- Destinos principais usam replace, evitando acumular histórico a cada troca de aba. Mês/categoria permanecem no provider financeiro compartilhado. Estado visual local (modo do gráfico/expansão de categorias/posição de rolagem) pode reiniciar ao retornar à página; não há persistência nova.
- Formulários preservam stack e proteção de alterações. Salvamento/exclusão continuam retornando ao Início, como antes. Botão de recuperação “Voltar à lista” passa a apontar `/transactions`. Rotas principais continuam protegidas por sessão. Verificador de exportação hospedada inclui Lançamentos e Minha conta; nenhuma publicação executada.

## Evidências

Chrome headless com toque emulado: componentes reais MonthlyOverview/MainNavigation, Router real em contexto isolado e FinanceController real sobre repository fictício em memória. Conta e formulário do harness são substitutos mínimos para observar destinos/ausência da barra; **não são teste integrado do formulário real ou de ações de conta**. Harness temporário removido antes de exportar.

Conferidos320/390/1280px, conteúdo longo na lista, ícones carregados, largura/altura das áreas de toque, seleção, Enter em link, filtro compartilhado, ausência de cards no Início e presença na lista. Toque via eventos CDP confirmou deslizar à esquerda/direita, gesto curto, rolagem vertical sem troca e limite na última aba. Zero exceções na execução final. Rota real `/transactions` em contexto separado sem sessão abriu login sem barra privada; nenhuma autenticação ou escrita financeira feita.

Na inspeção inicial, Link/asChild não aplicou corretamente estilo de função e depois rejeitou array no Slot. Correção: estilo achatado com estados explícitos. Nova execução conferiu áreas de60px e seleção antes de recapturar.

- Início: [320](assets/011-inicio-320.png), [390](assets/011-inicio-390.png), [1280](assets/011-inicio-1280.png).
- Lançamentos: [320](assets/011-lancamentos-320.png), [390](assets/011-lancamentos-390.png), [1280](assets/011-lancamentos-1280.png).

53 testes existentes e2 testes de proteção da exportação hospedada aprovados. TypeScript, exportação web de12rotas e diff sem erros aprovados. Ícones selecionados sem instalar catálogo: [origem/licença/hashes](../../assets/icons/phosphor/README.md).

Pendentes: aceite visual humano, sessão real com criação/edição/descarte/retorno entre rotas, Minha conta autenticada nesta composição, zoom real200%, leitor de tela, teclado virtual e aparelho Android (gestos do sistema, safe area e SVGs). Movimento reduzido usado na revisão isolada; animações dos gráficos têm evidências da entrega anterior. Não declarar validação integrada ou Android concluída.
