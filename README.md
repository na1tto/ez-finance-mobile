# ez-finance

Hospedagem aprovada: **Firebase Hosting + Supabase Free**, com prioridade de custo zero. Configuração local, ambiente de produção, callbacks e pendências em [hospedagem](docs/HOSPEDAGEM.md). Recursos externos, SMTP, backup/restauração e validação hospedada ainda pendentes.

SPEC-005 entregue na web local: criar receitas/despesas com data efetiva, editar pelo card/URL, excluir com confirmação e proteger alterações não salvas/duplicadas. Lista transitória dos dois tipos com totais de todo o histórico, usando Auth e persistência existentes. [Evidências F01–F14](docs/validacoes/005-formularios-e-protecao-de-alteracoes.md). SPEC-006, hospedado/backup e Android/APK continuam no plano; V1 não concluída.

Consulte [ambiente e integração Supabase](docs/AMBIENTE_SUPABASE.md) para configurar `.env.local`, reutilizar Docker e executar `npm run web` na origem **http://localhost:8081**. Os scripts validam a configuração pública antes de empacotar. Nunca colocar chaves administrativas ou segredo Google em variáveis `EXPO_PUBLIC_*`.

Validações: `npm test`, `npm run typecheck`, testes SQL locais e `npm run build:web`. Estado/pendências em [contexto](docs/CONTEXTO_APP.md) e [plano](docs/PLANO_IMPLEMENTACAO.md).

Referências e regras de interface: [base de design](docs/design/README.md), com catálogo Mobbin, inventário visual e registro de ícones. A identidade continua em refinamento; propostas não são requisitos aprovados.

## Referência original do template Expo

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
