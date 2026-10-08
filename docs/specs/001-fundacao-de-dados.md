# SPEC-001 — Fundação de dados financeiros

**Data:** 07/10/2026. **Estado:** concluída; migration aplicada e validação integrada aprovada no Supabase local.

**Etapa:** 1 — Modelo relacional e contratos do [plano de implementação](../PLANO_IMPLEMENTACAO.md).

**Fonte de requisitos:** [contexto aprovado](../CONTEXTO_APP.md), decisões D01–D11. Esta spec detalha a primeira entrega técnica, não toda a V1.

## 1. Objetivo e resultado esperado

Criar uma base consistente para receitas e despesas, com dinheiro em centavos, datas civis, categorias fixas e propriedade por usuário. Entregar contratos TypeScript, regras de domínio verificadas, migrations PostgreSQL compatíveis com Supabase e regras/testes de isolamento.

A entrega não torna o produto utilizável sozinha. Ela prepara ambiente, autenticação e persistência das etapas seguintes. Web continua sendo a primeira plataforma de validação do produto; APK Android permanece na entrega posterior.

**Autorização vigente:** solicitação expressa de implementar esta spec autoriza código, migrations e testes no seu escopo, substituindo a restrição documental anterior. A solicitação posterior de migração/testes autorizou preparar a stack local necessária. Não antecipar telas, autenticação do aplicativo, provisionamento hospedado ou demais entregas.

## 2. Base real e problema

Inspecionados nesta elaboração:

| Arquivo atual | Situação e implicação |
| --- | --- |
| `src/types/expense.ts` | `Expense` contém id/description/value/category/createdAt; valor em reais, categoria textual e sem usuário, tipo ou data efetiva. |
| `src/contexts/ExpensesContext.tsx` | Coleção em memória, adição e remoção; nenhuma integração com banco/autenticação. |
| `src/constants/categories.ts` | Seis categorias fixas de despesas; nenhuma de receitas. |
| `src/app/expenses/new.tsx` | Converte via `Number`; não garante precisão/limite/valor finito. |
| `src/app/index.tsx` e `src/components/ExpenseCard.tsx` | Consomem contrato atual e somam/exibem reais; não devem quebrar por substituição prematura do tipo. |
| `package.json` | Sem SDK Supabase, ferramenta de testes declarada ou banco configurado. |

Não há dados financeiros duráveis legados a migrar nesta entrega. O estado em memória é experimental. Dados/contas locais futuros serão apenas de teste e não serão transportados para avaliação hospedada.

## 3. Escopo desta entrega

1. Contratos de lançamento financeiro, rascunho validável, categoria e resultado de consulta/totais.
2. Conversão monetária textual exata, validação, formatação brasileira e soma/saldo em centavos.
3. Validação de data civil, período mensal e categoria coerente com o tipo.
4. Migrations versionadas para categorias e lançamentos, restrições e índices necessários às consultas aprovadas.
5. Propriedade por identidade do Supabase Auth e políticas de acesso por usuário no banco, com testes positivos/negativos.
6. Documentação das escolhas técnicas, mapeamento domínio/banco e evidências de validação.

**Fora desta entrega:** telas de login/CRUD/filtros; integração do provider com Supabase; sessão/Google/PKCE; servidor OAuth/API própria; provisionamento completo do ambiente; projeto hospedado; backups executados; build web/APK. Não antecipar etapas posteriores apenas porque compartilham arquivos.

Não incluir orçamento, contas financeiras, saldo inicial, parcelas, recorrência, múltiplas moedas, categorias personalizadas, fila offline ou exportação/importação de interface.

## 4. Requisitos de comportamento já aprovados

| ID nesta spec | Requisito | Origem |
| --- | --- | --- |
| R01 | Lançamentos de receita ou despesa; valor positivo. Tipo determina sinal no saldo. | D03/D04 |
| R02 | Somente BRL; 1 a 99.999.999 centavos por lançamento, inclusive. | D04 |
| R03 | Entrada inteira ou até duas casas com vírgula/ponto, sem separador de milhar; rejeitar zero, negativos, não finitos e excesso de casas, sem arredondar. | D04 |
| R04 | Data do gasto/recebimento separada do cadastro, hoje como padrão; hoje/passado, sem futuro. | D05 |
| R05 | Consulta mensal e por categoria; receitas, despesas e saldo calculados sobre o mesmo conjunto consultado. | D03/D05 |
| R06 | Categorias fixas distintas por tipo. | D06 |
| R07 | Dados vinculados ao usuário autenticado e inacessíveis a outra conta; Google/email-senha vinculados usam a mesma identidade. | D01/D10 |
| R08 | Supabase local/Docker com PostgreSQL; migrations reutilizáveis no Supabase hospedado. | D07/D09 |

