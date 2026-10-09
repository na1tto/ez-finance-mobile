# Workflow integrado do piloto

08/10/2026. Continuação autorizada pelo usuário após fechamento do escopo. Código do piloto já estava nas rotas da aplicação; esta etapa validou o fluxo real e corrigiu um destino de cancelamento, sem expandir o refinamento a Minha conta ou outras telas.

## Ajuste entregue

`TransactionForm`: “Cancelar e voltar à lista” agora navega para `/transactions`, mantendo askLeave/confirmação de descarte existentes. Antes retornava `/`, que passou a conter somente o resumo. O outro botão “Voltar à lista” já apontava para o novo destino. Salvar/excluir continuam retornando ao Início, conforme comportamento documentado do piloto. Sem regra monetária, Auth, schema, dependência ou token visual novo.

## Prova integrada

Aplicação real, Expo Router/AuthProvider/ExpensesProvider/formulário/SDK e Supabase local, com sessão email/senha real. Chrome headless com toque e movimento reduzido; nenhuma substituição de tela, callback ou repository nesta prova. Transporte da SPEC-006 restrito a duas contas descartáveis, API somente local. Reutilizados `validate-monthly-ui.cjs setup/seed/proxy/cleanup`; runner Playwright temporário removido após execução. Credenciais privadas nunca incluídas nas capturas/saída.

- Login em conta descartável abriu Início; Minha conta exibiu a identidade autenticada e ações existentes, sem executar vínculo Google ou recuperação de senha.
- Filtro Alimentação pelo gráfico permaneceu ao trocar para Lançamentos, com um card da consulta. Acesso real à edição abriu formulário sem barra.
- Edição de R$30,00 para R$35,90 foi confirmada no banco; retorno ao Início manteve filtro e valor. Lista exibiu registro atualizado.
- Cancelar com descrição alterada abriu confirmação. Continuar editando preservou conteúdo. Descartar e sair retornou `/transactions`, sem gravar a descrição descartada.
- Novo lançamento Alimentação de R$12,34 foi persistido e exibido na consulta. Exclusão com confirmação removeu esse registro; retorno ao Início e lista correto.
- Recarregar Lançamentos restaurou sessão e consulta padrão do mês (categoria não persistida após reload, como antes), exibindo os três registros de outubro. Sair removeu barra privada e abriu login.
- Lista real conferida em320/390/1280px sem overflow; zero exceções de página na execução final. [320](assets/012-workflow-lista-320.png), [390](assets/012-workflow-lista-390.png), [1280](assets/012-workflow-lista-1280.png).

Uma execução inicial parou por seletor incorreto do botão de confirmação de exclusão; dados descartáveis já criados foram removidos por limpeza exata. Segunda execução com fixture limpa e seletor real “Confirmar exclusão” passou integralmente. Não houve correção adicional de comportamento do aplicativo por essa falha do runner.

## Limpeza e verificações

Antes e após cada limpeza, duas contas humanas e identidades conferidas contra baseline; seus lançamentos permaneceram idênticos, sem adições concorrentes. Excluídos somente registros por ID/dono e contas descartáveis da fixture. Arquivos privados/modo/contadores e runner temporário removidos; servidores da prova encerrados. Exportação final não contém endpoint do transporte54340.

53/53 testes, TypeScript e exportação web de12rotas aprovados após o ajuste. Diff sem erros. Dois checks de proteção hospedada da etapa anterior não repetidos: caminho de exportação hospedada não foi alterado nesta etapa. Sem publicação, migrations ou escrita em conta humana.

## Limites restantes

Esta evidência resolve a pendência de workflow real email/senha, CRUD básico, descarte, retorno, restauração de sessão e acesso autenticado a Minha conta do piloto. Não repete todos os cenários de falha/concorrência das specs anteriores nem testa vínculo Google/recuperação novamente. Zoom real200%, teclado virtual, leitor de tela e aparelho Android continuam pendentes; toque emulado anterior não substitui Android. Aceite visual humano e expansão geral continuam separados. [Escopo fechado](011-navegacao-principal.md#fechamento-do-escopo).
