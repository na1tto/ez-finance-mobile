# Validação da SPEC-003 — autenticação

Atualizado em **08/10/2026: autenticação web local concluída**, com matriz A01–A15 abaixo e preparação/pendências Android em A16. Arquitetura D12 mantida. Os registros de 07/10 e a revisão independente de 08/10 foram preservados como histórico; a seção final registra a resolução das pendências, distinguindo unidade, serviço, navegador integrado e intervenção humana no navegador externo. Android/APK não concluídos.

## Entrega conferida

- `src/lib/auth/`: controller, parsing/correlação de callbacks, mensagens sem dados do serviço, adapters por plataforma e coordenação de tentativas.
- `src/contexts/AuthContext.tsx`: cliente único, eventos Auth, restauração, listeners e remoção dos parâmetros do callback do histórico antes do processamento.
- `src/app/auth/`: Google, cadastro/login email-senha, confirmação/reenvio, recuperação restrita e conta/logout. Layout raiz protege rotas e recria o provider financeiro por identidade; coleção experimental continua em memória.
- SDK 2.117.3 com PKCE, persistência/refresh quando recebe adapter, sem detecção automática de URL. Controller é responsável pela troca do código.
- Web: localStorage por endpoint e Web Locks; falha de storage/coordenação é explícita, sem fallback. Android: SecureStore em blocos com manifesto, sem storage comum; Expo Crypto fornece aleatoriedade/SHA-256 para PKCE. Adicionados `expo-secure-store ~57.0.4` e `expo-crypto ~57.0.3`, compatíveis com Expo 57.
- Vínculo escolhido: automático pelo Supabase Auth com email verificado. A tentativa a partir de uma conta exige manutenção do mesmo ID Auth. Não há fusão por email no app, edição de dono, vínculo de emails diferentes ou CRUD financeiro novo.
- Logout usa `scope: 'local'`: encerra esta sessão, limpa storage/material PKCE e bloqueia acesso privado imediatamente. Access tokens já emitidos podem permanecer válidos no serviço até expirar; não há promessa de logout de outros aparelhos.

## Resultados iniciais — histórico de 07/10/2026

`npm run test:auth`: **29 testes passaram**, sendo 28 de domínio/configuração/unidade e uma suíte integrada. Esta suíte usa SDK/controller reais, Auth/API/Mailpit locais e adapter persistente em memória compartilhado entre runtimes; não prova localStorage real ou fechar/reabrir o navegador.

A suíte integrada verificou cadastro não confirmado bloqueado, reenvio/confirmar via Mailpit e troca PKCE, senha válida/inválida, restauração em novo runtime, renovação real via refresh, recuperação restrita, atualização de senha, login posterior, reuso de link negado, verifier incorreto, logout e refresh revogado. Para induzir tentativa de refresh, alterou apenas metadados de expiração da fixture em seu próprio storage; não alterou relógio, Auth ou políticas. Não prova renovação automática após expiração natural no navegador.

Duas contas fictícias e uma fixture financeira comprovaram negação real na API: JWT de A não lê/altera/remove B nem insere em nome de B; B manteve sua linha e chave pública sem sessão não acessou dados. Fixture e contas são removidas por IDs conhecidos. Mailpit remove somente mensagens endereçadas aos emails únicos daquela execução, sem limpar a caixa existente. Testes SQL anteriores desta implementação: **53 passaram**, sem mudança de migration/RLS/grants.

`npm run typecheck` e `npm run build:web`: **aprovados**, novamente após as correções finais. Exportação Android também aprovada em diretório ignorado `supabase/.temp/spec003-android`; é prova de empacotamento, não APK/aparelho. A primeira tentativa Android falhou por permissão de arquivo temporário do Hermes; a execução com acesso apropriado passou.

No navegador integrado real: tela de entrada renderizada; acesso direto a `/expenses/new` sem sessão redirecionou para login; tentativa pendente bloqueou novo início; callback com tentativa obsoleta não criou sessão nem apagou a tentativa atual.

