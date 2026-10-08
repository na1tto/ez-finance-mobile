# SPEC-007 — Refinamento visual das telas existentes

**Estado:** parcial — fases A/B implementadas; R03 mantém limite de contraste não textual de bordas. **Marco:** web local, compatibilidade Android por APIs existentes; aparelho ainda não validado. SPEC-007 e V1 não concluídas.

**08/10/2026:** aprovação explícita da composição Jade recebida antes da expansão: “a composição jade casa muito bem com a proposta da aplicação”, com reforço de Manrope nas demais telas. Cadastro/overview refinados; demais consumidores recebem coesão. Zoom 200% confirmado pelo usuário nesta execução. R01/R02/R04 comprovados; [evidências, checks e limite R03](../validacoes/007-refinamento-visual.md).

## Objetivo e recorte

Dar identidade e coesão ao app existente, com prioridade em **login/cadastro e overview mensal**, sem novas telas, rotas ou funcionalidades. Reaproveitar `AuthPanel`/`AuthField`, Home, `ExpenseCard`, `TransactionForm` e `FinancialConfirmation`. Demais telas recebem somente adequações necessárias de componentes compartilhados; nenhum redesenho independente de cada rota.

**Aprovado:** Manrope, Phosphor, logo textual `EZ$` em `#44BA5D`; M01 como inspiração de entrada/overview e Buddy como apoio estético; **Radix Colors Jade com a hierarquia oficial de 12 passos**, escolhida pelo usuário após o primeiro piloto. Variante clara/sRGB aplicada no login existente. Composição do piloto, com os pesos/medidas exibidos, aprovada posteriormente; expansão usa essa direção. Tema escuro e efeitos adicionais não aprovados. Consultar [base visual](../design/README.md), [referências](../design/REFERENCIAS.md), [sistema](../design/SISTEMA_VISUAL.md) e [ícones](../design/ICONES.md).

Não incluir onboarding, gráficos, IA, orçamento, Apple, novos destinos de navegação, tema escuro completo, hosted, backup, APK ou migração ampla para kit de componentes. O verde da logo não define automaticamente cor de texto/botão/sucesso.

## Execução em duas fases, na mesma spec

### A — Piloto de entrada

1. Reinspecionar código atual e regras. Com interface-design, declarar intenção/hierarquia e apresentar **uma direção**, inspirada em M01: superfícies claras, texto escuro, acento moderado e poucas formas. Não gastar tempo criando várias alternativas ou ilustrações elaboradas.
2. Incorporar Manrope com `expo-font` existente, origem/licença registradas e poucos pesos. Incorporar somente ícones Phosphor necessários por integração compatível com RN/Web; verificar versão/licença e dependências, sem baixar catálogo inteiro. Se uma dependência pontual for necessária, justificar; não instalar novo sistema de estilos.
3. Refinar a tela de login existente, com Google principal e email/senha secundários, erros e estados preservados. Logo como texto; não inventar estatísticas ou promessas financeiras para decorar a entrada. Layout simples que se adapte ao mobile e à web ampla.
4. Mostrar a tela renderizada estreita/ampla e solicitar validação visual. **Aguardar essa validação antes da expansão**, conforme instrução do usuário e AGENTS. Famílias/logo e a posterior aprovação da paleta Jade não equivalem à aprovação da composição do piloto.

### B — Coesão após aprovação

1. Consolidar somente tokens efetivamente usados em uma fonte de código; preservar RN/StyleSheet. Evoluir botão/campo/superfície compartilhados apenas onde houver reutilização real, sem reimplementar comportamento complexo de plataforma.
2. Aplicar a direção ao cadastro pela composição existente e ao overview: período e categoria legíveis, receitas/despesas/saldo do mesmo conjunto e lista virtualizada. Seleção precisa de semântica e texto, além de cor. Não esconder filtros ou falhas para simplificar aparência.
3. Aplicar coerência mínima a cards, formulário e confirmação existentes: fonte, controles, cor e espaçamento compartilhados. Conferir consumidores Auth (conta, recuperação, confirmação etc.) após mudar componentes; manter ações descobertas e erros visíveis. Nenhuma tela extra.

