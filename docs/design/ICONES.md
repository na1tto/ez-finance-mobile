# Ícones

## Estado atual

**Família compartilhada aprovada pelo usuário: Phosphor**, em 08/10/2026. Integração reutilizada nos AuthField existentes: dois SVGs oficiais core 2.1.1 via `expo-image` existente; detalhes/licenças ao final. Regular/20 px aprovados como parte da composição do piloto; conferidos nos consumidores. `expo-symbols` está instalado, sem uso encontrado nas telas analisadas. PNGs legados permanecem preservados e não definem a família do produto.

Os símbolos visíveis nas capturas do Buddy são observações estéticas; biblioteca e licença não foram identificadas. Não recortar esses símbolos para distribuir no aplicativo.

## Registro da escolha

Registro da escolha; completar pacote/versão e variante durante a avaliação técnica e o piloto, sem baixar o catálogo inteiro.

| Campo | Valor |
| --- | --- |
| Família e variante (contorno/preenchido) | Phosphor regular aprovada na composição do piloto |
| Link oficial da biblioteca | [Phosphor Icons](https://phosphoricons.com/) |
| Autor/origem | Projeto Phosphor Icons; [assets e catálogo oficial](https://github.com/phosphor-icons/core) |
| Versão/tag do pacote ou data do download | Core 2.1.1, distribuição npm oficial; coleta 08/10/2026 |
| Licença e link do texto oficial | MIT no [repositório oficial core](https://github.com/phosphor-icons/core/blob/main/LICENSE), conferida em 08/10/2026; verificar também o pacote de integração escolhido |
| Avisos/atribuição exigidos e local de inclusão | MIT/copyright em assets/icons/phosphor/LICENSE e public/licenses/Phosphor-MIT.txt |
| Integração web/Android e custo de dependência | expo-image 57.0.5 existente; dois SVGs, 657 bytes; web conferida, aparelho Android pendente |
| Data/aprovação do usuário | Família confirmada em 08/10/2026; core 2.1.1 escolhido tecnicamente no piloto; regular/20 px/Jade 11 incorporados à composição aprovada |

**Recomendação de seleção, não requisito aprovado:** uma única família coerente, com boa legibilidade pequena e implementação compatível com Expo Web/Android. Preferir integração existente se atender aparência, cobertura e licença. Evitar misturar bibliotecas só para completar um ícone ausente; primeiro avaliar o conjunto necessário.

Para o Phosphor, a recomendação é experimentar peso regular nas ações e navegação e comparar preenchimento em estados selecionados. É uma proposta, não uma variante aprovada. Não presumir que `@phosphor-icons/react` destinado ao DOM serve diretamente ao React Native; avaliar integração Expo Web/Android e suas dependências antes de instalar.

## Onde colocar arquivos

- Ícones locais: `assets/icons/<familia>/`, com nomes por função, por exemplo `arrow-left.svg` ou `receipt.png`. Criar o subdiretório apenas após escolha; preservar arquivos de licença/avisos nele conforme a origem.
- Download de SVG não garante renderização no React Native: decidir integração compatível antes de importar; não presumir loader SVG já configurado.
- Biblioteca via pacote: registrar link/versão/licença acima e importar os símbolos usados; não manter cópia adicional dos mesmos arquivos em assets.
- Marca de provedor (por exemplo Google): asset oficial e regras próprias, com registro separado de origem; não substituir por símbolo aproximado da família de navegação.
- Ícone de instalação, splash e ilustração não são ícones de interface. Manter os assets/configurações existentes e tratar sua eventual atualização explicitamente.

## Regras propostas para o piloto

- Ícones apoiam rótulos de ações/categorias; não são a única pista de receita/despesa ou estado.
- Usar tamanho e peso visual consistentes por função; valores finais ficam no [sistema visual](SISTEMA_VISUAL.md), após validação.
- Ícones decorativos não devem repetir a fala do rótulo no leitor de tela. Ação só com ícone precisa de nome acessível, foco e área de toque suficientes.
- Não misturar emoji, contorno e ícones preenchidos como alternativas aleatórias da mesma função. Exceções de marca devem ser registradas.
- Centralizar um wrapper/mapeamento em `src/components/` apenas quando houver uso real compartilhado, reaproveitando implementação que exista no momento. Não criar agora um componente vazio nem importar catálogo inteiro.

## Integração do piloto — 08/10/2026

Phosphor **core 2.1.1**, licença MIT/copyright preservados em `assets/icons/phosphor/LICENSE` e `public/licenses/Phosphor-MIT.txt`. Dois arquivos oficiais: envelope/lock, peso regular proposto, 20×20, cor de apoio via tintColor. [Origem, hashes e regras](../../assets/icons/phosphor/README.md).

Usa `expo-image` **57.0.5** já instalado, sem pacote de ícones adicional nem catálogo no app. [Suporte SVG web/Android documentado pelo Expo](https://docs.expo.dev/versions/latest/sdk/image/). Renderização web e carregamento dos dois assets conferidos; Android/aparelho pendente. Decorativos junto a rótulos persistentes, `alt=""`/`accessible={false}`. Google permanece texto, sem marca aproximada. Integração entregue; peso/cor/tamanho permanecem para validação visual do usuário.
