<div align="center">

# MINUTES IN LEONIDA

### Seu tempo. Sua vez. 🎮

Organize partidas em que a galera divide um controle: cadastre os jogadores, sorteie a ordem e acompanhe cada turno.

<p>
  <a href="https://react.dev/"><img alt="React 19.2" src="https://img.shields.io/badge/React-19.2-e57bba?style=for-the-badge&logo=react&logoColor=23152e"></a>
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript 5" src="https://img.shields.io/badge/TypeScript-5-53b4df?style=for-the-badge&logo=typescript&logoColor=23152e"></a>
  <a href="https://vite.dev/"><img alt="Vite 8" src="https://img.shields.io/badge/Vite-8-f89f64?style=for-the-badge&logo=vite&logoColor=23152e"></a>
  <a href="https://tanstack.com/start/latest"><img alt="TanStack Start, Router e Query" src="https://img.shields.io/badge/TanStack-Start%20%2F%20Router%20%2F%20Query-a9d886?style=for-the-badge&logo=reactquery&logoColor=23152e"></a>
  <a href="https://tailwindcss.com/"><img alt="Tailwind CSS 4" src="https://img.shields.io/badge/Tailwind_CSS-4-53b4df?style=for-the-badge&logo=tailwindcss&logoColor=23152e"></a>
  <a href="https://nitro.build/"><img alt="Nitro" src="https://img.shields.io/badge/Nitro-3.0-f89f64?style=for-the-badge&logoColor=23152e"></a>
</p>
<p>
  <a href="https://www.radix-ui.com/primitives"><img alt="Radix UI" src="https://img.shields.io/badge/Radix_UI-Primitives-e57bba?style=for-the-badge&logo=radixui&logoColor=23152e"></a>
  <a href="https://lucide.dev/"><img alt="Lucide React" src="https://img.shields.io/badge/Lucide-React-53b4df?style=for-the-badge&logo=lucide&logoColor=23152e"></a>
  <a href="https://react-hook-form.com/"><img alt="React Hook Form" src="https://img.shields.io/badge/React_Hook_Form-7-f89f64?style=for-the-badge&logo=reacthookform&logoColor=23152e"></a>
  <a href="https://zod.dev/"><img alt="Zod" src="https://img.shields.io/badge/Zod-3-a9d886?style=for-the-badge&logo=zod&logoColor=23152e"></a>
  <a href="https://vitest.dev/"><img alt="Vitest 5" src="https://img.shields.io/badge/Vitest-5-a9d886?style=for-the-badge&logo=vitest&logoColor=23152e"></a>
  <a href="https://eslint.org/"><img alt="ESLint 9" src="https://img.shields.io/badge/ESLint-9-53b4df?style=for-the-badge&logo=eslint&logoColor=23152e"></a>
  <a href="https://prettier.io/"><img alt="Prettier 3" src="https://img.shields.io/badge/Prettier-3-f89f64?style=for-the-badge&logo=prettier&logoColor=23152e"></a>
  <a href="https://github.com/features/actions"><img alt="GitHub Actions" src="https://img.shields.io/badge/GitHub_Actions-Pages-23152e?style=for-the-badge&logo=githubactions&logoColor=white"></a>
</p>

<br>

**Uma ferramenta local, direta e feita para deixar a partida fluir.**

</div>

---

## 👋 O que é

O **Minutes in Leonida** ajuda um grupo a revezar o mesmo controle durante uma sessão de jogo. Ele sorteia quem começa, marca o tempo de cada pessoa e guarda o placar e o histórico naquele navegador.

Não precisa criar conta. Não existe servidor de jogo nem sincronização em nuvem: os dados da partida ficam no aparelho em que o app foi aberto.

### Em uma partida

```text
Cadastre a galera → Escolha quem vai jogar → Sorteie a ordem
                                              ↓
Veja de quem é a vez ← Passe o controle ← Acompanhe o cronômetro
        ↓
Confira o placar e guarde o relatório
```

## 🎯 PRD em resumo — o que o produto precisa fazer

### Para quem

Para amigos, família ou qualquer grupo que compartilhe um controle e queira combinar turnos sem discutir quem joga depois.

### Problema que resolve

