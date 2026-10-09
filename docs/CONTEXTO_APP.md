# Contexto do app de controle financeiro

**08/10/2026 — gráficos ao rolar:** animação autorizada começa com25% do gráfico visível e repete ao reentrar; movimento reduzido completo. Sem alterar consulta/regras ou dependências. [Evidências](validacoes/017-graficos-ao-rolar.md): web320/390/1280, barras/anel/reentrada/redução e tipos/exportação. Android/zoom/sensação pendentes; sem publicação.

**08/10/2026 — navegação contínua:** usuário solicitou próxima tela visível durante arraste. Páginas reais lado a lado, sem fade ou intervalo branco; barra fixa, limites sem circular, redução de movimento e controles inativos preservados. Substitui transição013; reutiliza snapshots autorizados sem novas consultas. [Evidências/limites](validacoes/015-pager-continuo.md). Web320/390/1280,53 testes/tipos/exportação aprovados. Aparelho/performance nativa/zoom/aceite da sensação pendentes; sem publicação.

**08/10/2026 — Minha conta:** nova iteração autorizada pelo usuário, User Profile Community como exemplo. Identificação centralizada, lista Google/senha e sessão implementadas localmente; ações Auth preservadas. Supera a exclusão histórica desta tela do recorte anterior, sem novas funções ou expansão geral. Web320/390/1280, email longo, teclado/estados e tipos/exportação conferidos. [Evidências/limites](validacoes/014-refinamento-minha-conta.md). Aceite visual, zoom/aparelho e nova execução integrada Auth pendentes; sem publicação.

**Adendo de movimento,08/10/2026:** usuário solicitou animação após validar gesto na8081. Implementado arraste do conteúdo, retorno curto/cancelado e saída/entrada lateral com barra fixa; redução de movimento compartilhada com gráficos. Revisão web320/390/1280 conferiu progresso, direções, interrupção, dois dedos e preferência durante gesto;53 testes,tipos/exportação12rotas aprovados. [Evidências/limites](validacoes/013-transicao-lateral-piloto.md). Prévia8081 mantida; Android/zoom/aceite da sensação pendentes. Sem publicação ou expansão além do adendo autorizado.

**Desenvolvimento/integração do piloto,08/10/2026:** continuação autorizada; implementação já presente nas rotas conferida com sessão real email/senha e Supabase local em contas descartáveis. Filtro→lista→edição, criação/exclusão, descarte, retorno, restauração e saída aprovados. Corrigido “Cancelar e voltar à lista” para `/transactions`, preservando confirmação. Fixtures removidas e dados humanos preservados;53 testes,tipos/exportação12rotas aprovados. [Prova/limites](validacoes/012-workflow-real-piloto.md). Resolve pendência de workflow básico real; zoom/Android/leitor de tela e aceite visual permanecem. Escopo fechado e Minha conta sem refinamento adicional.