Descrição não vazia já é regra do formulário existente e permanece na fundação. Limites adicionais de texto, período histórico ou quantidade de lançamentos não foram aprovados; não inventá-los como requisito.

## 5. Desenho técnico proposto

As escolhas abaixo são um ponto de partida técnico para implementar R01–R08, não novas decisões de produto. O implementador pode ajustar nomes/organização preservando os contratos e registrar justificativa. Não introduzir ORM, biblioteca de estado ou serviço próprio sem necessidade comprovada.

### 5.1 Contrato de domínio

Proposta de nomes TypeScript: `Transaction`, `TransactionInput`, `TransactionKind`, `Category` e `TransactionTotals`. Preservar convenções do projeto; domínio em camelCase e banco em snake_case, com conversão explícita.

| Campo do lançamento | Representação proposta | Invariante |
| --- | --- | --- |
| `id` | UUID como string; banco `uuid` | Identidade estável; não usar milissegundo como garantia de unicidade. |
| `userId` | UUID; referência à identidade em `auth.users` | Dono obrigatório; sessão define quem pode operar. |
| `kind` | `income` ou `expense` | Apenas dois tipos. |
| `description` | Texto | Rejeitar vazio/só espaços; normalização técnica documentada, sem truncar silenciosamente. |
| `amountCents` | Inteiro; TypeScript `number`, PostgreSQL `integer` | Intervalo R02; fronteiras de entrada não aceitam fração nem coerção silenciosa. |
| `categoryId` | Identificador estável | Categoria existe e pertence ao tipo do lançamento. |
| `occurredOn` | `YYYY-MM-DD`; PostgreSQL `date` | Data civil válida, não futura; não serializar como meia-noite UTC. |
| `createdAt` | ISO de instante; PostgreSQL `timestamptz` | Gerado pelo banco na criação, não confundido com data efetiva. |

Timestamps auxiliares, se tecnicamente úteis, são opcionais; não adicionar auditoria/histórico de versões como produto nesta etapa. DTO de entrada não deve permitir definir dono/arbitrariamente substituir identidade, ID ou instante de criação numa edição.

Google, senha e email não são identificadores de propriedade dos lançamentos. Não duplicar cadastro de credenciais no schema financeiro nem fundir históricos por comparação de emails.

### 5.2 Categorias

Proposta: catálogo relacional fixo com ID estável, tipo e nome de exibição; leitura para usuários autenticados, sem escrita pelo cliente. Inicializar por migration/dados de referência versionados, separadamente das fixtures de testes.

| Tipo | Nomes aprovados |
| --- | --- |
| Despesa | Alimentação, Transporte, Lazer, Saúde, Educação, Outros |
| Receita | Salário, Trabalho extra, Rendimentos, Outras receitas |

Garantir coerência tipo/categoria no banco, por exemplo com chave estrangeira composta para `(category_id, kind)` referenciando par único no catálogo. Alternativas equivalentes são permitidas se a rejeição de combinações inválidas for testada. Não depender somente de opções visíveis no formulário.

### 5.3 Dinheiro e consulta

Conversão deve partir dos dígitos e casas decimais, evitando interpretar reais em ponto flutuante e depois arredondar. Um inteiro textual representa reais; uma casa representa décimos de real; duas representam centavos. Documentar tratamento de espaços externos, zeros à esquerda e separador incompleto durante digitação; esses detalhes não podem permitir milhar, notação científica ou arredondamento não aprovados no salvamento.

Formatar em pt-BR/BRL sem mudar o valor armazenado. Retornar totais de receitas/despesas e saldo em centavos; conjunto vazio retorna zeros. Saldo negativo é resultado válido. O limite R02 é por lançamento, não limite do total: verificar faixa segura de agregações e conversão entre SQL/JSON/JavaScript, rejeitando perda silenciosa de precisão.