Quando várias pessoas usam o mesmo aparelho, é fácil perder a ordem, esquecer o tempo ou não lembrar como terminou a partida. O app centraliza essas informações numa tela que o grupo pode consultar.

### O que dá para fazer

- Cadastrar até **10 jogadores**, escolher entre **10 cores** e usar a inicial ou um ícone no avatar.
- Selecionar participantes e sortear a ordem de jogo.
- Definir turnos de **1 a 180 minutos**.
- Iniciar, pausar, retomar ou suspender uma sessão; registrar quando alguém morre ou quando o tempo acaba.
- Consultar sessões anteriores, ver estatísticas e apagar uma sessão suspensa.
- Exportar o placar em Markdown e baixar/restaurar uma cópia JSON dos dados.
- Escolher português, inglês ou espanhol; ativar vibração e alarme, inclusive com um áudio escolhido no aparelho.
- Instalar como PWA e reabrir offline depois do primeiro carregamento completo numa publicação compatível.

### Quando sabemos que está funcionando

1. O grupo consegue montar uma sessão sem conta e sem enviar seus dados para um serviço remoto.
2. Ao fechar e reabrir o navegador, o app recupera a sessão salva e recalcula o tempo usando os horários registrados.
3. O resumo mostra quem jogou, quanto tempo cada pessoa acumulou e como terminou cada turno.
4. Uma cópia exportada pode ser guardada fora do navegador e restaurada depois.

## 🧭 Como usar

1. Abra **Jogadores**, digite um nome e escolha uma cor e um avatar.
2. Toque em **Montar sessão** e marque quem participa.
3. Defina o tempo por turno e peça ao app para sortear a ordem.
4. Comece a partida. Na tela do turno, pause, passe a vez, registre uma morte ou encerre a sessão.
5. Consulte o resumo e o histórico. Em **Ajustes**, exporte ou restaure uma cópia JSON.

Os nomes dos botões podem variar conforme o idioma selecionado.

## 🧩 SDD em resumo — como o app foi montado

### Mapa das peças

```text
┌──────────────────────────────┐
│ Telas React                  │  Jogadores, sorteio, cronômetro,
│ LeonidaApp.tsx               │  histórico, ajustes e relatórios
└──────────────┬───────────────┘
               │ ações e estado
┌──────────────▼───────────────┐
│ Regras do jogo               │  turnos, pausa, sorteio, placar
│ src/domain/                  │  e validação dos dados
└──────────────┬───────────────┘
               │ leitura e gravação
┌──────────────▼───────────────┐
│ Armazenamento do navegador   │  localStorage versionado
│ + IndexedDB para áudio       │  cópia de segurança JSON
└──────────────────────────────┘

Arquivos do app ──► cache da PWA ──► reabertura offline na publicação
```

### Decisões de arquitetura, em linguagem simples

| Decisão                                 | Por quê                                                                  | O que significa no uso                                                                           |
| --------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Regras separadas da tela                | Facilita conferir o comportamento do jogo sem depender dos botões.       | Sorteio, tempo e placar ficam em `src/domain/game.ts`.                                           |
| Dados guardados no navegador            | O app é para uso particular e não precisa de conta ou servidor de dados. | Cada aparelho e endereço do site têm seus próprios jogadores e histórico.                        |
| Salvamento versionado com recuperação   | Evita aceitar arquivos incompletos e permite adaptar dados antigos.      | A chave atual usa a versão `v2`; há uma cópia local de recuperação e exportação JSON.            |
| Áudio personalizado em IndexedDB        | Arquivos de áudio são maiores que os outros ajustes.                     | O som fica neste navegador e não vai junto na cópia JSON.                                        |
| Horários salvos para o cronômetro       | Navegadores podem suspender a página quando ela fica em segundo plano.   | Ao voltar, o app recalcula os turnos vencidos; alarme pontual com o app fechado não é garantido. |
| Service worker só no endereço publicado | Evita que um preview ou build local prenda arquivos antigos no cache.    | Desenvolvimento e preview local não instalam o worker offline.                                   |
| GitHub Pages usa o mesmo repositório    | A publicação está preparada no workflow existente.                       | Não é criada uma segunda cópia ou ramo separado do app.                                          |

