# Hospedagem do Ez Finance

Atualizado em **08/10/2026**. Stack aprovada: Firebase Hosting + Supabase Free, prioridade de custo zero. Aplicação publicada para validação técnica; registros históricos abaixo preservam a sequência e os limites das provas.

## Destino e estado

| Parte | Destino | Estado |
| --- | --- | --- |
| Google OAuth | Projeto `ez-finance-511001` | Existente, informado pelo usuário |
| Web | Firebase Hosting `ez-finance-7c789` (nº 563727623453, informado pelo usuário) | Publicado em https://ez-finance-7c789.web.app; Spark confirmado pelo usuário |
| PostgreSQL/Auth | `tgfdihnemrseyifvfwan` — Ez Finance | Migrations e Google aplicados; Google, recuperação e sessão por senha comprovados; validação hospedada completa pendente |
| Emails Auth | Gmail SMTP próprio | Configurado pelo usuário; recuperação recebida e concluída; novo cadastro/confirmar/reenviar hospedados pendentes |
| Backup/restauração | Drive privado e restauração isolada | ZIP conferido por SHA-256; ensaio SQL aprovado; login após restauração pendente; backups manuais sem frequência por decisão do usuário |

Não transportar contas/lançamentos locais. Avaliação web precede APK; escolha de hospedagem não aprova lançamento público por inferência. Não habilitar cobrança para contornar cotas.

## Firebase

O usuário criou um projeto Firebase separado, **`ez-finance-7c789`**, para hospedar a aplicação. Manter o projeto Google **`ez-finance-511001`** somente para o cliente OAuth existente; não é necessário unificar os projetos. Conferir plano Spark e se já existe vínculo de faturamento antes de qualquer mudança. Não desvincular faturamento existente automaticamente: esclarecer a situação se o projeto não permitir Spark. Usar Hosting clássico; App Hosting, Cloud Run, Functions, Firebase Auth e Firestore não fazem parte desta entrega.

`.firebaserc` aponta para esse ID. `firebase.json` publica somente `dist`, com URLs sem `.html` e rewrite de `/expenses/*` para `/expenses/[id].html`. O Firebase serve arquivos existentes antes de rewrites: `/expenses/new` permanece a página de cadastro. Rotas desconhecidas fora desse padrão retornam 404, sem fallback global para a página inicial. Não rodar `firebase init hosting` sobre a configuração pronta: pode sobrescrever regras.

Ferramenta Firebase CLI consultada em 08/10/2026: **15.33.0**. Uso sem dependência adicional no app:

```powershell
npx --yes firebase-tools@15.33.0 login
npx --yes firebase-tools@15.33.0 projects:list
```

Validar que a conta tem acesso ao projeto informado. Para testar apenas arquivos locais com o emulador:

```powershell
npm run build:web
npx --yes firebase-tools@15.33.0 emulators:start --only hosting --project demo-ez-finance
```

O emulador usa `http://127.0.0.1:5000`. Um bundle local continua apontando para o Supabase local. Essa origem não está aprovada no Auth local: conferir respostas de arquivos/rotas não comprova OAuth nem autoriza alterar callbacks de desenvolvimento. Encerrar o emulador ao terminar.

## Supabase e ambiente público

Projeto confirmado no painel: **Ez Finance**, referência `tgfdihnemrseyifvfwan`, URL `https://tgfdihnemrseyifvfwan.supabase.co`, região **East US / North Virginia (`us-east-1`)**, compute Nano. Plano **Free** confirmado no cabeçalho da organização. Consulta somente de leitura confirmou ausência de `public.categories`/`public.transactions` e zero usuários Auth. Não recriar o projeto nem trocar região por inferência.

`.env.production.local` criado com URL e chave publishable existentes desse projeto, sem credenciais administrativas. `build:hosting` passou, gerando 11 rotas. Scan de 13 artefatos textuais confirmou presença do endpoint/chave pública e ausência dos segredos de servidor locais conhecidos nos nomes conferidos; não constitui auditoria universal de segredos. Desenvolvimento mantém `.env.local`.

