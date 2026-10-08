# SPEC-004 — Persistência financeira autenticada

**Data:** 08/10/2026. **Estado:** implementada e validada no marco web local; P01–P15 atendidos com métodos/limites registrados na [evidência](../validacoes/004-persistencia-financeira.md). **Etapa:** 4 do [plano](../PLANO_IMPLEMENTACAO.md).

**Requisitos:** [contexto aprovado, D01–D12](../CONTEXTO_APP.md). **Dependências:** [fundação](001-fundacao-de-dados.md), [ambiente](002-ambiente-e-integracao-supabase.md) e [autenticação web local](003-autenticacao.md). Evidência da etapa anterior: [SPEC-003](../validacoes/003-autenticacao.md).

A solicitação de implementação autorizou código, migration incremental necessária, integração mínima descrita abaixo e testes locais. Não autoriza reset, descarte de contas/dados existentes, provisionamento hospedado ou funcionalidades adiadas.

## 1. Objetivo e resultado demonstrável

Tornar o banco Supabase a fonte dos lançamentos do usuário autenticado. Entregar operações tipadas de consulta, criação, atualização e exclusão para receitas/despesas e estado financeiro isolado por identidade, com tratamento de carregamento, falhas e repetição segura de operações.

Demonstrar na web que uma despesa criada pelo formulário existente é confirmada pelo banco, aparece na lista e permanece após reload, nova sessão e reinício controlado do serviço preservando dados. Receitas, edição, exclusão e consultas mensais/categoria devem ser verificadas na camada de dados com Auth/API reais; suas interfaces completas pertencem às etapas 5–6.

Esse corte mantém uma entrega revisável: persistência funcional no fluxo existente, sem apresentar a V1 financeira completa como concluída. Dados em memória anteriores são experimentais e não serão importados.

## 2. Base inspecionada antes da implementação

A tabela abaixo registra o ponto de partida; o estado entregue está na seção 13 e na evidência de validação.

| Artefato | Estado conferido e implicação |
| --- | --- |
| `src/types/transaction.ts` | Contratos novos distinguem campos editáveis, dono/ID/criação, data civil e centavos; reutilizar. |
| `src/domain/{money,dates,transactions}.ts` | Validação exata, catálogo, período mensal, totais e DTOs puros disponíveis; não duplicar regras em telas/repositório. |
| `supabase/migrations/20261007000100_financial_foundation.sql` | Categorias/transactions, FK por tipo, RLS/grants por dono e identidade imutável. Insert atual não permite fornecer `id`; repetição segura exige desenho técnico explícito. |
| `src/lib/supabase.ts` | Cliente público compartilhado com sessão da SPEC-003; não criar cliente administrativo ou sessão paralela para finanças. |
| `src/contexts/AuthContext.tsx` / layout raiz | Estado de autenticação, guard e provider experimental recriado por identidade; integrar estado financeiro sem enfraquecer o guard/recuperação. |
| `src/contexts/ExpensesContext.tsx` | Coleção em memória, somente adicionar/remover; não faz I/O financeiro. Substituir ou adaptar internamente ao domínio persistido. |
| Lista/formulário/card atuais | Valores em reais/`toFixed` e categoria textual; migrar conjuntamente para centavos/IDs ao integrar. Botão de teste não pode gerar gravações reais. |
| `src/app/expenses/[id].tsx` | Rota de edição/detalhes ainda sem implementação; permanece para etapa 5. |

O usuário confirmou a conclusão da SPEC-003 no marco web local; contexto/plano/evidências registram 31 testes normais, 32 com integração, 53 SQL e tipos/exportação web aprovados. Nesta elaboração foram conferidos documentos e consumidores relevantes, sem repetir a validação completa de autenticação. Reconfirmar os pré-requisitos ao implementar, preservando as duas contas humanas e respectivas credenciais.

## 3. Escopo da entrega