No navegador externo, o usuário também confirmou que “Minha conta” mostra seu email, que após sair o acesso direto a `/expenses/new` conduz ao login e que “Continuar com Google” permite autenticar novamente. Prova humana de identidade exibida, logout/guard e novo login registrada; não houve captura automatizada de localStorage externo. O relato não detalhou fechamento/reabertura, duas abas ou renovação após expiração.

Google real chegou à entrada e à tela de consentimento com o email de teste autorizado pelo usuário. A tela permaneceu sob overlay de carregamento; console registrou `Uncaught (in promise) RpcError` na página Google, antes do callback. Recarregar essa página resultou em **400 — solicitação inválida**. O usuário iniciou um novo fluxo pelo Ez Finance no navegador externo e informou: **“Perfeito, funcionou no navegador externo!”**. Conferência no Auth local confirmou uma identidade Google com email verificado e uma sessão emitida; credenciais do servidor e troca real Google foram, portanto, exercitadas. O navegador externo não está conectado às ferramentas desta sessão: observação visual final é relato humano, complementado pela prova no serviço. Não copiar a URL de autorização entre navegadores.

## Matriz atualizada — 08/10/2026

| Caso | Estado real |
| --- | --- |
| A01 | **Passou.** Dois emails autorizados executaram Google real externamente; Auth original mantém confirmação, vínculo manual desabilitado e JWT de 3600 s. Sem reset nem segredo administrativo no cliente. |
| A02 | **Passou.** Rotas diretas sem sessão/refresh/logout levam ao login; recuperação real bloqueia `/expenses/new`. Voltar após cancelamento não recupera acesso. |
| A03 | **Passou.** Cadastro completo realizado pessoalmente pelo usuário; formulário de reenvio, Mailpit e confirmação exercitados na mesma origem. Fixture não confirmada rejeitada no Auth e na UI. Link expirado rejeitado pelo serviço; método de indução descrito abaixo. |
| A04 | **Passou.** Senha válida/inválida e não confirmado no Auth real; login web imediato após recuperação confirmado pelo usuário. Botões bloqueados durante envio/tentativa. |
| A05 | **Passou.** Google/PKCE externo real, retorno à aplicação e provas Auth/API dos dois métodos; consentimento pessoal, sem copiar URL entre navegadores. |
| A06 | **Passou.** Reuso/verifier errado no serviço; link expirado, retorno obsoleto e cancelamento na UI; parser cobre código/redirect inesperado e erro. Erro Google de navegador integrado permanece limitação documentada, contornada por fluxo novo externo. |
| A07 | **Passou.** Duas abas reais: disputa sob Web Locks aceita uma tentativa, rejeita a outra, permite cancelamento cruzado e sincroniza logout/nova entrada. Duplicação de handlers/respostas obsoletas também coberta em unidade. |
| A08 | **Passou.** Recuperação/Mailpit, senha atualizada e login posterior reais; usuário concluiu definição de senha. Rota restrita e cancelamento corrigido testados no navegador; expirado/reuso não concedem sessão. |
| A09 | **Passou.** localStorage real, reload e fechamento/reabertura de abas; usuário confirmou fechar todas as janelas do navegador externo e reabrir conectado com mesmo dono. Falha de storage sem fallback coberta pelos testes do adapter; não foi desabilitado storage do navegador do usuário. |
| A10 | **Passou.** Refresh manual e automático no navegador, restauração de JWT realmente expirado, refresh revogado no serviço e limpeza pelo app. Conexão TCP indisponível real classificada como indisponibilidade, preservando material para retomada; retry também coberto em unidade. |
| A11 | **Passou.** Logout observado nas duas abas, coleção experimental descartada e entrada nova sem coleção anterior. Alternância das duas contas e dos métodos manteve somente a fixture do proprietário correto. Eventos atrasados cobertos em unidade. Escopo local e validade residual do access token mantidos. |
| A12 | **Passou.** Google → senha (Eduardo) e email/senha → Google (paop): IDs Auth registrados antes, mesmos proprietários depois; relatórios reais de API nos dois métodos para cada conta, sem duplicação/fusão. |
| A13 | **Passou.** Vínculo conflitante paop → Google Eduardo rejeitado na UI; ambas as contas preservadas. Email não confirmado rejeitado no Auth/UI; cadastro reivindicando email já confirmado não emite sessão, muda senha/ID ou obtém histórico. Nenhuma identidade Google não verificada foi fabricada para simular essa prova. |
| A14 | **Passou.** JWTs reais: leitura/totais próprios, dono alheio oculto e negação de alteração/exclusão/inserção em nome de B; anon negado. Produto ainda não faz CRUD financeiro de rede. |
| A15 | **Passou.** 31 testes normais/32 com integração, tipos, exportação web e 53 testes SQL. Retornos válidos/expirados com query/hash removidos, inclusive após reload. 32 artefatos web finais sem segredos de servidor conhecidos nem diagnóstico; fixtures e serviços temporários removidos. |
| A16 | **Preparado; execução posterior.** Adapters/deep links e exportação Android anterior. Aparelho, SecureStore real, retomada aberto/fechado, conectividade e APK seguem no marco Android. Nenhuma aprovação nativa inferida da web. |

