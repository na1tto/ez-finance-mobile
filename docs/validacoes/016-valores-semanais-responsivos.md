# Valores semanais responsivos — 08/10/2026

Usuário reportou quebra irregular nos valores expandidos: a semana8–14 movia receitas/despesas para outra linha enquanto as demais permaneciam ao lado do período. Causa: flexWrap com larguras intrínsecas variáveis em duas camadas.

OverviewChart agora apresenta período acima de duas colunas iguais de receitas/despesas, com rótulo separado do valor. Cada semana usa a mesma estrutura, minWidth0 e separador. Valores extensos podem quebrar dentro da própria coluna, sem empurrar a outra coluna. Apenas estilos/markup da lista expandida; valores/cálculo/filtros/gráficos/seleção de semana preservados. Consumidor MonthlyOverview e previews da navegação mantêm o componente existente; sem tokens/dependências/assets novos.

Chrome real em320/390/490/1280 com os componentes de produção em harness isolado: dados fictícios iguais ao exemplo (R$500/R$246 na semana8–14, demais zeros) e valores longos (R$987.654.321/R$123.456.789). Medidos alinhamento vertical dos rótulos, larguras iguais e posições das colunas em todas as semanas, sem overflow horizontal. Expansão por foco/Enter e recolhimento conferidos; zero exceções. Capturas revisadas: [490](assets/016-semanas-490.png), [320 longo](assets/016-semanas-longo-320.png); capturas adicionais320/390/1280 e versões longas na pasta assets com prefixo016-semanas.

Tipos aprovados; harness removido e preview8083 encerrado. Preview8081 mantido. Sem publicação. Zoom real200%, leitor de tela e aparelho Android não executados nesta correção; valores longos simulam conteúdo, não zoom. Sem nova campanha Auth/CRUD ou testes que espelham estilos.
