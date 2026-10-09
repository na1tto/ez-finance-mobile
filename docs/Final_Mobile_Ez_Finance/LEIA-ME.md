# Relatório técnico Ez Finance

Documento elaborado a partir do template acadêmico UEPA fornecido, preservando capa, folha de rosto, autoria, instituição, disciplina, sumário e padrão abnTeX2. O template original e sua bibliografia permanecem intactos.

## Usar no Overleaf

1. Importe `Ez_Finance_Overleaf.zip` como novo projeto, ou envie `Ez_Finance_Tecnico.tex`, `referencias-tecnicas.bib` e `Brasao_Uepa.jpg` para seu projeto existente.
2. Selecione `Ez_Finance_Tecnico.tex` como documento principal.
3. Use pdfLaTeX. A bibliografia utiliza BibTeX e abntex2cite; o Overleaf normalmente gerencia as passagens necessárias.

O texto é autônomo: os caminhos do apêndice identificam fontes do repositório e não são arquivos necessários à compilação. A imagem do brasão é opcional pelo comando original do template.

## Conteúdo e recorte

Arquitetura, modelo de dados, regras monetárias e temporais, estado, reconciliação, autenticação, RLS, hospedagem, backup e evidências. Data de corte: 08/10/2026. Pendências reunidas no capítulo **Melhorias futuras**, distinguindo requisitos da V1, decisões operacionais e evoluções sem aprovação.

O conteúdo foi confrontado com código, migrações e registros internos. As cinco referências externas são documentações oficiais consultadas. Não foram executadas novamente as campanhas funcionais citadas, nem alterado o aplicativo.

## Validação do artefato

Conferidos: balanceamento de ambientes e chaves, citações/bibliografia, estrutura do documento e arquivos do pacote. A tentativa de prévia integrada falhou na preparação do ambiente de compilação (`windows sandbox: helper_unknown_error: setup refresh had errors`), antes de fornecer diagnóstico TeX. Não há compilação PDF nem revisão visual confirmadas nesta entrega. Conferir paginação, tabelas, capa e referências após compilar no Overleaf.
