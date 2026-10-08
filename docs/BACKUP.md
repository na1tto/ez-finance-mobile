# Backup e recuperação do Ez Finance

Estado em 08/10/2026: cópia privada guardada no Google Drive e integridade conferida por download; recuperação SQL ensaiada. Backups manuais sem frequência definida, por decisão do usuário; recuperação Auth completa ainda pendente. Nenhum dump deve entrar no Git, Hosting ou mensagem de chat.

## Gerar uma cópia

Com Docker ativo e CLI Supabase autenticada:

```powershell
node scripts/backup-hosted.cjs
```

O script recusa vínculo diferente de `tgfdihnemrseyifvfwan`. Gera `roles.sql`, `schema.sql`, `data.sql` e `manifest.json` com SHA-256 em `.expo/hosted-backups/<data-UTC>/`, ignorado pelo Git. Inclui schemas `public`, `auth`, `supabase_migrations` e papéis personalizados. O manifesto só existe após todos os comandos terminarem com sucesso. Conferir hashes após transferir a cópia para destino privado externo, preferencialmente cifrado. A pasta `.expo` é staging local e pode ser descartada por ferramentas; não serve como arquivo permanente.

Dados Auth podem conter hashes de senhas, identidades e material de sessão. Não imprimir ou compartilhar dumps. Guardar configuração OAuth/SMTP e procedimento de recuperação de credenciais em cofre privado separado; não incluir esses segredos no manifesto. Arquivos Storage, configurações externas, domínio e serviços Auth não são recuperados por este script.

Os dumps de schema/dados são etapas distintas. Para uma cópia operacional, interromper gravações durante a captura e qualquer migração concorrente; o script não oferece snapshot atômico entre arquivos. Decisão aprovada em 08/10/2026: backups manuais, sem frequência por enquanto. A proposta anterior de rotina diária e retenção não foi adotada. Destino aprovado: Google Drive privado da conta do usuário, na pasta indicada abaixo. Retenção específica ainda não definida; nenhuma execução recorrente ou agendamento será criado sem nova solicitação.

## Ensaio executado

Origem hospedada vazia: dez categorias, zero usuários/lançamentos, duas migrations. Exportação por Supabase CLI 2.120.0. Restauração em PostgreSQL 17.11, imagem oficial Supabase `17.11.0.003`, container temporário `ezfinance-restore-validation-20261008`, sem rede ou portas expostas, dados voláteis.

Criado banco `restore_validation` com `TEMPLATE template0`. Restaurados schema e dados, em transação única e `ON_ERROR_STOP=1`, com papel `supabase_admin`. Primeira tentativa com `postgres` recusou assumir o dono `supabase_admin` e fez rollback integral; a tentativa administrativa passou. As funções, tipos e tabelas Auth vieram do dump, sem copiar dados do ambiente local do aplicativo. Papéis internos vieram da imagem Supabase; importação de papéis personalizados não foi exercitada, pois esta aplicação não criou nenhum.

`deployment/verify-hosted.sql` passou no banco restaurado, com fixtures em rollback. Em seguida, `deployment/backup-fixtures.sql` criou duas identidades fictícias, três métodos de autenticação (email/Google ligados ao mesmo dono para uma delas) e dois lançamentos somente no banco temporário. Senhas são marcadores não autenticáveis; nenhuma conta Google ou email real é usada.

Esse banco foi exportado por `pg_dump` e restaurado em um segundo banco vazio, `recovery_check`, usando o schema hospedado. `deployment/verify-restored.sql` passou: catálogo, dois lançamentos/valores/datas/descrição, usuários, vínculo entre métodos, histórico, cinco políticas, RLS e isolamento entre donos preservados. Container removido ao final; serviços locais do aplicativo e projeto hospedado não receberam essas fixtures.

Comandos de restauração usados **somente no container isolado**, após copiar os arquivos privados para `/tmp`:

```powershell
docker exec ezfinance-restore-validation-20261008 psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1 -c 'CREATE DATABASE restore_validation TEMPLATE template0'
docker exec ezfinance-restore-validation-20261008 psql -U supabase_admin -d restore_validation -v ON_ERROR_STOP=1 -1 -f /tmp/schema.sql -c "SET session_replication_role = 'replica'" -f /tmp/data.sql
```

Não adaptar esses comandos para um banco com dados reais. Uma restauração hospedada requer destino novo isolado, compatibilidade de versões/roles, conferência de histórico e configuração Auth/OAuth/SMTP, seguida de testes com JWT e contas de teste.

## Limites antes de dados reais

- Destino externo privado definido e primeira transferência verificada. Frequência deliberadamente não definida pelo usuário; cópias são manuais.
- Login email/senha e Google após recuperação, vínculo real e renovação/revogação de sessões não testados. Preservar linhas de identidade no SQL não comprova esses fluxos.
- Não há prova de recuperação hospedada completa ou dos segredos/configurações externas.
- Não declarar requisito de backup concluído até resolver essas pendências.

[Orientação oficial Supabase](https://supabase.com/docs/guides/platform/migrating-within-supabase/backup-restore), [backups no plano gratuito](https://supabase.com/docs/guides/platform/backups).

## Primeira cópia externa — 08/10/2026

Destino escolhido explicitamente pelo usuário: [Ez Finance Backups](https://drive.google.com/drive/folders/1cESkL4WU4GJrma72hmEqctT7pfJYSC8p), criada no Meu Drive. Metadados da pasta e do arquivo confirmaram `shared=false` e somente permissão owner da conta Gmail informada. Não foram adicionadas permissões públicas ou de terceiros.

Cópia atualizada gerada pelo script, compactada em ZIP com somente roles.sql, schema.sql, data.sql e manifest.json; sem arquivos .env ou configurações secretas OAuth/SMTP. [Arquivo privado](https://drive.google.com/file/d/1zb7sMNlZZZocAukkSENEKmhffCiFYPaj/view?usp=drivesdk), nome `ez-finance-2026-10-08T10-03-56-849Z.zip`, 13.372 bytes. Upload pelo conector Google Drive, metadados lidos depois, cópia novamente baixada e SHA-256 comparado com o original: `714D6E00B9C74D10DC7509ABCEECA52EF2448C66CA949043B56B3BD0FEC3BF8A`, iguais. ZIP não cifrado separadamente; sua privacidade depende das permissões e segurança da conta Drive. Os arquivos de banco contêm material Auth sensível; não compartilhar a pasta.

Para próximas cópias: gerar novo diretório pelo script, compactar somente os quatro arquivos após sucesso/manifesto, enviar como novo ZIP datado para esta pasta, conferir permissões e SHA-256 por download. Não sobrescrever a última cópia válida antes dessa conferência. Conservar hashes em registro local/cofre privado para comparar na recuperação. Não salvar URLs temporárias de download na documentação. Esta entrega não criou agendamento, não aprovou automaticamente a retenção proposta e não comprovou login após recuperação.