**Escopo do piloto fechado pelo usuário em 08/10/2026:** recorte entregue localmente inclui Início (resumo e gráficos semanal/categorias animados e interativos), Lançamentos (lista/filtros/edição) e navegação principal por barra Phosphor/gesto. Minha conta recebeu somente a navegação, preservando composição e ações anteriores; seu refinamento visual fica para outra iteração, assim como a expansão geral. Encerramento do escopo não comprova validações ainda pendentes nem autoriza publicação. [Registro do fechamento](validacoes/011-navegacao-principal.md#fechamento-do-escopo).

**Navegação do piloto,08/10/2026:** barra inferior com Phosphor e gesto lateral autorizados/implementados entre Início, Lançamentos e Minha conta. Lista movida para `/transactions`, mantendo consulta compartilhada e sessão protegida; formulários sem barra/gesto e proteção existente preservada. Web320/390/1280 e toque emulado conferidos; 53 testes,2 checks de exportação, tipos e12rotas aprovados. Sem publicação. [Evidências/limites](validacoes/011-navegacao-principal.md). Composição, sessão real e Android pendentes.

**Interações do piloto, 08/10/2026:** sugestões autorizadas e implementadas localmente: valores ao selecionar semana, filtro pelo anel/legenda, limpeza próxima e resumo compacto. Modo preservado após consulta; filtros do gráfico respeitam contexto confirmado em caso de erro. 53 testes, tipos, exportação e revisão web320/390/1280 aprovados com dados fictícios. Sem publicação. [Evidências/limites](validacoes/010-interacoes-piloto-inicial.md). Workflow completo em sessão real, aceite humano e expansão geral pendentes.

**Continuação do piloto, 08/10/2026:** usuário aprovou manter Por semana/Por categoria e solicitou entradas animadas. Barras sobem da base; anel se preenche no sentido horário; movimento reduzido mostra resultados completos. Implementação local validada na web320/390/1280 e tipos/exportação, sem publicação. Substitui pendência de escolher somente uma representação; workflow integrado/zoom/Android/expansão geral permanecem pendentes. [Evidências](validacoes/008-piloto-overview-figma.md#animação-de-entrada-e-manutenção-das-duas-visualizações).

**Piloto visual da inicial, 08/10/2026:** usuário autorizou adaptar My Balance/Analytics do Figma e comparar gráficos semanais/categorias na consulta existente. Implementação local em validação, sem publicação: Jade/Manrope preservadas; gráficos do mês/categoria/resultados confirmados; filtro expansível e ação de lançamento em destaque. Amplia a exclusão anterior de gráficos somente para este piloto, sem aprovar expansão geral. [Evidências/limites](validacoes/008-piloto-overview-figma.md). Aceite humano, workflow integrado e zoom real da nova composição pendentes.

Atualizado em **08/10/2026**. SPEC-001–004 concluídas no marco local pertinente. **SPEC-005 implementada e validada na web local:** cadastro de receitas/despesas com data efetiva, edição pelo card/URL, exclusão confirmada, proteção de alterações, operações congeladas/reconciliação e lista transitória dos dois tipos. F01–F14 comprovados por unidades, SDK/Auth/API/banco/Mailpit e navegador real; Firefox confirmou refresh, fechar, voltar e zoom. 45 testes normais, 46 financeiros, 46 Auth, 63 SQL, tipos e exportação aprovados. Contas humanas e dados anteriores preservados; fixtures removidas sem reset. **SPEC-006 concluída na web local:** Q01–Q06 comprovados, zoom real 200% confirmado manualmente pelo usuário; 50 testes financeiros, tipos e exportação web aprovados, fixtures limpas. [Evidências Q01–Q06](validacoes/006-consulta-mensal-e-filtros.md). Hospedado/backup e Android/APK permanecem posteriores; V1 não concluída. Evidências: [fundação](validacoes/001-supabase-local.md), [ambiente](validacoes/002-ambiente-integracao-supabase.md), [Auth](validacoes/003-autenticacao.md), [persistência](validacoes/004-persistencia-financeira.md) e [formulários F01–F14](validacoes/005-formularios-e-protecao-de-alteracoes.md).

## Hospedagem aprovada em 08/10/2026

**Continuidade:** usuário criou e abriu o Supabase `tgfdihnemrseyifvfwan` (Ez Finance), ativo em `us-east-1`. Leitura remota confirmou tabelas financeiras ausentes e zero contas Auth. Ambiente público de produção configurado em arquivo ignorado; exportação hospedada de 11 rotas aprovada, sem segredos de servidor conhecidos no scan focal de 13 artefatos. Nenhuma migration remota aplicada/publicação executada. Usuário confirmou Firebase `ez-finance-7c789` como projeto separado para Hosting; `.firebaserc` atualizado. OAuth permanece em `ez-finance-511001`. Plano Supabase Free confirmado; login das ferramentas locais ainda pendente. [Estado e limites](HOSPEDAGEM.md).

**Registro da preparação inicial (destino atualizado no parágrafo acima):** projeto Google inicialmente informado `ez-finance-511001`; `firebase.json` para exportação estática, edição por ID, headers e hook de exportação protegido contra endpoint local. Conta Supabase criada pelo usuário; projeto remoto ainda pendente. Tipos, exportação local e proteção de publicação aprovados; rotas HTTP conferidas no emulador. Headers e execução completa no destino permanecem pendentes. [Roteiro e evidências](HOSPEDAGEM.md). Sem publicação ou migrations remotas executadas. SMTP próprio necessário para emails de avaliadores fora da equipe.

O usuário confirmou baixo volume esperado de usuários, prioridade de custo zero e a stack **Firebase Hosting para a web + Supabase hospedado no plano gratuito para PostgreSQL/Auth**. Atualmente, apenas OAuth está configurado no projeto Google; nenhum serviço hospedado foi informado. Manter Google OAuth e a arquitetura Supabase existente; Firebase Hosting não implica adotar Firebase Auth ou Firestore. A decisão orienta a implantação para avaliação, sem aprovar lançamento público web por inferência.

Implantação ainda pendente: projetos/endereços de destino, configuração de Hosting e rotas diretas, migrations/RLS, callbacks Google/email, envio de emails e cópia/restauração testada antes de dados reais. Não importar contas/lançamentos locais. Custo zero depende das cotas dos planos gratuitos; não habilitar planos pagos automaticamente. Pausa por inatividade e ausência de backups automáticos no Supabase gratuito exigem procedimento próprio, com frequência/cobertura ainda a definir. Nenhum recurso externo criado nesta decisão.

Compatibilidade: o Expo exporta a web para hospedagem estática; o projeto usa `expo.web.output: static` e `npm run build:web`. Configuração efetiva e rotas com IDs precisam de validação no destino antes de declarar implantação pronta. Fontes: [publicação web do Expo](https://docs.expo.dev/guides/publishing-websites/), [Firebase Hosting](https://firebase.google.com/docs/hosting/), [planos Supabase](https://supabase.com/pricing).

## 1. Fontes e estados

Recorte visual — [SPEC-007](specs/007-refinamento-visual-das-telas-existentes.md). Piloto Jade aprovado explicitamente em 08/10/2026; fase B aplicada ao cadastro e overview, com coesão nos demais consumidores. Manrope 400/600/700 carregada uma vez na raiz, inclusive textos, campos, botões e cabeçalhos. Tokens e Text/Button compartilhados em `src/components/VisualSystem.tsx`, primitivos em `src/constants/jade.ts`; AuthPanel/AuthField, FlatList, cards, formulário e Modal existentes preservados. Sem dependência/rota/funcionalidade nova. Unidades 49/49, Auth 50/50, finanças 50/50, tipos e exportação web aprovados; teclado, estados, conteúdo longo e 320/390/1280 conferidos. Zoom 200% validado manualmente pelo usuário nesta execução. **Entrega parcial: R03 mantém limite de contraste não textual das bordas Jade 7–8; R01/R02/R04 comprovados.** [Evidência](validacoes/007-refinamento-visual.md). Android/aparelho, hospedado/backup e V1 continuam posteriores.

Entrega concluída na web local: [SPEC-006 — Consulta mensal e filtro de categoria](specs/006-consulta-mensal-e-filtros.md). Mês/categoria e contexto solicitado/confirmado no controller existente; Q01–Q06 validados no navegador/unidades/integração financeira e zoom real 200% confirmado manualmente pelo usuário. Não inclui redesign completo, gráficos, hosted ou APK.

Base visual: [docs/design/README.md](design/README.md). Em 08/10/2026 foram organizadas as capturas Buddy/Mobbin e a referência complementar M01 para entrada/cadastro e overview. Manrope e Phosphor foram aprovadas; Mobbin serve apenas como inspiração estética. Jade/hierarquia e composição do piloto foram aprovadas posteriormente; consolidação da SPEC-007 descrita acima. Kit amplo, tema escuro e identidade de instalação não foram aprovados. Essa organização não conclui specs funcionais nem altera o aplicativo.

O contexto anterior veio da conversa **Ideias de apps React Native**, ID `6aa406da-c250-83e9-9eaf-a05e8ecbd8bd`. Seu histórico acessível começava após a primeira parte do desenvolvimento e incluía testes relatados do formulário e um aviso `GO_BACK`. A concepção anterior continua sem documentação recuperada.

Esta auditoria substitui as lacunas anteriores sobre código, provider, Dashboard, categorias e navegação. Código encontrado não equivale a execução validada ou aprovação de requisitos da primeira versão.

- **Existe:** identificado no código, sem teste de execução nesta etapa.
- **Incompleto:** apenas parte do fluxo está implementada.
- **Planejado:** intenção anterior, sem implementação encontrada.
- **Sugestão:** recomendação ainda não confirmada.
- **Aprovado:** escolha expressa do usuário, registrada abaixo.
- **Em aberto:** nenhuma resposta conclusiva; silêncio não aprova sugestões.

## 2. Objetivo e público

O projeto começou como registro de despesas em React Native, Expo e TypeScript. O refinamento atual busca definir uma primeira versão utilizável de controle financeiro.

**Aprovado:** público de outras pessoas, em uso individual. Validação primeiro via web; depois entrega de APK Android, sem exigir publicação em loja. Login e autenticação são requisitos obrigatórios e não negociáveis. Web é o primeiro ambiente de teste; isso não aprova um lançamento público web ou suporte a iOS. Após testes locais fictícios, a avaliação com outras pessoas usa Supabase hospedado; o APK permanece na entrega posterior.

**Escopo aprovado:** cadastro, lista, edição, exclusão, total, filtro por categoria e persistência, com receitas e saldo do período. Orçamento adiado. BRL em centavos inteiros, de R$ 0,01 a R$ 999.999,99 por lançamento; entrada sem separador de milhar, com vírgula ou ponto decimal e até duas casas, rejeitando zero, negativos e não finitos sem arredondamento silencioso. Data efetiva editável, hoje como padrão, separada do cadastro; somente hoje ou datas passadas, sem lançamentos futuros na V1. Dashboard no mês atual, navegação entre meses e totais acompanhando filtros; saldo = receitas menos despesas da consulta, sem saldo bancário inicial.

## 3. Comparação com a implementação real

| Item | Contexto anterior | Inspeção atual |
| --- | --- | --- |
| Context/provider | Conclusão relatada; arquivo não conferido | **Persistido:** provider/controller financeiro estável; consulta/mutações sob sessão validada, gerações e limpeza por identidade. |
| Cadastro | Testes relatados | **Validado na web:** receita/despesa, categorias por tipo, centavos, data editável até hoje, confirmação/retry e preservação dos campos. |
| Retorno após salvar | `replace` sugerido, não confirmado | **Validado na web:** retorno após gravação confirmada; falha incerta mantém cadastro. |
| Dashboard | Planejado | **Consulta mensal implementada:** lista e receitas/despesas/saldo do mês/categoria confirmados; navegação e retry com contexto. Zoom Q06 confirmado manualmente pelo usuário. |
| Card/estado vazio | Planejados | **Existem:** `ExpenseCard` e mensagem de coleção vazia. |
| Exclusão | Possibilidade mencionada | **Validada na web:** diálogo cancelar/confirmar, remoção autorizada e reconciliação de timeout pós-commit, sem segundo DELETE. |
| Detalhes | Possibilidade mencionada | **Decisão técnica executada:** rota `[id].tsx` usada para editar; nenhuma tela adicional de detalhes. |
| Edição | Não confirmada | **Validada na web:** card/teclado/URL, baseline autorizada, edição de tipo/categoria/valor/data sem trocar ID/dono/criação. |
| Filtro de categoria | Planejado | **Implementado:** seleção única entre dez categorias e Todas; mantém mês e acompanha indicadores. |
| Persistência | AsyncStorage planejado | **Implementada:** Supabase como fonte; durabilidade/isolamento/commit real comprovados. |
| PostgreSQL/Docker/Supabase e autenticação | Nova decisão deste refinamento | **Fundação/cliente/Auth implementados:** marco web da SPEC-003 validado, Google externo e vínculo nos dois sentidos. Android posterior; CRUD financeiro autenticado de rede entregue na SPEC-004. |
| Formatação brasileira | Sugerida | **Integrada:** formatBRL do domínio em centavos. |
| Data efetiva e período | Em aberto | **Data editável validada:** hoje padrão, passado permitido, futuro/calendário inválido rejeitados; recorte mensal/categoria implementado. |
| Interface de uso cotidiano | Experimental | **Formulários validados:** confirmações web, descarte/back/refresh, isolamento entre abas e erro/reconciliação; consulta mensal validada com zoom Q06 confirmado pelo usuário e refinamento visual posterior. |
| Receitas/saldo/orçamento | Não definidos | **Receitas editáveis na web:** lista/totais do mês/categoria; saldo do conjunto, orçamento adiado. |

## 4. Stack e estrutura conferidas

Versões declaradas: Expo `~57.0.22`, React Native `0.86.3`, React `19.2.3`, Expo Router `~57.0.21` e TypeScript `~6.0.3`. Conferidos nesta entrega Expo 57.0.22, React Native 0.86.3 e SDK `@supabase/supabase-js` 2.117.3 instalado. Interface com componentes nativos/StyleSheet; estado financeiro com Context/hooks.

```text
src/
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   └── expenses/
│       ├── new.tsx
│       └── [id].tsx       # edição protegida pelo ID
├── components/ExpenseCard.tsx
├── constants/categories.ts
├── contexts/ExpensesContext.tsx
├── config/             # ambiente público e validação Supabase
├── lib/supabase.ts     # entrada única do cliente
├── lib/supabase/client.ts
├── domain/             # regras da SPEC-001
└── types/              # expense legado e transaction novo
```

`tsconfig.json`: modo estrito, alias `@/*` para `./src/*` e alias de assets. `app.json`: retrato, nome `ez-finance`, esquema `ezfinance`, configurações Android/iOS e saída web estática. Essas configurações não confirmam suporte testado. Aparência automática na configuração não comprova tema escuro nas telas.

Scripts de iniciar Expo/Android/iOS/web agora validam configuração pública antes de empacotar; web fixa localhost:8081. `build:web` exporta com a mesma proteção. O reset legado aponta para `scripts/reset-project.js`, ausente e não executado; configuração de lint continua ausente. `test`/`typecheck` abrangem domínio e preparação Supabase. README raiz orienta para [ambiente](AMBIENTE_SUPABASE.md); fundação em `supabase/README.md`.

## 5. Modelo atual e comportamento

O fluxo ativo usa `Transaction`/`TransactionInput`, categoria por ID, UUID operacional, dono autenticado, `amountCents`, `occurredOn` civil e `createdAt` imutável. Os contratos legados de despesas não são a fonte ativa dos lançamentos e nenhum registro experimental foi importado.

`src/lib/transactions/repository.ts` consulta catálogo e histórico, CRUD autenticado e filtros técnicos de mês/categoria/tipo. Ordenação por data e ID, paginação por cursor até página vazia e totais do conjunto completo; API continua limitada a 1.000 linhas por resposta. Leituras múltiplas não prometem snapshot entre dispositivos; repetir consulta para incorporar alterações externas.

`FinanceController` preserva rascunho/intenção apenas em memória durante falha da mesma conta, oculta dados sem sessão validada, invalida respostas obsoletas e limpa estado/memória de operações ao sair, trocar identidade ou entrar em recuperação. Não há fila offline nem cache financeiro persistente.

### Formulários e lista transitória da SPEC-005

Formulário compartilhado com seletor receita/despesa, descrição, valor textual sem milhar, categoria coerente e data civil editável. Hoje inicializado uma vez; trocar tipo limpa categoria. Validação por campo mantém entradas/foco. Edição lê registro autorizado, mostra loading/erro/retry/ausente e preserva ID/dono/criação. Exclusão identifica registro salvo, confirma e só retorna após resposta/reconciliação; cancelar mantém alterações sem DELETE.

Controller do formulário mantém baseline, versão e dono. Dirty inclui texto inválido e todos os campos; valores válidos equivalentes não geram aviso falso. Saída voluntária pede continuar/descartar, sem autosave; operações em andamento bloqueiam concorrência até resultado/timeout. Resultado incerto ou conflito mantém payload/UUID bloqueados, verifica antes de repetir e avisa commit possível ao sair. Falha da consulta depois de commit confirmado tem mensagem separada.

Beforeunload deriva do snapshot (compatível com React Compiler), ativo só quando necessário. Proteção de popstate complementa a navegação interna do Expo. Firefox comprovou F5/fechar/voltar; navegador controla aviso, não há proteção contra encerramento forçado nem restauração persistente de rascunho. Ao bloquear travessia, a âncora pode substituir a ramificação adiante do histórico. Segurança Auth prevalece: logout externo/recuperação/troca de dono removem campos/diálogos privados, inclusive com leitura antiga em trânsito.

Lista virtualizada mostra os dois tipos, categoria/data/valor e receitas/despesas/saldo do **mês/categoria confirmados**. Seleção em memória sobrevive ao CRUD da mesma conta e é reiniciada em logout/troca de dono. Loading oculta resultados; erro conserva a última consulta completa com contexto e aviso, sem falso zero; retry usa seleção atual. `expenses/new` e `expenses/[id]` preservados. SPEC-006 implementou recorte mensal/categoria, com zoom Q06 confirmado manualmente pelo usuário; hosted/backup e Android/APK posteriores. [Provas e limites F01–F14](validacoes/005-formularios-e-protecao-de-alteracoes.md).

### Persistência e acesso aprovados para a primeira versão

- Banco de dados relacional **PostgreSQL via Docker no desenvolvimento**, com migração posterior para **Supabase**.
- Endereços e configurações correspondentes geridos por variáveis em **`.env`**.
- **Login e autenticação obrigatórios, não negociáveis.** Google via Supabase Auth usa **OAuth 2.0 Authorization Code Flow com PKCE** como opção principal; cadastro/login por email e senha via Supabase Auth é a opção secundária, em fluxo distinto do OAuth Google. Confirmação de email, reenvio e recuperação por link estão aprovados.
- Categorias fixas: despesas — Alimentação, Transporte, Lazer, Saúde, Educação e Outros; receitas — Salário, Trabalho extra, Rendimentos e Outras receitas. Categorias personalizadas ficam para depois.
- Tocar no lançamento para editar, confirmar exclusão, avisar ao sair com alterações não salvas e impedir salvamentos duplicados.
- Em falha de gravação, preservar alterações para tentar novamente; em falha de carregamento, preservar os dados e oferecer nova tentativa, sem apagar o histórico.

**Modo offline explicitamente adiado:** a V1 depende de conexão com os serviços para autenticar, consultar e persistir alterações; em falhas, preservar alterações para nova tentativa. Não incluir fila de sincronização offline. Exportação/importação pela interface foram adiadas; cópia e restauração do banco, com procedimento testado antes de dados reais, são obrigatórias; API própria não foi aprovada. O ambiente Docker é de desenvolvimento; o acesso do Android deve ser validado no ambiente escolhido.

### Limites técnicos e implementação futura

O cliente móvel acessará os dados pelos serviços da arquitetura Supabase aprovada; integração OAuth e autorização por usuário devem ser concretizadas e verificadas na implementação. Senhas do PostgreSQL e chaves administrativas pertencem ao ambiente de servidor, não ao aplicativo distribuído. Variáveis públicas do Expo são incorporadas ao aplicativo; `.env` configura ambientes, mas não torna essas variáveis secretas. Na etapa de ambiente, documentar variáveis exigidas em `.env.example` sem valores sensíveis e manter credenciais reais fora do versionamento. A SPEC-001 entrega schema/regras/testes; provisionamento completo pertence à etapa 2.

**Decisão aprovada:** usar a stack local do Supabase via Docker desde o desenvolvimento, com PostgreSQL e serviços locais, e depois migrar para Supabase hospedado. A alternativa de PostgreSQL isolado com API própria não foi escolhida. Supabase Auth intermediará o login Google; servidor OAuth próprio não foi escolhido. A opção secundária é cadastro/login por email e senha via Supabase Auth, já aprovada. Não presumir que apenas trocar o endereço migrará schema, políticas, dados ou contas.

O acesso individual exige associar os lançamentos ao usuário autenticado e verificar autorização no servidor/banco, além da tela de login. O mecanismo de isolamento (por exemplo, políticas por linha no Supabase) deve ser concretizado e testado na arquitetura aprovada. Consultas, alterações e totais devem respeitar esse limite.

Fontes técnicas consultadas para estas recomendações: [desenvolvimento local do Supabase](https://supabase.com/docs/guides/local-development), que inclui PostgreSQL e Auth na stack local, e [variáveis de ambiente do Expo](https://docs.expo.dev/guides/environment-variables/), sobre configuração e visibilidade de variáveis públicas. As fontes não representam aprovação do usuário.

## 6. Decisões aprovadas da primeira versão

Todas as decisões abaixo foram confirmadas pelo usuário em **07/10/2026**. Elas definem comportamento futuro; não mudam o estado de implementação descrito na auditoria.

| ID | Tema | Decisão aprovada | Consequência/critério |
| --- | --- | --- | --- |
| D01 | Público | Outras pessoas, em uso individual. | Conta e histórico privados por usuário, sem compartilhamento familiar/empresarial. |
| D02 | Plataformas | Testar primeiro via web; manter APK Android no plano de entrega; sem exigir loja. | Validação web precede geração/validação do APK; web não é automaticamente lançamento público. |
| D03 | Funcionalidades | Cadastro, lista, edição, exclusão, total, filtro por categoria, persistência, receitas e saldo do período. | Orçamento adiado; saldo = receitas menos despesas da consulta, sem saldo bancário inicial. |
| D04 | Dinheiro | BRL em centavos inteiros; de R$ 0,01 a R$ 999.999,99 por lançamento; inteiro ou até duas casas com vírgula/ponto, sem milhar. | Rejeitar zero, negativos, não finitos, mais de duas casas e valores acima do limite; sem arredondamento silencioso. Saldo calculado pode ser negativo. |
| D05 | Datas/consulta | Data efetiva editável, hoje como padrão, separada do cadastro; hoje ou passado. Dashboard no mês atual, navegação mensal e totais filtrados. | Cadastro/edição rejeitam datas futuras; consulta usa data do gasto/recebimento. |
| D06 | Categorias | Listas fixas: despesas — Alimentação, Transporte, Lazer, Saúde, Educação e Outros; receitas — Salário, Trabalho extra, Rendimentos e Outras receitas. | Sem criação/renomeação de categorias pelo usuário na V1. |
| D07 | Persistência/ambientes | Supabase local via Docker com PostgreSQL no desenvolvimento; depois Supabase hospedado; endereços/configuração por `.env`. | Banco relacional é fonte principal; substitui a antiga proposta de AsyncStorage para lançamentos. Senhas de banco/chaves administrativas ficam fora do cliente. |
| D08 | Alterações/falhas | Editar ao tocar; confirmar exclusão; avisar ao sair com mudanças; impedir duplicação; preservar dados/alterações e oferecer nova tentativa em falhas. | Exclusão cancelada mantém registro; erro de gravação não perde formulário; erro de leitura não apaga histórico. |
| D09 | Avaliação | Dados/contas locais apenas para testes; avaliação com outras pessoas no Supabase hospedado, sem transportá-los. Web antes do APK. | Levar schema/configuração, começar sem contas/lançamentos locais de teste; validar novamente no Android depois da web. |
| D10 | Login/sessão | Obrigatórios, não negociáveis. Google via Supabase Auth com Authorization Code/PKCE principal; cadastro/login por email/senha via Supabase Auth secundário. Confirmar email, reenviar confirmação e recuperar senha por link. Sessão persistente e renovável; logout limpa credenciais/estado privado. | Login por senha é caminho distinto do OAuth Google. Ambos acessam mesma identidade/histórico após vínculo seguro; sem fusão por simples comparação de email. |
| D11 | Offline/backup | Offline adiado; exportação/importação pela interface adiadas; procedimento de cópia/restauração do banco testado antes de dados reais. | Serviços acessíveis são necessários para consultar/gravar; recuperação operacional é obrigatória, mesmo sem botão de exportar. |
| D12 | Sessão por plataforma | Supabase direto na web; armazenamento persistente do navegador acessível ao JavaScript aceito. Android usa armazenamento seguro do sistema. | Confirmação expressa durante a redação da SPEC-003; concretiza D10 para web, sem servidor intermediário/HttpOnly. Medidas contra exposição, restauração e limpeza devem ser verificadas; não autoriza storage comum no Android. |

### Registro das confirmações finais

- Combinação Google/PKCE principal e email/senha secundário confirmada após esclarecimento dos diferentes protocolos.
- Política de mesma conta/histórico pelos dois métodos aprovada, com verificação segura de identidade.
- Restrição de datas futuras aprovada; lançamentos previstos não entram na V1.
- Sequência local fictício → hospedado sem dados de teste aprovada.
- Limite R$ 999.999,99 e escopo de backup operacional aprovados.
- A última resposta ajustou a ordem de validação para **web primeiro, APK depois**, preservando APK no plano de entrega.
- Implementações das SPEC-001 e SPEC-002 foram expressamente autorizadas, substituindo a restrição documental nos seus escopos. Stack local e cliente público preparados; autenticação completa, CRUD financeiro de rede, telas novas, provisionamento hospedado e publicação continuam fora desta entrega.

## 7. Orientação técnica e validação futura

Estas escolhas concretizam requisitos aprovados; detalhes rotineiros de implementação podem ser resolvidos autonomamente, preservando arquitetura/convenções. Mudanças relevantes de comportamento/escopo devem voltar ao usuário.

- Google: gerar verifier por tentativa, enviar challenge, receber código e trocá-lo com verifier associado. Correlacionar retorno/tentativa, rejeitar código inválido/expirado/reutilizado e tratar cancelamento/erro. Configurar `flowType: 'pkce'` explicitamente no SDK JavaScript; não presumir o padrão do SDK. Não incluir client secret no app.
- Email/senha: usar o serviço de autenticação aprovado, sem senhas no banco financeiro/dispositivo. Login por senha não executa a troca OAuth de código; confirmação/recuperação podem envolver retorno PKCE. Configurar confirmação tanto no local quanto no hospedado e validar links.
- Sessão: armazenamento seguro conforme plataforma; restaurar/renovar quando válido, pedir novo login quando não recuperável e limpar dados privados ao sair. Preservar sessão não equivale a suporte offline financeiro.
- Web: callbacks HTTP(S) e retorno de autenticação devem funcionar no navegador. Erros, confirmação de exclusão e descarte devem ser visíveis/funcionais; o uso atual de `Alert.alert` exige verificação, não presume compatibilidade. Testar refresh, rotas diretas e navegação com alterações.
- Android: callback/deep link e retomada de sessão precisam de validação própria no APK. `app.json` já declara esquema `ezfinance`, sem comprovar callback implementado.
- Banco/autorização: vincular lançamentos à identidade; validar permissões de leitura/escrita e agregação, mesmo em chamadas diretas. Datas e dinheiro também devem ser validados na camada persistente.
- Backup: documentar como copiar/restaurar, cobertura de schema/dados e dependências de identidades/configuração. Testar em ambiente isolado com dados fictícios; não restaurar sobre dados reais durante a prova. Método e operação documentados; decisão posterior do usuário em 08/10/2026 mantém backups manuais sem frequência por enquanto, sem prometer cobertura automática do provedor.
- Valores: limite por registro não substitui precisão das somas; validar agregações sem perda de centavos. Datas efetivas devem permanecer dias civis, separadas dos instantes de cadastro; resolver referência de hoje/fuso de modo consistente entre cliente e servidor.

Fontes técnicas já consultadas: [PKCE no Supabase Auth](https://supabase.com/docs/guides/auth/sessions/pkce-flow), [autenticação por senha](https://supabase.com/docs/guides/auth/passwords), [retorno ao app móvel](https://supabase.com/docs/guides/auth/native-mobile-deep-linking) e [opções padrão do auth-js](https://raw.githubusercontent.com/supabase/auth-js/master/src/GoTrueClient.ts). São referências de implementação, não decisões de produto. Supabase como servidor OAuth próprio para clientes registrados não foi escolhido.

## 8. Itens adiados e questões não bloqueadoras

**Etapa 5 concluída em 08/10/2026:** [SPEC-005](specs/005-formularios-e-protecao-de-alteracoes.md), com formulários dos dois tipos/data, edição, exclusão, proteção e lista transitória. [F01–F14 comprovados](validacoes/005-formularios-e-protecao-de-alteracoes.md). Etapa 6 implementada nesta solicitação autorizada: SPEC-006 mensal/categoria/indicadores; Q01–Q06 comprovados, zoom real confirmado pelo usuário.

**Persistência precedente concluída:** [SPEC-004](specs/004-persistencia-financeira.md) fornece CRUD/consulta/reconciliação usados pelos formulários. Nenhuma migração de registros experimentais ou modo offline. Consulta mensal visual validada, incluindo Q06; backup/hospedado e APK permanecem posteriores.

**Adiamentos aprovados:** orçamento, categorias personalizadas, modo offline, exportação/importação na interface e publicação em loja como condição da primeira entrega.

**Não definidos para versões futuras:** lançamento público web, iOS, monetização, identidade visual definitiva, gráficos, múltiplas moedas, contas financeiras, meios de pagamento, recorrência, parcelas, anexos e colaboração. Não são requisitos da V1 por inferência.

Schema/migration, políticas financeiras e referência de hoje foram escritos e testados no banco na SPEC-001. Vínculo/callbacks/sessão web local já comprovados na SPEC-003. Restam validação nativa, configuração de callbacks/credenciais por ambiente de entrega, estratégia de backup e geração do APK. Devem ser resolvidos e verificados antes da entrega correspondente. Mudanças significativas decorrentes desses detalhes precisam de confirmação.

## 9. Validação documental e continuidade

Na auditoria documental inicial, foram lidos arquivos da aplicação, modelo, categorias, contexto, dependências/configuração e README; rota de detalhes confirmada com zero bytes. Regras aprovadas confrontadas com o plano e separadas da implementação existente. Essa auditoria não executou app/banco/testes. As verificações posteriores da SPEC-001 estão registradas abaixo; testes relatados no histórico não validam o código atual em todas as plataformas.

O [plano](PLANO_IMPLEMENTACAO.md) define dependências e aceitação, incluindo web antes do APK. A auditoria acima registra o fluxo experimental preservado; a primeira entrega técnica está descrita a seguir.

### Entrega da SPEC-001 em 07/10/2026

**Estado: concluída e validada no Supabase local.** Contratos de receitas/despesas, rascunho, consulta/totais e DTO do banco; catálogo tipado das dez categorias; conversão/formatação monetária exata, soma segura, validação de descrição/categoria/datas e consulta mensal filtrada implementados. Migration em `supabase/migrations/` contém catálogo, constraints, índice por dono/data, grants, RLS por `auth.uid()` e trigger temporal/identidade. Testes SQL em `supabase/tests/` usam papéis anon/authenticated e fixtures fictícias separadas das migrations.

Hoje usa `America/Sao_Paulo` no domínio e banco; datas civis não são convertidas em instantes. ID/criação/dono não são campos editáveis; exclusão de identidade usa RESTRICT, sem cascata financeira. Essas escolhas técnicas estão detalhadas em [supabase/README.md](../supabase/README.md).

Validação executada: `npm test` passou (11 testes: M01–M06, D01–D03, C01/V01, formatação, DTOs e consistência/separação do catálogo e fixtures S02); `npm run typecheck` passou, preservando compatibilidade do fluxo atual. A inclusão do TypeScript foi delimitada a `src/` e tipos Expo porque o antigo template ignorado `example/` tinha imports incompatíveis com os aliases do app. Não foram adicionadas dependências.

Validação integrada posterior, após o usuário iniciar Docker: CLI Supabase 2.120.0 via npx, Docker 29.8.1 e PostgreSQL 17.11 (imagem 17.11.0.004). `start` aplicou a migration em uma stack nova (S01); `migration up --local` confirmou ausência de pendências; `test db` aprovou **53 testes**, inclusive A01–A04 e regras persistentes. Quatro CTEs dos testes SQL foram corrigidos para o nível principal; schema/políticas não precisaram de mudança. Testes repetidos com sucesso após reinício preservando dados. Conferência final: 10 categorias, 0 lançamentos, 0 usuários Auth, confirmando rollback das fixtures (S02). Evidência em [validação local](validacoes/001-supabase-local.md).

Configuração local em `supabase/config.toml`, confirmação de email habilitada e seeds desabilitados. Analytics de logs desabilitado por incompatibilidade do acesso TCP do coletor Vector ao Docker Desktop; serviços financeiros/Auth/API estão ativos. Etapa 2 parcialmente iniciada; `.env`/SDK/callbacks/Android permanecem pendentes. Login e vínculo de contas não foram exercitados. `git diff --check` passou com acesso de leitura fora do sandbox após falhar dentro dele; logs locais/temporários e chaves de assinatura estão ignorados.

Nenhuma tela, autenticação do aplicativo, sessão, integração do provider, ambiente hospedado ou build web/APK foi antecipado. `Expense`, telas e provider experimental continuam em memória. Ver [SPEC-001](specs/001-fundacao-de-dados.md) para checklist atualizado.

### Entrega inicial da SPEC-002 em 07/10/2026 (registro histórico)

**Parcial por dependência externa Google.** Exemplos `.env.example`/`supabase/.env.example`, proteção `.env*`, validação pública tipada sem fallback, SDK 2.117.3 e entrada única `getSupabaseClient()` entregues. Layout prepara o cliente sem login ou I/O financeiro. PKCE explícito; persistência/refresh/detecção automática de retorno desabilitados até adapter seguro e callbacks da SPEC-003. Nenhum storage comum provisório de tokens.

Web em `http://localhost:8081`; API local configurável em `.env.local`. Site URL/allowlist Auth web e esquema Android preparados/aplicados; Google desabilitado até receber **Client ID e Client Secret OAuth Web**, com origem/redirect/consentimento/escopos/usuários de teste configurados externamente. Credenciais serão de servidor via `.env` na raiz, não públicas. Callbacks/links ainda sem handlers e sem prova ponta a ponta; Android apenas planejado.

Navegador real: API HTTP 200, consultas sem sessão de lançamentos/categorias HTTP 401/42501 e `data: null`; falha de rede controlada distinguida. `npm test`: 17 testes; tipos, exportação web e regressão SQL (53 testes) passaram. Bundle conferido com URL/chave pública, sem valores administrativos locais conhecidos ou diagnóstico temporário. Preflight rejeita configuração administrativa antes de empacotar. Após testes: dez categorias e zero lançamentos/contas; stack reutilizada sem reset/migration alterada. Fluxo financeiro experimental preservado; aviso da rota vazia `[id].tsx` permanece para etapa posterior.

[Instruções, callbacks e Android](AMBIENTE_SUPABASE.md), [evidência E01–E09](validacoes/002-ambiente-integracao-supabase.md) e [SPEC-002](specs/002-ambiente-e-integracao-supabase.md). Etapa 2 não declarada concluída por dependência externa; etapa 3/autenticação será a próxima entrega, sem presumir autorização nesta.

### Preparação da SPEC-003

O usuário informou ter criado o cliente OAuth Web no Google. [SPEC-003 — Autenticação e sessão](specs/003-autenticacao.md) preparada/revisada para futura implementação, com sequência, escopo, marcos web/Android e critérios A01–A16. Autenticação ainda não implementada; esta solicitação autorizou somente conclusão da configuração da SPEC-002 e documentação da SPEC-003.

**Decisão D12 aprovada nesta elaboração:** manter SDK Supabase direto e aceitar armazenamento persistente do navegador acessível ao JavaScript na web; Android usa armazenamento protegido do sistema. Não acrescentar servidor intermediário/HttpOnly. O usuário confirmou a combinação recomendada; ela especifica a política anterior para a web, sem autorizar storage comum no Android. Não confundir armazenamento do navegador com proteção equivalente ao sistema móvel ou cookie HttpOnly. A spec exige medidas contra exposição, restauração, renovação, limpeza e testes entre abas.

### Conclusão da configuração da SPEC-002 — 07/10/2026

Credenciais encontradas em `.env.local`, conforme esclarecimento do usuário, e duas entradas Google transferidas para `.env` da raiz sem sobrescrever configuração pública. Provider habilitado e aplicado por stop/start sem reset; resumos do catálogo/lançamentos/contas antes/depois idênticos (10/0/0), mesma migration. Auth confere credenciais por igualdade sem imprimir valores; settings HTTP 200/Google true e início de autorização HTTP 302 para Google com Client ID/callback correspondentes, response_type code/state presente. Redirect não seguido; nenhuma conta/sessão criada.

Navegador confirmou Google habilitado e negação financeira sem sessão 401/42501. 17 testes, tipos, 53 testes SQL e exportação web aprovados. Estado atual substitui a pendência de credenciais do registro histórico: etapa 2 concluída no escopo de preparação. Console Google/consentimento/usuários de teste e token endpoint não foram validados; prova real de login, PKCE, sessão e vínculo é requisito da SPEC-003. Android/APK mantidos no plano; CRUD posterior. Ver evidência atualizada e ambiente.


### Implementação da SPEC-003 — 07/10/2026

Solicitação posterior autorizou código/configuração/testes da autenticação, substituindo a restrição documental anterior neste escopo. AuthProvider/controller, rotas de entrada/cadastro/links/callback/recuperação/conta e proteção da navegação implementados. Cliente usa PKCE, adapter persistente e refresh; D12 mantida com localStorage web e SecureStore Android em blocos. Expo Crypto fornece aleatoriedade/SHA-256 nativas. Provider financeiro é recriado por identidade, logout e recuperação; lançamentos permanecem experimentais em memória, sem CRUD de rede.

29 testes passaram (28 domínio/configuração/unidade mais uma suíte Auth/API/Mailpit reais), tipos e exportações web/Android passaram; 53 testes SQL repetidos após configuração definitiva aprovaram. Vínculo manual permaneceu desabilitado: Auth deve realizar vínculo automático de email verificado, preservando ID; prova real dos dois sentidos ainda pendente. Configuração aplicada por stop/start, sem reset, preservou dez categorias e a conta/sessão Google autorizada; zero lançamentos ao concluir fixtures.

Google apresentou carregamento infinito/erro RPC no navegador integrado, seguido de 400 ao recarregar. Novo fluxo no navegador externo funcionou conforme relato do usuário; identidade Google verificada e sessão emitida conferidas no serviço. Não mudou arquitetura, scopes ou segurança. Scan de 61 artefatos encontrou zero segredos Google/administrativos locais conhecidos. Refresh/reabertura/abas reais, vínculo nos dois sentidos e parte das provas de UI ainda pendentes; execução Android/APK permanece posterior. Estado parcial detalhado em [evidência da SPEC-003](validacoes/003-autenticacao.md).

### Conclusão web da SPEC-003 — 08/10/2026

Resolvidas as pendências web apontadas pela revisão independente. O usuário exerceu Google → senha e email/senha → Google com dois emails autorizados, confirmou conflito rejeitado e relatou permanência da sessão após fechar todas as janelas/reabrir o navegador externo. IDs Auth/donos registrados antes do vínculo foram preservados; JWT/API reais comprovaram fixture própria de 100 centavos e dono alheio oculto nos dois métodos de cada conta. Coincidência de email/identidade não confirmada não emitiram sessão nem transferiram histórico.

Provas automatizadas no navegador integrado usaram localStorage e Web Locks reais, duas abas, reload, fechamento/reabertura, renovação automática e restauração após JWT realmente expirado; refresh revogado exigiu login e limpou storage. Formulários/Mailpit reais completaram confirmação/reenvio, recuperação restrita, cancelamento, voltar/rotas diretas e rejeição de link expirado. Corrigidos retorno indevido à confirmação após login com senha, sincronização de nova sessão entre abas, destino do cancelamento, parâmetros repostos pelo Router e controle de cancelamento na aba bloqueada. Arquitetura D12 e Auth/RLS preservados.

Tipos, 31 testes normais/32 com integração ampliada, 53 SQL e exportação web passaram. Scan de 32 artefatos finais sem segredos de servidor conhecidos. Removidos somente dois lançamentos/três contas automáticas/mensagens exatas das fixtures; duas contas humanas e suas credenciais preservadas, dez categorias e zero lançamentos ao final. Ferramentas/serviços temporários de prova removidos; aplicação original mantida em localhost:8081, Auth original em JWT de 3600 segundos. Android/aparelho/APK, hospedado, backup e CRUD persistido continuam posteriores. Detalhes, limites e matriz A01–A16 em [validação](validacoes/003-autenticacao.md).

**08/10/2026 — continuação visual:** Jade/hierarquia e composição do piloto aprovadas; expansão aplicada, sem reinterpretar Mobbin como requisitos. Registro atual no [sistema visual](design/SISTEMA_VISUAL.md). SPEC-007 parcial pelo limite não textual de R03; V1 não concluída.

### Transição hospedada — 08/10/2026

CLIs Firebase/Supabase autenticadas pelo usuário. Site Firebase `ez-finance-7c789` confirmado, sem deploy; plano/faturamento ainda pendente de conferência. Supabase `tgfdihnemrseyifvfwan` recebeu as duas migrations existentes, sem importar contas/dados locais, e a configuração base de Site URL/callbacks. Histórico local/remoto correspondente. Testes remotos SQL de CRUD, constraints e isolamento aprovados; fixtures em rollback, dez categorias e zero contas/lançamentos ao final. Não equivale a prova de login/JWT/navegador hospedado.

Após autorização explícita do usuário para a transferência das credenciais, Google habilitado no Supabase Auth. API pública confirmou provider ativo, confirmação de email e início code/state para o callback hospedado; não houve login/troca de token. Acesso ao console OAuth restabelecido pelo usuário; origem Firebase e callback Supabase salvos após confirmação explícita. Reabertura confirmou persistência e preservação dos endereços locais. Login hospedado completo ainda pendente. SMTP, backup/restauração, deploy e validação HTTPS continuam pendentes; etapa 7 e V1 não concluídas. Detalhes em [hospedagem](HOSPEDAGEM.md).

**Continuação da hospedagem — 08/10/2026:** usuário confirmou Firebase Spark e autorizou Gmail pessoal como remetente, pois não possui domínio. SMTP preparado no painel, sem senha/salvamento, aguardando criação e entrada privada da senha de app pelo usuário. Cópia de banco gerada e restauração SQL isolada com fixtures aprovada, incluindo dados financeiros, vínculo estrutural de identidades, histórico e isolamento; container removido. Recuperação de login real e destino/rotina externa continuam pendentes. Ver [backup](BACKUP.md). Sem deploy nesta rodada.

**Publicação técnica — 08/10/2026:** SMTP Gmail salvo pelo usuário, que confirmou senha de app Google; painel reaberto confirmou SMTP ativo, host e porta 465 sem ler credencial. Firebase Hosting publicado em https://ez-finance-7c789.web.app para validação técnica, Spark confirmado pelo usuário. Tipos, proteção do build e exportação de 11 rotas aprovados. HTTP remoto: sete rotas esperadas 200, desconhecida 404, headers nosniff/no-referrer/no-cache presentes. Navegador hidratado redirecionou raiz e detalhe financeiro sem sessão ao login. Aviso compartilhado corrigido para “Ambiente de avaliação.”, conferido em 390×844 e 1280×900. Entrega SMTP/login/CRUD completos ainda não comprovados; próxima prova humana é cadastro, recebimento de email, confirmação e recuperação. Backup externo escolhido como outro armazenamento privado, sem destino específico informado; rotina e recuperação Auth continuam pendentes. Nenhum commit/push necessário.

**Backup no Drive — 08/10/2026:** usuário escolheu Google Drive privado. Criada pasta Ez Finance Backups em Meu Drive, primeira cópia atualizada enviada em ZIP, metadados de pasta/arquivo conferidos sem compartilhamento e somente proprietário. Download de retorno com SHA-256 idêntico ao original. [Procedimento e destino](BACKUP.md). Frequência/retencão operacionais e recuperação de login completo ainda pendentes; não foi criada automação.

**Validação hospedada — 08/10/2026:** usuário definiu backups manuais, sem frequência por enquanto; não criar automação. No primeiro teste Google, identificada exportação Metro em cache com endpoint local, apesar de preflight válido. Build de Hosting passou a exportar com --clear e conferir URL/chave pública nos bundles finais, recusando endpoint local ou credenciais públicas divergentes. Dois testes de proteção passaram; nova publicação concluída. Bundle baixado do Firebase idêntico ao exportado, endpoint hospedado presente e local ausente. Login Google completou callback, abriu consulta vazia e sessão sobreviveu ao reload; contagens remotas confirmaram uma conta/identidade Google e zero lançamentos. Solicitada recuperação pelo fluxo Minha conta para o próprio usuário; interface aceitou o pedido. Recebimento e definição de senha aguardam prova humana. Não confundir esse login com prova de recuperação de backup Auth.

**Email hospedado recebido — 08/10/2026:** usuário confirmou recebimento da recuperação no Gmail. Primeiro link foi aberto no Firefox, embora o pedido tivesse sido iniciado no navegador integrado; retorno rejeitado por tentativa ausente. Conta hospedada já existente por Google (uma conta/identidade confirmada por contagem). Cancelada somente a tentativa pendente pelo controle existente, sem alterar senha. Próxima prova: usuário solicita novo link pelo Firefox e o abre no mesmo Firefox para definir senha; sessão por senha/vínculo preservado ainda não comprovados. A rejeição entre navegadores mantém o contrato PKCE da SPEC-003, sem enfraquecer validação de retorno.


**08/10/2026 — ajuste de feedback:** erros destacados em vermelho #B42318/fundo #FFF1F0 (5,98:1), Manrope e faixa lateral; confirmações informativas mantêm Jade. Componente ErrorFeedback compartilhado em Auth/overview/formulários; tipo de mensagem Auth explícito, sem mudar autenticação. Unidades 50/50, tipos/exportação e navegador aprovados. [Evidência](validacoes/007-refinamento-visual.md). Pendência anterior R03 permanece.


**08/10/2026 — feedbacks Radix:** autorização posterior para tons da Radix aplicada: Tomato11 no texto, Tomato2 no fundo e Tomato9 na faixa; Jade permanece principal. Contraste 4,75:1, navegador390/1280 e tipos/exportação conferidos. [Registro](validacoes/007-refinamento-visual.md). Substitui o vermelho anterior; pendência R03 inalterada.

**Recuperação e dados hospedados — 08/10/2026:** usuário concluiu o novo fluxo de recuperação no mesmo navegador e confirmou sucesso. Consulta remota confirmou uma conta com senha e uma identidade Google; sessão recente por senha comprovada no Auth. Novo login Google no navegador integrado abriu a aplicação, preservando a mesma conta. Não houve leitura/entrada da senha pelo agente. Lançamento fictício TESTE HOSPEDAGEM 08-10-2026 criado pela interface com 3590 centavos e editado para 4000; consulta remota confirmou um único registro, e abertura direta do detalhe após recarregar preservou os campos. Setembro retornou zero lançamentos; outubro/Transporte zero e outubro/Alimentação um, com totais correspondentes. Exclusão do teste aguarda confirmação humana antes da ação permanente. Cliques automatizados no card tiveram timeout e retorno à lista; abertura direta funcionou, portanto navegação pelo card ainda deve ser reavaliada na exportação atualizada. Cadastro/confirmar/reenviar hospedados, isolamento com duas contas/JWT reais, login após restauração do backup e Android/APK permanecem pendentes. Backups continuam manuais, sem frequência.

**Nova publicação solicitada — 08/10/2026:** base de código atual exportada com cache limpo e publicada diretamente no Firebase Hosting, sem commit/push. Tipos, 50 testes da aplicação, 2 testes de Hosting e diff check aprovados. Exportação gerou 11 rotas/21 arquivos; bundle entry-4ec18612dfb2f3116553d049adeb26db.js remoto tem SHA-256 igual ao local, endpoint Supabase hospedado presente e segredo Google conhecido ausente. Sete rotas HTTPS responderam 200 com nosniff. Navegador recarregou a nova versão, manteve sessão e lançamento de 4000 centavos; abertura pelo card funcionou e carregou os campos, substituindo a pendência de navegação descrita no registro anterior (não foi atribuída uma causa aos timeouts anteriores). Diálogo de exclusão do único lançamento fictício preparado, aguardando confirmação humana; nenhuma exclusão executada. Escopo das provas anteriores e pendências hospedadas/backup Auth/Android preservados.

**Exclusão hospedada concluída — 08/10/2026:** após confirmação explícita do usuário, o lançamento fictício TESTE HOSPEDAGEM 08-10-2026 (4000 centavos) foi excluído pelo diálogo da aplicação publicada. Interface confirmou a alteração no banco e voltou à consulta de outubro com zero lançamentos e receitas/despesas/saldo zerados. Consulta remota confirmou UUID do teste ausente, zero lançamentos totais, uma conta Auth e dez categorias preservadas. Ciclo de criação, leitura, edição e exclusão hospedadas comprovado para essa conta; nenhuma importação local. Substitui a pendência de limpeza dos registros anteriores. Permanecem cadastro/confirmar/reenviar hospedados, isolamento com duas contas/JWT reais, login após restauração do backup e Android/APK. Backups manuais sem frequência mantidos; nenhuma nova publicação necessária para excluir o dado de teste.
