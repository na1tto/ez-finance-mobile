# SPEC-002 — Ambiente e integração Supabase

**Data:** 07/10/2026. **Estado atual:** **concluída no escopo de preparação**, incluindo Google habilitado/verificado no Supabase local. Login, troca PKCE e retorno ponta a ponta permanecem na SPEC-003.

**Etapa:** completar a preparação da etapa 2 do [plano](../PLANO_IMPLEMENTACAO.md). **Dependência:** SPEC-001 validada. **Requisitos:** decisões aprovadas no [contexto](../CONTEXTO_APP.md), especialmente D07/D09/D10 e validação web antes do APK.

A solicitação expressa posterior autorizou implementar esta spec, preservando os limites abaixo. Escolhas técnicas foram concretizadas sem mudar requisitos aprovados; autenticação completa e CRUD continuam para etapas posteriores.

## Objetivo

Permitir que o aplicativo seja configurado para o Supabase local e, posteriormente, hospedado, com cliente público preparado para autenticação. Entregar configuração reproduzível, sem segredos administrativos no pacote e sem mudanças no fluxo financeiro experimental. A próxima entrega após esta será autenticação; persistência dos lançamentos vem depois.

## Base inicial conferida (antes da implementação)

- Supabase local via Docker já está ativo, com migration aplicada, dez categorias e testes SQL aprovados. Reutilizar essa stack; não reinicializar, apagar volumes ou repetir a SPEC-001.
- `package.json` não declara SDK Supabase. Não há cliente, leitura de configuração de ambiente ou adapter de sessão no app.
- `.gitignore` ignora `.env*.local`, mas não protege todas as formas de `.env` que podem ser utilizadas. Não imprimir conteúdo de arquivos de credenciais ao investigar.
- `supabase/config.toml` exige confirmação de email, mas URLs de Auth ainda são do template na porta 3000. Google/callbacks não estão integrados.
- O esquema de links `ezfinance` já está declarado em `app.json`; isso não comprova callback nativo funcional. As telas continuam usando `ExpensesContext` em memória.

## Escopo e limites

1. Configuração pública tipada e validada para URL Supabase e chave própria para cliente; exemplo versionado com placeholders, instruções e arquivos locais ignorados.
2. Cliente Supabase reutilizável, com PKCE explicitamente configurado e ponto de integração para a política de sessão da etapa 3. Instanciar cliente não pode significar login validado.
3. Instruções reproduzíveis da stack existente, configuração do navegador e planejamento de endereços/callbacks Android.
4. Preparação de URLs de Auth e configuração do provedor Google pelo mecanismo suportado pelo Supabase local, sem incluir client secret no app.
5. Evidência de conectividade do navegador ao serviço local e de que a chave pública não contorna a autorização do banco.

**Fora desta entrega:** telas/fluxos completos de login, cadastro, confirmação, recuperação, vínculo de identidades, armazenamento/restauração de sessões reais, CRUD de rede, substituição do provider, projeto hospedado, backup executado e APK. Não habilitar acesso anônimo às categorias para facilitar um teste de conexão. Offline permanece adiado.

## Sequência e dependências

1. Ler instruções/contexto/plano, verificar alterações existentes e stack. Preservar mudanças do usuário e fixtures fora deste teste; operações destrutivas não são rotina de inicialização.
2. Definir nomes das configurações públicas compatíveis com Expo, adicionar exemplo sem credenciais e regras para ignorar arquivos reais. Documentar que variáveis públicas entram no pacote e que trocar ambiente requer o processo de recarga/build correspondente.
3. Implementar leitura/validação centralizada e fábrica ou módulo de cliente. Evitar clientes duplicados e conexão silenciosa com ambiente alternativo. Instalar apenas o SDK e dependências comprovadamente necessárias e compatíveis com as versões efetivas do projeto.
4. Fixar/documentar origem e porta de desenvolvimento web e compatibilizar URLs locais de Auth. Separar callback do aplicativo, callback Google para Supabase e links de confirmação/recuperação; documentar suas finalidades. Rotas e tratamentos serão implementados na etapa 3.
5. Preparar configuração Google e listar os valores externos necessários. Credenciais do provedor ficam na configuração do serviço, fora das variáveis públicas. Se não estiverem disponíveis, registrar essa dependência sem inventar valores nem afirmar Google validado.
6. Documentar acesso Android futuro: localhost do computador não é localhost do celular; distinguir emulador e aparelho, API acessível e callback nativo. Não mudar publicamente a exposição dos serviços nem prometer teste em aparelho não executado.
7. Verificar configuração, navegador/API e regressões proporcionais. Registrar resultados, limitações e atualizar contexto/plano.