### Fluxo de uma sessão

```text
[Início]
   │
   ▼
[Escolher jogadores] ──► [Sortear ordem] ──► [Preparar duração]
                                                  │
                                                  ▼
                                          [Turno ativo]
                                           │    │    │
                                pausar/retomar    │    └─ tempo esgotado
                                    suspender    └────── morreu
                                           │             │
                                           └──────┬──────┘
                                                  ▼
                                      [Próximo turno ou fim]
                                                  │
                                                  ▼
                                        [Resumo e histórico]
```

### O que fica salvo

```text
localStorage (v2)                  IndexedDB
├── jogadores e avatares            └── áudio personalizado
├── ajustes e idioma
├── sessão em andamento
└── histórico (até 100 sessões)
```

## 🛠️ Tecnologias

Os badges e versões abaixo refletem as dependências declaradas em `package.json` e `package-lock.json`. Os badges usam a paleta do app: roxo escuro `#23152e`, rosa `#e57bba`, azul `#53b4df`, coral `#f89f64` e verde `#a9d886`.

<p>
  <a href="https://tanstack.com/router/latest"><img alt="TanStack Router 1.170" src="https://img.shields.io/badge/TanStack_Router-1.170-a9d886?style=flat-square&logo=reactquery&logoColor=23152e"></a>
  <a href="https://tanstack.com/query/latest"><img alt="TanStack Query 5" src="https://img.shields.io/badge/TanStack_Query-5-a9d886?style=flat-square&logo=reactquery&logoColor=23152e"></a>
  <a href="https://github.com/unjs/nitro"><img alt="Nitro 3" src="https://img.shields.io/badge/Nitro-3-f89f64?style=flat-square"></a>
  <a href="https://tailwindcss.com/"><img alt="Tailwind CSS 4" src="https://img.shields.io/badge/Tailwind_CSS-4-53b4df?style=flat-square&logo=tailwindcss&logoColor=23152e"></a>
  <a href="https://www.radix-ui.com/primitives"><img alt="Radix UI" src="https://img.shields.io/badge/Radix_UI-Primitives-e57bba?style=flat-square&logo=radixui&logoColor=23152e"></a>
  <a href="https://lucide.dev/"><img alt="Lucide React" src="https://img.shields.io/badge/Lucide-React-53b4df?style=flat-square&logo=lucide&logoColor=23152e"></a>
  <a href="https://vite-pwa-org.netlify.app/"><img alt="vite-plugin-pwa / Workbox" src="https://img.shields.io/badge/PWA-vite--plugin--pwa%20%2B%20Workbox-f89f64?style=flat-square"></a>
  <a href="https://vitest.dev/"><img alt="Vitest 5" src="https://img.shields.io/badge/Vitest-5-a9d886?style=flat-square&logo=vitest&logoColor=23152e"></a>
  <a href="https://nodejs.org/"><img alt="Node.js 22" src="https://img.shields.io/badge/Node.js-22-a9d886?style=flat-square&logo=nodedotjs&logoColor=23152e"></a>
  <a href="https://www.npmjs.com/"><img alt="npm" src="https://img.shields.io/badge/npm-lockfile-e57bba?style=flat-square&logo=npm&logoColor=23152e"></a>
</p>