Período mensal pode usar limite inicial inclusivo e início do próximo mês exclusivo sobre `occurredOn`. Categoria restringe o conjunto antes de calcular indicadores. Total de receitas pode ficar zero numa consulta de categoria exclusiva de despesas, e vice-versa; não manter total global ocultamente.

### 5.4 Datas

Validar formato, existência no calendário e limite até hoje, incluindo anos bissextos. A regra deve existir no domínio e no banco/serviço, não apenas no futuro seletor.

Obter a referência de hoje por uma política consistente de dia civil/fuso entre cliente e camada persistente; não misturar dia local com truncamento UTC. A implementação deve definir e documentar essa política como detalhe técnico, mantendo o comportamento aprovado; se exigir mudar o significado de hoje por usuário, confirmar a mudança. Testes usam hoje fixo/injetável, sem depender do dia de execução.

Na migration, escolher mecanismo PostgreSQL adequado para validação temporal na escrita; documentar comportamento em insert/update e virada de dia. Não tratar uma verificação estática de schema como prova suficiente de uma regra dependente do relógio.

### 5.5 Schema, migrations e acesso

Proposta de localização: `supabase/migrations/` e testes SQL em `supabase/tests/`. Seguir convenções da versão Supabase usada quando a etapa de ambiente for executada.

- Referenciar a chave primária da identidade gerida pelo Supabase; não criar ou substituir tabelas internas de autenticação.
- Habilitar RLS e configurar grants mínimos nas tabelas expostas. Ausência de usuário autenticado impede acesso financeiro.
- Select/delete usam o dono da linha; insert/update também validam o dono da linha resultante. Uma atualização não pode transferir propriedade para outra conta.
- Restrições de campos/categoria/valor/data aplicam-se mesmo em acesso direto à API.
- Índice inicial coerente com dono e data efetiva; acrescentar categoria somente conforme necessidade real da consulta, sem otimização especulativa.
- Não criar view/RPC de totais que contorne isolamento. Esta etapa pode limitar-se ao contrato/função pura de totais; a consulta persistida entra na etapa 4.
- Fixtures contêm só usuários/lançamentos fictícios e não entram em migrations destinadas ao hospedado; catálogo fixo é dado de referência do produto e acompanha schema.

Regra de remoção da conta de autenticação não é funcionalidade desta spec; escolher comportamento referencial sem apagar dados por cascata implicitamente. Caso seja necessário um fluxo de exclusão de conta, levar ao refinamento antes de implementá-lo.

## 6. Compatibilidade e arquivos previstos

| Área | Localização candidata | Orientação |
| --- | --- | --- |
| Tipos novos | `src/types/transaction.ts` | Contratos do domínio sem substituir abruptamente `Expense`. |
| Regras puras | `src/domain/` | Dinheiro, datas, validação/categorias e totais; organização interna livre. |
| Catálogo tipado | `src/constants/` | Compartilhar IDs/rótulos com dados de referência do banco sem romper imports atuais. |
| Banco | `supabase/migrations/` | Schema, catálogo, constraints, grants, políticas e índices versionados. |
| Verificações | Arquivos de teste próximos do domínio ou diretório de testes; `supabase/tests/` para banco | Escolher ferramenta mínima compatível com ambiente existente. |

`Expense`, provider e telas podem coexistir temporariamente com o novo domínio. Não converter apenas o tipo e deixar o código somando centavos como reais. Integração/migração do fluxo experimental será feita na etapa pertinente, mantendo o app compilável.

Não criar `.env` com segredos, não alterar AGENTS.md e não editar arquivos externos ao escopo sem necessidade. Scripts/testes mínimos e devDependencies só entram na implementação se necessários, com justificativa e registro. A implementação utilizou TypeScript existente e o executor nativo do Node, sem novas dependências.

## 7. Sequência de execução

1. Reconfirmar instruções locais, estado dos arquivos e ferramentas existentes; preservar mudanças do usuário.
2. Implementar contratos novos e regras puras, com os testes de comportamento abaixo.
3. Escrever migrations e dados de referência; preparar grants/RLS e testes de isolamento sem telas de login.
4. Executar tipos/testes de domínio. Aplicar migrations e testar banco no Supabase local quando o ambiente estiver disponível.
5. Rever compatibilidade dos consumidores atuais e conferir que nenhum requisito adiado entrou.
6. Atualizar contexto/plano/spec com arquivos entregues, evidências e limitações, distinguindo código escrito de testes executados.