Preservar controllers, consultas, guards, armazenamento de sessão, regras de dinheiro/data, reconciliação e proteção de rascunhos. Não alterar regras de negócio para acomodar referência visual. Biblioteca pontual pode fornecer comportamento estabelecido quando necessário; não escrever picker/modal/foco complexos do zero por preferência estética.

## Aceitação enxuta

| ID | Critério | Evidência |
| --- | --- | --- |
| R01 | Piloto usa logo/fonte/ícones aprovados e recebe aprovação visual explícita antes de expandir. | Capturas reais mobile/web e registro do que o usuário aprovou; sem aprovação, fase B permanece pendente. |
| R02 | Login/cadastro e overview existentes compartilham direção/tokens, sem novas rotas; demais consumidores continuam legíveis e operáveis. | Comparação renderizada das três telas prioritárias e inspeção dos componentes reutilizados. |
| R03 | Teclado/foco, contraste e responsividade verificados; estados loading/vazio/erro/desabilitado preservados. | Um roteiro web em 320/390 e 1280 CSS px, zoom 200%, descrição/valor longos, seleção mensal/categoria e uma confirmação. Revisão por web-design-guidelines; não alegar WCAG integral. |
| R04 | Fluxos existentes continuam funcionando e verificações pertinentes passam. | Login email/senha, navegação de cadastro/recuperação e consulta/CRUD no mesmo roteiro com fixtures fictícias; tipos, exportação web e regressões pertinentes. Dados humanos preservados. |

Aplicar vercel-react-best-practices ao React: manter virtualização, digitação barata, imports restritos e estado derivado dos snapshots; não adicionar memoização ou store sem necessidade.

**Validação proporcional:** unidades, tipos e exportação web uma vez após estabilizar. Integração financeira quando alterar controles/formulários/consulta; Auth completo quando afetar eventos/fluxos de autenticação. SQL somente se alterar essa camada, o que não é esperado. Repetir checks apenas por mudança/falha relevante; não recriar campanhas de PKCE, commit perdido ou reinício de banco já comprovadas. Biblioteca/marca/fontes exigem revisão de licença e bundle, não uma nova campanha SQL.

## Registro e limites

Atualizar sistema visual com decisões aprovadas, tokens e consumidores afetados; contexto/plano/spec e evidência curta em `docs/validacoes/007-refinamento-visual.md`. Preservar credenciais/dados humanos, limpar somente fixtures próprias e não executar reset. Nenhuma captura com dados pessoais/tokens.

**Concluída:** R01–R04 comprovados na web local, fases A/B finalizadas. A espera de validação do piloto é uma pendência explícita, não conclusão da spec. Android/aparelho/APK e ambiente hospedado/backup continuam marcos posteriores; V1 não concluída.


**08/10/2026 — refinamento adicional autorizado:** erros em #B42318 sobre #FFF1F0 (5,98:1), faixa lateral e Manrope600, reutilizados nas telas existentes. Informações/sucesso continuam Jade; Auth expõe metadado de tipo da mensagem, sem mudar contratos de autenticação. Unidades 50/50, tipos/exportação e revisão renderizada passaram. [Evidência do ajuste](../validacoes/007-refinamento-visual.md). Estado parcial de R03 permanece pelo limite não textual das bordas Jade.


**08/10/2026 — continuação:** usuário autorizou tons Radix adicionais. Tomato11/2/9 agora fornece texto/fundo/faixa dos erros, com 4,75:1 para texto pequeno. Jade principal, Manrope e fluxos preservados; [evidências atuais](../validacoes/007-refinamento-visual.md). Substitui #B42318/#FFF1F0; R03 anterior permanece parcial.
