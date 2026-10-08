# SPEC-002 — Evidência de ambiente e integração

**Data:** 07/10/2026 (America/Sao_Paulo). **Estado atual:** SPEC-002 concluída no escopo de preparação; Google habilitado/aplicado/verificado no serviço local. O registro inicial e a revisão independente abaixo são históricos. A conclusão atual está na seção final; login/consentimento/sessão ainda não implementados nem validados.

## Estado preservado

Lidos AGENTS.md, contexto, plano, SPEC-002 e revisão independente da SPEC-001. Stack `ez-finance` existente reutilizada; nenhuma migration alterada, nenhum init/reset/exclusão de volume/projeto hospedado. Alterações anteriores preservadas, inclusive AGENTS.md, contratos/testes/documentação da SPEC-001 e ajustes de TypeScript.

SDK adicionado: `@supabase/supabase-js` **2.117.3**, fixo em package.json/package-lock.json. Node **26.7.0**, Expo **57.0.22**, CLI Supabase **2.120.0** e PostgreSQL **17.11**. Nenhuma nova dependência de armazenamento/estado/polyfill. A aplicação prepara o cliente público no layout, mantendo `ExpensesContext` e telas em memória, sem CRUD de rede ou login.

### Arquivos desta entrega

- `src/config/supabase.ts`, `src/config/environment.ts`, `src/lib/supabase.ts`, `src/lib/supabase/client.ts` e `src/app/_layout.tsx`: configuração e cliente compartilhado.
- `.env.example`, `supabase/.env.example`, `.gitignore` e `supabase/config.toml`: templates, proteção e URLs/provider do serviço. `.env.local` gerado apenas localmente, ignorado.
- `package.json`/`package-lock.json`: SDK fixo e scripts; `scripts/expo.cjs`, `scripts/check-supabase-web.cjs`, `scripts/test-domain.cjs`, `tsconfig.tests.json` e `tests/supabase.test.cjs`: preflight, diagnóstico e verificações.
- README raiz, `supabase/README.md`, contexto/plano/SPEC-002, `docs/AMBIENTE_SUPABASE.md`, esta evidência e nota de continuidade na evidência 001: estado e reprodução. Não alterados AGENTS.md, migration, provider/telas financeiras nem regras da SPEC-001.

## Matriz E01–E09 da entrega inicial (histórico)

| Caso | Resultado e evidência |
| --- | --- |
| E01 | Stack existente retomada por stop/start com dados preservados para aplicar Auth URLs. `migration up --local`: `applied: []`, saída 0. Instruções não incluem reset automático. |
| E02 | Testes rejeitam configuração ausente, URL inválida/com credenciais/query/fragmento e chave ausente/inválida; mensagens não incluem valores. Preflight também aborta antes do bundle. |
| E03 | URL/chave lidas via referências Expo estáticas; testes de destino local/hospedado/emulador, sem fallback. Par público local configurado em `.env.local` ignorado. |
| E04 | `.env`, `.env.local`, `.env.production` e variantes em supabase ignorados; templates versionáveis. JWT service_role/chave secret rejeitados no preflight. Bundle contém URL/chave pública local, sem valores administrativos conhecidos do CLI. Saída operacional local de inicialização sanitizada; nenhum segredo Google disponível. |
| E05 | Fábrica/entrada única com reutilização confirmada por testes e navegador. PKCE explícito; persistência/refresh/detecção automática de callback desabilitados. Sessão ausente, sem storage comum real. Adapter seguro indicado para SPEC-003. |
| E06 | Navegador real na origem `http://localhost:8081` obteve Auth settings HTTP 200 e consultas sem sessão HTTP 401/código 42501, `data: null`. CORS/conectividade confirmados; falha de rede controlada distinguida. Somente chave pública usada. |
| E07 | Configuração aplicada ao Auth confere Site URL 8081 e quatro redirects web/nativos exatos. Confirmação de email exigida. Callbacks documentados/preparados; rotas/retorno ponta a ponta ficam na SPEC-003. Android só planejado. |
| E08 | Provider Google preparado/desabilitado. Faltam Client ID/Client Secret OAuth Web e configuração externa Google (origem, redirect, consentimento/escopos/usuários de teste). Nenhum login Google declarado validado. **Entrega/etapa 2 permanecem parciais.** |
| E09 | `npm test`: **17 testes**, saída 0; `npm run typecheck`: saída 0; regressão SQL: **53 testes**, saída 0; exportação web: saída 0; Git diff/check passou. |

## Conectividade observada no navegador

Diagnóstico temporário gerado por `scripts/check-supabase-web.cjs`, usando os módulos reais de configuração/fábrica transpilados e SDK instalado (UMD), servido pelo Expo na mesma origem de desenvolvimento. Resultado lido na página:

```json
{
  "origin": "http://localhost:8081",
  "clientReused": true,
  "pkce": true,
  "persistentSession": false,
  "automaticUrlSession": false,
  "apiHttp": 200,
  "googleEnabled": false,
  "sessionAbsent": true,
  "transactions": { "http": 401, "code": "42501", "dataIsNull": true, "denied": true },
  "categories": { "http": 401, "code": "42501", "dataIsNull": true, "denied": true },
  "unavailable": "network-unavailable",
  "result": "PASS"
}
```

A página realizou somente leitura e não criou conta/sessão nem alterou dados. Falha de rede foi induzida contra porta local sem serviço, separada da API disponível e da negação RLS/grants. Diagnóstico removido por `--clean`, sem inclusão no export.

Conferência de flags **não sensíveis** do container Auth depois do restart:

```text
GOTRUE_SITE_URL=http://localhost:8081
GOTRUE_MAILER_AUTOCONFIRM=false
GOTRUE_URI_ALLOW_LIST=http://localhost:8081/auth/callback,http://localhost:8081/auth/reset-password,ezfinance://auth/callback,ezfinance://auth/reset-password
GOTRUE_EXTERNAL_GOOGLE_ENABLED=false
```

Após regressão SQL: migration `20261007000100`, dez categorias, zero lançamentos e zero usuários Auth. Nenhuma fixture persistida. Os 53 testes da fundação foram repetidos por regressão após configuração, sem reimplementar ou reaplicar migration já registrada.

## Bundle e limites

`npm run build:web` exportou `dist` (ignorado): bundle contendo SDK/configuração pública e rotas atuais. Conferência em memória contra valores do CLI, sem imprimir credenciais:

```text
PublicUrlIncluded=true
PublicKeyIncluded=true
AdministrativeValuesFound=false
TemporaryDiagnosticIncluded=false
```

Testes de preflight com URL ausente, chave secret e JWT service_role abortaram exportação antes do empacotamento e sem imprimir os valores. A checagem de bundle compara os valores administrativos locais conhecidos; não promete detectar qualquer segredo arbitrário. Código do cliente referencia somente as duas variáveis públicas previstas.

Tela inicial existente aberta no navegador: quantidade zero, estado vazio e acesso a Nova despesa, sem novo fluxo de login/CRUD. Há aviso preexistente da rota vazia `expenses/[id].tsx` sem export default; arquivo não alterado, correção pertence ao fluxo financeiro posterior. Não foi validado CRUD financeiro completo na web.

Não executados: login Google/email-senha, callbacks/troca PKCE, confirmação/reenvio/recuperação, persistência segura de sessão, vínculo entre métodos, Android/APK, hosted e backup operacional. Falta exatamente a configuração externa listada no caso E08; nenhuma chave externa foi inventada. [Reprodução e próximos passos](../AMBIENTE_SUPABASE.md).

## Revisão independente do retorno — 07/10/2026

Conferidos SPEC-002, contexto/plano, configuração, fábrica/entrada do SDK, layout, scripts, testes, templates e URLs/provider do Supabase. O código corresponde ao relato; nenhum bloqueador identificado no escopo de preparação. A classificação **parcial por dependência externa Google** é consistente com a spec: os valores externos não foram inventados e o provider permanece desabilitado.

Reproduzidos nesta revisão: `npm test` (17 aprovados), `npm run typecheck` (saída 0), `npm run build:web` (saída 0) e `npx --offline --yes supabase@2.120.0 test db` (53 aprovados). Consultas HTTP independentes, somente com a chave pública configurada, confirmaram Auth settings 200/Google desabilitado e categorias/lançamentos 401 com código 42501. O acesso HTTP local e os testes Docker exigiram execução autorizada fora do sandbox. Nenhuma conta, sessão, escrita financeira, reinício ou mudança no código/configuração foi efetuada nesta revisão; somente este registro documental foi acrescentado, além dos artefatos ignorados da exportação.

A prova no navegador/CORS e a comparação do bundle com valores administrativos conhecidos continuam apoiadas nas evidências do implementador; não foram reproduzidas aqui. Os testes e a inspeção confirmam rejeição de configuração administrativa, sem substituir auditoria de todo segredo arbitrário. PKCE está configurado, mas não houve troca real de código. As flags `persistSession`, `autoRefreshToken` e `detectSessionInUrl` estão desativadas conforme esta preparação; adapter seguro, persistência do verifier, retorno, renovação e logout são trabalho obrigatório da SPEC-003 antes de iniciar login real. Não ligar essas flags isoladamente nem declarar sessão pronta.

Continuação recomendada: obter/configurar privadamente o cliente OAuth Web no Google, preencher as variáveis de servidor e habilitar/verificar o provider local. Preparar a SPEC-003 em paralelo, preservando todos os métodos e a política de sessão aprovados. O login Google completo só poderá ser aceito após configuração externa e testes ponta a ponta; ausência das credenciais não impede planejar a autenticação.

## Conclusão do provider Google — 07/10/2026

Solicitação atual autoriza habilitar/configurar Google local e preparar a SPEC-003, sem implementar autenticação ou CRUD. AGENTS, contexto, plano, SPEC-002, spec 003 existente e evidências lidos; alterações anteriores preservadas. D12 já aprovada foi mantida, sem nova arquitetura web.

