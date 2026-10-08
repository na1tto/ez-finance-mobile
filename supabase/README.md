# Fundação financeira — SPEC-001

**Estado em 07/10/2026:** migration aplicada em Supabase local novo e **53 testes SQL aprovados**, inclusive A01–A04. Isolamento validado no banco com papéis `anon`/`authenticated`; autenticação e integração do aplicativo continuam fora desta entrega. Após reinício preservando dados, os mesmos 53 testes passaram novamente.

Versões usadas: Supabase CLI **2.120.0** via `npx` com versão fixa, Docker Engine **29.8.1**, imagem PostgreSQL **17.11.0.004** (servidor **17.11**), pgTAP disponível **1.3.3**, executor pg_prove **3.36**. Evidência completa em [validação local](../docs/validacoes/001-supabase-local.md).

**Continuidade SPEC-002:** concluída no escopo de preparação; cliente público/SDK/PKCE disponíveis e Google habilitado no Auth local, com serviço/início de redirect verificados e dados preservados. Credenciais privadas de servidor em `.env` da raiz, configuração pública em `.env.local`. Site URL `http://localhost:8081`; callbacks exatos web/Android preparados, sem handlers. Login real/sessão/vínculo aguardam implementação da SPEC-003. Ver [ambiente e integração](../docs/AMBIENTE_SUPABASE.md) e [evidência](../docs/validacoes/002-ambiente-integracao-supabase.md). O provider financeiro continua em memória.

## Artefatos e reprodução local

- `migrations/20261007000100_financial_foundation.sql`: schema, dez categorias de referência, índice `(user_id, occurred_on)`, grants, RLS e trigger de validação.
- `tests/001_financial_foundation.test.sql`: pgTAP com fixtures fictícias dentro de transação finalizada com rollback. Os papéis `anon` e `authenticated` executam as verificações de acesso; administrador apenas prepara fixtures e confere integridade referencial.

`config.toml` foi gerado pelo CLI oficial e versionado para este projeto (`ez-finance`), com PostgreSQL 17 e serviços reais de Auth/API. Confirmação de email habilitada conforme requisito aprovado; seeds desabilitados porque fixtures existem apenas nos testes. Analytics de logs desabilitado: o coletor Vector tentou acessar o endpoint TCP do Docker Desktop e falhou com `Network unreachable`. Nenhuma configuração global do Docker foi alterada.

Com Docker iniciado e Node >= 22.18 (validado com 26.7.0; SDK/preflight da SPEC-002), executar na raiz do projeto:

```powershell
npx --yes supabase@2.120.0 start
npx --yes supabase@2.120.0 migration up --local
npx --yes supabase@2.120.0 test db
npm test
npm run typecheck
```

Na primeira inicialização, `start` aplica as migrations automaticamente. `migration up --local` confirmou ausência de migrações pendentes. Para parar preservando os dados, usar `npx --yes supabase@2.120.0 stop`; esse procedimento e a retomada foram executados. Não foi usado reset nem exclusão de volumes. O teste pgTAP usa apenas fixtures fictícias com rollback e pressupõe banco local de desenvolvimento, sem contas reais. Somente `migrations/` acompanha o destino hospedado (S02).

