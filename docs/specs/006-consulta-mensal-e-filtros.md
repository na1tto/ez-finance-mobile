# SPEC-006 — Consulta mensal e filtro de categoria

**Estado:** concluída na web local em 08/10/2026: Q01–Q06 comprovados; zoom real 200% confirmado manualmente pelo usuário. **Marco:** web local. **Dependência:** [SPEC-005 concluída](../validacoes/005-formularios-e-protecao-de-alteracoes.md). [Evidência e limpeza da execução](../validacoes/006-consulta-mensal-e-filtros.md). V1 não concluída.

## Objetivo e limites

Transformar a lista de todo o histórico em consulta mensal: escolher mês/categoria e mostrar receitas, despesas e saldo do mesmo conjunto. Concretiza D03/D05/D06, preservando CRUD, sessão e proteção de alterações existentes.

Não inclui gráficos, comparações percentuais, orçamento, saldo bancário inicial, novos filtros por tipo, busca, Realtime, exportação, persistência de filtros/rascunhos, hosted/backup ou APK. Redesign completo, instalação de Manrope/Phosphor e tema/tokens pertencem ao piloto visual; fazer apenas o layout funcional necessário nesta entrega. Consultar [regras visuais](../design/README.md), sem interpretar M01 como novas funcionalidades.

## Base conferida no planejamento (antes desta implementação)

- `src/app/index.tsx`: lista virtualizada dos dois tipos, acesso à edição e totais de todo o histórico.
- `TransactionRepository.query`: mês/categoria, paginação completa, totais e isolamento prontos; `monthlyPeriod` e `civilToday` já tratam calendário civil.
- `FinanceController.load`: aceita filtro e ignora resposta antiga, mas filtro privado não integra o snapshot e não é reinicializado em `bind`. Associar consulta solicitada/confirmada aos resultados e reiniciar filtros ao mudar identidade é parte desta entrega.
- Provider e formulários já compartilham controllers estáveis; mutações confirmadas chamam releitura. Reutilizar essa integração.

A conclusão da SPEC-005 foi conferida no código e no registro de evidências para planejar dependências; seus testes/browser não foram reproduzidos nesta elaboração.

## Comportamento

1. **Mês:** abrir no mês atual de `civilToday` (`America/Sao_Paulo`), com mês/ano legíveis, anterior, próximo e retorno ao mês atual. Usar mês civil `YYYY-MM`, sem conversão que altere limites por fuso; respeitar intervalo do calendário já suportado. Consulta futura vazia não autoriza cadastrar data futura.
2. **Categoria:** opção “Todas as categorias” e seleção única entre as dez categorias existentes, com distinção receita/despesa nos rótulos ou grupos. Mudar mês mantém categoria; limpar categoria mantém mês. Não adicionar filtro de tipo.
3. **Resultados:** lista e três indicadores provêm da mesma consulta completa. Saldo = receitas − despesas; valores em centavos, formatados pelo domínio. Mostrar claramente mês/categoria considerados. Selecionar uma categoria de despesa pode zerar receitas e tornar saldo negativo; não compensar com receitas fora do filtro.
4. **Retorno do CRUD:** manter mês/categoria da mesma conta ao voltar do formulário e reler após confirmação. Se lançamento criado/editado não pertencer mais ao recorte, fica fora da lista e dos totais; não trocar filtro silenciosamente para exibi-lo. Falha de releitura é distinta de falha de gravação.
5. **Estados:** carregar, vazio confirmado, erro e retry. Usar “Nenhum lançamento neste mês” ou “Nenhum lançamento para este filtro”, sem afirmar que todo o histórico é vazio e sem buscar o histórico inteiro só para essa distinção. Zero somente após consulta vazia confirmada. Preservar última consulta completa em falha, com seu mês/categoria e aviso de desatualização; nunca rotular dados antigos como resultado do novo filtro. Ocultar resultados incompatíveis durante transição é permitido, mantendo snapshot anterior para recuperação.
6. **Concorrência/identidade:** última seleção vence; resposta de consulta/conta anterior não repopula a tela. Retry usa seleção atual. Logout/troca de dono limpa dados e filtros; nova conta começa no mês atual/todas. Filtros em memória bastam; reload inicia padrão. Rascunho, reconciliação e guards continuam intactos.

