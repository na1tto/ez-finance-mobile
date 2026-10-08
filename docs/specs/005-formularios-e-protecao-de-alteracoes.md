# SPEC-005 — Formulários e proteção das alterações

**Data:** 08/10/2026. **Estado:** implementada e validada no marco web local (F01–F14). **Etapa:** 5 do [plano](../PLANO_IMPLEMENTACAO.md).

**Requisitos:** [contexto, D01–D12](../CONTEXTO_APP.md). **Dependências:** autenticação web local da [SPEC-003](003-autenticacao.md) e persistência da [SPEC-004](004-persistencia-financeira.md). [Evidência financeira](../validacoes/004-persistencia-financeira.md).

Implementação de código e testes locais expressamente autorizada pelo usuário em 08/10/2026, substituindo a autorização documental anterior. Entrega concluída no recorte web local: [matriz F01–F14, métodos, correções e limpeza](../validacoes/005-formularios-e-protecao-de-alteracoes.md). Sem migrations/dependências novas, reset, alterações de grants/RLS ou contas humanas. Android/APK e SPEC-006 posteriores; V1 não concluída.

## 1. Objetivo e escopo

Completar o fluxo financeiro de cadastro/correção na web: criar receitas e despesas, editar ao tocar no lançamento, escolher data efetiva, excluir com confirmação e avisar antes de descartar alterações. Usar a camada persistente e as garantias de sessão/retry já entregues.

Inclui formulário compartilhado de criação/edição, carregamento autorizado do registro, apresentação dos dois tipos na lista transitória, confirmação de excluir/descarte, erros e estados de envio/reconciliação, validação e testes reais na web. Ajustes proporcionais de layout, teclado, foco e rolagem entram para tornar o fluxo utilizável, preservando as convenções existentes.

**Fora desta entrega:** painel mensal, navegação entre meses e filtros visuais de categoria da etapa 6; redesign/design system completo; categorias personalizadas; orçamento; saldo inicial; anexos/recorrência; Realtime/resolução de concorrência entre dispositivos; cache/rascunho persistente ou fila offline; hosted/backup; geração de APK. Compatibilidade do código Android deve ser preservada, mas sua prova em aparelho permanece no marco próprio.

## 2. Base conferida antes da implementação

| Arquivo/área | Situação e trabalho necessário |
| --- | --- |
| `src/lib/transactions/repository.ts` | CRUD de ambos os tipos, leitura autorizada por ID, consultas/totais e reconciliação. Reutilizar; não reimplementar acesso nas telas. |
| `src/lib/transactions/controller.ts` | Rascunho atual de despesa, intenção UUID estável, carregamento e mutação. Generalizar para modos/tipos e baseline de edição sem perder isolamento. |
| `src/contexts/ExpensesContext.tsx` | Estado financeiro isolado e preservação temporária da mesma conta. Nome pode ser ajustado com consumidores, sem dependência nova de estado. |
| `src/app/expenses/new.tsx` | Cadastro persistente de despesa, data hoje fixa; campos bloqueados em gravação incerta. Completar tipo e data editável. |
| `src/app/expenses/[id].tsx` | Rota vazia. Pode tornar-se edição; não criar detalhes adicionais como requisito. |
| `src/components/ExpenseCard.tsx` / lista | Card de despesa não clicável; lista só despesas/todo histórico. Tornar lançamentos dos dois tipos visíveis e acessíveis para edição. |
| Domínio/tipos/catálogo | Centavos, datas, categorias por tipo e DTOs disponíveis. São a referência para validação/formatação. |

SPEC-004 revisada em 08/10/2026: código pertinente conferido; 37 testes normais, 38 financeiros, tipos e 63 SQL reproduzidos com sucesso. Navegador real, Google/senha, exportação e reinício documentados pelo implementador não foram repetidos nesta revisão. Nenhum bloqueador identificado no escopo da persistência; esse resultado não entrega as interfaces desta spec.

