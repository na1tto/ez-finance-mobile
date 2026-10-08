# SPEC-003 — Autenticação e sessão

**Data:** 07/10/2026; atualizada em **08/10/2026**. **Estado:** concluída no marco web local, A01–A15 comprovados com Auth/API/Mailpit e navegador reais, incluindo intervenção humana Google. A16 preparado; aparelho/Android/APK posteriores. Vínculo nos dois sentidos preservou ID Auth/proprietário; conflito rejeitado e contas humanas preservadas. **Política web/Android aprovada:** decisão D12, seção 4. Evidências, métodos e limites em [validação da SPEC-003](../validacoes/003-autenticacao.md).

**Etapa:** 3 do [plano](../PLANO_IMPLEMENTACAO.md). **Fontes:** [contexto e decisões D01–D12](../CONTEXTO_APP.md), [SPEC-002](002-ambiente-e-integracao-supabase.md) e [ambiente Supabase](../AMBIENTE_SUPABASE.md).

O usuário autorizou posteriormente implementar esta spec, incluindo código, configuração local e testes no escopo abaixo. Não presumir autorização para provisionar serviços hospedados, publicar ou mudar significativamente a arquitetura. D12 foi mantida: cliente direto, localStorage na web e armazenamento protegido no Android. Se a solução web exigir mudança significativa em relação à D12, apresentar proposta concreta e obter aprovação antes de implementá-la.

## 1. Objetivo e dependências

Entregar autenticação real primeiro na web: Google principal por Supabase Auth/Authorization Code com PKCE; cadastro/login email e senha secundário; confirmação, reenvio e recuperação; sessão persistente e renovável; rotas protegidas; logout com limpeza de estado privado; identidade compartilhada após vínculo seguro. Preparar a integração Android sem declarar APK ou fluxo nativo validado por testes web.

Pré-requisitos:

- Fundação financeira da SPEC-001 validada e stack local existente reutilizada.
- Configuração pública/SDK da SPEC-002 disponíveis. O usuário informou ter criado o cliente OAuth Web e configurado suas credenciais privadamente no `.env` da raiz; conferir existência/leitura do arquivo sem imprimir valores. Esse relato **não comprova** consentimento/URLs externos corretos ou provider habilitado. O estado observado deve constar na evidência da SPEC-002.
- Provider Google habilitado e credenciais de servidor aplicadas na conclusão da SPEC-002: settings 200/Google true e início de redirect 302 verificados, sem login. Reconfirmar esse estado ao implementar; configuração externa/consentimento e validade do segredo serão comprovados no fluxo real. Se faltarem valores no ambiente da implementação, registrar dependência sem inventar credenciais.
- Aplicar a política de sessão da seção 4, aprovada nesta elaboração. Autenticação por senha também depende dessa integração.

## 2. Base real conferida antes da implementação

| Artefato | Estado atual e ação necessária |
| --- | --- |
| `src/config/` e `.env.example` | Configuração pública validada; manter separação entre chave de cliente e segredos de servidor. |
| `src/lib/supabase.ts` / `src/lib/supabase/client.ts` | SDK 2.117.3, entrada reutilizável, `flowType: 'pkce'`; persistência, refresh e detecção automática de URL desativados. Integrar storage e ciclo de sessão antes de ativá-los. |
| `src/app/_layout.tsx` | Prepara cliente e envolve Stack com ExpensesProvider; sem restauração de sessão, guard ou login. |
| `src/contexts/ExpensesContext.tsx` | Despesas experimentais em memória sem usuário. Estado deve ser descartado ao sair/trocar conta; CRUD de rede continua posterior. |
| `supabase/config.toml` | Confirmação de email habilitada; Google habilitado/aplicado ao Auth na conclusão da SPEC-002, sem login real; vínculo manual desabilitado; política atual de senha mínima de seis caracteres, sem composição adicional. Não inventar nova política de senha. |
| URLs locais | Site URL `http://localhost:8081`; retornos do app `/auth/callback` e `/auth/reset-password`; callback Google para Supabase `http://127.0.0.1:54321/auth/v1/callback`. Rotas do app ainda ausentes. |
| Android | Scheme `ezfinance` já declarado; callbacks `ezfinance://auth/callback` e `ezfinance://auth/reset-password` preparados. Não houve validação em aparelho. |

## 3. Escopo aprovado e limites

Inclui telas/serviços de autenticação, callbacks, estado de sessão, proteção da navegação, integração do armazenamento escolhido, configurações Auth locais necessárias e interface mínima para habilitar o segundo método na mesma identidade. Mensagens e formulários devem funcionar na web, sem depender de alertas nativos não verificados.