Pacote para revisão preparado em `.expo/hosting-bootstrap.sql` (ignorado pelo Git): cópia das duas migrations existentes, hashes de origem, transação única e recusa se tabelas financeiras já existirem. Não executado no remoto. Preferir aplicar via CLI vinculada ao destino para preservar o histórico de migrations; se o SQL Editor for usado, registrar execução e sincronizar histórico com `supabase migration repair` após conferir schema. Não declarar migration aplicada com base apenas no arquivo preparado.

Criar conta e projeto no plano Free, escolhendo região próxima do público quando disponível. Guardar senha do banco em local privado. Registrar referência do projeto e URL HTTPS; somente URL e chave publishable (ou anon) entram no aplicativo.

Criar **`.env.production.local`** com as duas variáveis de `.env.example`, preenchidas para o novo projeto hospedado. Esse arquivo já é ignorado. Não substituir `.env.local` de desenvolvimento nem copiar segredos Google/administrativos. Na exportação, `.env.production.local` tem precedência sobre `.env.local`; variáveis já definidas no processo prevalecem. Depois:

```powershell
npm run test:hosting
npm run build:hosting
```

`build:hosting` exige HTTPS em um domínio de projeto `*.supabase.co`, rejeita endereço local/chave administrativa e exporta novamente. O hook `predeploy` do Firebase executa essa mesma proteção. `build:web` continua disponível para desenvolvimento. A proteção confere formato/configuração e rotas geradas; não comprova conectividade, RLS ou que URL/chave pertencem ao mesmo projeto.

Aplicar somente migrations versionadas `20261007000100_financial_foundation.sql` e `20261008000100_transaction_intent_id.sql` após conferir o destino vazio. Não executar reset no hospedado nem importar fixtures/dados/contas locais. CLI Supabase existente: 2.120.0. Login, vínculo de projeto e `db push --dry-run` devem preceder aplicação; confirmar schema/grants/RLS e histórico depois. Configuração Auth local não é transferida automaticamente por migrations.

## Login e emails

Após habilitar Hosting, confirmar o endereço efetivo; o endereço padrão esperado é `https://ez-finance-7c789.web.app`. Não considerar provisionado até verificar no console.

- Supabase Site URL: origem HTTPS escolhida.
- Allowlist Supabase: `/auth/callback` e `/auth/reset-password` nessa origem, mais as variantes com `?attempt=*` que o controller utiliza. Evitar curinga de host/caminho.
- Google OAuth: adicionar o callback exibido pelo Supabase, normalmente `https://<project-ref>.supabase.co/auth/v1/callback`, preservando o callback local existente.
- Configurar Client ID/Secret Google somente no servidor Auth hospedado. Nunca no bundle Expo.
- Manter confirmação de email, recuperação e vínculo seguro; não desabilitar requisitos para simplificar a hospedagem.
- Definir SMTP para usuários fora da equipe. O envio padrão Supabase é restrito a membros da equipe e tem limite baixo; não adicionar avaliadores como administradores para contornar isso. Escolha de provedor gratuito e requisitos de remetente/domínio ainda precisam ser resolvidos.

## Backup e validação antes de dados reais

Supabase Free não inclui backups automáticos e pode pausar por baixa atividade. O requisito de backup permanece obrigatório. Planejar cópia de schema, dados financeiros, identidades/vínculos Auth e histórico de migrations; preservar também configuração Auth/OAuth/SMTP por procedimento privado separado. Dump de banco não substitui configuração externa e não comprova recuperação de sessão ou segredos.

Definir destino privado das cópias, retenção, frequência e executar restauração com dados fictícios em ambiente isolado. Conferir categorias, lançamentos, identidades, vínculo entre métodos, grants/RLS, login e acesso entre duas contas. Nunca restaurar sobre dados reais para testar. Não armazenar dumps no Git nem em `public`/`dist`.

