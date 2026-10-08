# SPEC-007 — evidência do refinamento visual

**08/10/2026 · fases A/B aplicadas; entrega parcial por R03. SPEC-007 e V1 não concluídas.**

## Aprovação e entrega

Após o piloto Jade renderizado em 320/390/1280, o usuário aprovou explicitamente: “a composição jade casa muito bem com a proposta da aplicação”, reforçando Manrope nas demais telas. Fase B iniciou somente após esse aceite. Paleta/hierarquia Radix, Manrope e Phosphor aprovadas; logo exclusivamente EZ$ #44BA5D.

Carregamento único de Manrope 400/600/700 na raiz; faces reais em Text/Button compartilhados, inputs e cabeçalhos (incluindo retorno). Primitivos Jade e papéis reutilizados em VisualSystem; RN/StyleSheet, AuthPanel/AuthField, ExpenseCard, TransactionForm e FinancialConfirmation existentes. Cadastro compartilha a entrada; overview destaca período, contexto confirmado, receitas/despesas/saldo e mantém filtros/lista FlatList/ações. Demais Auth recebem coesão. Nenhuma rota/dependência/funcionalidade nova; controllers, dinheiro/datas, RLS e proteção de alterações preservados.

Origem/licença/versão/hashes: [Manrope](../../assets/fonts/manrope/README.md) e [Phosphor](../../assets/icons/phosphor/README.md). OFL/MIT presentes em assets e exportação public/licenses. Fontes ~284 KiB, dois SVGs 657 bytes; integração expo-font/expo-image existente, compatível por APIs com web/Android. Aparelho Android não exercitado.

## Evidência renderizada e roteiro

Chromium real integrado, DPR 1, **320×720, 390×844, 1280×800 CSS px**. Sem transbordamento horizontal no cadastro, overview e lista longa; conteúdo rola até todas as ações. Tipografia computada conferida: ManropeRegular nos campos, SemiBold nas ações/cabeçalhos e Bold nos títulos; fontWeight CSS 400 nas faces nomeadas corresponde ao asset pesado real.

- Login aprovado: [390](assets/007-login-jade-390.png), [1280](assets/007-login-jade-1280.png), [320/foco](assets/007-login-jade-320-foco.png), [pendente](assets/007-login-jade-pendente.png).
- Cadastro: [320](assets/007-cadastro-jade-320.png), [390](assets/007-cadastro-jade-390.png), [1280](assets/007-cadastro-jade-1280.png).
- Overview/indicadores: [390](assets/007-overview-jade-390.png), [1280](assets/007-overview-jade-1280.png); [lista longa 390](assets/007-lista-longa-390.png), [320](assets/007-lista-longa-320.png). Capturas do overview antecedem o ajuste final dos dois links para Jade 12, documentado abaixo.
- Estados/consumidores: [erro 320](assets/007-overview-erro-320.png), [carregamento](assets/007-overview-carregando-320.png), [descarte protegido](assets/007-confirmacao-320.png), [exclusão](assets/007-exclusao-320.png), [conta](assets/007-conta-320.png), [recuperação](assets/007-recuperacao-320.png). Capturas iniciais sem Jade ficam como histórico, não aparência atual.

Tab/Enter, contorno nativo visível, rótulos Auth clicáveis, autocomplete e senha mascarada conferidos. Cadastro bloqueado com senha de cinco caracteres. Login com fixture, overview vazio, criação de despesa/receita, filtro, mês anterior/atual mantendo categoria, erro/retry, edição e exclusão confirmada passaram. Valores fictícios R$1.234,56 e teto R$999.999,99; saldo exato R$998.765,43. Valor acima do teto gera erro e foco no campo. Descrição longa quebra com valor na linha seguinte quando necessário. Seleção visível por texto e ARIA (checked/pressed explícitos: accessibilityState sozinho não expunha seleção na saída web). Cancelamento de saída mantém rascunho; Modal começa em Continuar editando e devolve foco ao cancelar. Loading bloqueia repetição; falha conserva contexto do resultado anterior e aviso.

**Zoom real 200%:** usuário confirmou nesta execução “Validei em 200% e está legível e operável”. Evidência manual do usuário; o navegador integrado não aplicava o atalho e não foi usado CSS para simular zoom.