## Configuração definitiva aplicada

O arquivo `supabase/config.toml` define vínculo manual desabilitado (estratégia automática) e allowlist nativa com parâmetro opaco `attempt`. Uma configuração intermediária com vínculo manual habilitado chegou a ser aplicada ao container. Após o usuário concluir Google externamente, aplicado o arquivo definitivo por stop/start, preservando volumes/dados, **sem reset**. Container confirmou `GOTRUE_SECURITY_MANUAL_LINKING_ENABLED=false`; 53 testes SQL e 29 testes de aplicação/integração passaram novamente. Conferência final: 10 categorias, zero lançamentos financeiros, uma conta Google de teste e sua sessão preservadas. Conta humana autorizada não foi tratada como fixture descartável.

## Reprodução e próximos passos — registro inicial histórico

Logs temporários de início/parada/status foram redigidos contra os valores privados conhecidos e permanecem ignorados. O log Metro ativo está bloqueado pelo processo de desenvolvimento e não foi regravado; preservado para manter o navegador do usuário funcionando. A saída de build exibe nomes de variáveis, sem seus valores. O scan não prova ausência de qualquer segredo desconhecido; códigos/verifier/tokens de usuário não são registrados deliberadamente pelo controller nem pelos testes.

Com Docker/Supabase local disponíveis e variáveis privadas existentes:

```powershell
npm run test:auth
npm run typecheck
npm run build:web
npx --yes supabase@2.120.0 test db
npm run web
```

`test:auth` recusa endpoint diferente de `http://127.0.0.1:54321`; chaves administrativas são lidas em memória somente para criação/limpeza das fixtures, nunca incorporadas ao app. Links Mailpit de confirmação/recuperação devem abrir na mesma origem/navegador que iniciou o fluxo. Há uma tentativa por vez; cancelar antes de reenviar/começar outro método. Link sem contexto PKCE exige nova tentativa, sem autorização por parâmetro de URL.

Concluir A12/A13 e provas restantes de UI/localStorage/abas/renovação. Google externo, email na conta, logout/guard e novo login foram confirmados pelo usuário; não faltam credenciais externas identificadas. O problema observado no consentimento do navegador integrado foi contornado usando navegador externo, sem mudança de arquitetura, scopes ou segurança. Persistência financeira, ambiente hospedado, backup e APK não foram antecipados.

## Revisão independente do retorno — 08/10/2026

Conferidos controller, contratos/correlação de callbacks, adapters, provider Auth, cliente Supabase, proteção de rotas, telas de entrada/recuperação/conta e suites de unidade/integração contra a SPEC-003. A classificação **implementação com validação parcial** é adequada. Não foi identificada nesta revisão razão para declarar todos os critérios A01–A15 atendidos: vínculo e várias provas no navegador continuam sem evidência completa.