### Resultado da execução em 08/10/2026

Implementados controller de formulário por identidade/modo/ID/versão, formulário compartilhado, diálogo web/nativo, navegação protegida, beforeunload e leitura/CRUD por repositório existente. `/expenses/new` preservado; `/expenses/[id]` tornou-se edição protegida. Lista mostra ambos os tipos e totais do histórico completo. React Compiler exigiu dirty/validade visual derivados do snapshot. Correções de popstate, descrição longa, leitura interrompida e UUID em conflito estão na evidência.

45 unidades, 46 financeiro real, 46 Auth real, 63 SQL, tipos e exportação aprovados; browser/Firefox comprovam os fluxos. F01–F14 aprovados pelos métodos detalhados na [validação](../validacoes/005-formularios-e-protecao-de-alteracoes.md). Nenhum critério obrigatório web local pendente; encerramento forçado, histórico adiante e rascunho após reload têm limites explícitos.

## 3. Fluxos de criação e edição

### Formulário compartilhado

- Tipo receita/despesa, descrição, valor textual em BRL, categoria por tipo e data efetiva civil editável. Hoje como padrão de **novo** registro; não redefinir data/dados quando rerenderizar, renovar sessão ou carregar catálogo.
- Duas entradas claras para criar receita/despesa, ou um formulário com seletor; organização visual é escolha técnica. Manter entrada existente de nova despesa funcional. Se reorganizar rotas, preservar acesso por links anteriores com redirecionamento protegido apropriado.
- Seleção de categoria incompatível não pode permanecer após mudar tipo. Pedir nova escolha, sem mapear silenciosamente categorias. Valor continua positivo; não inverter sinal do lançamento.
- Entradas monetárias usam regras existentes: inteiro ou até duas casas, vírgula/ponto, sem milhar; rejeitar zero, negativo, não finito, excesso de casas/limite, sem arredondar. Exibir valores editados sem inserir separador de milhar incompatível com a entrada.
- Data usa validação de calendário e hoje/passado; feedback visível tanto em criação quanto edição. Controle pode ser nativo ou textual validado, acessível e compatível com Expo/web; não adicionar biblioteca de calendário sem necessidade.
- Campos obrigatórios/erro identificados; manter os demais campos e colocar foco no erro quando apropriado. Não truncar descrições nem inventar limites adicionais de texto/período.

### Criar

Gerar uma intenção estável no envio conforme SPEC-004; botão/serviço impedem duplicação. Sucesso exige confirmação/reconciliação do banco e retorna à lista com consulta atualizada. Se gravação confirmou mas releitura falhou, comunicar os resultados separadamente, mantendo última consulta sinalizada; não solicitar novo cadastro para reparar a lista.

### Editar ao tocar

Tocar/clicar/ativar pelo teclado um card abre edição pelo ID. Carregar pela camada de dados sob identidade atual; a lista anterior pode servir como apresentação temporária identificada, mas não como única confirmação de que o registro continua acessível.

Mostrar carregamento/erro/tentar novamente e resultado ausente/inacessível sem revelar dono alheio. Não abrir formulário vazio que permita transformar falha de leitura em criação. Refresh/acesso direto à rota deve funcionar com guard e leitura autorizada.

Preencher baseline confirmada, preservar ID/dono/criação e enviar só campos editáveis. Formulário compartilhado pode editar tipo, com regra de categoria acima; nenhuma troca de identidade. Cancelar edição não altera banco. Sucesso mantém uma linha, atualiza valores/tipo/data e os totais do conjunto exibido.

Durante revalidação/releitura da mesma conta, não sobrescrever alterações em andamento pela resposta do registro. IDs diferentes têm baselines separadas; resposta de uma edição anterior não preenche outra. Alterações externas não ganham merge/trava de versões nesta entrega; detectar ausência/inacessibilidade, informar e preservar segurança sem prometer prevenção de todo conflito entre dispositivos.