O `.env` informado inicialmente não existia. O usuário esclareceu que inseriu as credenciais em `.env.local`. Conferidos somente nomes/presença: as duas entradas de servidor existentes tinham os nomes esperados e não estavam em variáveis públicas. Foram transferidas para `.env` da raiz (criado sem sobrescrever arquivo), mantendo os demais valores de `.env.local`. Correspondência dos valores foi verificada em memória; nenhum valor publicado. Ambos os arquivos são ignorados. Configuração pública permanece a mesma.

Única mudança executável: `[auth.external.google].enabled = true` e comentário correspondente em `supabase/config.toml`. Referências `env(...)`, nonce check, callback, allowlist e confirmação de email mantidos. Stop/start padrão do CLI 2.120.0 aplicou configuração, preservando a stack; nenhuma migration/reset/init/exclusão de volume. Nenhuma flag de sessão do SDK ou código de autenticação/CRUD alterado; nenhuma dependência adicionada.

### Serviço e limites da prova

Flags efetivas do container conferidas por resultados não sensíveis:

```text
googleEnabled=true
clientIdMatchesPrivateFile=true
clientSecretMatchesPrivateFile=true
nonceCheckEnabled=true
googleCallback=http://127.0.0.1:54321/auth/v1/callback
siteUrl=http://localhost:8081
redirectAllowList=http://localhost:8081/auth/callback,http://localhost:8081/auth/reset-password,ezfinance://auth/callback,ezfinance://auth/reset-password
emailConfirmationRequired=true
```

Com somente chave pública, Auth settings HTTP 200/Google true. Requisição ao `/auth/v1/authorize` com provider Google, retorno do app e challenge S256 retornou **302** para `https://accounts.google.com`. Inspeção do Location em memória: Client ID corresponde ao arquivo privado, redirect_uri corresponde ao callback Google→Supabase, response_type `code`, state presente, scopes `email profile`. URL completa/state não publicados nem redirecionamento seguido. Não houve sessão, conta ou troca de código; o challenge foi de diagnóstico, não tentativa de login do produto. Validade do segredo no token endpoint não foi provada.

Origem/callback documentados confrontados com a [documentação oficial Google/Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google) e configuração efetiva local. **Console Google não inspecionado:** cadastro externo, consentimento, escopos e usuários de teste são relato/preparação; a aceitação externa real será demonstrada no login da SPEC-003. Não chamar este teste de Google ponta a ponta.

Navegador real, origem localhost:8081, diagnóstico temporário usando módulos/SDK reais:

```json
{
  "origin": "http://localhost:8081",
  "clientReused": true,
  "pkce": true,
  "persistentSession": false,
  "automaticUrlSession": false,
  "apiHttp": 200,
  "googleEnabled": true,
  "sessionAbsent": true,
  "transactions": { "http": 401, "code": "42501", "dataIsNull": true, "denied": true },
  "categories": { "http": 401, "code": "42501", "dataIsNull": true, "denied": true },
  "unavailable": "network-unavailable",
  "result": "PASS"
}
```

### Preservação e regressões

Antes do reinício e depois do restart/regressão SQL: mesmas contagens, versão de migration e resumos MD5 do conteúdo completo das três tabelas, comparados sem publicar linhas:

| Item | Antes | Depois |
| --- | --- | --- |
| Categorias | 10; `6ea949f8a413f91e77a31b6f1ec9c675` | Igual |
| Lançamentos | 0; `d41d8cd98f00b204e9800998ecf8427e` | Igual |
| Usuários Auth | 0; `d41d8cd98f00b204e9800998ecf8427e` | Igual |
| Migration | `20261007000100` | Igual |

`npm test`: **17 aprovados**; `npm run typecheck`: saída 0; `npx --offline --yes supabase@2.120.0 test db`: **53 aprovados**; `npm run build:web`: saída 0; `git diff --check`: passou. Diagnóstico temporário removido antes do export. Saída de inicialização sanitizada privadamente; testes/logs não exibiram credenciais.

Exportação com `.env` privado presente, comparada em memória contra Client ID/Secret conhecidos:

```text
publicUrlIncluded=true
publicKeyIncluded=true
googleCredentialsFoundInBundle=false
googleCredentialsFoundInOperationalLogs=false
temporaryDiagnosticIncluded=false
temporaryDiagnosticExists=false
```

Essa comparação não é auditoria de todo segredo arbitrário. E01/E04/E06/E07/E08/E09 reforçados por restart/dados, proteção/exportação, navegador, flags/URLs, provider presente e regressões atuais; E02/E03/E05 mantidos e cobertos pelos 17 testes. **E01–E09 atendidos no escopo de preparação; etapa 2 concluída.** Autenticação completa/PKCE real, vínculo, callbacks e persistência aguardam solicitação de implementação da [SPEC-003](../specs/003-autenticacao.md). Android/APK, hosted, backup e CRUD continuam pendentes em suas etapas.