Após configurar os serviços, validar Google/PKCE, cadastro/confirmar/reenviar/recuperar, logout, CRUD, mês/categoria, persistência, isolamento, falhas/reconciliação e refresh de `/expenses/<UUID>`. Testar navegador em origem HTTPS de destino; aprovação local não comprova o hospedado. Somente então distribuir o endereço de avaliação. Com todos os pré-requisitos atendidos, a publicação usa:

```powershell
npx --yes firebase-tools@15.33.0 deploy --only hosting --project ez-finance-7c789
```

## Validação da preparação em 08/10/2026

- `npm run test:hosting`: proteção contra endereços locais, URLs inadequadas e chave administrativa aprovada; `npm run build:hosting` recusou corretamente a configuração local antes de exportar.
- `npm run typecheck`, `npm run build:web` e `git diff --check`: aprovados. Exportação local gerou 11 rotas; não foi gerado bundle de produção com projeto remoto nesta etapa.
- Firebase CLI 15.33.0, emulador Hosting com projeto fictício `demo-ez-finance`: seis páginas HTTP 200 com conteúdo igual ao arquivo exportado, incluindo `/expenses/<UUID>`, cadastro e callbacks com query; URL desconhecida HTTP 404 e redirecionamento `.html` HTTP 301 preservando `attempt`. Emulador encerrado após os testes.
- Headers personalizados não apareceram nas respostas do emulador; conferência no Hosting remoto continua pendente. Instalação do emulador advertiu que Superstatic declara Node 20/22/24, enquanto a máquina usa 26.7.0; não se atribui o problema dos headers a essa diferença sem prova.
- Sem revisão visual ou execução JavaScript no navegador nesta rodada; HTTP de arquivos não comprova hidratação, autenticação, dados ou proteção de alterações no destino. Provas HTTPS/RLS/SMTP/backup continuam obrigatórias.
- `firebase projects:list`: sem autenticação na ferramenta. Nenhum recurso externo criado/publicado; nenhuma migration remota aplicada. Usuário informou criação da conta Supabase depois dos testes locais; referência do projeto ainda pendente.

Continuidade: usuário abriu o projeto Supabase e criou conta Firebase. Projeto remoto Supabase conferido por consulta de leitura; exportação hospedada passou conforme seção acima. Login web no Google não autentica a CLI. No console Firebase apareceu também `ez-finance-7c789`, distinto do projeto OAuth informado; o usuário confirmou que esse projeto separado é o destino da aplicação; `.firebaserc` foi atualizado, mas a prova de acesso ainda é necessária antes de publicar. Conta correta foi conectada pelo usuário; não registrar senha/token em documentação.

## Referências oficiais