## 4. Excluir com confirmação

Disponibilizar ação de excluir na edição do registro existente. Antes da requisição, mostrar confirmação visível e funcional na web e com caminho compatível com Android, identificando o lançamento e a consequência.

- Cancelar mantém registro, formulário e alterações em andamento; não emitir DELETE.
- Confirmar envia um DELETE autorizado do ID selecionado; bloquear ações concorrentes até conclusão/resultado incerto.
- Somente confirmar remoção após resposta/reconciliação do serviço. Remover da lista/voltar após sucesso e atualizar consulta/totais, sem reaparecer ao reler.
- Falha não apaga linha/formulário nem afirma sucesso. Resultado incerto oferece verificar/tentar novamente usando o mecanismo existente, sem criar uma nova intenção de alteração.
- Se houver mudanças não salvas no formulário, a confirmação de exclusão deve deixar claro que excluir remove o registro salvo e descarta essas mudanças após sucesso. Não empilhar dois diálogos redundantes.
- ID ausente/inacessível recebe tratamento coerente; não interpretar ausência arbitrária como prova de exclusão realizada.

Não usar `Alert.alert` como única implementação web sem comprovar seu funcionamento. Diálogo pode ser um componente simples da aplicação; sem necessidade de nova biblioteca.

## 5. Proteção de alterações e navegação

### Rascunho e baseline

Manter estado explicitamente associado a usuário, modo criar/editar e ID quando existir. Novo formulário sem entrada do usuário é limpo; baseline de edição recém-carregada é limpa. Após salvar confirmado, nova baseline/rascunho limpo permite navegação sem aviso falso.

Detectar alterações em todos os campos editáveis, inclusive campos inválidos/vazios e mudança de tipo/data. Reverter ao conteúdo original deve remover o aviso. Comparação pode usar equivalência de valor válido (ex.: `35,90` e `35.90`) sem perder detecção de texto inválido. Não usar validade como condição para considerar o formulário alterado.

### Sair voluntariamente

Ao voltar/cancelar/navegar para outra tela com mudanças não salvas, pedir decisão **continuar editando** ou **descartar e sair**. Continuar preserva campos e rota; descartar não grava, limpa somente o rascunho correto e prossegue à navegação solicitada uma vez. Não transformar saída em salvamento automático.

Cobrir botões do formulário/cabeçalho e voltar do navegador nos limites suportados pela navegação; centralizar proteção e evitar listeners duplicados/pedidos repetidos. Ações iniciadas pelo usuário que levam ao logout passam por descarte quando ainda é possível decidir antes de encerrar a sessão.

Revogação, logout em outra aba, recuperação restrita ou troca real de identidade têm prioridade de segurança: bloquear/limpar estado privado mesmo se o formulário estiver alterado. Não manter dados de A visíveis para permitir que B decida descartá-los. Falha transitória com a mesma identidade preserva o rascunho conforme SPEC-004, sem conceder operação offline.

### Refresh/fechar e limitações

Na web, registrar proteção `beforeunload` somente enquanto houver alterações/resultados pendentes, removendo ao limpar/salvar/desmontar. O navegador controla texto e disponibilidade do aviso; testar com interação real e registrar limitações. Não prometer impedir encerramento forçado, perda de processo ou restaurar rascunho depois de reload: persistência de rascunhos/offline não foi aprovada.

Em gravação em andamento, impedir novo envio/edição e saída voluntária enquanto a requisição termina ou atinge timeout finito; não deixar bloqueio infinito. Abort de transporte não significa rollback.

Em resultado incerto, manter payload/intenção bloqueados e oferecer reconciliação. Se o usuário escolher sair mesmo assim, avisar que a alteração pode já estar no banco e orientar conferir a lista antes de repetir. Abandonar tela não executa nova mutação nem fabrica cancelamento de um commit; manter garantias do repositório. Decidir descartar antes de envio é diferente de sair após resultado desconhecido.