1. Camada de acesso Supabase para categorias e lançamentos, usando sessão válida e contratos do domínio.
2. CRUD de receita/despesa, leitura por ID e consulta por período/categoria, com isolamento e retorno confirmado.
3. Provider/controller financeiro com estado de leitura/operação/erro separado da sessão; invalidar respostas obsoletas e limpar dados ao sair/trocar conta.
4. Repetição segura de criação após resposta incerta e bloqueio de operações duplicadas em andamento.
5. Integração mínima do cadastro/lista de **despesas** existentes ao banco, com validação, valores em centavos, feedback web e preservação do formulário em falhas.
6. Testes de rede, autorização real, persistência, concorrência e regressões; evidência e documentação de reprodução.

**Fora desta entrega:** formulário completo de receitas/edição/data selecionável, ações visuais de excluir, confirmação de descarte, painel mensal e filtros visuais completos, redesign, Realtime obrigatório, sincronização automática entre dispositivos, fila offline, cache financeiro persistente, migração de dados em memória, fusão de contas, backup operacional, Supabase hospedado e APK.

CRUD na camada de dados não equivale a CRUD completo na interface. Etapa 5 entregará os fluxos de cadastro/correção/proteção e etapa 6 a consulta financeira final. Não adicionar controles de diagnóstico permanentes para demonstrar operações ainda sem tela de produto.

## 4. Regras de dados e autorização

- Somente centavos inteiros de 1 a 99.999.999 por lançamento; tipo determina entrada/saída. Reutilizar conversão textual exata, validação e formatação existentes. Nenhuma soma em reais de ponto flutuante.
- Categorias fixas identificadas por ID, coerentes com o tipo. Ler catálogo pela API autenticada e conferir consistência com os IDs do domínio; erro no catálogo não libera personalização nem fallback silencioso para dados financeiros em memória.
- Data efetiva civil separada de `created_at`; hoje/passado com referência já adotada `America/Sao_Paulo`. A integração mínima de despesas usa hoje como data efetiva e informa esse comportamento; seleção/edição da data fica para etapa 5.
- Entrada de criação/atualização utiliza DTO dos campos editáveis. Dono não vem de formulário/rota; usar dono padrão do banco/identidade autenticada. ID operacional de criação, quando adotado, é gerado internamente; não se torna campo editável.
- ID, dono e criação permanecem imutáveis após insert. Não reutilizar `Date.now()` para identidade persistente.
- RLS é a barreira de autorização. Filtro explícito por dono pode complementar a consulta, mas não substitui política no banco. Chave pública + JWT real nas operações do app; nenhuma chave administrativa no cliente.
- Sem sessão financeira autorizada — desconectado, restaurando, indisponível ou recuperação restrita — não iniciar operações nem mostrar dados privados. Uma leitura de sessão local não contorna o estado validado da SPEC-003.
- Mensagem para ID ausente/inacessível não revela se o lançamento pertence a outra conta. Erro de acesso, indisponibilidade e coleção vazia são estados distintos.

## 5. Contratos de acesso e consulta

Organização sugerida: `src/lib/transactions/` ou equivalente para repositório/erros e `src/contexts/` para provider, com controller puro quando ajudar testes. Nomes livres; preservar convenções e dependências existentes.

Operações esperadas, com nomes ajustáveis:

- Ler categorias autenticadas e lançamento autorizado por ID.
- Consultar lançamentos por mês/categoria conforme `TransactionQuery`; produzir `TransactionQueryResult` com lista e totais sobre **o mesmo conjunto autorizado**.
- Criar com intenção operacional estável e retornar `Transaction` confirmado.
- Atualizar por ID somente campos editáveis e retornar a versão persistida.
- Excluir por ID com confirmação do serviço ou reconciliação explícita do resultado incerto.

A integração transitória da lista existente pode consultar somente despesas de todo o histórico do usuário. Identificar o total como total dessas despesas; não chamá-lo saldo/mês atual. Isso preserva o recorte da tela existente até etapa 6, sem criar uma nova decisão para a V1.