O adapter de sessão deverá cumprir a política aprovada na etapa 3. Não persistir tokens reais em armazenamento comum como solução provisória. Nesta etapa podem ser usados testes de construção/configuração sem login; a aprovação da sessão exige testes próprios na próxima entrega.

## Critérios de aceitação

| Caso | Resultado esperado |
| --- | --- |
| E01 — Reprodução | Instruções permitem iniciar/reutilizar a stack e aplicar migrations pendentes sem reset automático. Comandos de reset explicitamente separados. |
| E02 — Configuração | Exemplo versionado e configuração tipada; ausência, URL inválida ou chave ausente impedem criar conexão e produzem diagnóstico claro sem expor valores. |
| E03 — Ambientes | URL/chave configuráveis, sem segredo embutido, endpoint financeiro fixo no código ou fallback silencioso para outro ambiente. |
| E04 — Credenciais | Arquivos reais ignorados; exemplo continua versionável. Senha de banco, chave administrativa e client secret Google não integram configuração pública, logs ou bundle. |
| E05 — Cliente | SDK compatível, cliente reutilizável, PKCE explícito; pontos de integração da sessão identificados. Não declarar autenticação/armazenamento seguro concluídos. |
| E06 — Conectividade web | Navegador alcança a API local. Uma requisição financeira sem sessão é negada; erro de permissão difere de indisponibilidade de rede. Usar só chave pública e não relaxar RLS/grants. |
| E07 — Callbacks | Origem/porta web e configurações Auth concordam. Documentadas URLs do app, retorno do provedor ao Supabase e links de email; configuração Android preparada. Retorno ponta a ponta fica para etapa 3. |
| E08 — Dependências externas | Configuração Google preparada ou pendência explícita com valores necessários; nenhum provedor declarado funcional sem teste. |
| E09 — Regressão | `npm test` e `npm run typecheck` passam. Repetir testes SQL se houver mudança na configuração com impacto no banco; não alterar migration da fundação sem necessidade comprovada. |

Verificar casos de configuração sem SDK de rede quando possível; prova de conectividade deve usar o serviço real no navegador. Não confundir resposta sem sessão com histórico vazio. A etapa 2 só será declarada concluída quando seus critérios forem atendidos; dependências externas pendentes mantêm a entrega parcial.

## Continuação após esta entrega

**Dependência de credenciais resolvida:** cliente OAuth Web criado pelo usuário; entradas privadas transferidas de `.env.local` para `.env` da raiz e aplicadas ao Auth. Provider habilitado; serviço e início de autorização verificados, sem autenticar. A configuração no console Google não foi inspecionada diretamente; consentimento, usuários de teste e validade do segredo no token endpoint serão comprovados no fluxo real da SPEC-003. Não há login entregue.

Preparar a SPEC-003 de autenticação com base na configuração efetiva: Google/PKCE, email/senha, confirmação/reenvio/recuperação, proteção de rotas, sessão segura, logout e vínculo seguro de métodos. Validar primeiro na web com contas fictícias e duas identidades para isolamento. Depois integrar CRUD autenticado usando contratos e DTOs da SPEC-001, sem transportar o estado experimental ou contas locais para avaliação hospedada. O APK permanece no plano de entrega.

## Relato exigido do implementador

Listar arquivos alterados, dependências adicionadas e motivo, comandos/testes e resultados, conectividade realmente verificada e pendências externas. Atualizar contexto/plano com o estado efetivo; não converter preparação de callbacks em login entregue ou conexão de teste em persistência do produto.