<p>
  <img alt="date-fns" src="https://img.shields.io/badge/date--fns-4-f89f64?style=flat-square">
  <img alt="Recharts" src="https://img.shields.io/badge/Recharts-2-a9d886?style=flat-square">
  <img alt="Embla Carousel" src="https://img.shields.io/badge/Embla_Carousel-8-53b4df?style=flat-square">
  <img alt="cmdk" src="https://img.shields.io/badge/cmdk-1-e57bba?style=flat-square">
  <img alt="Sonner" src="https://img.shields.io/badge/Sonner-2-f89f64?style=flat-square">
  <img alt="Vaul" src="https://img.shields.io/badge/Vaul-1-a9d886?style=flat-square">
  <img alt="Input OTP" src="https://img.shields.io/badge/Input_OTP-1-53b4df?style=flat-square">
  <img alt="React Day Picker" src="https://img.shields.io/badge/React_Day_Picker-9-e57bba?style=flat-square">
  <img alt="Resizable Panels" src="https://img.shields.io/badge/Resizable_Panels-4-f89f64?style=flat-square">
  <img alt="Class Variance Authority" src="https://img.shields.io/badge/CVA-0.7-a9d886?style=flat-square">
  <img alt="clsx" src="https://img.shields.io/badge/clsx-2-53b4df?style=flat-square">
  <img alt="tailwind-merge" src="https://img.shields.io/badge/tailwind--merge-3-e57bba?style=flat-square">
  <img alt="tw-animate-css" src="https://img.shields.io/badge/tw--animate--css-1-f89f64?style=flat-square">
  <img alt="Fontsource Barlow Condensed and DM Sans" src="https://img.shields.io/badge/Fontsource-Barlow%20%2B%20DM%20Sans-a9d886?style=flat-square">
  <img alt="Browser Storage APIs" src="https://img.shields.io/badge/Browser_APIs-localStorage%20%2B%20IndexedDB-53b4df?style=flat-square">
</p>

#### Interface, formulários e visualizações

`Radix UI` fornece os controles acessíveis usados pelos componentes locais; `Lucide React` fornece os ícones. Também são usadas estas bibliotecas:

- Formulários: `react-hook-form`, `@hookform/resolvers` e `zod`.
- Interface: `cmdk`, `input-otp`, `react-day-picker`, `react-resizable-panels`, `vaul` e `sonner`.
- Gráficos e movimento: `recharts` e `embla-carousel-react`.
- Datas e estilos: `date-fns`, `class-variance-authority`, `clsx`, `tailwind-merge` e `tw-animate-css`.
- Fontes locais: `@fontsource/barlow-condensed` e `@fontsource/dm-sans`.

#### Ferramentas de desenvolvimento

`@vitejs/plugin-react`, `@tailwindcss/vite` e `@tanstack/router-plugin` conectam as ferramentas ao Vite. `typescript-eslint`, `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-plugin-prettier`, `eslint-config-prettier` e `globals` compõem a verificação de código. Os tipos de React e Node vêm de `@types/react`, `@types/react-dom` e `@types/node`.

## 📁 Onde encontrar cada coisa

```text
.
├── public/                 ícones, manifest, robots.txt e imagens
├── src/
│   ├── app/                telas, idioma, cronômetro e PWA
│   ├── assets/             imagem de fundo e áudio incluído
│   ├── components/ui/      componentes acessíveis da interface
│   ├── domain/             regras, armazenamento, alarmes e relatório
│   ├── routes/             rota principal e documento HTML
│   └── styles.css          tema, cores, fontes e layout
├── .github/workflows/      publicação opcional no GitHub Pages
├── package.json            tecnologias e comandos
└── package-lock.json       versões instaladas pelo npm
```

### Arquivos principais

| Arquivo                     | Papel                                                        |
| --------------------------- | ------------------------------------------------------------ |
| `src/domain/game.ts`        | Tipos e regras de jogadores, sorteio, turnos e estatísticas. |
| `src/domain/storage.ts`     | Valida, migra, carrega e salva os dados locais.              |
| `src/domain/report.ts`      | Monta o placar exportado em Markdown.                        |
| `src/domain/alarm-sound.ts` | Salva e reproduz o áudio personalizado no navegador.         |
| `src/app/useGame.ts`        | Liga as regras à tela, ao cronômetro e ao salvamento.        |
| `src/app/LeonidaApp.tsx`    | Telas e interações que a pessoa usa.                         |
| `src/app/pwa.ts`            | Decide quando registrar o service worker.                    |
| `src/routes/__root.tsx`     | HTML-base, metadados e rota principal.                       |
| `vite.config.ts`            | Build, modo SPA, cache offline e caminhos de publicação.     |

## 🚀 Rodar no seu computador

### O que precisa ter

- **Node.js 22** ou mais recente.
- **npm**, instalado junto com o Node.js.

### 1. Baixar as dependências

Abra um terminal na pasta do projeto e execute:

```bash
npm ci
```

### 2. Iniciar o app

```bash
npm run dev
```

Abra o endereço que o Vite mostrar no terminal. Normalmente é `http://localhost:5173/`.