Filtros mensais usam início inclusivo/fim exclusivo sobre `occurred_on`; categorias usam ID. Ordem técnica determinística, com desempate por ID, evita instabilidade entre páginas. Não inventar limite de quantidade de lançamentos como requisito.

Não somar apenas a primeira página e apresentar total completo. Consultas completas devem buscar todas as páginas necessárias ou usar agregação autorizada consistente; tela que mostrar página parcial precisa identificar isso e não exibir seu subtotal como total do histórico. Recomenda-se paginação técnica interna, sem acrescentar UX de paginação nesta entrega. Testar coleção maior que o limite configurado da API, sem aumentar esse limite para mascarar truncamento. Montar o resultado após completar a leitura; falha intermediária não substitui histórico completo por uma lista parcial sem aviso.

Não prometer snapshot entre múltiplas requisições independentes: após mutações/reconciliação, invalidar/reler a consulta e documentar comportamento quando outra sessão altera dados durante paginação. Caso um resultado incorreto exija ajuste técnico de consulta, resolvê-lo proporcionalmente sem introduzir sincronização em tempo real como requisito.

## 6. Gravação confirmada e repetição segura

Uma atualização visual não comprova persistência. Não limpar formulário, navegar como sucesso ou atualizar totais definitivamente antes de confirmação/reconciliação da gravação. Em resultado incerto, informar que a confirmação falhou e oferecer verificar/tentar novamente; não afirmar que nada foi salvo.

### Criação

**Desenho técnico recomendado, ajustável com prova equivalente:** gerar UUID uma vez por intenção de criação, reutilizando-o nos retries; permitir insert desse ID por migration incremental mínima, mantendo PK/RLS e impedindo atualização da identidade. O grant atual exclui `id`; portanto esse caminho exige migration nova, não alteração retroativa da migration aplicada da SPEC-001.

- Envelope operacional separa UUID do `TransactionInput`; payload usa DTO validado sem dono/criação fornecidos pela tela.
- Insert confirmado retorna a linha persistida. Se commit ocorreu mas a resposta se perdeu, consultar o UUID sob a mesma identidade antes de reemitir.
- Linha acessível com mesmos campos normalizados confirma a intenção; conflito de PK isoladamente não é prova de sucesso. UUID de outra conta não pode revelar/apropriar sua linha.
- Mesmo UUID com conteúdo diferente gera resultado de conflito/reconciliação, sem sobrescrita automática. Não usar upsert para transformar retry em atualização silenciosa.
- Bloquear duplo envio local por intenção; não gerar novo UUID em toda tentativa. Campos podem ficar preservados, mas editar uma intenção cujo resultado é desconhecido exige verificar o resultado anterior antes de tratar a edição como nova criação.
- A intenção pendente fica apenas em memória neste recorte; nenhuma fila em localStorage/AsyncStorage. Se o formulário/contexto for perdido após reload, reler o histórico e informar o resultado conhecido, sem reenvio automático com novo ID. Não prometer restauração de rascunhos após fechar o app.

Uma alternativa pode usar chave de operação própria e função transacional no banco, se necessária e proporcional; deve manter chave por usuário, conteúdo estável, RLS/permissões e retornar resultado autorizado. Não exige nova API própria. Escolher uma estratégia, registrar motivo e testá-la com resposta perdida **após commit real**; mock que só retorna timeout não comprova idempotência.

### Atualização e exclusão

Atualização incide no mesmo ID e não cria linha nova. Usar campos explícitos e verificar retorno afetado; resposta vazia não é sucesso garantido. Exclusão também deve verificar efeito ou reconciliar leitura autorizada após resposta incerta. ID arbitrário inacessível nunca gera confirmação fabricada de operação realizada.