## 6. Lista transitória e estados de interface

Para receitas recém-criadas terem caminho de leitura/edição, ampliar a lista transitória para lançamentos de ambos os tipos do usuário, com tipo, descrição, categoria, data e valor claramente identificados. Ordem atual determinística e consulta completa permanecem.

Indicar que é **todo o histórico**, até a etapa 6 entregar recorte mensal/categoria. Se exibir totais, distinguir receitas/despesas/saldo sobre o mesmo conjunto; não apresentar soma de receitas como despesa nem saldo como saldo bancário. Não antecipar seletores mensais/filtros ou gráficos.

Carregamento, vazio confirmado, erro e dados antigos sinalizados preservam a semântica da SPEC-004. Não sumir com lista/totais durante erro como se fossem zero. Alterações confirmadas atualizam lista/indicadores; destino da navegação continua acessível se a atualização falhar.

Leitura do registro, envio, exclusão e reconciliação devem ter feedback próprio. Teclado/descrições longas/tela estreita não impedem salvar/cancelar/excluir. Labels acessíveis, foco de diálogos e ações destrutivas diferenciadas são requisitos de usabilidade do fluxo; não criar projeto de identidade visual nesta etapa.

## 7. Sequência e escolhas técnicas

1. Reconfirmar instruções, código/estado das SPEC-003/004 e preservar mudanças/contas/dados. Reproduzir verificações proporcionais antes de mudar integração.
2. Generalizar controller/estado para rascunhos de tipo/modo/ID, baseline e operações de edição/exclusão. Reutilizar repositório e DTOs; testes de isolamento/resultado incerto precedem telas.
3. Criar formulário compartilhado com tipo/data/categorias, validar dinheiro/datas e implementar carregamento autorizado da edição.
4. Integrar cards/rotas protegidas e lista transitória dos dois tipos; manter caminho antigo de despesas. Não criar tela de detalhes extra.
5. Implementar confirmações de excluir e descarte, proteção de navegação e encerramento web, com cleanup e prioridade da segurança Auth.
6. Validar criação/edição/exclusão/descartes e falhas reais no navegador, com Auth/API e fixtures isoladas. Reutilizar provas de rede/retry da SPEC-004 e ampliar para os formulários novos.
7. Executar regressões financeiras/Auth/SQL, tipos e exportação web. Não repetir toda infraestrutura de teste quando não houver impacto; registrar verificações não executadas e motivo.
8. Atualizar contexto/plano/spec e `docs/validacoes/005-formularios-e-protecao-de-alteracoes.md`, com critérios abaixo, limites Android e limpeza.

Organização de rotas/componentes é escolha técnica rotineira. Pode reutilizar `/expenses/[id]` como edição e generalizar nomes para transactions se melhorar consistência; revisar guard, deep links e testes para não quebrar URLs existentes. Não adicionar state manager, biblioteca de formulários ou alterar schema por conveniência; se necessário, justificar concretamente e manter migrations incrementais.

## 8. Matriz de aceitação

