# Design do Ez Finance

Organização iniciada em **08/10/2026**. Piloto Jade aprovado explicitamente; cadastro/overview e coesão dos demais consumidores implementados com **Manrope 400/600/700**, Phosphor regular e logo textual **EZ$ #44BA5D**. Sem novas rotas/dependências. SPEC-007 parcial pelo contraste não textual de bordas (R03); zoom 200% confirmado pelo usuário. [Evidências](../validacoes/007-refinamento-visual.md), regras atuais no [sistema visual](SISTEMA_VISUAL.md). O inventário/revisão abaixo é histórico anterior à execução.

## Fontes e locais

| Fonte | Responsabilidade |
| --- | --- |
| [Contexto](../CONTEXTO_APP.md) e [plano](../PLANO_IMPLEMENTACAO.md) | Público, comportamento aprovado e sequência funcional; não duplicar aqui as decisões D01–D12. |
| [Referências](REFERENCIAS.md) | Índice ordenado, origem e leitura das capturas; distingue observação de adaptação proposta. |
| [Sistema visual](SISTEMA_VISUAL.md) | Inventário existente, propostas, decisões visuais aprovadas e roteiro de validação. Fonte documental única para regras visuais. |
| [Ícones](ICONES.md) | Família, link oficial, licença, integração e regras de uso. |
| `docs/design/mobbin/` | Capturas originais de referência, já presentes. Não são assets do aplicativo. |
| `docs/design/referencias/` | Referências complementares de outras origens; M01 mostra entrada e overview. Procedência e análise no catálogo. |
| `assets/icons/` | Somente ícones locais destinados ao aplicativo, com procedência e licença. [Instruções](../../assets/icons/README.md). |
| `src/components/` | Implementação compartilhada existente; ampliar por necessidade real, sem duplicar controles. |

Não criar outro manual completo em `.interface-design/system.md`: o registro canônico é `SISTEMA_VISUAL.md`. Se uma ferramenta exigir esse caminho posteriormente, usar apenas um apontador para este registro. Ainda não existe módulo de tokens; não criar uma segunda implementação de estilos durante esta organização.

## O que foi conferido

- `AGENTS.md`, contexto, plano, SPEC-005, `package.json`, `app.json`, layouts, telas de autenticação, lista/cadastro e componentes compartilhados.
- Dez capturas locais do Buddy, identificadas individualmente em [REFERENCIAS.md](REFERENCIAS.md).
- Referência complementar M01 “Money Manager”, movida para `referencias/01-money-manager-auth-overview.webp` sem alteração de conteúdo. Origem não informada; inclusão como inspiração para entrada/cadastro e overview solicitada pelo usuário.
- Expo/React Native/React Native Web, Expo Router, estilos com `StyleSheet` e alguns objetos locais. Não foi encontrado Tailwind, CSS global de design, tema central ou biblioteca de componentes visuais utilizada nas telas analisadas.
- `AuthPanel`, `AuthField` e `authStyles` compartilham a apresentação de autenticação; `ExpenseCard` apresenta lançamentos. Botões usam o componente nativo `Button`; categorias usam `Pressable`.
- `expo-font` e `expo-symbols` constam das dependências, mas as telas inspecionadas não carregam fonte customizada nem usam uma família de ícones compartilhada. Dependência instalada não equivale a identidade escolhida.
- `app.json` declara aparência automática, mas as telas têm cores claras fixas; tema escuro completo não está comprovado. Splash e ícones de instalação têm configuração própria, a avaliar quando houver identidade aprovada.
- Durante a leitura, `src/lib/transactions/form.ts` e integração de formulário no provider surgiram no workspace. Há implementação em andamento: este inventário é um retrato, não validação de conclusão da SPEC-005. Reinspecionar antes de refinar a tela piloto; preservar essas alterações.
- Reinspeção posterior: `TransactionForm` e `FinancialConfirmation` agora existem em `src/components/`; a lista exibe ambos os tipos e totais do histórico, com acesso à edição. Isso não comprova conclusão da SPEC-005 nem consulta mensal. Preservar e evoluir esses componentes, sem recriar formulário/diálogo paralelos. `@expo/ui` 57.0.18 já instalado expõe API universal; não há uso identificado nas telas lidas.

## Revisão inicial de código

Leitura orientada pelas [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md), consultadas em 08/10/2026. São pontos a verificar/corrigir no piloto, não alegação de falhas comprovadas no navegador:

- `src/components/AuthPanel.tsx:15` — campos têm nome acessível, mas o texto visual não tem associação explícita que permita clicar no rótulo para focar o campo; verificar DOM e solução compatível com RN Web.
- `src/components/AuthPanel.tsx:25` — estilos compartilhados não definem estado de foco; verificar foco nativo antes de definir substituição, sem remover contorno sem equivalente.
- `src/components/ExpenseCard.tsx:14` — coluna de texto não tem limite flexível explícito; validar descrições longas junto ao maior valor permitido em largura estreita.
- `src/components/ExpenseCard.tsx:36` — apenas a borda inferior recebe cor; uniformizar estratégia de bordas quando a direção for aprovada.
- `src/app/expenses/new.tsx:19` — seleção de categoria usa botões com estado selecionado; verificar semântica de escolha única, teclado e foco no controle final da SPEC-005.
- `src/app/auth/sign-in.tsx:11` — envio é ação de botão; não há contrato explícito de submissão por Enter na tela. Validar teclado e feedback próximo ao campo sem mudar política de autenticação por uma revisão estética.

Na revisão React: a lista já usa `FlatList` e chaves estáveis; manter virtualização. O projeto declara React Compiler; não adicionar memoização automática a expressões simples. Manter estilos estáticos fora do render, inputs baratos por digitação, controllers estáveis e estado derivado sem efeitos redundantes. Recomendações específicas de Next.js/RSC não se aplicam a este projeto Expo; não acrescentar SWR ou outro estado paralelo por causa da skill.

**Limite desta etapa:** nenhuma sessão no navegador, medição de contraste, teste de leitor de tela ou verificação dos estados renderizados foi executada. Isso faz parte da validação da tela piloto, descrita no sistema visual. Não declarar acessibilidade ou responsividade aprovadas somente pela leitura.

## Próximo passo

1. Usuário confirmou Mobbin apenas como inspiração estética; seu fluxo não corresponde ao produto. Capturas prioritárias, link/data da coleta podem completar o catálogo, sem bloquear uma proposta própria.
2. Phosphor escolhida e registrada em `ICONES.md`; integração/peso/variante ainda serão avaliados. Manrope aprovada como fonte do aplicativo, conforme `SISTEMA_VISUAL.md`; pesos e medidas serão validados no piloto. Não é necessário baixar bibliotecas inteiras.
3. Recomendação pendente: começar por `/auth/sign-in`, reaproveitando `AuthPanel`/`AuthField` e composição inspirada em M01. Cadastro deve usar a mesma linguagem; overview será adaptado ao conteúdo aprovado e à etapa funcional de consulta mensal. Se a preferência for o formulário financeiro, coordenar com a entrega da SPEC-005 e usar sua versão atual.
4. Apresentar direção e uma tela renderizada, com comparativo e estados, para validação do usuário. Só depois consolidar tokens e expandir os componentes afetados.

As capturas já bastam para propor um piloto de entrada. M01 complementa a composição de overview, sem definir gráficos ou novas funcionalidades. Referências de formulário continuam opcionais. Estratégia recomendada de componentes e comparação de bibliotecas estão no [sistema visual](SISTEMA_VISUAL.md#estratégia-de-componentes--recomendação-pendente). Não solicitar credenciais ou dados pessoais como referência.
