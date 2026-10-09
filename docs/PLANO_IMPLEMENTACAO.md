# Plano de implementação da primeira versão

**08/10/2026 — gráficos ao rolar:** entrada650ms acionada por25% de visibilidade do desenho, repetida na reentrada; preferência reduzida/previews preservados. Web320/390/1280 e tipos/exportação conferidos. [Evidências/limites](validacoes/017-graficos-ao-rolar.md). Revisão humana e Android/zoom pendentes; sem publicação.

**08/10/2026 — navegação contínua autorizada:** próxima tela aparece durante o arraste, páginas lado a lado sem fade; substitui sequência013. Web320/390/1280, cancelamento/interrupção/redução/resize e53 testes/tipos/exportação aprovados. [Evidências](validacoes/015-pager-continuo.md). Revisão da sensação e performance/gestos em aparelho pendentes; sem publicação ou expansão funcional.

**08/10/2026 — Minha conta em nova iteração autorizada:** User Profile Community adaptado à identidade e ações existentes. Identificação centralizada, lista Google/senha e sessão implementadas; sem edição de perfil/ajuda/configurações. Tipos/exportação e revisão web320/390/1280, email longo, foco/estados aprovados. [Evidências](validacoes/014-refinamento-minha-conta.md). Revisão humana e zoom/aparelho pendentes; sem expansão geral ou publicação.

**08/10/2026 — transição lateral autorizada:** usuário solicitou movimento ao deslizar entre telas do piloto. Arraste, saída/entrada, retorno de gesto cancelado, barra fixa e movimento reduzido implementados/conferidos na web320/390/1280;53 testes,tipos e12rotas aprovados. [Evidências](validacoes/013-transicao-lateral-piloto.md). Validar sensação na8081 e aparelho; demais refinamentos continuam em outra iteração. Nenhuma publicação.

**08/10/2026 — workflow real do piloto validado:** após autorização para desenvolvimento, conferida implementação e executado fluxo real em sessão descartável local: filtro gráfico→lista→edição/criação→descarte/salvar/excluir→retorno, restauração e saída. Destino de cancelamento corrigido para Lançamentos. Fixtures limpas, dados humanos preservados;53 testes,tipos e12rotas aprovados. [Evidências](validacoes/012-workflow-real-piloto.md). Pendência de workflow básico real resolvida; próximo recorte de validação é aceite visual/zoom/aparelho. Sem expansão de telas ou publicação autorizada por esta entrega.