| Caso | Prova e resultado esperado |
| --- | --- |
| F01 — Cadastro dos tipos | Navegador cria receita e despesa, categorias corretas, hoje padrão, valores em centavos; lista mostra ambos após reload sob dono correto. |
| F02 — Dinheiro/campos | Limites válidos aceitos; zero/negativo/não finito/milhar/três casas/excesso e campos obrigatórios rejeitados com feedback; demais entradas preservadas. |
| F03 — Data efetiva | Data passada/hoje aceita, futura/inexistente rejeitada em criar/editar; dia civil preservado após salvar/reload e criação distinta de data efetiva. |
| F04 — Editar pelo card/URL | Clique/teclado e rota direta carregam registro autorizado; salvar mantém ID/dono/criação e uma linha. Tipo/categoria, valores/data e consulta refletem mudança. |
| F05 — Leitura da edição | Loading/erro/retry/ausente-inacessível tratados sem formulário de criação falso; resposta atrasada não sobrescreve rascunho/ID/conta atuais. |
| F06 — Exclusão | Cancelar não emite DELETE e mantém tudo; confirmar remove linha, lista/totais e permanece removida após reload. Falha/timeout usa reconciliação, sem falso sucesso. |
| F07 — Dirty/baseline | Todos os campos e texto inválido contam como alteração; baseline inicial/salva é limpa; reverter alterações evita aviso falso. Troca de tipo não mantém categoria incompatível. |
| F08 — Descarte/navegação | Voltar/cancelar/navegar pede decisão; continuar mantém campos/rota, descartar não grava e segue destino uma vez. Confirmar exclusão não causa segundo aviso de descarte após sucesso. |
| F09 — Refresh/fechar | Aviso de saída web testado com interação real quando suportado; listener só ativo enquanto necessário; limites do navegador e ausência de restauração persistente explicitados. |
| F10 — Falhas/retry | Formulários novos preservam payload/intenção em erro antes/depois de commit; timeout pós-commit real e retry não duplicam nem sobrescrevem. Commit confirmado/releitura falha comunicados separadamente. |
| F11 — Concorrência | Duplo envio, handlers repetidos, salvar/excluir/voltar concorrentes não emitem operações conflitantes; timeout finito libera caminho de reconciliação. |
| F12 — Sessão/isolamento | Duas contas, logout externo/recuperação e troca de identidade bloqueiam acesso e limpam privado; resposta atrasada/diálogo de A não atua como B. ID de outro usuário não revela dados. |
| F13 — Usabilidade web | Tela estreita, teclado, descrição longa, foco dos diálogos, leitura de labels e rolagem permitem concluir/cancelar; mensagens sem detalhes técnicos/credenciais desnecessários. |
| F14 — Regressão/limpeza | Testes pertinentes, tipos/exportação web e regressões financeiras/Auth/SQL aprovados; fixtures removidas por IDs/donos conhecidos, contas humanas/dados existentes preservados. |

Unidade testa decisões de baseline, estado, concorrência e navegação; integração usa SDK/Auth/API reais; browser real comprova diálogos, voltar/refresh, campos e persistência. Um método do controller funcionando não comprova formulário/diálogo. Não enfraquecer Auth/RLS, não usar reset e não enviar dados reais em provas. Solicitar interação humana Google somente quando realmente necessária, preservando contas e credenciais.

## 9. Conclusão e continuidade

Marcar concluída no marco web local quando F01–F14 forem comprovados e nenhum fluxo obrigatório perder/duplicar dados ou expor outra identidade. Marcar parcial quando só CRUD de serviço existir ou diálogos, navegação, edição/exclusão/receitas e falhas reais estiverem sem prova. Registrar limitações de encerramento inevitáveis da plataforma sem apresentá-las como garantia de proteção absoluta.

Próxima etapa: SPEC-006 de consulta financeira — mês atual, navegação mensal, filtro de categoria e indicadores filtrados. Hosted/backup/avaliação e Android/APK continuam posteriores. SPEC-005 concluída não encerra a V1.

Relato final: arquivos alterados/dependências e motivo, comportamento entregue, resultados F01–F14, regressões, fixtures/limpeza e pendências por plataforma. Atualizar documentação com evidência efetiva, preservando decisões aprovadas.

## 10. Referências técnicas

Consultadas para a elaboração, sem definir nova funcionalidade: [proteção da navegação React Navigation](https://reactnavigation.org/docs/preventing-going-back/) e [evento beforeunload/limitações](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event). Conferir integração com Expo Router instalado; listeners de navegador e navegação interna não são a mesma proteção. Domínio/persistência vêm dos artefatos locais da SPEC-001/004.