[Expo/Firebase Hosting](https://docs.expo.dev/guides/publishing-websites/), [regras de Hosting](https://firebase.google.com/docs/hosting/full-config), [Firebase em projeto Google existente](https://firebase.google.com/docs/projects/use-firebase-with-existing-cloud-project), [cotas gratuitas Hosting](https://firebase.google.com/docs/hosting/usage-quotas-pricing), [Supabase Free](https://supabase.com/pricing), [SMTP Auth](https://supabase.com/docs/guides/auth/auth-smtp), [cópia/restauração](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore).

Conferência Firebase: após o login do usuário, a conta conectada mostrou zero projetos e negou acesso aos dois IDs. Usuário deve abrir `ez-finance-7c789` na conta proprietária; não criar cópia nem alterar permissões/contas por inferência.

Conferência posterior: projeto `ez-finance-7c789` apareceu na lista do console na conta correta. A tela de detalhes apresentou erro de carregamento do status dos Termos de Serviço no navegador integrado; não aceitar termos nem criar projeto duplicado como tentativa de recuperação. Usuário relata acesso pelo Firefox. Ambas as CLIs foram conferidas e ainda estão sem autenticação. Usar login no navegador habitual para autorizar as ferramentas, depois vincular Supabase `tgfdihnemrseyifvfwan` e conferir plano Spark antes de implantar. Nenhum SQL de alteração executado nesta preparação.

Depois, o usuário abriu com sucesso a visão geral e Hosting de `ez-finance-7c789` no navegador integrado. Hosting exibiu aviso de permissões necessárias para gerenciar o recurso; plano não pôde ser confirmado nessa tela. Não alterar IAM automaticamente. Próximo passo é autenticar as ferramentas no terminal com `npx --yes firebase-tools@15.33.0 login` e `npx --yes supabase@2.120.0 login`, depois verificar projetos/permissões e vincular o banco. O script SQL foi apenas preparado para revisão; executar migrations pela CLI preserva o histórico. Não criar um app Firebase ou habilitar Firebase Auth como requisito artificial de Hosting.

## Estado atual após login das ferramentas — 08/10/2026

Este registro substitui as pendências de autenticação/acesso e aplicação de migrations dos registros históricos acima. Ambas as CLIs autenticadas confirmaram os projetos esperados. Firebase confirmou o site padrão existente, com endereço `https://ez-finance-7c789.web.app`; não houve deploy. Plano Spark/faturamento ainda deve ser conferido.

Supabase vinculado a `tgfdihnemrseyifvfwan`. Após `db push --dry-run`, as duas migrations versionadas foram aplicadas por `db push --yes`; `migration list` confirmou histórico local/remoto correspondente. O pacote SQL alternativo não foi executado. Conferência remota: dez categorias, cinco políticas, RLS habilitada, zero contas e zero lançamentos.

Configuração base em `deployment/supabase/config.toml`, aplicada por `node scripts/hosted-config.cjs push base`: Site URL do Firebase e allowlist delimitada para callback/recuperação web e esquema nativo, com variantes `attempt`. A CLI confirmou somente duas alterações e nenhum segredo enviado. Confirmação de email continua habilitada; opções remotas não declaradas foram preservadas. Endereços nativos preparados não comprovam funcionamento Android.

`deployment/verify-hosted.sql` executado no banco vinculado: acesso anônimo negado; CRUD do dono aprovado; outra identidade não consulta, altera, exclui nem insere em nome do dono; duplicação de ID, valor zero, data futura e transferência de dono rejeitados. Fixtures fictícias encerradas por rollback, com zero contas/lançamentos ao final. Essa prova usa papéis e claims SQL; não substitui testes com JWT/Auth reais e navegador HTTPS.

Configuração Google preparada separadamente em `deployment/google/supabase/config.toml`, sem segredos literais no arquivo. **Não aplicada:** a revisão automática rejeitou a comparação que enviaria o segredo OAuth privado ao novo projeto sem autorização explícita para a transferência. `scripts/hosted-config.cjs` separa os perfis: `base` não carrega/envia credenciais Google; `google` usa o ambiente privado e mascara o segredo na saída. Aguardar autorização específica antes de executar `diff google` ou `push google`. Também falta confirmar o callback hospedado no cliente Google existente.

Continuação com autorização explícita do usuário: `diff google` conferido e `push google` aplicado ao Supabase Auth. A CLI confirmou cinco propriedades Google atualizadas, incluindo segredo, sem modificar as doze propriedades remotas não declaradas. `/auth/v1/settings` respondeu HTTP 200 com Google habilitado e confirmação de email mantida. Início de autorização respondeu HTTP 302 para `accounts.google.com`, fluxo code/state e callback `https://tgfdihnemrseyifvfwan.supabase.co/auth/v1/callback`. Redirecionamento não seguido; nenhuma sessão/conta criada. Isso não comprova troca de token nem autorização do callback no console Google.

Console Google: após abertura pelo usuário, acesso ao cliente existente confirmado no projeto `ez-finance-511001`, com Client ID correspondente ao Supabase. Origem existente `http://localhost:8081` e callback local `http://127.0.0.1:54321/auth/v1/callback` preservados. Após confirmação explícita do usuário, origem `https://ez-finance-7c789.web.app` e callback `https://tgfdihnemrseyifvfwan.supabase.co/auth/v1/callback` salvos. Console exibiu “Cliente OAuth salvo”; reabertura do cliente confirmou os quatro endereços persistidos. Console informa propagação de cinco minutos a algumas horas; login completo ainda não exercitado. Console Firebase ainda exibiu aviso de permissões de gerenciamento do Hosting, apesar da consulta CLI do site ter funcionado; plano/faturamento não confirmado.

Permanecem pendentes: plano Firebase, Google/Auth ponta a ponta, SMTP para avaliadores externos, rotina de backup/restauração isolada, deploy e testes no endereço HTTPS. Etapa 7 não concluída e endereço não distribuído para avaliação. Nenhum commit/push foi necessário para esta configuração.

## Continuação: emails e recuperação — 08/10/2026

Usuário confirmou plano Spark e ausência de domínio; escolheu seu Gmail pessoal como remetente. A tela de plano no navegador não carregou os detalhes, portanto a prova de Spark nesta rodada é a confirmação humana. SMTP preparado **sem salvar**, com smtp.gmail.com, porta 465, remetente/usuário Gmail informado, nome Ez Finance e intervalo de 60 segundos. Nenhuma senha inserida. Usuário deve criar senha de app Google, inseri-la privadamente no campo Password e salvar; a política de navegador exige handoff para criação/entrada de nova credencial. Painel alerta que Gmail é serviço de email pessoal e entregabilidade transacional pode ser afetada. Testar confirmação e recuperação antes de distribuir a avaliação.

`node scripts/backup-hosted.cjs` executado com sucesso: roles/schema/data e manifesto SHA-256 em staging ignorado. Cópia inicial restaurada em banco isolado sem rede; ensaio adicional recuperou lançamentos fictícios e vínculo estrutural de identidades, com isolamento SQL aprovado. Container removido, sem tocar em dados locais/remotos do app. Escopo, instruções e limites em [BACKUP.md](BACKUP.md). Não comprova login Auth recuperado nem backup externo operacional. Spark deixa de ser pendência segundo confirmação do usuário; SMTP, backup externo/Auth, deploy e testes HTTPS permanecem.

**Publicação técnica — 08/10/2026:** SMTP Gmail salvo pelo usuário, que confirmou senha de app Google; painel reaberto confirmou SMTP ativo, host e porta 465 sem ler credencial. Firebase Hosting publicado em https://ez-finance-7c789.web.app para validação técnica, Spark confirmado pelo usuário. Tipos, proteção do build e exportação de 11 rotas aprovados. HTTP remoto: sete rotas esperadas 200, desconhecida 404, headers nosniff/no-referrer/no-cache presentes. Navegador hidratado redirecionou raiz e detalhe financeiro sem sessão ao login. Aviso compartilhado corrigido para “Ambiente de avaliação.”, conferido em 390×844 e 1280×900. Entrega SMTP/login/CRUD completos ainda não comprovados; próxima prova humana é cadastro, recebimento de email, confirmação e recuperação. Backup externo escolhido como outro armazenamento privado, sem destino específico informado; rotina e recuperação Auth continuam pendentes. Nenhum commit/push necessário.

**Backup no Drive — 08/10/2026:** usuário escolheu Google Drive privado. Criada pasta Ez Finance Backups em Meu Drive, primeira cópia atualizada enviada em ZIP, metadados de pasta/arquivo conferidos sem compartilhamento e somente proprietário. Download de retorno com SHA-256 idêntico ao original. [Procedimento e destino](BACKUP.md). Frequência/retencão operacionais e recuperação de login completo ainda pendentes; não foi criada automação.

**Validação hospedada — 08/10/2026:** usuário definiu backups manuais, sem frequência por enquanto; não criar automação. No primeiro teste Google, identificada exportação Metro em cache com endpoint local, apesar de preflight válido. Build de Hosting passou a exportar com --clear e conferir URL/chave pública nos bundles finais, recusando endpoint local ou credenciais públicas divergentes. Dois testes de proteção passaram; nova publicação concluída. Bundle baixado do Firebase idêntico ao exportado, endpoint hospedado presente e local ausente. Login Google completou callback, abriu consulta vazia e sessão sobreviveu ao reload; contagens remotas confirmaram uma conta/identidade Google e zero lançamentos. Solicitada recuperação pelo fluxo Minha conta para o próprio usuário; interface aceitou o pedido. Recebimento e definição de senha aguardam prova humana. Não confundir esse login com prova de recuperação de backup Auth.

**Email hospedado recebido — 08/10/2026:** usuário confirmou recebimento da recuperação no Gmail. Primeiro link foi aberto no Firefox, embora o pedido tivesse sido iniciado no navegador integrado; retorno rejeitado por tentativa ausente. Conta hospedada já existente por Google (uma conta/identidade confirmada por contagem). Cancelada somente a tentativa pendente pelo controle existente, sem alterar senha. Próxima prova: usuário solicita novo link pelo Firefox e o abre no mesmo Firefox para definir senha; sessão por senha/vínculo preservado ainda não comprovados. A rejeição entre navegadores mantém o contrato PKCE da SPEC-003, sem enfraquecer validação de retorno.

**Recuperação e dados hospedados — 08/10/2026:** usuário concluiu o novo fluxo de recuperação no mesmo navegador e confirmou sucesso. Consulta remota confirmou uma conta com senha e uma identidade Google; sessão recente por senha comprovada no Auth. Novo login Google no navegador integrado abriu a aplicação, preservando a mesma conta. Não houve leitura/entrada da senha pelo agente. Lançamento fictício TESTE HOSPEDAGEM 08-10-2026 criado pela interface com 3590 centavos e editado para 4000; consulta remota confirmou um único registro, e abertura direta do detalhe após recarregar preservou os campos. Setembro retornou zero lançamentos; outubro/Transporte zero e outubro/Alimentação um, com totais correspondentes. Exclusão do teste aguarda confirmação humana antes da ação permanente. Cliques automatizados no card tiveram timeout e retorno à lista; abertura direta funcionou, portanto navegação pelo card ainda deve ser reavaliada na exportação atualizada. Cadastro/confirmar/reenviar hospedados, isolamento com duas contas/JWT reais, login após restauração do backup e Android/APK permanecem pendentes. Backups continuam manuais, sem frequência.

**Nova publicação solicitada — 08/10/2026:** base de código atual exportada com cache limpo e publicada diretamente no Firebase Hosting, sem commit/push. Tipos, 50 testes da aplicação, 2 testes de Hosting e diff check aprovados. Exportação gerou 11 rotas/21 arquivos; bundle entry-4ec18612dfb2f3116553d049adeb26db.js remoto tem SHA-256 igual ao local, endpoint Supabase hospedado presente e segredo Google conhecido ausente. Sete rotas HTTPS responderam 200 com nosniff. Navegador recarregou a nova versão, manteve sessão e lançamento de 4000 centavos; abertura pelo card funcionou e carregou os campos, substituindo a pendência de navegação descrita no registro anterior (não foi atribuída uma causa aos timeouts anteriores). Diálogo de exclusão do único lançamento fictício preparado, aguardando confirmação humana; nenhuma exclusão executada. Escopo das provas anteriores e pendências hospedadas/backup Auth/Android preservados.

**Exclusão hospedada concluída — 08/10/2026:** após confirmação explícita do usuário, o lançamento fictício TESTE HOSPEDAGEM 08-10-2026 (4000 centavos) foi excluído pelo diálogo da aplicação publicada. Interface confirmou a alteração no banco e voltou à consulta de outubro com zero lançamentos e receitas/despesas/saldo zerados. Consulta remota confirmou UUID do teste ausente, zero lançamentos totais, uma conta Auth e dez categorias preservadas. Ciclo de criação, leitura, edição e exclusão hospedadas comprovado para essa conta; nenhuma importação local. Substitui a pendência de limpeza dos registros anteriores. Permanecem cadastro/confirmar/reenviar hospedados, isolamento com duas contas/JWT reais, login após restauração do backup e Android/APK. Backups manuais sem frequência mantidos; nenhuma nova publicação necessária para excluir o dado de teste.
