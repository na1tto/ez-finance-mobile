# Ambiente e cliente Supabase — SPEC-002

**Estado em 07/10/2026:** SPEC-002 concluída no escopo de preparação; Google habilitado no Auth local, serviço e início do redirecionamento verificados. Não há login, sessão persistente ou CRUD financeiro no aplicativo. Console Google e login ponta a ponta ainda não validados.

## Preparar e reutilizar

Usar Node **22.18 ou posterior** (validado com 26.7.0), npm e Docker Desktop em execução. O SDK 2.117.3 exige Node >= 22; os scripts locais também usam suporte nativo a TypeScript. A stack/configuração existente é do projeto `ez-finance`, Supabase CLI 2.120.0 e PostgreSQL 17. Não executar `init` novamente.

Na raiz do repositório:

```powershell
npm ci
npx --yes supabase@2.120.0 start
npx --yes supabase@2.120.0 migration up --local
Copy-Item .env.example .env.local
```

Preservar `.env.local` existente; a cópia acima é apenas para a primeira preparação. Preencher as duas variáveis públicas com URL da API e chave **publishable** da stack. Para consultar somente esses valores, sem imprimir o objeto completo de credenciais:

```powershell
$configLocal = npx --yes supabase@2.120.0 status -o json | ConvertFrom-Json
$configLocal.API_URL
$configLocal.PUBLISHABLE_KEY
```

Depois:

```powershell
npm run web
```

Origem de desenvolvimento: **http://localhost:8081**. Usar essa origem exata; `localhost` e `127.0.0.1` são origens distintas. `npm run web` fixa porta 8081 e host local. Se a porta estiver ocupada, encerrar o processo responsável ou liberar a porta; não aceitar outra porta sem atualizar a configuração Auth correspondente.

`start`/`migration up --local` reutilizam o banco e aplicam somente migrations pendentes. Para parar preservando dados: `npx --yes supabase@2.120.0 stop`. Mudanças no `supabase/config.toml` exigem stop/start; não usar reset como inicialização. Reset/exclusão de volumes são operações destrutivas separadas, não executadas nesta entrega. Studio permanece em http://127.0.0.1:54323.

## Configuração pública e troca de ambiente

| Variável do app | Uso |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | URL base HTTP(S) da API Supabase. Exemplo local no template; sem fallback no código. |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Chave publishable (`sb_publishable_...`) ou chave legada JWT com papel `anon`. Nunca service_role, chave secret, senha ou token de sessão. |

`src/config/environment.ts` usa referências estáticas `process.env.EXPO_PUBLIC_*`, conforme o mecanismo Expo. A validação pura em `src/config/supabase.ts` rejeita ausência/URL inválida/credenciais na URL/chave imprópria, sem incluir valores no diagnóstico. A checagem de formato/papel não verifica assinatura nem autorização: a API real faz isso.

Arquivos reais `.env`/`.env.*`, inclusive em `supabase/`, são ignorados; `.env.example` e `supabase/.env.example` são templates versionáveis. `.env.local` contém a configuração pública local; `.env` da raiz contém credenciais Google de servidor fornecidas pelo usuário. As duas entradas Google foram transferidas preservando os demais valores. Variáveis `EXPO_PUBLIC_*` entram no bundle em texto acessível. `.env` não transforma variáveis públicas em segredos.

Os scripts `npm start`, `npm run web`, `npm run android`, `npm run ios` e `npm run build:web` passam por `scripts/expo.cjs`: carregam o ambiente pelo loader já fornecido pelo Expo e validam **antes de iniciar o empacotamento**. Isso bloqueia uma chave administrativa configurada no campo público antes de ela ser incorporada. Usar esses scripts como entradas de desenvolvimento/build; chamar o CLI Expo diretamente não executa esse preflight do projeto.

Para trocar local/hospedado, substituir o par URL/chave em `.env.local` ou no ambiente de execução, manter só um ambiente efetivo e reiniciar/recarregar completamente o app. Publicação/exportação/APK precisam de novo bundle/build com os valores corretos. Não usar `NODE_ENV` como seletor de destino Supabase nem assumir que alterar endpoint migra banco, contas ou sessões. Supabase hospedado permanece para a etapa 7.