## Resultado inicial da implementação — 07/10/2026 (registro histórico)

Entregues validação pública e leitor Expo em `src/config/`, entrada/fábrica do cliente em `src/lib/supabase.ts` e `src/lib/supabase/client.ts`, inicialização no layout raiz, templates público/servidor e regras para ignorar arquivos reais. SDK oficial **2.117.3** adicionado ao manifest/lockfile; nenhuma biblioteca de storage/estado/polyfill adicionada. Sessão provisória só na memória interna do SDK, sem login; PKCE explícito e flags persistência/refresh/detecção automática de URL desabilitadas até SPEC-003.

Web fixada em **http://localhost:8081**; Site URL/allowlist Auth aplicadas por stop/start preservando stack/dados. Google preparado com `env(...)` do serviço e mantido desabilitado. Templates e instruções em [ambiente](../AMBIENTE_SUPABASE.md) separam callbacks do app, provedor→Supabase, confirmação e recuperação, além de emulador/aparelho Android planejados. Nenhuma rota de login/callback ou CRUD foi criada.

Preflight nos scripts Expo valida antes de empacotar, evitando incorporar uma chave administrativa no campo público. Testes sem rede confirmam rejeição e diagnóstico sem exposição de valores; navegador real com SDK confirmou API 200 e negação de lançamentos/categorias sem sessão **401/42501, data null**, além de falha de rede controlada. RLS/grants e migration da fundação intactos. Diagnóstico temporário de leitura removido antes do export e protegido contra inclusão pelo preflight.

Verificações aprovadas: `npm test` **17 testes**, `npm run typecheck`, `npm run build:web`, `npx --offline --yes supabase@2.120.0 migration up --local` (nenhuma pendente), `test db` **53 testes**, `git diff --check`. Bundle com par público local, sem valores administrativos locais conhecidos/diagnóstico; arquivos reais ignorados e templates versionáveis. Conferência final do banco: migration existente, dez categorias, zero lançamentos/contas. Estado financeiro experimental mantido.

**E01–E07/E09 validados no escopo de preparação; E08 parcial por dependência externa.** Faltam exatamente `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` e `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET` de um cliente Google OAuth Web, com origem localhost:8081, redirect 127.0.0.1:54321/auth/v1/callback e consentimento/escopos/usuários de teste configurados no Google. Nenhum valor inventado; nenhum Google/login/sessão segura/callback ponta a ponta declarado funcional. Android, hosted e backup não executados. [Evidência detalhada e limites](../validacoes/002-ambiente-integracao-supabase.md).

## Conclusão da configuração Google — 07/10/2026

Credenciais encontradas em `.env.local`, conforme esclarecimento do usuário; somente as duas entradas de servidor foram transferidas para `.env` da raiz. Configuração pública e demais entradas preservadas; ambos os arquivos ignorados. `[auth.external.google].enabled = true`, referências `env(...)`, callback e nonce check mantidos. Stop/start padrão reutilizou a stack sem reset ou alteração de migration.

Auth settings HTTP 200/Google habilitado; container confere credenciais por igualdade em memória, sem publicar valores. `/authorize` com challenge S256 retornou HTTP 302 para Google, com Client ID correspondente, callback `http://127.0.0.1:54321/auth/v1/callback`, `response_type=code` e state presente. Redirecionamento não seguido; nenhum login, sessão ou troca de código. Escopos emitidos pelo serviço nessa prova: `email profile`; consentimento/configuração externa e escopos efetivos no login serão verificados na SPEC-003.

Navegador real confirmou Google habilitado/API 200 e negação financeira sem sessão 401/42501; teste de rede distinto. Resumos dos dados antes/depois idênticos: dez categorias, zero lançamentos/usuários Auth e mesma migration. Regressões: 17 testes, tipos e 53 testes SQL aprovados. Exportação com credenciais privadas presentes verificada conforme evidência. **E01–E09 atendidos no escopo de preparação; etapa 2 concluída.** Autenticação web/Android, consentimento Google e callbacks reais não declarados validados. Próxima entrega: [SPEC-003 preparada](003-autenticacao.md), implementação ainda não autorizada.