**Contraste sRGB:** Jade12/1 12,02:1, 12/2 11,61:1, 12/3 10,97:1; Jade11/1 4,59:1; branco/9 3,15:1 e branco/10 3,54:1 com Manrope700/20 px (texto grande). Links do overview ajustados para 12: Jade11 em fundos 2/3 teria 4,43/4,19:1. Destrutivo #9f1239/1 7,90:1. **Limite R03:** bordas Jade7/3 1,63:1 e Jade8/3 2,12:1, abaixo de 3:1 como limite obrigatório isolado; hierarquia escolhida preservada e foco nativo escuro mantido. Não alegar WCAG integral; adequação não textual dessas bordas permanece pendente.

## Checks, dados e aceitação

Unidades **49/49**, integração Auth **50/50**, financeira **50/50**; tipos/exportação web aprovados. Exportação mantém **11 rotas**, bundle reportado **1,6 MB**. Checks repetidos somente por ajustes relevantes; nenhum teste espelha estilos. SQL não executado: essa camada não mudou. Revisão web-design-guidelines aplicada a foco, rótulos, mensagens, seleção, longos e contraste; React mantém virtualização/imports restritos/estado derivado, sem store/memoização nova.

Duas fixtures SPEC-007 em transporte local restrito; CRUD pela sessão comum sob RLS. Limpeza por IDs/identidades/prefixo próprios e somente emails delas; contas fictícias e linha restante removidas, instância/proxy encerrados, arquivos privados excluídos. Inventário detectou **um novo registro humano concomitante**: leitura confirmou identidades e registro anterior intactos; limpeza preservou também essa adição. Não atribuir a adição ao roteiro restrito de fixtures. Sem reset, remoção de volumes, importação ou alteração de credenciais humanas. Trabalho anterior/concomitante preservado.

| Critério | Resultado |
| --- | --- |
| R01 | Comprovado: assets e capturas, aprovação explícita anterior à expansão. |
| R02 | Comprovado: cadastro/overview e coesão dos consumidores existentes. |
| R03 | **Parcial:** larguras, teclado/foco, zoom, estados e contraste textual verificados; contraste não textual de bordas pendente. |
| R04 | Comprovado: Auth/navegação e CRUD reais, unidades/integrações/tipos/exportação. |

Limites adicionais: Android/aparelho, leitor de tela, falha de carregamento de fonte e OAuth externo não reexercitados; OAuth depende da prova anterior, não alegar nova autenticação Google real. Recuperação/retorno visual conferidos sem trocar senha humana; contratos Auth cobertos pela integração local. Hospedado/backup e APK são marcos posteriores.


## Ajuste solicitado — feedbacks de erro, 08/10/2026

ErrorFeedback comum: #B42318 sobre #FFF1F0, contraste **5,98:1**, faixa lateral vermelha 4 px, Manrope600, role alert/live polite. Mensagens Auth possuem tipo explícito (erro/informação); confirmação de envio/cancelamento/sucesso mantém Jade. Aplicado ao Auth, indisponibilidade, fonte, overview e validação/falha financeira. Sem mudar requisições, guards, dinheiro/datas ou RLS.

Navegador real em **390/1280**, retorno inválido fictício, texto longo, ManropeSemiBold e cores computadas conferidos; Enter retorna à entrada. Capturas: [390](assets/007-feedback-erro-390.png), [1280](assets/007-feedback-erro-1280.png). Informação de pedido/cancelamento local conferida separadamente. Nenhuma conta criada/trocada ou dado humano alterado; pedido destinado a endereço fictício inexistente, tentativa encerrada. Unidades **50/50** (inclui distinção erro/informação/limpeza), tipos e exportação web aprovados, 11 rotas/1,6 MB. Integrações completas não repetidas: alteração de apresentação/metadado, sem mudança nos fluxos; SQL intacto. Revisão das Web Interface Guidelines: mensagem junto à tarefa, live region e legibilidade. Zoom/aparelho não reexercitados neste pequeno ajuste. SPEC-007 permanece parcial pelo limite anterior de bordas Jade em R03, não pelo contraste do novo feedback.


**Ajuste posterior — tons Radix:** após autorização do usuário, feedbacks usam Tomato11/2/9 oficiais (texto/fundo/faixa), conforme sistema visual. Contrastes **4,75:1** textual e **3,69:1** faixa; Tomato3 descartado por 4,33:1 no texto pequeno. Navegador real 390/1280 confirmou cores computadas, ManropeSemiBold e mensagem longa: [390](assets/007-feedback-tomato-390.png), [1280](assets/007-feedback-tomato-1280.png). Capturas do vermelho anterior são históricas. Tipos/exportação aprovados; teste sem conta usando retorno fictício, serviço temporário encerrado. Unidades 50/50 anteriores permanecem pertinentes: somente primitivos/mapeamento alterados, sem repetir Auth/finanças/SQL. Limite anterior R03 de bordas Jade permanece.