Reproduzidos:

- `npm test`: 28 testes de domínio/configuração/unidade aprovados.
- `npm run typecheck`: saída 0.
- `npm run test:auth`: 29 testes aprovados, incluindo uma suíte integrada com SDK/controller e Auth/API/Mailpit reais. Usa adapter compartilhado em memória; não comprova localStorage, Web Locks ou SecureStore reais.
- `npx --offline --yes supabase@2.120.0 test db`: 53 testes, saída 0, `Result: PASS`.

A suíte integrada cria e limpa somente fixtures identificadas de sua execução; não altera a conta Google de teste do usuário. Docker/integração exigiram execução autorizada fora do sandbox. Nesta revisão não houve reset, reinício, mudança no código/configuração nem novo login Google. Exportações web/Android, comparação de bundle e observações em navegador permanecem evidências da entrega anterior, não foram reproduzidas. A causa exata da falha no navegador integrado não foi investigada; o relato delimita onde ela ocorreu, sem comprovar sua causa.

### Próxima entrega recomendada: fechar a validação web da SPEC-003

1. **A12/A13:** conta Google habilita senha e entra pelos dois métodos mantendo ID Auth/dono; conta email-senha confirmada entra/vincula Google mantendo ID; identidade não verificada e conflito não ganham histórico. Usar contas de teste e prova real no Auth; unidade não basta.
2. **A09–A11/A07:** localStorage real após refresh e fechar/reabrir; duas abas, logout e entrada de outra conta sem coleção anterior; renovar sessão no navegador e tratar refresh inválido/revogado/falha de rede. Confirmar armazenamento e coordenação reais, além da simulação atual.
3. **A02–A08/A15:** completar formulários reais de cadastro, confirmação/reenvio e recuperação; testar voltar/rotas diretas, cancelamento/erros/expiração, remoção dos parâmetros sensíveis e ausência de acesso financeiro durante recuperação.
4. Atualizar a matriz com resultados por caso e corrigir problemas encontrados, sem antecipar CRUD ou enfraquecer Auth/RLS. Somente após fechar os critérios web avançar à etapa 4 de persistência financeira.

Preparação/teste em Android deve continuar registrada separadamente: exportação Android é empacotamento, não APK, dispositivo, SecureStore real ou retorno com app aberto/fechado. Essa execução pode permanecer no marco Android planejado e não exige adiar todo desenvolvimento após a conclusão web. Não declarar autenticação/V1 em Android concluídas por aprovação web.

## Conclusão da validação web — 08/10/2026

Esta execução resolve as pendências da revisão acima. Foram corrigidos comportamentos observados e conferidos na validação:

- Após definir/recuperar senha, login válido podia voltar à confirmação e só depois chegar à lista. A navegação agora deriva do estado validado: autenticado sai das rotas públicas/recuperação; recuperação continua restrita. O usuário repetiu a entrada com a senha existente e confirmou **“Ok, foi direto”**.
- Nova entrada em uma aba após logout não restabelecia a outra. Eventos de storage agora invalidam respostas/estado privado anteriores e restauram a sessão validada, aguardando a conclusão da tentativa antes de admitir um callback de outra aba. Repetido em duas abas reais com coleção experimental zerada.
- Cancelar recuperação permanecia na tela de link inválido. Cancelamento agora encerra a sessão e substitui a rota por login; voltar não concede acesso.
- Após rejeitar link expirado, o Router podia repor query/hash limpos na inicialização. A navegação também remove seus parâmetros retidos após processamento. Repetido com link realmente rejeitado pelo Auth, URL sem query/hash e refresh sem acesso. A aba que perde a disputa por uma tentativa agora exibe seu cancelamento.
- Conferência final encontrou que broadcasts do SDK também precisavam aguardar o commit do callback. A validação agora bloqueia token recém-escrito enquanto a tentativa estiver ativa, com cancelamento/logout disponível durante a espera. Um novo teste de regressão cobre o evento antes do commit; retorno real de recuperação com duas abas levou ambas ao formulário restrito, inclusive após acesso direto a `/expenses/new`. Cancelar em uma removeu a sessão e a possibilidade de trocar senha na outra; sua rota financeira direta voltou ao login.