No Windows, depois de instalar as dependências uma vez, também dá para abrir **`Abrir-Minutes.vbs`** com dois cliques. Ele inicia o servidor em segundo plano e abre o Chrome; **`Iniciar-Minutes.ps1`** é o script que faz o trabalho.

### Conferir o build de produção

```bash
npm run build
npm run preview
```

O build é gerado em `.output/`. O preview local é só para conferir a versão compilada; por decisão de segurança do cache, ele não instala o service worker offline.

### Comandos do projeto

| Comando              | Em palavras simples                                    |
| -------------------- | ------------------------------------------------------ |
| `npm run dev`        | Abre o servidor para desenvolver e usar localmente.    |
| `npm run build`      | Monta o app de produção e confere os tipos TypeScript. |
| `npm run build:dev`  | Gera um build com as configurações de desenvolvimento. |
| `npm run preview`    | Mostra localmente o build pronto.                      |
| `npm run typecheck`  | Confere tipos sem gerar arquivos de build.             |
| `npm run test`       | Executa os testes automatizados.                       |
| `npm run test:watch` | Repete os testes conforme os arquivos mudam.           |
| `npm run lint`       | Procura problemas de estilo e padrões de código.       |
| `npm run format`     | Formata os arquivos com Prettier.                      |

## 🌐 Publicação e funcionamento offline

Há um workflow em `.github/workflows/deploy.yml` para publicar **este mesmo repositório** no GitHub Pages. Ele prepara o caminho do projeto, gera a versão estática e configura a página de fallback. Não mantém um segundo app ou uma cópia separada.

O service worker só é registrado no endereço de produção definido para a publicação. Na primeira visita à publicação, é preciso carregar os arquivos com internet; depois que o cache termina de instalar, o app pode abrir offline. Em desenvolvimento e preview local, o service worker fica desligado.

## 🔐 Seus dados e os limites do navegador

- Os dados da partida ficam no armazenamento do navegador, vinculados a este aparelho e endereço do app. Não são enviados para uma conta ou serviço de jogo.
- Apagar os dados do site, usar navegação privada ou deixar o sistema remover o armazenamento pode apagar jogadores e histórico.
- Use **Baixar cópia de segurança** em Ajustes e guarde o JSON em outro lugar. A cópia guarda jogadores, sessão, histórico e ajustes, mas **não inclui o áudio personalizado**.
- O navegador pode suspender uma página fechada ou em segundo plano. Ao reabrir, o app recalcula turnos vencidos usando os horários salvos; não consegue garantir um alarme pontual enquanto o app está fechado.
- A cópia local não sincroniza automaticamente entre celular e computador. Para levar os dados a outro aparelho, exporte e restaure a cópia JSON.

## ✅ Qualidade e testes

Os testes existentes cobrem regras do jogo, relatórios, persistência, alarmes e traduções. Para conferir antes de uma alteração:

```bash
npm run typecheck
npm run test
npm run lint
npm run build
```

## 📚 Documentação útil

- [React](https://react.dev/learn) · [TypeScript](https://www.typescriptlang.org/docs/) · [Vite](https://vite.dev/guide/)
- [TanStack Start](https://tanstack.com/start/latest/docs/framework/react/overview) · [TanStack Router](https://tanstack.com/router/latest/docs/framework/react/overview)
- [Radix UI](https://www.radix-ui.com/primitives/docs/overview/introduction) · [Tailwind CSS](https://tailwindcss.com/docs)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) · [GitHub Pages](https://docs.github.com/pages)

## 📄 Licença e Propósito Comunitário

Este projeto é um **trabalho de fã, de código aberto e estritamente sem fins lucrativos**, desenvolvido para uso pessoal e comunitário — facilitando a divisão fraterna de turnos para que amigos e pessoas sem condições financeiras de ter múltiplos consoles possam compartilhar um mesmo videogame e jogo. O uso comercial ou lucrativo é expressamente proibido.

Consulte o arquivo [`LICENSE`](LICENSE) para os termos completos de licença de uso pessoal e não comercial.

<div align="center">

**MINUTES IN LEONIDA** · Feito para a galera jogar junto.

</div>