**08/10/2026 — escopo do piloto fechado:** usuário encerrou o recorte em Início, Lançamentos, gráficos/interações/animações e barra/gesto com Phosphor. Minha conta integra a navegação, sem refinamento de conteúdo/composição. Refinamento de Minha conta e expansão geral ficam para outra iteração; nenhuma ampliação automática. Validações de sessão real/fluxo completo, zoom e Android seguem pendentes, separadas da conclusão de implementação deste recorte. [Fechamento e evidências](validacoes/011-navegacao-principal.md#fechamento-do-escopo).

**08/10/2026 — navegação principal:** usuário aprovou barra/gesto lateral e lista dedicada em Lançamentos, com Phosphor. Entrega local conferida na web320/390/1280 e toque emulado; tipos,53 testes,2 checks de exportação e12rotas aprovados. Sem publicação. [Evidências](validacoes/011-navegacao-principal.md). Próximo: aceite da composição e validação com sessão real (consulta→lista→edição/criação→descarte/salvar→retorno), zoom e aparelho; consolidação/expansão depois.

**08/10/2026 — interações do piloto:** melhorias propostas autorizadas e implementadas: semana com valores, categoria pelo anel/legenda, limpeza de filtro e cabeçalho compacto. 53 testes, tipos/exportação e revisão web320/390/1280 aprovados; callback de edição conferido em harness fictício. [Evidências/limites](validacoes/010-interacoes-piloto-inicial.md). Próximo passo permanece validar composição, workflow completo com rotas/formulário/sessão real e zoom; depois consolidar direção e expandir.

**08/10/2026 — continuação:** manter as duas visualizações foi aprovado; animações de entrada solicitadas foram implementadas e conferidas na web, com preferência de movimento reduzido. Sem publicação ou expansão geral. [Checks/demonstrações/limites](validacoes/008-piloto-overview-figma.md#animação-de-entrada-e-manutenção-das-duas-visualizações). Não aguardar escolha de uma única representação; próximos passos continuam workflow integrado e zoom da composição.

**08/10/2026 — piloto adicional da inicial:** composição inspirada em My Balance/Analytics e comparação de gráficos semanais/categorias autorizadas, implementadas localmente. Consulta confirmada/filtros/regras financeiras preservados, sem publicação/expansão geral. [Entrega/evidências/limites](validacoes/008-piloto-overview-figma.md). Próxima etapa: aceite da tela/gráfico, workflow integrado e zoom real; depois consolidação/expansão.

Atualizado em **08/10/2026**. Base: [CONTEXTO_APP.md](CONTEXTO_APP.md), decisões D01–D12.

## Estado e autorização

Etapas 1–5 concluídas no recorte web local. SPEC-005 expressamente autorizada para código e testes: formulários receita/despesa/data, edição ao tocar, excluir com confirmação, proteção de alterações e lista transitória dos dois tipos. [F01–F14 e evidências](validacoes/005-formularios-e-protecao-de-alteracoes.md). Reutilizados persistência/Auth/domínio, sem migration ou dependência nova. Etapa 6 concluída na web local (Q01–Q06, zoom real 200% confirmado manualmente pelo usuário); etapas 7–9 continuam necessárias. V1 não concluída.

Aprovado: controle individual de receitas/despesas, CRUD e consulta mensal/categoria, indicadores filtrados, BRL em centavos até R$ 999.999,99 por lançamento, datas até hoje, categorias fixas, Supabase local/Docker e depois hospedado, `.env`, Google/PKCE principal e email/senha secundário, confirmação/recuperação, sessão persistente, identidade compartilhada após vínculo seguro, proteção de alterações e backup operacional testado antes de dados reais. **Testar via web antes de gerar/validar APK Android**, que continua na entrega. Offline, orçamento, categorias personalizadas e exportação/importação pela interface adiados; loja não é condição.

Base atual: cadastro/edição/exclusão de receitas/despesas na web, protegidos por sessão validada, isolamento por identidade, confirmação de descarte e falha/reconciliação. Consulta mensal/categoria implementada sobre controller/repositório existentes, lista e indicadores do mesmo conjunto. SPEC-006 concluída com Q01–Q06 comprovados, incluindo zoom Q06 confirmado pelo usuário; Android/APK permanece posterior. Nenhuma importação experimental.

**Revisão independente em 07/10/2026:** código, migration e testes conferidos contra a SPEC-001; 11 testes de domínio, verificação de tipos e 53 testes SQL reproduzidos com sucesso. Migration registrada e dez categorias presentes; zero contas/lançamentos antes e depois dos testes. Nenhum bloqueador identificado no escopo da fundação. Aplicação inicial em banco vazio e reinício são evidências da entrega anterior, não operações repetidas nesta revisão. Ver [registro de validação](validacoes/001-supabase-local.md).

## Ordem e dependências

**Refinamento visual transversal:** consultar a [base de design](design/README.md). Piloto Jade validado pelo usuário antes da expansão; tokens/componentes consolidados e cadastro/overview refinados na SPEC-007. Pendência não textual de R03 registrada. Preservar as dependências funcionais abaixo; referências visuais não autorizam novas funcionalidades não substituem as provas funcionais das specs.

**Recorte visual — SPEC-007:** Piloto Jade aprovado explicitamente em 08/10/2026; fase B aplicada ao cadastro e overview, com coesão nos demais consumidores. Manrope 400/600/700 carregada uma vez na raiz, inclusive textos, campos, botões e cabeçalhos. Tokens e Text/Button compartilhados em `src/components/VisualSystem.tsx`, primitivos em `src/constants/jade.ts`; AuthPanel/AuthField, FlatList, cards, formulário e Modal existentes preservados. Sem dependência/rota/funcionalidade nova. Unidades 49/49, Auth 50/50, finanças 50/50, tipos e exportação web aprovados; teclado, estados, conteúdo longo e 320/390/1280 conferidos. Zoom 200% validado manualmente pelo usuário nesta execução. **Entrega parcial: R03 mantém limite de contraste não textual das bordas Jade 7–8; R01/R02/R04 comprovados.** [Evidência](validacoes/007-refinamento-visual.md). Android/aparelho, hospedado/backup e V1 continuam posteriores. A etapa 7 abaixo continua hospedado/backup.

0. Decisões consolidadas → 1. Modelo relacional e contratos → 2. Ambiente de desenvolvimento → 3. Autenticação e autorização → 4. Persistência dos lançamentos → 5. Cadastro/correção → 6. Consulta financeira → 7. Transição para Supabase hospedado → 8. Validação web → 9. Geração, validação e entrega do APK Android.

Testes de desenvolvimento usam o ambiente local e dados fictícios; a avaliação com outras pessoas ocorre após a transição ao Supabase hospedado, sem importar dados ou contas locais de teste. Autenticação e isolamento devem preceder acesso a dados reais. A estratégia de migração deve ser definida desde a etapa 1, mesmo quando executada depois.

## 0. Consolidar decisões — etapa documental concluída

**Dependências:** auditoria e respostas D01–D11 registradas.

D01–D11 consolidados no contexto. Limite de R$ 999.999,99 aprovado, backup operacional obrigatório e exportação/importação da interface adiadas. Validação web precede APK Android; contas/dados locais fictícios não são transportados para avaliação hospedada. Callbacks, vínculo seguro e estratégia de backup são detalhes técnicos a concretizar nas etapas pertinentes. Não alterar decisões aprovadas por inferência.

**Estado: concluído no refinamento documental. Aceitação:** acesso ao banco e autenticação especificados; cadastro/recuperação/sessão definidos; modo online obrigatório e offline adiado registrados; destino de dados/contas de teste e ambiente da primeira entrega definidos; limite R$ 999.999,99 confirmado; datas futuras proibidas já registradas. Sugestões continuam separadas de requisitos.

## 1. Consolidar modelo relacional e contratos

**Especificação de execução:** [SPEC-001 — Fundação de dados financeiros](specs/001-fundacao-de-dados.md). **Estado: concluída e validada no Supabase local.** Contratos, catálogo tipado, regras puras, migration com grants/RLS/constraints e testes pgTAP entregues. `npm test`: 11 testes passaram; `npm run typecheck`: passou; `npx --yes supabase@2.120.0 test db`: 53 testes passaram. Fluxo experimental preservado. Detalhes e reprodução em [supabase/README.md](../supabase/README.md).

**Validação integrada concluída:** migration aplicada numa stack nova (S01), A01–A04 e integridade aprovados sob papéis de cliente. Resultado repetido após reinício preservando dados. Migrations contêm somente schema/catálogo; fixtures nos testes com rollback, confirmadas 0 contas/0 transações ao concluir (S02). Isolamento validado no banco; autenticação/vínculo real e integração financeira continuam dependências antes do uso de dados reais. Ver [evidência local](validacoes/001-supabase-local.md).

**Dependências:** etapa 0 para regras bloqueadoras; D03–D07 aprovados.

Definir schema PostgreSQL, contratos de lançamentos e vínculo com identidade autenticada. Receitas/despesas usam valores de 1 a 99.999.999 centavos por registro; tipo determina entrada/saída. Saldo = receitas menos despesas da consulta, sem saldo bancário inicial. Data efetiva distinta de cadastro e limitada a hoje/datas passadas; categorias fixas por tipo com identificação consistente. Versionar migrações de schema para desenvolvimento e Supabase.

**Aceitação:**

- Contratos/restrições aceitam de R$ 0,01 a R$ 999.999,99; rejeitam R$ 1.000.000,00, zero, negativos, não finitos, milhar e excesso de casas; precisão, tipos, categorias e campos obrigatórios coerentes no cliente/banco.
- Vínculo por usuário viabiliza isolamento de consulta, alteração e agregação.
- 35,90 + 22,50 + 40,00 = R$ 98,40; 0,10 + 0,20 = R$ 0,30.
- Receita de R$ 100,00 e despesa de R$ 35,90 resultam em saldo de R$ 64,10; só despesa de R$ 35,90 resulta em -R$ 35,90. Saldo negativo não implica lançamento negativo.
- Datas não mudam de dia por conversão de fuso; migrations recriam schema sem depender de mudanças manuais não registradas.

## 2. Preparar PostgreSQL/Docker e configuração de ambientes

**Entrega executada:** [SPEC-002 — Ambiente e integração Supabase](specs/002-ambiente-e-integracao-supabase.md). Configuração pública validada, templates/arquivos reais protegidos, SDK 2.117.3/cliente único/PKCE e URLs de Auth preparados. Navegador confirmou API disponível e negação financeira sem sessão usando só chave pública. 17 testes, tipos, exportação web e 53 testes SQL passaram. [Evidência E01–E09](validacoes/002-ambiente-integracao-supabase.md) e [reprodução](AMBIENTE_SUPABASE.md). Depois especificar/executar autenticação da etapa 3; só então CRUD da etapa 4, mediante autorização correspondente.

**Estado: concluída no escopo de preparação.** CLI 2.120.0, PostgreSQL 17.11 e stack existente reutilizados; analytics opcional continua desabilitado. `.env.local` público e `.env` privado ignorados; credenciais Google transferidas para a fonte do CLI, provider habilitado e aplicado por stop/start sem reset. Settings 200/Google true, credenciais correspondentes no Auth e início de redirect 302 com callback/code/state verificados; dados/resumos preservados. Web fixa localhost:8081, Site URL/allowlist alinhadas e retorno nativo documentado. Console Google/consentimento/usuários de teste e validade do segredo no token endpoint não foram comprovados: serão exercitados no login real da etapa 3, junto aos handlers de callback/email e sessão. Conectividade Android não executada; preparação não equivale a Google/login funcional no app.

**Dependências:** etapa 1; stack Supabase local já aprovada, parâmetros de autenticação dependem dos detalhes de D10.

Preparar stack Supabase local via Docker com PostgreSQL e armazenamento durável durante desenvolvimento. Configurar serviços de API/Auth e a integração OAuth conforme o papel/provedor definido em D10. Configurar endereços e parâmetros por `.env`, com exemplo sem segredos. Documentar acesso do navegador ao serviço local e endereços futuros do Android; callbacks separados conforme plataforma/ambiente.

**Aceitação:**

- Ambiente inicia conforme instruções e aplica schema/migrações de forma reproduzível.
- Reinício dos serviços preserva dados; reset/destruição de dados de teste é operação explícita.
- Navegador acessa serviço local e callback configurado; preparar configuração Android sem confundir localhost da máquina com o celular.
- Endereços são configuráveis por ambiente; credenciais reais não são versionadas.
- Variáveis incluídas no app contêm apenas configurações públicas/chaves próprias para cliente; senha de banco e chaves administrativas ficam no servidor.
- Ausência de configuração impede conexão com mensagem clara, sem recorrer silenciosamente a outro ambiente.

## 3. Implementar autenticação e autorização

**Concluída na web local em 08/10/2026:** [SPEC-003 — Autenticação e sessão](specs/003-autenticacao.md). Google/PKCE externo, email-senha, confirmação/reenvio/recuperação, guard, sessão, logout e vínculo pelo Auth validados. Matriz A01–A15 atendida com limites/métodos explícitos; A16 preparado com aparelho/APK posteriores. **D12 mantida:** cliente Supabase direto com armazenamento persistente acessível ao JavaScript na web; armazenamento seguro do sistema no Android. Ferramentas de prova temporárias removidas, contas humanas preservadas. CRUD permanece posterior.

**Dependências:** etapas 1–2 e métodos de login/sessão aprovados em D10.

Implementar login Google via Supabase Auth com OAuth 2.0 Authorization Code Flow com PKCE: challenge, retorno com código e troca com o verifier da tentativa. Configurar PKCE explicitamente no SDK JavaScript/React Native e callback por ambiente; não depender do padrão do SDK nem incluir client secret no app. Oferecer cadastro/login diretamente no aplicativo como caminho secundário obrigatório; confirmação de email antes do acesso financeiro, reenvio e recuperação por link estão aprovados; email e senha pelo Supabase Auth são as credenciais aprovadas para esse caminho separado do OAuth Google. Não presumir que login por senha execute Authorization Code Flow. Proteger rotas financeiras e validar identidade/permissões no serviço/banco, além da interface. Manter sessão entre aberturas em armazenamento seguro, renovar quando permitido, exigir novo login sem renovação válida e limpar credenciais/estado privado ao sair. Detalhes de implementação devem respeitar essa política aprovada. Não desenvolver autenticação própria por presunção.

**Aceitação:**

- Sem sessão válida, usuário não acessa consultas nem operações financeiras por tela ou chamada direta ao serviço.
- Usuário A não lê, cria em nome de, altera ou exclui dados do usuário B, inclusive por manipulação de IDs ou filtros; totais também respeitam isolamento.
- Login inválido e sessão expirada recebem tratamento definido; logout limpa sessão e estado privado da interface antes de outra conta entrar.
- Login Google retorna código de autorização e só estabelece sessão após troca válida com o verifier correspondente, conforme contrato do servidor; não substituir por fluxo implícito.
- Código inválido, expirado, reutilizado ou associado a verifier incorreto não cria sessão; callback inesperado, cancelamento e erro exibem resultado definido sem acesso financeiro.
- Tentativas simultâneas não misturam verifier/código; retorno funciona primeiro na web; validar posteriormente deep link Android com app aberto/fechado, conforme retomada definida.
- Cadastro/login direto secundário funcionam por email e senha via Supabase Auth; confirmar email antes do acesso financeiro, reenviar confirmação e recuperar senha por link são obrigatórios e validados ponta a ponta, incluindo links inválidos/expirados.
- Sessão é restaurada ao reabrir, renovada quando válida e substituída por novo login quando não recuperável; tokens seguem D12: armazenamento persistente do navegador aceito na web e armazenamento protegido do sistema no Android. Senhas não são persistidas e credenciais não são expostas em logs.
- Google e email/senha vinculados após verificação segura acessam a mesma identidade/histórico; alternar métodos não duplica nem perde dados, e identidade não verificada não obtém acesso por coincidência de email.
- Chaves públicas não concedem autorização administrativa; regras de acesso são testadas no mecanismo escolhido.

## 4. Implementar persistência autenticada dos lançamentos

**Concluída no marco web local em 08/10/2026:** [SPEC-004 — Persistência financeira autenticada](specs/004-persistencia-financeira.md). Repositório/controller financeiro e cadastro/lista/cards persistidos. Migration nova `20261008000100_transaction_intent_id.sql` concede somente insert do UUID operacional; identidade imutável, RLS e demais grants preservados. Resposta perdida após commit real reconciliada sem duplicação; 1.007 registros consultados além do limite 1.000 da API. Durabilidade após reload, nova sessão e reinício PostgreSQL comprovada; Google/senha conferidos pelo usuário externo na mesma fixture. Formulários foram concluídos depois na etapa 5; consulta mensal/filtros ficam na etapa 6; contas humanas preservadas e limpeza restrita às fixtures. [Evidências e limites](validacoes/004-persistencia-financeira.md).

**Dependências:** etapas 1–3; offline já adiado em D11.

Implementar consulta e CRUD na camada aprovada. O banco relacional é fonte principal; não substituir por AsyncStorage. Não implementar fila offline; preservação do formulário em falhas não equivale a lançamento gravado. Distinguir histórico vazio de erro de carregamento e confirmação de gravação de simples atualização visual.

**Aceitação:**

- Lançamentos e indicadores sobrevivem a reinício do app e do serviço; identidade e filtros corretos ao reler dados.
- Carregamento inicial não sobrescreve histórico; falhas não causam limpeza silenciosa.
- Falha ao salvar preserva alterações e permite nova tentativa; falha ao carregar preserva dados e oferece tentar novamente.
- Adição/edição/exclusão não exibem sucesso durável antes da confirmação da gravação.
- Toques repetidos não geram operações concorrentes duplicadas; repetição após timeout não duplica lançamentos já gravados (definir solução técnica proporcional).
- Sem conexão com os serviços, informar falha/indisponibilidade, preservar alterações em andamento e permitir nova tentativa; não registrar sucesso nem executar fila offline.

## 5. Completar cadastro e proteção das alterações

**Concluída no marco web local em 08/10/2026:** [SPEC-005 — Formulários e proteção das alterações](specs/005-formularios-e-protecao-de-alteracoes.md). F01–F14 comprovados com unidades e browser/serviços reais, incluindo commits com resposta perdida, duas abas e recuperação restrita. Firefox validou F5/fechar/voltar e zoom 200%; limites de beforeunload/rascunho explicitados. Rotas existentes preservadas; sem migration/grants/dependência nova. [Evidências, correções e limpeza](validacoes/005-formularios-e-protecao-de-alteracoes.md).

**Dependências:** etapa 4 e D08 aprovado.

Formulário de receita/despesa, valor, categoria e data; edição ao tocar no lançamento; confirmação de exclusão, aviso ao sair com alterações não salvas, bloqueio de envio duplicado. Integrar erros de rede/autenticação. Rota existente `/expenses/[id]` concretizada como edição; nenhuma tela extra de detalhes.

**Aceitação:**

- Campos obrigatórios, entradas monetárias inválidas e data futura impedem salvar com feedback visível na web e, posteriormente, no Android; edição também rejeita data futura.
- Categorias de despesas: Alimentação, Transporte, Lazer, Saúde, Educação e Outros. Receitas: Salário, Trabalho extra, Rendimentos e Outras receitas.
- Cadastro válido gera um lançamento, retorna ao destino definido e atualiza consulta.
- Edição mantém identidade, não duplica e recalcula indicadores; falha mantém alterações para nova tentativa.
- Cancelar confirmação de exclusão mantém lançamento; confirmar o remove do banco e da consulta, sem reaparecer após reinício.
- Sair com alterações não salvas exige decisão do usuário; formulário não perde alterações em falha de gravação.
- Teclado, descrições longas e navegação direta não impedem completar o fluxo.

## 6. Completar consulta financeira

**Concluída no marco web local em 08/10/2026:** [SPEC-006 — Consulta mensal e filtro de categoria](specs/006-consulta-mensal-e-filtros.md). Q01–Q06 comprovados; zoom real 200% validado manualmente pelo usuário. [Evidência curta, checks e limpeza](validacoes/006-consulta-mensal-e-filtros.md); 50 financeiros, tipos e exportação aprovados. Escopo concentrado em mês/categoria, três indicadores do mesmo recorte, atualização após CRUD e estados/concorrência. Seis critérios Q01–Q06; reutilizar domínio/repositório/controllers. Validação focal e uma rodada final financeira/tipos/web; Auth completo e SQL condicionais a alterações nessas camadas. Redesign e piloto visual permanecem trabalho separado, sem instalar kit/fontes/ícones nesta spec por inferência.

**Dependências:** etapa 5, D05/D06 e regras de autorização da etapa 3.

Abrir no mês atual, navegar entre meses e filtrar por categoria. Mostrar receitas, despesas e saldo da consulta para a conta autenticada. Remover controles de experimento; categorias personalizadas/orçamento não entram.

**Aceitação:**

- Lista e indicadores acompanham mês e filtros; rótulos deixam claro o conjunto consultado.
- Ausência de lançamentos mostra zero; histórico vazio e consulta sem resultados têm mensagens adequadas.
- Alterações persistidas atualizam consulta sem recarregamento manual.
- Consulta mensal usa data efetiva e é validada nos limites de mês.
- Filtro não permite incluir dados de outra conta; mudança de usuário não mostra histórico anterior.
- Sem botão de despesa de teste, contagem repetida ou erros de texto na entrega cotidiana.
- Fluxo financeiro e autenticação exercitados via web com serviços locais e dados fictícios antes da transição; a etapa 8 completa a validação hospedada antes do APK.

## 7. Preparar transição para Supabase hospedado

**Transição em andamento:** configuração Hosting vinculada ao novo projeto `ez-finance-7c789`, conforme esclarecimento do usuário; projeto Google `ez-finance-511001` mantido para OAuth. Ambas as CLIs autenticadas; site Firebase existente confirmado, sem deploy. Supabase `tgfdihnemrseyifvfwan` recebeu as duas migrations e endereços de retorno Auth. Histórico conferido e testes SQL remotos de CRUD, constraints e isolamento aprovados, com rollback e zero contas/lançamentos. Ambiente público de produção configurado, exportação hospedada aprovada. [Roteiro e evidências](HOSPEDAGEM.md). Com autorização explícita, credenciais Google aplicadas ao Supabase Auth e redirecionamento inicial validado. Origem Firebase e callback Supabase salvos no cliente Google, com endereços locais preservados e persistência conferida após reabertura. Plano Firebase, SMTP, backup/restauração e provas Auth/navegador hospedadas continuam pendentes. Etapa 7 não concluída.

**Destino aprovado em 08/10/2026:** Firebase Hosting para a web e Supabase hospedado gratuito para PostgreSQL/Auth, com prioridade de custo zero e baixo volume esperado. Google OAuth existente é mantido. Não adotar Firebase Auth/Firestore nem plano pago por inferência. Registrar e validar limites gratuitos, rotas diretas/refresh (inclusive edição por ID), callbacks e entrega de emails; definir e testar backup próprio antes de dados reais. Decisão registrada no [contexto](CONTEXTO_APP.md). Recursos externos e implantação ainda pendentes; escolha de hosting para avaliação não equivale a aprovação de lançamento público web.

**Dependências:** schema versionado e fundação autenticada/persistida validados localmente; concluir antes da avaliação com outras pessoas, conforme D11 aprovado.

Criar ambiente hospedado quando autorizado na etapa de implementação; aplicar schema, regras de acesso e configuração de autenticação. Aplicar migrations/configuração sem importar dados ou contas locais, que são apenas de teste. Implementar/documentar procedimento de cópia e restauração do banco e testá-lo em ambiente isolado antes de usar dados reais. Exportação/importação pela interface fica fora desta etapa. Migrar também configurações OAuth, callbacks e integração de identidade escolhida; não presumir portabilidade automática das sessões. Trocar endpoint é apenas parte da transição.

**Aceitação:**

- Migrations e políticas de autorização aplicadas; acesso entre usuários continua bloqueado.
- Endereços/chaves por ambiente documentados; trocar configuração não inclui segredos administrativos no app.
- Login, CRUD, filtros, retenção e recuperação funcionam no ambiente de destino.
- Ambiente hospedado não contém contas/lançamentos locais de teste; usuários da avaliação autenticam-se/cadastram-se no destino e histórico inicial não é contaminado por testes locais. Dados reais não são descartados nessa operação.
- Procedimento de backup/recuperação documentado e executado com dados fictícios em ambiente isolado; conferir schema, lançamentos, permissões e vínculo com identidades. Escopo/cobertura e dependências de configuração explicitados; não prometer recuperação de itens não testados. Rotina manual aprovada pelo usuário em 08/10/2026, sem frequência definida por enquanto; não criar agendamento por inferência.

## 8. Validar primeiro via web

**Dependências:** etapas anteriores; desenvolvimento local fictício disponível e Supabase hospedado pronto antes da avaliação com outras pessoas. Backup testado antes de dados reais.

Executar verificações de tipos e testes proporcionais de dinheiro, datas, migrações, autenticação, autorização, persistência e retorno ao navegador. Validar os fluxos no ambiente local e depois no hospedado, sem transportar contas/lançamentos locais. Web é ambiente de validação inicial; publicação pública de um site não foi solicitada.

**Aceitação:**

- Google/PKCE e cadastro/login email/senha, confirmação, reenvio, recuperação e logout funcionam no navegador; retorno/código e renovação de sessão conforme requisitos.
- Receita/despesa, edição, exclusão, filtros mensais/categoria e saldo refletem dados do usuário correto; reload mantém dados persistidos e sessão válida.
- Erros e confirmações são visíveis/funcionais na web; não presumir que `Alert.alert` do código atual ofereça a experiência necessária.
- Rotas diretas/refresh, voltar com alterações e cancelamento de login são verificados; navegação protegida não expõe dados sem sessão.
- Duas contas provam isolamento, e métodos vinculados da mesma identidade provam histórico único.
- Limite monetário, precisão/somas, data futura e viradas de mês verificados.
- Falhas de rede/leitura/gravação preservam formulário/dados e retomada não duplica lançamentos.
- Avaliação hospedada não usa contas/dados de teste importados; problemas que comprometam dados/acesso/fluxos obrigatórios resolvidos antes de avançar para APK.

## 9. Gerar, validar e entregar APK Android

**Dependências:** etapa 8 validada; configuração móvel, credenciais de build necessárias e Supabase hospedado preparado. Publicação em loja não é condição.

Gerar APK instalável e validar no Android, usando os mesmos serviços/modelo. Esta etapa permanece obrigatória no plano: aprovação web não comprova comportamento nativo. Documentar instalação, uso e limitações.

**Aceitação:**

- APK instala e abre no aparelho alvo, com configuração do ambiente hospedado.
- Login Google com callback/deep link e email/senha, confirmação/reenvio/recuperação funcionam; sessão é preservada/renovada conforme política, logout limpa credenciais/estado privado.
- Cadastro, consulta, edição, exclusão, restrição de datas, filtros e retenção funcionam após fechar/reabrir.
- Confirmação de exclusão/descarte e falhas de conexão funcionam no Android; teclado, legibilidade, fontes ampliadas e seleção de categoria verificados.
- Evidência dos fluxos obrigatórios registrada, incluindo isolamento; não há falhas conhecidas que causem perda, duplicação ou acesso indevido aos dados.
- Contexto, plano e instruções de execução/instalação atualizados; limitações explicitadas. Web validada e APK validado são marcos separados.

## Validação e detalhes restantes

Refinamento documental e etapas 1–5 concluídos no recorte local web. SPEC-005: 45 testes normais, 46 com financeiro real, 46 Auth, 63 SQL, tipos e exportação aprovados. F01–F14 com métodos/limites na [evidência](validacoes/005-formularios-e-protecao-de-alteracoes.md). Sem reset; contas humanas/dados anteriores preservados e fixtures removidas por identidade/IDs próprios. D01–D12 mantidas. Etapa 6 concluída na web local, incluindo prova manual do zoom Q06; etapas 7–9 pendentes: hospedado/backup, avaliação web e APK/aparelho. A V1 não está concluída.

Schema/migration, políticas financeiras e referência de hoje/fuso foram escritos e verificados na SPEC-001. Vínculo/callbacks/sessão web local foram validados na SPEC-003. Restam execução nativa e configuração Google por ambiente de entrega, consulta financeira mensal/filtros, cobertura/rotina de backup e geração do APK. Não são funcionalidades adicionais aprovadas implicitamente. Se exigirem mudanças relevantes de comportamento/arquitetura, voltar ao usuário.

Podem permanecer abertas as decisões futuras de lojas, lançamento público web, iOS, monetização, gráficos e demais funcionalidades fora do escopo. Não adiar autenticação, substituir banco relacional, remover APK ou incluir offline sem nova decisão do usuário.


**SPEC-007, continuação em 08/10/2026:** aceite explícito do piloto recebido, Manrope aplicada às demais telas e direção Jade consolidada. R03 parcial pelo contraste de bordas; [evidência atualizada](validacoes/007-refinamento-visual.md).

**Continuação da hospedagem — 08/10/2026:** usuário confirmou Firebase Spark e autorizou Gmail pessoal como remetente, pois não possui domínio. SMTP preparado no painel, sem senha/salvamento, aguardando criação e entrada privada da senha de app pelo usuário. Cópia de banco gerada e restauração SQL isolada com fixtures aprovada, incluindo dados financeiros, vínculo estrutural de identidades, histórico e isolamento; container removido. Recuperação de login real e destino/rotina externa continuam pendentes. Ver [backup](BACKUP.md). Sem deploy nesta rodada.

**Publicação técnica — 08/10/2026:** SMTP Gmail salvo pelo usuário, que confirmou senha de app Google; painel reaberto confirmou SMTP ativo, host e porta 465 sem ler credencial. Firebase Hosting publicado em https://ez-finance-7c789.web.app para validação técnica, Spark confirmado pelo usuário. Tipos, proteção do build e exportação de 11 rotas aprovados. HTTP remoto: sete rotas esperadas 200, desconhecida 404, headers nosniff/no-referrer/no-cache presentes. Navegador hidratado redirecionou raiz e detalhe financeiro sem sessão ao login. Aviso compartilhado corrigido para “Ambiente de avaliação.”, conferido em 390×844 e 1280×900. Entrega SMTP/login/CRUD completos ainda não comprovados; próxima prova humana é cadastro, recebimento de email, confirmação e recuperação. Backup externo escolhido como outro armazenamento privado, sem destino específico informado; rotina e recuperação Auth continuam pendentes. Nenhum commit/push necessário.

**Backup no Drive — 08/10/2026:** usuário escolheu Google Drive privado. Criada pasta Ez Finance Backups em Meu Drive, primeira cópia atualizada enviada em ZIP, metadados de pasta/arquivo conferidos sem compartilhamento e somente proprietário. Download de retorno com SHA-256 idêntico ao original. [Procedimento e destino](BACKUP.md). Frequência/retencão operacionais e recuperação de login completo ainda pendentes; não foi criada automação.

**Validação hospedada — 08/10/2026:** usuário definiu backups manuais, sem frequência por enquanto; não criar automação. No primeiro teste Google, identificada exportação Metro em cache com endpoint local, apesar de preflight válido. Build de Hosting passou a exportar com --clear e conferir URL/chave pública nos bundles finais, recusando endpoint local ou credenciais públicas divergentes. Dois testes de proteção passaram; nova publicação concluída. Bundle baixado do Firebase idêntico ao exportado, endpoint hospedado presente e local ausente. Login Google completou callback, abriu consulta vazia e sessão sobreviveu ao reload; contagens remotas confirmaram uma conta/identidade Google e zero lançamentos. Solicitada recuperação pelo fluxo Minha conta para o próprio usuário; interface aceitou o pedido. Recebimento e definição de senha aguardam prova humana. Não confundir esse login com prova de recuperação de backup Auth.

**Email hospedado recebido — 08/10/2026:** usuário confirmou recebimento da recuperação no Gmail. Primeiro link foi aberto no Firefox, embora o pedido tivesse sido iniciado no navegador integrado; retorno rejeitado por tentativa ausente. Conta hospedada já existente por Google (uma conta/identidade confirmada por contagem). Cancelada somente a tentativa pendente pelo controle existente, sem alterar senha. Próxima prova: usuário solicita novo link pelo Firefox e o abre no mesmo Firefox para definir senha; sessão por senha/vínculo preservado ainda não comprovados. A rejeição entre navegadores mantém o contrato PKCE da SPEC-003, sem enfraquecer validação de retorno.


**SPEC-007 — ajuste solicitado em 08/10/2026:** destaque vermelho compartilhado para erros entregue; mensagens informativas preservadas em Jade. Unidades 50/50, tipos/exportação e inspeção real 390/1280 aprovados. Sem nova campanha financeira/SQL ou alterações de fluxo Auth. [Registro](validacoes/007-refinamento-visual.md); limite de bordas em R03 continua pendente.


**08/10/2026 — feedbacks Radix:** autorização posterior para tons da Radix aplicada: Tomato11 no texto, Tomato2 no fundo e Tomato9 na faixa; Jade permanece principal. Contraste 4,75:1, navegador390/1280 e tipos/exportação conferidos. [Registro](validacoes/007-refinamento-visual.md). Substitui o vermelho anterior; pendência R03 inalterada.

**Recuperação e dados hospedados — 08/10/2026:** usuário concluiu o novo fluxo de recuperação no mesmo navegador e confirmou sucesso. Consulta remota confirmou uma conta com senha e uma identidade Google; sessão recente por senha comprovada no Auth. Novo login Google no navegador integrado abriu a aplicação, preservando a mesma conta. Não houve leitura/entrada da senha pelo agente. Lançamento fictício TESTE HOSPEDAGEM 08-10-2026 criado pela interface com 3590 centavos e editado para 4000; consulta remota confirmou um único registro, e abertura direta do detalhe após recarregar preservou os campos. Setembro retornou zero lançamentos; outubro/Transporte zero e outubro/Alimentação um, com totais correspondentes. Exclusão do teste aguarda confirmação humana antes da ação permanente. Cliques automatizados no card tiveram timeout e retorno à lista; abertura direta funcionou, portanto navegação pelo card ainda deve ser reavaliada na exportação atualizada. Cadastro/confirmar/reenviar hospedados, isolamento com duas contas/JWT reais, login após restauração do backup e Android/APK permanecem pendentes. Backups continuam manuais, sem frequência.

**Nova publicação solicitada — 08/10/2026:** base de código atual exportada com cache limpo e publicada diretamente no Firebase Hosting, sem commit/push. Tipos, 50 testes da aplicação, 2 testes de Hosting e diff check aprovados. Exportação gerou 11 rotas/21 arquivos; bundle entry-4ec18612dfb2f3116553d049adeb26db.js remoto tem SHA-256 igual ao local, endpoint Supabase hospedado presente e segredo Google conhecido ausente. Sete rotas HTTPS responderam 200 com nosniff. Navegador recarregou a nova versão, manteve sessão e lançamento de 4000 centavos; abertura pelo card funcionou e carregou os campos, substituindo a pendência de navegação descrita no registro anterior (não foi atribuída uma causa aos timeouts anteriores). Diálogo de exclusão do único lançamento fictício preparado, aguardando confirmação humana; nenhuma exclusão executada. Escopo das provas anteriores e pendências hospedadas/backup Auth/Android preservados.

**Exclusão hospedada concluída — 08/10/2026:** após confirmação explícita do usuário, o lançamento fictício TESTE HOSPEDAGEM 08-10-2026 (4000 centavos) foi excluído pelo diálogo da aplicação publicada. Interface confirmou a alteração no banco e voltou à consulta de outubro com zero lançamentos e receitas/despesas/saldo zerados. Consulta remota confirmou UUID do teste ausente, zero lançamentos totais, uma conta Auth e dez categorias preservadas. Ciclo de criação, leitura, edição e exclusão hospedadas comprovado para essa conta; nenhuma importação local. Substitui a pendência de limpeza dos registros anteriores. Permanecem cadastro/confirmar/reenviar hospedados, isolamento com duas contas/JWT reais, login após restauração do backup e Android/APK. Backups manuais sem frequência mantidos; nenhuma nova publicação necessária para excluir o dado de teste.