### Identidade e proprietário — prova humana e serviço real

O usuário definiu pessoalmente a senha da conta originalmente Google e criou/confirmou pessoalmente `paop90646@gmail.com` pelo formulário/Mailpit. IDs Auth e donos de duas fixtures financeiras de 100 centavos foram registrados privadamente antes do vínculo da segunda conta. O usuário realizou Google externo com o email correto e retornou autenticado. Conferência administrativa posterior: Eduardo manteve a identidade Google; paop passou de `email` a `email, google`; ambos conservaram seu ID Auth e dono original. Habilitar senha numa conta Google não exige criar uma linha de identidade `email`: a senha no Auth e o login real por ela foram comprovados.

Em cada conta, o usuário executou o diagnóstico **após Google e após email/senha**, recebendo `session=true`, `verified=true`, `persistent=true`, `sameAuthId=true`, `sameFinancialOwner=true`, `ownTotal=100`, `otherOwnerHidden=true`. O diagnóstico usa SDK, JWT e API reais do navegador; não é comparação fabricada de objetos. Ao tentar vincular paop ao Google de Eduardo, o retorno foi rejeitado com **“Não foi possível concluir. Verifique os dados ou solicite uma nova tentativa.”**. Novas entradas Google/senha na conta original mantiveram os mesmos resultados. Conferência no Auth após o conflito manteve as duas contas e identidades corretas.

Email não confirmado foi criado pelo `signUp` real, sem confirmação administrativa: login rejeitado com `email_not_confirmed`, feedback no formulário e sem sessão. Depois, reenvio no formulário e confirmação Mailpit no mesmo navegador/origem autenticaram a fixture. A integração passou a testar também cadastro com email coincidente, incluindo variação de caixa, sem emissão de sessão, troca de senha/ID ou acesso a histórico. Estas são provas reais de identidade não verificada/coincidência e conflito; não houve edição administrativa de identidades Google para simular vínculo.

### Sessão, concorrência e expiração

Navegador integrado: login por senha, reload, encerramento de todas as abas da origem de teste e abertura de nova aba restauraram a fixture. Duas abas de aplicação real sincronizaram logout/nova entrada e removeram a coleção experimental anterior. Duas solicitações concorrentes de recuperação usaram Web Locks reais: uma recebeu link, outra foi bloqueada pela tentativa existente; cancelar na segunda liberou a primeira. Unidade continua cobrindo handlers duplicados e respostas tardias, sem substituir estas provas de armazenamento/coordenação.

Navegador externo: o usuário fechou todas as janelas, reabriu `/auth/account` e viu `eduardo3245.ss@gmail.com` sem novo login. A conferência posterior manteve todos os indicadores de ID/proprietário/isolamento verdadeiros. Observação externa é relato humano, complementado pela API real do diagnóstico; não se afirma automação do navegador externo.

Para expiração, foi criado um **Auth temporário local da mesma imagem/configuração**, conectado à stack existente, com única diferença `GOTRUE_JWT_EXP=120`; o Auth original permaneceu em 3600 segundos. Uma ponte HTTP temporária, restrita a loopback, origem `localhost:8082`, endpoint de senha e email da fixture descartável, forneceu o transporte CORS normalmente oferecido pelo gateway. Não implementou emissão de tokens, políticas ou API de produto; não usou JWT fabricado, reset, mudança de relógio ou relaxamento de RLS. Nenhuma conta humana foi usada nesse transporte.