Studio: [http://127.0.0.1:54323](http://127.0.0.1:54323). API local: `http://127.0.0.1:54321`; PostgreSQL: porta `54322`. Credenciais locais podem ser consultadas pelo CLI, mas não são registradas na documentação. `supabase/.temp/` e chaves de assinatura estão ignorados pelo Git. SPEC-003 implementou Auth, handlers, sessão e guard; Google real funcionou externamente. Vínculo e provas restantes web/Android estão em [validação da autenticação](../docs/validacoes/003-autenticacao.md). CRUD financeiro/hospedado permanecem posteriores.

## Contratos e escolhas

Domínio: `src/types/transaction.ts`; regras em `src/domain/`; catálogo em `src/constants/transactionCategories.ts`. O contrato experimental `Expense` e seus consumidores permanecem como estavam. Não há integração do provider com banco.

`TransactionInput` só possui campos editáveis. `TransactionDraft` recebe valor textual e data opcional; validação produz entrada com centavos e data preenchida. `transactionInputToRow` copia explicitamente campos snake_case, descartando identidade/dono/instante mesmo se presentes no objeto recebido. `transactionFromRow` converte a leitura persistida; UUIDs e instante vêm do banco. Não é cliente de rede nem autorização.

Dinheiro: espaços externos e zeros à esquerda são aceitos; separador sem casas (`1,`), milhar, expoentes, sinal, espaços internos e mais de duas casas são rejeitados. Conversão por dígitos/BigInt antes de retornar `number`; nenhuma interpretação de reais em ponto flutuante. Valores de lançamentos são inteiros positivos até 99.999.999. Formatação BRL usa dígitos inteiros, inclusive para saldo negativo. Agregações verificam `Number.isSafeInteger` e rejeitam overflow, sem aplicar o teto de um lançamento aos totais. Se uma futura consulta SQL retornar `bigint`/`numeric` ou strings, sua integração deve validar conversão antes de chamar estas funções; nenhuma RPC/view de totais foi criada.

Descrição: `trim()` nas extremidades, sem truncamento; trigger usa o mesmo conjunto de espaços Unicode do ECMAScript, e constraint rejeita texto vazio após normalização. Sem limite adicional de texto.

Datas: dias civis `YYYY-MM-DD`, calendário de 0001 a 9999, sem conversão para meia-noite UTC. Referência compartilhada de hoje: `America/Sao_Paulo`, independente do fuso configurado no dispositivo/banco. No domínio, hoje é injetável para testes. No banco, `statement_timestamp()` convertido nesse fuso é avaliado em cada insert/update, incluindo alterações de outros campos; virada de dia é considerada no início de cada comando, sem depender de CHECK estático ou do início de uma transação longa. `monthlyPeriod` retorna início inclusivo/próximo mês exclusivo; dezembro de 9999 tem limite superior `null` por não haver próximo mês no calendário suportado. Referência por fuso individual não foi adicionada.

Identidade: `user_id` referencia `auth.users` com `ON DELETE RESTRICT`; exclusão de conta não apaga silenciosamente lançamentos. ID UUID, criação e dono padrão são gerados pelo banco. Cliente não recebe grants para inserir ID/criação nem editar identidade/dono/criação. RLS de escrita também exige dono = `auth.uid()`; trigger impede alteração de identidade mesmo em escritas privilegiadas. Catálogo tem leitura autenticada e nenhuma escrita pelo cliente. Não há senha/email/schema próprio de credenciais, fusão de contas, API própria ou dados fictícios em migrations.

## Verificações

- `npm test`: compilação isolada das regras pelo TypeScript já instalado e execução pelo `node:test`; sem novas dependências. Build temporário fora da árvore, removido ao concluir. Casos M01–M06, D01–D03, C01 e V01, formatação e DTOs.
- `npm run typecheck`: aplicação e domínio. `tsconfig.json` inclui o código de `src/` e tipos Expo, evitando o antigo template ignorado `example/`, cujos imports não pertencem ao app atual.
- SQL: **53 testes passaram**. A01–A04, limites/categorias/datas/descrição, consulta civil e integridade referencial executados com sucesso. S01 validado pela aplicação inicial numa stack nova; após os testes/reinício: 10 categorias, 0 lançamentos e 0 usuários Auth. S02 confirmado por revisão/teste de artefatos e ausência de fixtures persistidas; aplicação hospedada continua fora do escopo.
- Domínio: **11 testes passaram**; TypeScript passou. Os testes SQL receberam correção de quatro CTEs de escrita para o nível principal exigido pelo PostgreSQL; a migration não precisou ser alterada.

Regras e grants seguem as referências oficiais de [RLS do Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security), [testes de banco](https://supabase.com/docs/guides/database/testing) e [GRANT do PostgreSQL](https://www.postgresql.org/docs/current/sql-grant.html). CLI e configuração local seguem o [guia oficial de desenvolvimento local](https://supabase.com/docs/guides/local-development/cli/getting-started). Validação integrada registrada nesta entrega; teste ponta a ponta de login/vínculo, integração financeira, callbacks, backup operacional e web/APK ainda não foram executados.