## Cliente e sessão — SPEC-003

`src/lib/supabase.ts` exporta **`getSupabaseClient()`**, única entrada do aplicativo. O layout raiz prepara esse cliente; renders repetidos reutilizam a mesma instância por runtime. O provider financeiro continua em memória, sem consultas/gravações de rede.

Opções efetivas em `src/lib/supabase/client.ts`:

- `flowType: 'pkce'` explícito.
- `persistSession: true` e `autoRefreshToken: true` na entrada do aplicativo, com adapter explícito. A fábrica isolada sem adapter permanece não persistente para testes de construção.
- `detectSessionInUrl: false`, para que a SPEC-003 correlacione e trate explicitamente o callback/troca de código.

O app integra localStorage na web (D12 aprovada, tokens acessíveis ao JavaScript) e SecureStore em blocos no Android, sem fallback para storage comum. Sessão/verifier usam chaves por endpoint. Web Locks coordenam operações entre abas e uma tentativa pendente bloqueia novos fluxos até concluir/cancelar. Confirmação/recuperação PKCE devem abrir no mesmo navegador/dispositivo que iniciou o pedido. Logout local limpa tokens, verifier, tentativa e estado financeiro experimental. Falhas de storage/serviço bloqueiam a área privada e oferecem retomada. Marco web local validado em 08/10/2026, incluindo vínculo, reabertura, duas abas, renovação e expiração; ver [evidência e pendências Android](validacoes/003-autenticacao.md). Execução nativa não comprovada pela web.

Dependência direta adicionada: **`@supabase/supabase-js` 2.117.3**, fixa no manifest/lockfile. Não foi necessário adicionar polyfill de URL: Expo fornece o global `URL`; validação no navegador/exportação passou. Armazenamento seguro não é declarado concluído.

## URLs e Google

| Finalidade | Web local / destino planejado |
| --- | --- |
| Site URL do Auth e origem do app | `http://localhost:8081` |
| Supabase → app após Google/confirmar email | `http://localhost:8081/auth/callback` |
| Supabase → app após recuperação por email | `http://localhost:8081/auth/reset-password` |
| Google → serviço Supabase (Authorized redirect URI) | `http://127.0.0.1:54321/auth/v1/callback` |
| Supabase → app Android | `ezfinance://auth/callback` / `ezfinance://auth/reset-password` |

Rotas/handlers foram implementados na SPEC-003. Allowlist nativa inclui somente os caminhos previstos e variantes com `?attempt=*`, para a correlação opaca da tentativa; não há curinga de host/caminho. Web usa a origem localhost:8081. Cadastro/reenvio retornam para confirmação; recuperação retorna para fluxo restrito. Links de email passam pelo Supabase (`/auth/v1/verify`) antes do retorno, não pelo callback Google. Teste real Google funcionou no navegador externo, conforme relato do usuário e identidade confirmada no Auth; navegador integrado travou na página Google com erro RPC.

`[auth.external.google]` está **enabled = true**, com nonce check preservado e referências `env(...)` a credenciais de servidor presentes. Para reproduzir em outro ambiente, fornecer privadamente e conferir:

1. **Client ID OAuth Google do tipo Web application** (`SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID`).
2. **Client Secret desse mesmo cliente** (`SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET`).
3. Configuração externa desse cliente no Google: origem `http://localhost:8081`, redirect URI `http://127.0.0.1:54321/auth/v1/callback`, consentimento/escopos `openid`, email e profile e usuários de teste autorizados enquanto estiver em modo de teste.