O JWT emitido tinha prazo real de 120 segundos e foi validado pelo Auth original. Na aplicação aberta, o observador de storage sem inicializar SDK detectou renovação automática para JWT de 3600 segundos. Em outra execução, foram fechadas as abas da aplicação e mantido apenas observador sem SDK: após esperar, detectou `expired=true`, `shortToken=true`, `changedSinceSeed=false`. Ao reabrir a aplicação, a mesma fixture apareceu autenticada e o observador registrou `expired=false`, `shortToken=false`, `changedSinceSeed=true`. Isto comprova restauração após expiração real, além do refresh manual real já aprovado.

Refresh revogado: `signOut(local)` real apenas da fixture; reintrodução de sua sessão revogada com metadado `expires_at` vencido, sem falsificar JWT. A aplicação reaberta em `/expenses/new` exigiu login e o observador registrou `stored=false`. Este caso usa metadado vencido para forçar refresh e é distinto da prova de expiração natural acima. Falha transitória: a integração usou SDK/controller e credencial realmente emitida contra uma porta TCP indisponível, bloqueou conteúdo como `unavailable` e preservou storage; retomada/retry e mensagens também cobertos em unidade.

Recuperação: Mailpit real levou ao formulário restrito; rota direta financeira voltou à recuperação, salvar sem senha válida permaneceu desabilitado e cancelar voltou ao login. O usuário realizou a troca completa de senha; serviço real confirmou login posterior, senha antiga negada e reuso negado. Para link expirado sem esperar uma hora, envelhecido **somente `recovery_sent_at` da fixture descartável** em duas horas. O próprio Auth rejeitou seu link antes da troca PKCE; UI/refresh não concederam sessão e query/hash foram removidos. Não se apresenta esse envelhecimento como espera natural de uma hora; políticas e prazo do serviço não foram alterados.

### Verificação final e limpeza

- `npm run typecheck`: saída 0; `npm test`: 31 aprovados; `npm run test:auth`: 32 aprovados, com suíte integrada ampliada para coincidência de email e conexão indisponível real.
- `npx --offline --yes supabase@2.120.0 test db`: 53 aprovados, `Result: PASS`; migrations/RLS/grants preservados.
- `npm run build:web`: saída 0, 11 rotas exportadas. Scan de 32 artefatos web finais: zero valores Google/administrativos locais conhecidos e nenhum diagnóstico. Não prova ausência de segredo desconhecido. Não houve novo teste em aparelho Android.
- Removidos apenas dois lançamentos por IDs/donos registrados, três contas automáticas `spec003-ui-…@example.test` e nove mensagens endereçadas exatamente a essas fixtures. Nenhuma mensagem das contas humanas apagada; sem purga geral Mailpit.
- Ambas as contas humanas preservadas, confirmadas e com senha configurada; dez categorias, zero lançamentos e zero contas UI descartáveis ao final. Container de expiração, ponte HTTP, Metro 8082, arquivos privados de senha/link/baseline e diagnóstico público removidos. Aplicação original em 8081 preservada; Auth original continua com JWT 3600, confirmação habilitada e vínculo manual desabilitado.

`scripts/check-auth-web.cjs` permite diagnóstico local opcional de sessão/refresh, recusando ações destrutivas sobre contas humanas. Sem baseline privada anterior, `sameAuthId` não é aprovado e dono não é presumido; a prova desta execução está acima. Usar `node scripts/check-auth-web.cjs --clean` antes de exportar; o export recusa diagnósticos presentes. A página usada nos testes foi removida e sua URL não constitui tela de produto.

**Pendências:** nenhuma credencial externa ou critério obrigatório web identificado como faltante nesta execução. Android/aparelho/APK, ambiente hospedado, backup operacional e persistência/CRUD financeiro continuam nas etapas posteriores, mediante escopo correspondente. Google do navegador integrado permanece limitação de ambiente; validação Google desta entrega usa navegador externo. A revisão independente histórica não foi reescrita como se tivesse aprovado os resultados posteriores.