**Dependência de validação:** o provisionamento completo do ambiente é etapa 2 do plano. Se Supabase local ainda não estiver disponível, entregar os artefatos desta etapa e registrar testes SQL pendentes; não declarar schema/RLS validados. A validação integrada é obrigatória ao preparar o ambiente, antes de dados reais e integração financeira. Não substituir teste real por mocks que apenas reproduzem a política.

## 8. Matriz de validação

Os dados são exemplos de teste, não dados reais. IDs dos casos devem aparecer no relato de verificação ou documentação equivalente.

| Caso | Entrada/cenário | Resultado esperado |
| --- | --- | --- |
| M01 | `40`, `32,50`, `32.50`, `0,1` | 4000, 3250, 3250 e 10 centavos. |
| M02 | `0,01` e `999999,99` | Limites aceitos; 1 e 99.999.999 centavos. |
| M03 | `0`, negativo, vazio, `Infinity`, `NaN`, `1e3`, `1.250,50`, `1,234`, `1000000` | Rejeitar; sem valor convertido/arredondado silenciosamente. |
| M04 | 3590 + 2250 + 4000; 10 + 20 | 9840 e 30 centavos. |
| M05 | Receita 10000, despesa 3590; apenas despesa 3590; vazio | Saldo 6410, -3590 e 0; indicadores coerentes. |
| M06 | Total válido maior que 99.999.999 centavos | Não aplicar teto por lançamento à soma; preservar precisão. |
| D01 | Hoje fixo 2026-10-07; hoje/passado/2026-10-08 | Aceitar hoje/passado e rejeitar futuro em cadastro/edição. |
| D02 | 2024-02-29; 2025-02-29; 2026-02-30 | Validar ano bissexto e rejeitar datas inexistentes. |
| D03 | Primeiro/último dia de mês e primeiro dia do seguinte; dezembro/janeiro | Consulta inclui só o mês correto, sem deslocar o dia pelo fuso. |
| C01 | Receita com categoria de despesas; categoria inexistente | Rejeitar domínio e banco; catálogo tem as dez opções aprovadas. |
| V01 | Descrição só espaços; inteiro de centavos fora de faixa/fração | Rejeitar no domínio e camada persistente apropriada. |
| A01 | Sem sessão: select/insert/update/delete de lançamentos | Negar acesso; não vazar dados pela API. |
| A02 | Usuário A opera seus lançamentos | CRUD permitido segundo grants/políticas. |
| A03 | A lê/edita/remove linha de B por ID; insere em nome de B; transfere dono | Não retorna dados de B nem efetiva alteração; tentativas de escrita inválidas não persistem. |
| A04 | A tenta inserir/alterar/remover categorias | Impedir personalização; leitura autenticada permitida. |
| S01 | Aplicar sequência de migrations numa instância local vazia | Schema, catálogo e políticas presentes sem edição manual. |
| S02 | Fixtures locais e artefatos destinados ao hospedado | Somente schema/catálogo vão ao destino; nenhum usuário/lançamento fictício embutido. |

Testes de acesso devem executar com papéis/sessões de usuário/anon, não apenas como administrador que ignora RLS. Google e email/senha compartilhando a identidade são política do produto; teste ponta a ponta de vínculo entra na etapa de autenticação, não é simulado como prova nesta fundação.

## 9. Critérios de conclusão e relato

- [x] Contratos abrangem R01–R08 e diferenciam rascunho/dado persistido/identidade.
- [x] Regras monetárias, de calendário, categorias e totais passam pelos casos pertinentes.
- [x] Migrations e catálogo versionados; isolamento/grants e validações persistentes escritos.
- [x] Tipos/consumidores atuais permanecem compatíveis, sem integração parcial de unidades monetárias.
- [x] Migration aplicada numa stack Supabase local nova (S01), **53 testes SQL aprovados**, inclusive A01–A04, com repetição após reinício preservando dados. S02 confirmado por artefatos e ausência de fixtures após rollback; aplicação hospedada fora do escopo.
- [x] Nenhuma tela/infraestrutura hospedada/funcionalidade fora do escopo foi entregue implicitamente.
- [x] Contexto, plano e esta spec refletem resultado real e comandos/resultados das verificações, sem segredos.