As entradas de `supabase/.env.example` pertencem a **`.env` na raiz do projeto**, conforme a leitura `env(...)` do Supabase CLI, e devem ser preenchidas privadamente. `.env.local` é configuração pública do Expo; não usá-lo como fonte de credenciais do CLI. Não sobrescrever arquivos existentes nem colocar Client Secret em `EXPO_PUBLIC_*`, app.json, código ou documentação. Aplicar por stop/start preservando dados. A configuração externa documentada foi confrontada com a documentação oficial e com o callback/origem do serviço; o console Google não foi inspecionado. A SPEC-003 comprovou login/troca PKCE reais com dois emails autorizados no navegador externo e consentimento pessoal; identidade/sessão/vínculo conferidos no Auth/API. O 302 sem autenticação foi somente a prova inicial da SPEC-002.

## Android planejado

- Emulador Android padrão: API do computador em `http://10.0.2.2:54321`, não localhost do emulador; configurar o par URL/chave para esse ambiente e reconstruir/recarregar.
- Aparelho físico: usar o IP de rede do computador ou ambiente hospedado acessível ao aparelho. Conectividade/rota/firewall devem ser validados antes do teste; não foram alteradas exposição de serviços, rede ou firewall nesta entrega.
- Callback nativo é o esquema `ezfinance` já declarado em `app.json`, separado da URL da API e do callback Google ao Supabase. Expo Go não comprova callback de um APK com esse esquema.

Não houve teste em emulador/aparelho ou geração de APK; validar após os fluxos web e nas etapas correspondentes.

## Verificações reproduzíveis

```powershell
npm test
npm run test:auth
npm run test:finance
npm run typecheck
npx --yes supabase@2.120.0 test db
npm run build:web
```

Para repetir E06 no navegador com **somente a chave pública**, gerar o diagnóstico temporário:

```powershell
node scripts/check-supabase-web.cjs
npm run web
```

Abrir `http://localhost:8081/__spec002-check/index.html`. O script transpila as regras/fábrica reais e usa o SDK instalado, sem CDN. Executa apenas GET, sem login/fixtures: Auth settings deve responder 200; lançamentos e categorias sem sessão devem responder 401/403 com código 42501 e `data: null`, não histórico vazio. Também simula um serviço indisponível na porta local 59999 para distinguir falha de rede de negação de permissão. Não relaxar grants/RLS para obter resposta vazia.

Ao terminar:

```powershell
node scripts/check-supabase-web.cjs --clean
```

O diagnóstico é ignorado e deve ser removido antes de exportar; o preflight bloqueia exportação enquanto ele existir. Ele não é uma tela/rota do produto. Não capturar/publicar os valores de credenciais emitidos pelo CLI local. [Evidência desta entrega](validacoes/002-ambiente-integracao-supabase.md) registra somente resultados não sensíveis.

Referências: [variáveis Expo](https://docs.expo.dev/guides/environment-variables/), [Supabase no Expo](https://docs.expo.dev/guides/using-supabase/), [configuração/secrets do CLI](https://supabase.com/docs/guides/local-development/managing-config), [Google local](https://supabase.com/docs/guides/auth/social-login/auth-google) e [chaves públicas/admin](https://supabase.com/docs/guides/getting-started/api-keys).

## Persistência financeira — SPEC-004

Aplicar migrations novas com `npx --yes supabase@2.120.0 migration up --local`, sem reset. A migration `20261008000100_transaction_intent_id.sql` permite somente insert do UUID operacional; RLS e identidade imutável permanecem.

`npm run test:finance` compila e executa unidades mais Auth/SDK/API reais. É restrito a `http://127.0.0.1:54321`: cria duas contas descartáveis, insere fixtures sob JWT público, demonstra 1.007 linhas apesar do cap 1.000 e descarta respostas somente após commits reais de POST/PATCH/DELETE. Verifica retry sem nova mutação, conflito, RLS, renovação e JWT inválido. Chave administrativa é lida apenas no processo local de preparação/limpeza, nunca no app/bundle; contas humanas não são modificadas. Limpeza por IDs/donos conhecidos em finally.

Na web, usar cadastro/lista existentes; não há diagnósticos permanentes de CRUD nem importação da memória antiga. Provas e limites em [evidência SPEC-004](validacoes/004-persistencia-financeira.md).