Não inclui CRUD financeiro persistido, filtros/dashboard novos, migração dos registros em memória, fusão de duas contas existentes, remoção de conta, desvinculação de métodos, MFA, biometria obrigatória, novo servidor OAuth, suporte offline, Supabase hospedado, backup operacional ou geração/publicação de APK. Login não torna os lançamentos atuais duráveis; deixar esse limite visível nas instruções de teste.

Permitir aos usuários de teste autenticados acessar o fluxo experimental protegido é suficiente nesta etapa. Nenhum estado desse fluxo pode transitar de uma identidade para outra.

## 4. Decisão aprovada de sessão por plataforma — D12

**Aprovado anteriormente:** sessão persistente, renovação, limpeza ao sair e armazenamento seguro conforme plataforma. **Aprovação expressa nesta elaboração:** manter cliente Supabase direto, aceitar armazenamento do navegador acessível ao JavaScript na web e usar armazenamento seguro do sistema no Android. Esta decisão especifica a política anterior para a web; não autoriza armazenamento comum de tokens no Android.

O SDK no navegador precisa utilizar credenciais para manter sessão. Armazenamento persistente acessível ao JavaScript não oferece a proteção de cookies HttpOnly; adicionar cookies legíveis pelo JavaScript ou criptografar com chave acessível ao mesmo aplicativo não resolve essa diferença. A documentação oficial descreve [tokens acessíveis ao cliente e armazenamento de sessão](https://supabase.com/docs/guides/auth/server-side/advanced-guide).

**Combinação escolhida:** SDK direto e armazenamento persistente na origem do navegador; não implementar servidor intermediário ou cookies HttpOnly. O adapter web pode utilizar localStorage, com integração documentada ao SDK. O usuário aceitou a exposição dos tokens ao JavaScript nessa plataforma; não prometer proteção contra execução de scripts maliciosos na mesma origem. Não registrar tokens, senha ou verifier em logs/diagnósticos; não carregar scripts externos desnecessários nem renderizar conteúdo não confiável como HTML. Usar HTTPS no ambiente hospedado; HTTP permanece restrito ao desenvolvimento local aprovado.

Testar restauração, remoção ao sair, sincronização entre abas e armazenamento indisponível. Separar chaves por ambiente/projeto para evitar mistura de sessões e remover material de tentativas concluídas/obsoletas. Não remover o requisito de persistência para contornar falhas do adapter. Medidas concretas de prevenção de exposição devem aparecer no relato; localStorage não passa a ser descrito como armazenamento criptografado ou equivalente ao sistema móvel.

Android: candidato técnico é um adapter de armazenamento protegido do sistema, por exemplo [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/), compatível com a versão efetiva do Expo. Verificar tamanho da sessão, erros de leitura/escrita e disponibilidade por plataforma; não usar fallback silencioso para AsyncStorage. Persistir/restaurar o verifier PKCE pelo mecanismo escolhido, além da sessão. A biblioteca concreta é escolha técnica rotineira, sem aprovar biometria ou dependência de desbloqueio como comportamento novo.

## 5. Contratos de comportamento

### Sessão e navegação

- Estado explícito: inicializando/restaurando, desconectado, operação em andamento, autenticado, recuperação de senha restrita e erro recuperável. Os nomes e a organização são livres.
- Durante inicialização/restauração, não montar telas financeiras nem mostrar dados antigos. Validar/renovar a sessão conforme contrato do serviço antes de liberar acesso; ler storage não é autorização do banco.
- Sem sessão válida, acesso direto, refresh ou voltar para `/` e `/expenses/*` conduz à autenticação. Rotas de entrada, confirmação e recuperação são públicas controladas; retornar de um callback não libera acesso por si só.
- Um cliente e uma assinatura de eventos Auth por runtime. Tratar cleanup, eventos repetidos e respostas assíncronas antigas; uma resposta da conta A não pode restaurar estado após logout/entrada de B.
- Renovar quando permitido; ao detectar sessão não recuperável, limpar credenciais/estado e solicitar login. Erro transitório de rede não deve ser confundido com revogação definitiva; informar indisponibilidade sem liberar acesso offline a dados financeiros.
- Senhas não são persistidas ou registradas em logs. Tokens, verifier e códigos não aparecem em logs, mensagens ou URLs após processamento. Limpar material de tentativa ao terminar/cancelar e limpar credenciais ao sair.

### Google e PKCE

- Iniciar pelo SDK Supabase, com PKCE explícito, retorno permitido e verifier associado à tentativa. Não criar protocolo OAuth próprio, trocar por fluxo implícito ou utilizar login nativo por ID token como substituição do fluxo aprovado.
- Tratar callback em `/auth/callback`; escolher um único responsável pela troca do código e evitar duplicação entre handlers e detecção automática do SDK. Verifier deve sobreviver à navegação/reload exigidos pelo fluxo.
- Restringir destinos de retorno a rotas locais permitidas; não aceitar redirecionamento externo por parâmetro arbitrário. Validar origem/caminho e finalidade do retorno conforme plataforma e contrato do serviço.
- Código inválido, expirado, reutilizado, verifier ausente/incorreto, cancelamento e erro do provedor não criam nova sessão. Uma tentativa inválida não troca silenciosamente uma conta já autenticada.
- Evitar sobrescrever verifier em tentativas concorrentes, incluindo abas. Usar capacidade suportada pela versão instalada ou impedir/invalidar tentativas concorrentes de modo seguro e visível. Não depender de API experimental apenas porque consta da documentação atual. A [documentação PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow) descreve armazenamento do verifier e conflitos entre fluxos.

### Email/senha, confirmação e recuperação

- Cadastro e login pelo Supabase Auth, com feedback de campos e requisitos efetivos do serviço. Não aparar, transformar ou persistir a senha; não criar limite/política extra sem necessidade aprovada.
- Cadastro não confirmado mostra instruções e reenvio; não libera telas ou dados financeiros. Confirmar no serviço, manter `enable_confirmations = true` e testar link válido/inválido/expirado. Usar email de teste e Mailpit local; não configurar envio de produção nesta entrega.
- Reenvio e recuperação têm estados de envio/erro e respeitam rate limits do serviço. Evitar mensagens que confirmem a existência de contas; não presumir que resposta de cadastro ofuscada significa conta criada ou email enviado.
- Recuperação solicita email e retorna para `/auth/reset-password`; validar link/sessão autorizada para recuperação antes de permitir mudança de senha. Não aceitar mero parâmetro de URL como prova.
- A sessão de recuperação pode ser emitida pelo serviço: manter o usuário no fluxo restrito até concluir/cancelar. Não encaminhar automaticamente ao dashboard apenas por receber evento de sessão. Conclusão exige senha atualizada no Auth e possibilidade de autenticação válida; tratar reuso/expiração do link.
- Fluxos PKCE de email devem documentar necessidade de iniciar/abrir no navegador/dispositivo correspondente. Quando o mecanismo exigir contexto ausente, orientar nova tentativa sem acesso indevido; não deixar confirmação/recuperação sem caminho utilizável. Mudança relevante no mecanismo deve ser explicada e aprovada.

### Mesma identidade pelos dois métodos

- Vínculo realizado pelo Supabase Auth, nunca por atualização manual de `user_id`, fusão de lançamentos ou simples igualdade de strings de email no aplicativo.
- Verificar a estratégia suportada pelo Auth instalado: vínculo automático validado pelo serviço para emails verificados e/ou vínculo OAuth a partir de sessão autenticada. Habilitar vínculo manual somente se necessário ao fluxo escolhido, sem ampliar escopo para fusão de contas ou emails diferentes.
- Para conta criada por Google, oferecer habilitação de senha na conta autenticada/verificada, com autenticação recente ou prova de recuperação suportada pelo serviço quando necessária. Criar outro cadastro por email não prova habilitação de senha na conta OAuth. Ver [vínculo e senha em conta OAuth](https://supabase.com/docs/guides/auth/auth-identity-linking).
- Para conta email/senha confirmada, vincular/autenticar Google com prova do provedor e verificar manutenção do mesmo ID Auth. Confirmar os dois sentidos; identidade não verificada não ganha o histórico por coincidência de email.
- Colisão com outra conta existente resulta em erro recuperável, preservando identidades/dados; não mover dados para resolver. Métodos diferentes na mesma conta retornam o mesmo dono financeiro.

### Logout e mudança de conta

- Sair interrompe acesso privado, limpa storage/estado/verifier e descarta a coleção experimental; reabrir não restaura a conta que saiu. Desmontar/remontar o provider por identidade é uma opção técnica.
- Em falha de revogação remota, bloquear acesso e limpar estado local mesmo assim; registrar limitação do serviço sem prometer revogação imediata de todo access token já emitido.
- Documentar explicitamente o escopo de logout configurado no SDK. A política de desconectar outros aparelhos não foi definida como funcionalidade; não adicionar botão ou promessa de logout global. Se a escolha exigir mudar o comportamento esperado, confirmar antes.

## 6. Organização e sequência de implementação

1. Reconfirmar arquivos/instruções, estado do repositório e decisão D12 da seção 4; preservar mudanças do usuário e a aprovação já registrada, sem pedir confirmação novamente.
2. Reconfirmar Google/URLs/secrets localmente sem expor valores, consultando a evidência de conclusão da SPEC-002 e preservando a stack. Separar preparação do provedor de login testado; não repetir reinício/migrations sem necessidade.
3. Implementar adapters e ciclo de sessão, integração com a entrada única do cliente e assinatura Auth. Ajustar os testes da SPEC-002 que fixavam flags provisórias: continuar verificando PKCE/reutilização e testar agora a política aprovada.
4. Implementar provider/guard e rotas públicas. Garantir limpeza do estado experimental por identidade antes de abrir o fluxo privado.
5. Implementar cadastro/login email-senha, confirmação/reenvio e recuperação por link. Testar com Auth/Mailpit reais antes de integrar Google.
6. Implementar Google/PKCE e callbacks, cancelamento/falhas, correlação e concorrência. Validar no navegador real com o cliente OAuth configurado.
7. Implementar habilitação/vínculo seguro dos métodos e testar manutenção da identidade nos dois sentidos.
8. Executar regressões e provas de isolamento com tokens reais de duas contas locais fictícias. Testes de integração podem criar lançamentos exclusivamente como fixtures, com limpeza controlada; não implementar CRUD do produto.
9. Preparar código/callback/storage nativos onde compatível e registrar verificações executadas. Android ponta a ponta/APK continuam no marco posterior; testes web não os substituem.
10. Atualizar contexto/plano/spec, ambiente e `docs/validacoes/003-autenticacao.md` com estado, comandos/resultados, IDs dos casos e pendências. Remover diagnósticos temporários antes de exportar.

Locais candidatos: `src/contexts/` para Auth; `src/lib/` para sessão/adapters; rotas de autenticação sob `src/app/`; testes em `tests/` e integração local separada. Agrupamento de rotas Expo pode preservar `/` e URLs atuais. Não criar biblioteca de estado, ORM ou API própria sem necessidade. Documentar bibliotecas adicionais e compatibilidade.

### Marcos de validação

- **Preparação do serviço (SPEC-002):** verificar flags Auth, URLs, presença das credenciais e início do redirecionamento Google sem login, sem reset e sem publicar a URL de autorização completa. Isso não valida client secret no token endpoint nem consentimento Google.
- **Autenticação web local (SPEC-003):** executar A01–A15 no navegador e Auth reais, registrar testes automatizados e intervenção humana Google separadamente. Restaurar configuração de teste, limpar fixtures controladas e evitar segredos em screenshots/artefatos.
- **Preparação Android nesta spec:** isolar adapter nativo e documentar API/deep links; A16 registra exatamente o que foi conferido e o que falta. Retomada com app aberto/fechado e armazenamento real continuam pendentes até execução no Android.
- **Entrega Android/APK posterior:** repetir autenticação, sessão, vínculo e isolamento no ambiente de entrega das etapas 7–9. Não marcar a autenticação Android/APK como concluída a partir da web.

## 7. Matriz de aceitação

| Caso | Prova e resultado esperado |
| --- | --- |
| A01 — Configuração | Provider Google habilitado com credenciais externas válidas, URLs corretas e segredo fora do cliente; nenhum reset automático. |
| A02 — Guard | Desconectado/restaurando não vê conteúdo financeiro por link direto, refresh ou voltar; recuperação fica restrita ao seu fluxo. |
| A03 — Cadastro | Conta email-senha fictícia criada; sem confirmação não entra na área financeira. Confirmação/reenvio funcionam via Mailpit; links inválidos/expirados não concedem acesso. |
| A04 — Login por senha | Credenciais válidas e email confirmado autenticam; senha inválida/não confirmado falham com feedback; envio repetido não duplica operação. |
| A05 — Google | Navegador real executa autorização, retorno com código e troca PKCE válida; identidade confirmada só depois da resposta válida do serviço. Verifier sobrevive à navegação necessária. |
| A06 — Retornos inválidos | Código inválido/expirado/reutilizado, verifier errado/ausente, erro/cancelamento e redirect inesperado não estabelecem nova sessão nem expõem dados. |
| A07 — Concorrência | Duplo clique, eventos/handlers repetidos e duas abas não misturam verifier, troca ou conta; tentativa obsoleta não restaura sessão após logout. |
| A08 — Recuperação | Pedido/link válido permitem mudar senha na conta correta; inválido/expirado/reutilizado sem acesso; login posterior funciona; nenhuma senha persistida/logada. |
| A09 — Persistência | Refresh, fechar/reabrir navegador e restauração mantêm sessão válida conforme decisão aprovada, sem flash de dados antigos; armazenamento indisponível tem erro explícito, sem fallback inseguro. |
| A10 — Renovação | Expiração com refresh válido renova; refresh inválido/revogado exige login e limpa estado. Falha transitória distingue rede de credencial inválida; sem sucesso offline presumido. |
| A11 — Logout/troca | Sair limpa credenciais/estado; entrar como B não mostra despesas de A; atraso de resposta/evento de A não repopula estado. Escopo remoto e limites de access tokens documentados. |
| A12 — Vínculo | Conta Google com senha habilitada e conta email-senha vinculada ao Google mantêm, em cada cenário, seu ID Auth e dono financeiro original ao alternar métodos. Sem conta duplicada/fusão manual. |
| A13 — Identidade não verificada | Coincidência de email, fluxo incompleto e tentativa de vínculo conflitante não concedem histórico nem transferem dados. Prova real no Auth, além de testes unitários. |
| A14 — Autorização real | Chave pública + JWT de A não lê/edita/remove fixture de B nem insere em nome de B; A acessa sua fixture. Totais consultados só usam linhas autorizadas. RLS/grants não relaxados. |
| A15 — Regressão/segredos | `npm test`, `npm run typecheck`, `npm run build:web` e testes SQL passam. Bundle/logs não incluem senha, client secret, tokens/verifier ou dados das fixtures; parâmetros sensíveis removidos do histórico de navegação após processamento. |
| A16 — Android preparado | Adapter/callback por plataforma e instruções documentados; verificações nativas executadas ou pendentes declaradas. APK e retorno com app aberto/fechado permanecem critérios próprios da etapa 9. |

Testes unitários cobrem estados, concorrência, parsing de retorno, erros e limpeza. Mocks não comprovam emissão de tokens, troca PKCE, vínculo ou RLS. Testes de integração usam Auth/API reais, duas contas fictícias e fixtures controladas; os testes SQL da SPEC-001 continuam regressão necessária, sem substituir A14. Não publicar códigos/tokens/credenciais nas evidências.

Não alterar relógio de produção nem enfraquecer Auth/RLS para induzir expiração. Usar configuração local de teste documentada, espera proporcional ou ferramenta própria do serviço; restaurar a configuração ao terminar. Separar automação de intervenção humana em Google e registrar ambos. Não aceitar falha de rede como prova de rejeição de credenciais.

## 8. Critério de conclusão e entrega ao próximo agente

A SPEC-003 pode ser implementada após solicitação expressa e conferência/configuração efetiva das dependências correspondentes; a política da seção 4 já foi aprovada. Marcar como **parcial** se persistência web, Google real, confirmação/recuperação, vínculo ou testes reais de isolamento estiverem pendentes; não apresentar somente telas prontas como autenticação concluída.

Concluir a autenticação web quando A01–A15 forem atendidos com evidências e A16 tiver preparação/pendências explícitas. A V1 e autenticação no APK ainda não estão concluídas. Integração financeira persistida será a etapa 4: reutilizar contratos, DTOs, cliente e identidade autenticada, sem transportar contas/dados locais de teste para avaliação hospedada.

O relato final deve distinguir código escrito, testes automatizados, fluxos reais exercitados, decisões aprovadas e pendências externas; listar arquivos/dependências e limitações. Preservar todos os requisitos aprovados e manter a arquitetura Supabase, salvo mudança expressamente aprovada.

## 9. Referências técnicas

Entrega web de 08/10: corrigidos navegação após recuperação, sincronização entre abas, cancelamento e limpeza de parâmetros retidos pelo Router. 31 testes normais/32 com integração real, tipos, 53 SQL e exportação web aprovados. Provas de storage/concorrência/vínculo não se apoiam somente em simulação. JWT realmente expirado restaurado no navegador; link expirado induzido envelhecendo somente timestamp da fixture, sem alterar prazo/políticas do Auth. Diagnósticos/serviços/fixtures temporários removidos, sem reset nem CRUD financeiro novo. A revisão independente histórica e a matriz atualizada constam no registro de validação.

Fontes oficiais consultadas nesta elaboração; conferir compatibilidade com as versões instaladas. São orientação técnica, não aprovação de produto: [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow), [senha/confirmar/recuperar](https://supabase.com/docs/guides/auth/passwords), [vínculo de identidades](https://supabase.com/docs/guides/auth/auth-identity-linking), [armazenamento de sessão no navegador](https://supabase.com/docs/guides/auth/server-side/advanced-guide) e [SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/). Configuração Google e URLs já documentadas no [ambiente do projeto](../AMBIENTE_SUPABASE.md).