Serializar mutações concorrentes sobre o mesmo ID no runtime; não aplicar resultado tardio sobre estado mais novo. Concorrência entre dispositivos não ganhará trava/merge de versões nesta etapa; não acrescentar comportamento de resolução de conflitos de produto por inferência. Se necessário além da segurança de retry, apresentar cenário e decisão concreta.

## 7. Estado financeiro, sessão e falhas

- Distinguir carregamento inicial, resultado completo, resultado vazio, erro de leitura com dados anteriores da mesma conta e mutação em andamento/erro/resultado incerto.
- Erro de leitura não apaga histórico já confirmado da mesma conta nem exibe coleção vazia como se fosse real. Mostrar estado desatualizado/erro e tentar novamente; nunca mostrar dados preservados de outra identidade.
- Preservar descrição/valor/categoria/data/intenção operacional em memória em falha de gravação. Rascunhos não são lançamentos salvos. Não oferecer uso offline dos dados preservados.
- Cancelar ou ignorar requisições ao sair/trocar conta. Comparar identidade e geração da consulta/operação antes de aplicar qualquer resposta; abort não desfaz commit já executado no servidor.
- Logout, troca de conta e recuperação restrita impedem visibilidade privada. Falha transitória da mesma conta não deve apagar rascunho silenciosamente; estruturar sua preservação sem enfraquecer o guard. Senha/token não fazem parte do estado financeiro.
- Usar o ciclo de sessão da SPEC-003: erros de JWT/sessão exigem revalidação/renovação adequada, sem cliente paralelo nem logout indiscriminado por qualquer falha de rede. Replay de criação sempre reutiliza a intenção estável.
- Releitura após mutação atualiza a consulta e respectivos totais, sem recarregamento manual da página. Falha nessa releitura não transforma uma gravação já confirmada em gravação inexistente: comunicar os resultados separadamente.

## 8. Integração mínima da interface

1. Migrar cadastro, lista e card atuais para domínio `Transaction`, IDs de categoria e centavos, conjuntamente. Adaptar/eliminar contrato antigo somente quando consumidores não dependerem dele; não dividir centavos por 100 para continuar somando no modelo legado.
2. Cadastro atual persiste despesa, com data efetiva hoje, validação existente do domínio, feedback web e botão bloqueado durante envio. Preservar campos/intenção em falhas; limpar/navegar após confirmação.
3. Lista mostra despesas persistidas do usuário, carregamento/erro/vazio adequados e total BRL correto. Identificar o escopo transitório de todo o histórico. Dados fictícios não são inseridos por botão de teste; remover/desativar esse caminho ao conectar o banco.
4. Renovação/logout/troca de conta continuam protegidos; entrada pelo outro método da mesma identidade relê o mesmo histórico.
5. Nenhuma importação silenciosa do estado experimental. Não manter memória como fonte alternativa quando o banco falhar; memória é só estado temporário de consulta/formulário.

Os fluxos visuais de receita, edição, excluir com confirmação e descarte de alterações permanecem na SPEC-005. As operações correspondentes nesta entrega serão exercitadas por testes controlados e não por botões experimentais enviados ao produto.

## 9. Sequência de implementação e dependências

1. Ler instruções/contexto/plano e SPEC-001–003; inspecionar estado atual e preservar alterações/contas humanas.
2. Definir repositório/erros, estado e estratégia de idempotência. Escrever migration incremental apenas se necessária; manter constraints, grants mínimos e RLS. Revisar/tests para identidade e retry precedem integração das telas.
3. Implementar categorias, leitura/consulta completa e CRUD com DTOs, sessão compartilhada e reconciliação.
4. Implementar provider/controller com geração/identidade, carregamento e limpeza. Testar respostas tardias, falhas e consultas incompletas.
5. Integrar cadastro/lista/card existentes ao domínio persistido, removendo fonte em memória/atalho de teste. Demonstrar despesa persistida no navegador real.
6. Executar provas Auth/API/banco com duas contas fictícias, limites de dados, filtros e valores. Induzir timeout após commit e demonstrar uma linha só.
7. Repetir regressões de Auth/tipos/exportação web e SQL. Executar reinício preservando dados em horário controlado, informar que interromperá serviço local e restaurar funcionamento; não usar reset/destruição de volumes.
8. Limpar somente fixtures desta execução por IDs/donos conhecidos e registrar `docs/validacoes/004-persistencia-financeira.md`. Atualizar contexto/plano/spec com entrega real e pendências para etapas 5–6 e Android.

