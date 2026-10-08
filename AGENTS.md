# Orientações de trabalho

O contexto do aplicativo está em `docs/CONTEXTO_APP.md`.
O plano de desenvolvimento está em `docs/PLANO_IMPLEMENTACAO.md`, quando existir.

- Consulte as partes relevantes desses documentos para a tarefa.
- Confira o código antes de afirmar o que já está implementado.
- Diferencie requisitos aprovados, sugestões e decisões em aberto.
- Resolva autonomamente escolhas técnicas rotineiras dentro do escopo autorizado.
- Pergunte quando uma decisão mudar o comportamento do produto, o escopo ou a arquitetura de forma significativa.
- Preserve as convenções existentes e evite dependências sem necessidade.
- Valide as alterações com verificações proporcionais ao comportamento afetado.
- Atualize a documentação quando uma entrega mudar o comportamento ou resolver uma pendência.
- Ao concluir, informe o que foi entregue, como foi validado e o que permanece pendente.

## Alterações de interface

- Consulte `docs/design/README.md`, `docs/design/REFERENCIAS.md`, `docs/design/SISTEMA_VISUAL.md` e `docs/design/ICONES.md` antes de alterar telas ou componentes visuais.
- Referências do Mobbin são inspiração, não requisitos de funcionalidades ou identidade aprovada. Diferencie padrões observados, propostas e decisões confirmadas; consulte também o contexto e a spec funcional pertinente.
- Reutilize componentes em `src/components/` e a convenção React Native/StyleSheet. Confira o código atual, inclusive trabalho em andamento, antes de extrair tokens ou criar componentes; não introduza um sistema de estilos paralelo.
- Refine primeiro uma tela representativa. Após validação do usuário, consolide a direção em tokens e componentes compartilhados e expanda às demais telas. Não trate sugestões documentadas como aprovação.
- Registre mudanças do sistema visual em `docs/design/SISTEMA_VISUAL.md`, com motivo, estado de aprovação, componentes/telas afetados e evidências. Avalie também os demais consumidores dos componentes alterados.
- Em trabalho visual, use interface-design; aplique vercel-react-best-practices ao React e web-design-guidelines à interface web, adaptando recomendações à stack Expo, sem adicionar dependências por padrão.
- Valide telas renderizadas em larguras estreitas e amplas, conteúdo longo, zoom, teclado, foco, formulários e estados de carregamento, vazio, erro e desabilitado. Registre limites e verificações não executadas; testes de lógica não substituem revisão visual.
- Registre origem, licença, versão e regras da família de ícones antes de incorporar seus assets. Preserve autenticação, isolamento, regras monetárias, datas e proteção de alterações durante o refinamento visual.
