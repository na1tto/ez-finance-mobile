# Minha conta — 08/10/2026

Usuário autorizou nova iteração de refinamento e forneceu [User Profile Community](https://www.figma.com/design/qT4N9bp9mqzQk6pqpdftmH/User-Profile--Community-?node-id=33-393) como exemplo. Screenshot e contexto de alta fidelidade do frame52:581 consultados (o nó33:393 é a página).

AccountSettings organiza identificação centralizada com email selecionável, lista de ações com ícones circulares e sessão ao final. Adaptado à Jade/Manrope/EZ$ e Phosphor existentes: max720/p20, identidade r28, painel r24. Foto/nome/cargo fictícios, edição de perfil, ajuda, configurações e cinco destinos do exemplo não fazem parte do recorte. Nenhum asset da referência incorporado; família aprovada reutilizada. Composição aguardando revisão humana.

Adapter auth/account conserva google(true), emailLink('recovery',email), logout() e cancelAttempt(). Google/senha bloqueados por busy/pending; senha sem email bloqueada; cancelamento bloqueado quando busy. Saída segue disponível durante tentativa. Mensagens originais e ErrorFeedback preservados. AuthPanel, seus outros consumidores, barra e transição existentes não alterados. Sem dependências ou tokens globais novos.

Chrome real com Expo Router/MainNavigation e componente de produção, callbacks/estados fictícios isolados:320/390/1280, email longo, ausência de email, busy/pending/erro, foco/Enter em Google e cliques senha/saída/cancelamento. Nenhum overflow horizontal ou exceção de página. Saída alcançada por scroll. Capturas finais revisadas; raio flutuante é ferramenta Expo. Harness temporário removido antes da exportação.

- [320](assets/014-conta-320.png), [390](assets/014-conta-390.png), [1280](assets/014-conta-1280.png).
- [Email longo320](assets/014-conta-email-longo-320.png), [390](assets/014-conta-email-longo-390.png), [1280](assets/014-conta-email-longo-1280.png).
- [Pendente](assets/014-conta-pendente-390.png), [Erro](assets/014-conta-erro-390.png).

Tipos e exportação web12rotas aprovados. Preview local8081 mantido; sem publicação Firebase. Callbacks de interface não comprovam nova execução OAuth/email/logout integrada; fluxo Auth anterior consta na evidência012. Zoom real200%, leitor de tela, teclado virtual e Android não executados nesta composição. Não declara WCAG integral ou V1 concluída. Aceite visual permanece pendente.