## 10. Matriz de aceitação

| Caso | Prova e resultado esperado |
| --- | --- |
| P01 — Consulta/isolamento | JWTs reais de A/B: cada um lê somente seus lançamentos; anon negado pela API e estado de recuperação impede iniciar operações financeiras no aplicativo. Categorias autenticadas corretas; IDs inacessíveis não revelam outra conta. |
| P02 — CRUD | Criar receita/despesa, ler, editar campos permitidos e excluir pela camada de dados; dados retornados conferem com banco. ID/dono/criação não mudam. |
| P03 — Regras | Centavos/limites, categoria por tipo, descrição, data civil e proibição de futuro no cliente e banco; nenhum arredondamento silencioso. |
| P04 — Consultas/totais | Receita 10000 e despesa 3590: saldo 6410; só despesa: -3590. Mês/categoria/limites de mês e dono aplicados ao mesmo conjunto; precisão das somas reutilizada. |
| P05 — Dados completos | Histórico acima do limite de resposta API consultado sem perda/duplicação de linhas ou total truncado; ordem/paginação determinísticas. Falha intermediária não produz falso histórico completo. |
| P06 — Persistência real | Despesa pelo formulário → lista → reload → logout/login da mesma identidade → reinício preservando dados: mesma linha/valor/dono. Nenhum reset; contas humanas preservadas. |
| P07 — Retry após commit | Serviço grava, resposta é perdida, retry/reconciliação retorna a mesma linha; contagem final é uma. Mesma intenção com conteúdo divergente não sobrescreve linha; PK de outra conta não confirma sucesso. |
| P08 — Duplo envio | Cliques concorrentes não criam operações locais duplicadas. Resultado tardio de criação/update/delete não repopula outra conta ou substitui estado mais recente. |
| P09 — Rede/leitura | Serviço indisponível e leitura incompleta têm erro/tentar novamente; dados anteriores da mesma conta não desaparecem, nem erro é apresentado como zero. Sem cache/queue offline. |
| P10 — Gravação incerta | Falha antes do commit, timeout depois do commit e falha de releitura distinguidos; campos preservados e nenhum falso sucesso. Edição/exclusão também reconciliadas sem nova linha. |
| P11 — Sessão/identidade | Renovação e sessão inválida seguem Auth; logout/troca A→B e recuperação bloqueiam operações privadas. Resposta antiga de A não aparece em B. |
| P12 — Não autorizado | A não cria em nome de B, edita/remove B ou altera dono/ID/criação. SQL e API reais comprovam isolamento após qualquer migration incremental. |
| P13 — Integração web | Cadastro/lista/card de despesas usam contratos novos, feedback e formatação BRL; botão de teste não grava, campos sobrevivem a falha e consulta reflete sucesso confirmado. |
| P14 — Métodos vinculados | Mesma identidade Google/senha relê a mesma fixture financeira e dono, sem importar estado em memória ou criar histórico duplicado. Usar conta de teste/intervenção humana explicitada. |
| P15 — Regressão/limpeza | Testes proporcionais, `npm run typecheck`, exportação web, suíte Auth e SQL passam; fixtures limpas por IDs conhecidos, sem segredos em logs/bundle, sem alteração das contas humanas. |

Unitários verificam orquestração/erros/concorrência/DTOs, sem espelhar apenas implementação. Integração executa o repositório real com SDK/Auth/API locais e duas identidades; mocks não comprovam RLS, durabilidade ou commit antes de timeout. Provas de interface no navegador real cobrem cadastro/leitura, erros e sessão, não apenas um script de diagnóstico.

