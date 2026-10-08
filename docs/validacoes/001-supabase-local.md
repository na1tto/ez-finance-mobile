# SPEC-001 — Evidência de validação no Supabase local

**Data:** 07/10/2026 (America/Sao_Paulo). **Resultado:** migração aplicada e testes integrados aprovados.

## Ambiente e escopo

Projeto local `ez-finance`, inicializado via CLI oficial após verificar ausência de containers/volumes Supabase desse projeto. Outros projetos Docker existentes foram preservados. Configuração em `supabase/config.toml`; nenhum projeto hospedado criado ou vinculado.

| Componente | Versão |
| --- | --- |
| Node | 26.7.0 |
| Supabase CLI | 2.120.0, via npx com versão fixa |
| Docker Engine | 29.8.1 |
| Imagem Supabase PostgreSQL | 17.11.0.004 |
| Servidor PostgreSQL | 17.11 |
| pgTAP disponível na imagem | 1.3.3 |
| pg_prove | 3.36 |

Seeds desabilitados; confirmação de email habilitada conforme requisito aprovado. Analytics local desabilitado após diagnosticar o coletor Vector 0.58.0 em reinício por `Network unreachable` ao acessar o Docker Desktop via TCP. Foram usados os serviços reais Supabase/PostgreSQL; nenhum substituto/mock de Auth ou banco foi criado.

## Execução e resultados

1. `npx --yes supabase@2.120.0 init`: configuração local criada, sem alterar migration ou dados de outros projetos.
2. `npx --yes supabase@2.120.0 start`: saída 0; aplicação automática de `20261007000100_financial_foundation.sql` sobre banco novo (S01).
3. `npx --yes supabase@2.120.0 migration up --local`: saída 0, `applied: []`; nenhuma migração pendente.
4. `npx --yes supabase@2.120.0 test db`: saída 0; **1 arquivo, 53 testes, Result: PASS**.
5. Depois de desabilitar analytics, `npx --yes supabase@2.120.0 stop` confirmou `backup: true`; `start` retomou o banco preservado, saída 0. Nenhum reset ou exclusão de volume.
6. Repetidos `migration up --local` e `test db` na configuração final: saída 0; **53 testes passaram novamente**.
7. `npm test`: saída 0, **11 testes passaram**. `npm run typecheck`: saída 0.

Os quatro testes de UPDATE/DELETE que contavam linhas por CTE foram corrigidos para colocar o `WITH` de escrita no nível principal da consulta, conforme exigido pelo PostgreSQL. A migration permaneceu inalterada.

### Cobertura integrada

| Casos | Evidência |
| --- | --- |
| A01 | Anon sem grants não lê/escreve; papel authenticated sem identidade não vê/altera linhas nem insere em nome de uma conta. |
| A02 | Dono consulta, insere com dono padrão, edita e exclui seus registros. |
| A03 | A não lê/edita/remove B; insert em nome de B é rejeitado; dono/ID/criação não são editáveis; B permanece íntegro e sua agregação só inclui suas linhas. |
| A04 | Leitura autenticada das categorias permitida; insert/update/delete rejeitados. |
| C01/V01/M02 | Catálogo com dez opções, FK composta tipo/categoria, valores mínimo/máximo, rejeição de zero/negativo/excesso/fração textual e descrição vazia/Unicode. |
| D01/D02/D03/M04/M05 | Hoje aceito; futuro rejeitado em insert/update; calendário bissexto e datas inválidas; limites mensais dezembro/janeiro e categoria aplicados antes dos totais. |
| S01 | Migration registrada em banco novo; RLS habilitada; referência Auth não remove registros por cascata. Schema/catálogo preservados no reinício. |
| S02 | Migration contém somente schema/catálogo; fixtures só nos testes, com rollback; verificação final confirma nenhuma conta ou transação fictícia persistida. |

Consulta administrativa de conferência após a execução final (sem simular autorização):

```text
migration=20261007000100:financial_foundation
categories=10
transactions=0
auth_users=0
```

PostgreSQL, Auth, gateway, Realtime, Storage, Studio e metadata apresentaram estado saudável; REST e Edge Runtime estavam ativos. Studio respondeu HTTP 200 após seu redirecionamento padrão. Endereços locais e reprodução estão em [supabase/README.md](../../supabase/README.md). Credenciais e logs locais não são publicados nesta evidência.

## Limites e continuidade

Isolamento **validado no banco**, com execução sob papéis de cliente e claims fictícias, não apenas como administrador. Isto não comprova login, emissão/renovação real de sessões, vínculo Google/email-senha, callbacks ou integração do app: são etapas posteriores. A regra temporal foi exercitada na escrita com o relógio real; não houve espera por virada de meia-noite do PostgreSQL. A fronteira de fuso com relógio injetável foi coberta nos testes de domínio.

Etapa 1 concluída. Etapa 2 apenas iniciada: stack local/configuração básica disponíveis; `.env` do app, acesso Android, callbacks e configurações completas de autenticação ainda pendentes. Backup operacional/restauração com dados fictícios e transição hospedada continuam sem validação; `stop/start` comprova retomada local do schema/catálogo, não substitui esse procedimento.

`git diff --check` falhou dentro do sandbox por erro de work tree, mas **passou** ao repetir com acesso de leitura aos metadados Git fora do sandbox. Conferido que `supabase/.temp/start.log` e `supabase/signing_keys.json` estão ignorados; alterações preexistentes em `AGENTS.md` foram preservadas.

## Revisão independente da entrega — 07/10/2026

A pedido do usuário, contratos, regras puras, migration, testes, configuração local e consumidores atuais foram conferidos contra a SPEC-001. Resultado: **fundação concluída no seu escopo, sem bloqueador identificado**. O provider atual continua em memória e não consome o novo domínio/banco; isso é uma dependência prevista, não persistência entregue no aplicativo.

Verificações reproduzidas nesta revisão:

- `npm test`: saída 0, 11 testes passaram.
- `npm run typecheck`: saída 0.
- `npx --offline --yes supabase@2.120.0 test db`: saída 0, 1 arquivo, 53 testes, `Result: PASS`, usando a stack local existente.
- Consulta de conferência antes e depois dos testes: migration `20261007000100:financial_foundation`, dez categorias, zero lançamentos e zero usuários Auth. Fixtures desfeitas ao terminar.

O acesso ao Docker exigiu execução autorizada fora do sandbox devido à restrição do named pipe do Docker Desktop. Nenhum reset, reinício, alteração de migration ou provisionamento hospedado foi feito nesta revisão. Aplicação inicial sobre banco vazio e preservação após reinício continuam apoiadas no registro da entrega anterior; não foram reproduzidas aqui. Testes de banco usam papéis/claims fictícias e não comprovam emissão de tokens, API consumida pelo app, Google/PKCE ou sessão persistente.

Pendências para a próxima entrega: SDK/configuração pública do aplicativo, exemplo de ambiente, proteção de `.env` (a regra atual cobre apenas `.env*.local`), endpoints web/Android e configuração de callbacks. `supabase/config.toml` ainda contém URLs de redirecionamento do template na porta 3000; é preciso compatibilizá-las com a execução web escolhida. Cadastro/login, recuperação, vínculo de identidades e armazenamento de sessão pertencem à etapa 3. Procedimento de backup/restauração continua obrigatório antes de dados reais.

**Continuidade posterior:** essas pendências de preparação foram trabalhadas na SPEC-002; ver [evidência própria](002-ambiente-integracao-supabase.md). O registro da revisão independente acima permanece como evidência do seu momento; Google externo mantém a próxima entrega parcial.