### Evidência e decisões da implementação

Entregues `src/types/transaction.ts`, `src/constants/transactionCategories.ts`, regras em `src/domain/{money,dates,transactions}.ts`, migration `supabase/migrations/20261007000100_financial_foundation.sql`, testes `tests/domain.test.cjs` e `supabase/tests/001_financial_foundation.test.sql`. Instruções/mapeamento detalhados em [supabase/README.md](../../supabase/README.md).

Rotinas técnicas: dinheiro convertido por dígitos/BigInt; espaços externos/zeros à esquerda aceitos, separador incompleto rejeitado; descrição aparada nas extremidades, sem truncamento; hoje em `America/Sao_Paulo` no cliente/banco, trigger por comando insert/update com `statement_timestamp()`; tipos/categorias ligados por FK composta; identidade Auth com RESTRICT, grants mínimos e RLS por dono. DTO de escrita exclui identidade/dono/criação; agregações puras verificam precisão segura. Não há consulta de rede/RPC de totais nem integração de autenticação.

Executado em 07/10/2026, Node 26.7.0 e TypeScript instalado no projeto: `npm test` passou **11 testes**, cobrindo M01–M06, D01–D03, C01/V01, formatação BRL, mapeamento DTO e consistência do catálogo/separação de fixtures S02. `npm run typecheck` passou após restringir inclusão aos fontes da aplicação/tipos Expo; o template ignorado `example/` apresentava erros preexistentes de aliases. Nenhuma dependência nova; testes compilam domínio em pasta temporária e usam `node:test`. Fluxo experimental preservado.

### Validação integrada concluída após iniciar Docker

CLI oficial **2.120.0** via npx, Docker Engine **29.8.1**, imagem PostgreSQL **17.11.0.004**, servidor **17.11**, pgTAP disponível **1.3.3**, pg_prove **3.36**. `init` gerou configuração local; `start` aplicou `20261007000100_financial_foundation.sql` em uma stack nova. `migration up --local` confirmou ausência de migrations pendentes. `test db` aprovou **53 testes** sob papéis anon/authenticated, cobrindo A01–A04, constraints, categorias, datas/consulta e integridade referencial. Quatro CTEs de escrita dos testes foram corrigidos para o nível principal; migration inalterada.

Configuração em `supabase/config.toml`: confirmação de email habilitada, seeds desabilitados. Analytics opcional desabilitado após falha de acesso TCP do coletor Vector ao Docker Desktop. `stop` preservou dados (`backup: true`); `start` retomou o banco, e os **53 testes passaram novamente** na configuração final. Conferência final: migration registrada, **10 categorias, 0 lançamentos, 0 usuários Auth**, sem fixtures persistidas (S02). Nenhum mock/substituto de Auth, reset, exclusão de volumes ou recurso hospedado foi utilizado. Outros projetos Docker preservados.

`npm test` (11 testes) e `npm run typecheck` repetidos com sucesso. Evidência detalhada e limites em [validação local](../validacoes/001-supabase-local.md); reprodução em [supabase/README.md](../../supabase/README.md). Isolamento validado **no banco**, sem afirmar login/vínculo/sessão/API integrada do aplicativo. Não houve teste esperando a virada real de meia-noite no PostgreSQL; fronteira de fuso verificada com relógio injetável no domínio. Etapa 2 parcialmente iniciada, sem declarar `.env`/SDK/callbacks/Android/backup operacional concluídos. `git diff --check` passou fora do sandbox após falhar dentro dele por erro de work tree; logs temporários e chaves de assinatura estão ignorados.

Relato da implementação: o que mudou, escolhas técnicas relevantes, verificações executadas/resultados, verificações não executadas e motivo, riscos/pendências e próxima etapa. Não afirmar a V1 concluída a partir desta entrega.

## 10. Referências técnicas

Documentação oficial consultada ao escrever a spec: [RLS, grants e testes no Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security), [identidades e dados de usuário](https://supabase.com/docs/guides/auth/managing-user-data) e [migrations de banco](https://supabase.com/docs/guides/deployment/database-migrations). Conferir a versão efetivamente utilizada ao implementar. Essas referências sustentam o desenho técnico; requisitos de produto vêm do contexto aprovado.