## Execução enxuta

1. Integrar mês/categoria e consulta confirmada ao controller/snapshot existente; reutilizar domínio/repositório. Não criar segundo store, cache, serviço de agregação ou reescrever CRUD.
2. Acrescentar controles e indicadores na tela atual; manter `FlatList`, cards, rotas e formulário. Usar controles acessíveis existentes; não construir calendário customizado para navegar por mês.
3. Validar os critérios abaixo e atualizar contexto/plano/spec. Evidência curta em `docs/validacoes/006-consulta-mensal-e-filtros.md`: uma linha por critério, método, resultado e limitações; não duplicar relatórios anteriores.

Não se espera migration/dependência nova. Resolver escolhas técnicas locais autonomamente; mudança significativa de arquitetura ou produto exige consulta ao usuário. Preservar contas humanas/dados/credenciais; fixtures identificadas por execução, limpeza restrita, sem reset ou alteração de RLS.

## Aceitação e validação

| ID | Critério | Prova mínima |
| --- | --- | --- |
| Q01 | Mês atual, anterior/próximo/atual e limites civis corretos. | Teste focal de mudança dezembro/janeiro e fevereiro bissexto; navegador real confirma controles/rótulos. Aproveitar testes existentes do domínio. |
| Q02 | Categoria/todas e três indicadores acompanham exatamente o recorte. | Uma fixture real pequena em dois meses e categorias de ambos os tipos; conferir valores esperados, saldo negativo e retorno a todas. Lista continua completa pelo repositório existente. |
| Q03 | CRUD atualiza consulta sem mudar seleção ou duplicar registros. | Mesmo roteiro real: criar, editar data/categoria para sair do recorte e excluir; confirmar lista/totais no retorno. Não refazer campanha de perdas de commit já validada. |
| Q04 | Loading, vazio, falha/retry e dados anteriores têm contexto correto. | Navegador com uma falha de leitura controlada; retry e consulta vazia comprovados. Erro não vira zero nem muda dono/recorte dos dados apresentados. |
| Q05 | Seleção rápida e troca de identidade invalidam respostas antigas e reiniciam filtros. | Teste determinístico de respostas fora de ordem e reset de dono; regressão financeira real de isolamento. Ampliar prova real só se mudar mecanismo de autorização. |
| Q06 | Controles utilizáveis e regressões aprovadas. | Navegador estreito/amplo, teclado/foco e zoom 200%; testes financeiros, tipos e exportação web. Sem sobreposição ou regressão no formulário. |

**Checks finais, uma execução após estabilizar:** `npm run test:finance`, `npm run typecheck`, `npm run build:web`. O script financeiro já inclui as unidades; não repetir `npm test` apenas para obter outra contagem. Reexecutar somente checks afetados por correções posteriores.

SQL e integração Auth completa são condicionais a mudanças em migrations/RLS/configuração/fluxos Auth; se essas camadas não mudarem, referenciar suas evidências anteriores e registrar que não foram repetidas. A inspeção e os testes focais de identidade continuam obrigatórios. Não repetir login Google humano, reinício do banco ou nova carga manual de 1.007 linhas para esta spec; a suíte financeira já conserva suas regressões.

**Concluída:** Q01–Q06 comprovados na web local, documentação/fixtures finalizadas. Pendência obrigatória implica entrega parcial. Refinamento visual, hosted/backup e Android/APK seguem posteriores; V1 ainda não concluída.

## Entrega em 08/10/2026

Estado solicitado/confirmado integrado ao FinanceController; filtros reinicializados por identidade. Tela index mantém FlatList/cards/CRUD e adiciona mês/categoria e contexto dos indicadores. Helpers civis no domínio, quatro testes focais novos (incluindo regressão de reabertura) e harness mensal que reutiliza a prova anterior. Sem nova dependência/migration/Auth/store. Checks finais passaram (50 financeiros, tipos, 11 rotas web); limpeza restrita concluída. Q06 concluído após confirmação manual explícita do usuário de zoom real 200%, filtros/totais/lista/rolagem legíveis sem cortes ou sobreposição. Ver matriz curta de evidência vinculada acima.