Dados de teste são fictícios e identificáveis; teste de volume não pode apagar histórico existente. Scripts administrativos limitam-se a criar/limpar fixtures no ambiente local e não entram no bundle. Não repetir login Google externo se uma sessão validada suficiente puder demonstrar o caso; solicitar interação humana somente quando a prova a exigir.

## 11. Critério de conclusão e continuidade

Concluir quando P01–P15 tiverem evidências no escopo desta etapa: CRUD completo na camada de dados e cadastro/lista de despesas persistidos na web. Marcar parcial se retry após commit, isolamento, leitura completa, falhas/sessão ou persistência real estiverem sem prova; nenhum número de testes isolado substitui critérios.

Etapas 5–6 permanecem necessárias para a V1: receitas/edição/exclusão/proteção de alterações na interface, consulta mensal/categoria e indicadores finais. Hosted/backup e Android/APK continuam no plano; aprovação local não comprova esses marcos.

Relato exigido: arquivos/dependências/migrations, estratégia de idempotência, critérios e testes executados, limites de UI, verificações não executadas e motivo, limpeza e próxima etapa. Esta spec não altera decisões aprovadas; escolhas técnicas rotineiras podem ser ajustadas com justificativa/evidência equivalente. Mudança significativa de produto/arquitetura exige confirmação.

## 12. Referências técnicas

Documentação oficial consultada para implementação, sem criar requisito de produto: [insert e retorno](https://supabase.com/docs/reference/javascript/insert), [paginação por intervalo](https://supabase.com/docs/reference/javascript/range) e [RLS/grants](https://supabase.com/docs/guides/database/postgres/row-level-security). Conferir APIs da versão SDK instalada; a idempotência acima é desenho técnico proposto e deve ser comprovada, não promessa automática do SDK.

## 13. Estado entregue — 08/10/2026

Repositório/erros/controller em `src/lib/transactions/`, provider financeiro adaptado e cadastro/lista/cards existentes integrados ao banco. Domínio, cliente público e Auth reutilizados, sem nova dependência. Migration incremental `20261008000100_transaction_intent_id.sql` aplicada sem reset: insert do UUID operacional, mantendo PK, RLS, defaults e imutabilidade de identidade.

UUID único por intenção, DTO sem dono/criação e consulta autorizada antes de retry. Somente mesmos campos confirmam; conteúdo divergente/UUID alheio não viram sucesso. Sem upsert. Mutação por ID serializada e respostas por identidade/geração; desconhecido preserva campos/UUID em memória. Consulta por cursor `(occurred_on,id)` termina só em página vazia, soma o conjunto completo e descarta leitura parcial. Não garante snapshot entre requisições ou sincronização automática externa.

JWT de cada requisição fixado ao dono validado, usando a sessão do cliente compartilhado e nova conferência da geração; troca real A→B durante resolução do SDK não atribui o rascunho antigo a B. Sem cliente/armazenamento Auth paralelo ou autorização por leitura local isolada.

P01–P15: aprovados no recorte e pelos métodos explicitados na [matriz de evidências](../validacoes/004-persistencia-financeira.md), incluindo commit real antes da resposta perdida e navegador real. Corrigidos sobreposição durante releitura, limpeza de operações privadas, data inicial do cadastro, mensagem obsoleta de falha após recuperação da consulta e altura zero da lista após reload. Duas contas humanas preservadas; fixture descartável criada pelo usuário e fixtures automáticas limpas por IDs/donos conhecidos.

37 testes normais; 38 com integração financeira, 38 com integração Auth; 63 SQL; tipos e exportação web aprovados. Sem pendência obrigatória desta etapa. UX completa de receitas/edição/exclusão/descarte/filtros, hospedado/backup e Android/APK continuam posteriores; V1 não concluída.
