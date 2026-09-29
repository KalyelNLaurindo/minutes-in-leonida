# Minutes in Leonida

![React 19.2](https://img.shields.io/badge/React-19.2-149eca?logo=react) ![TypeScript 5](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript) ![Vite 8](https://img.shields.io/badge/Vite-8-646cff?logo=vite) ![TanStack Start](https://img.shields.io/badge/TanStack_Start-1.168-ff4154)

## Resumo

Aplicativo web instalável para sortear a ordem de jogadores, marcar turnos e guardar o histórico de sessões neste aparelho. O app funciona sem conta e não envia as regras ou os dados da partida para um servidor. Depois de carregar uma versão publicada uma vez, seus arquivos locais podem ser usados offline.

**Palavras-chave:** turnos; sessões de jogo; aplicativo web; PWA; armazenamento local.

## 1. Objetivo

Organizar partidas compartilhadas em que várias pessoas usam o mesmo controle. O app escolhe a ordem, acompanha o tempo e mantém um placar local.

## 2. Como funciona

1. Cadastre os jogadores, escolha uma entre dez cores e personalize cada avatar com uma letra ou um ícone. Depois, escolha o tempo de cada turno.
2. Selecione quem participa; o app sorteia a ordem.
3. Inicie o cronômetro. É possível pausar, registrar uma morte ou suspender a sessão.
4. Ao terminar, consulte o resumo e exporte o placar em Markdown.

Jogadores, ajustes, sessão atual e histórico são salvos no armazenamento do navegador em formato versionado, com uma cópia principal e outra de recuperação. O áudio escolhido pelo usuário fica no IndexedDB deste navegador. Uma cópia JSON pode ser baixada e restaurada nas configurações.

O navegador pode suspender a execução enquanto o app está fechado. Ao reabrir, o app confere os horários salvos e reconcilia os turnos vencidos. Sem um serviço de fundo do sistema ou servidor, não é possível garantir que o alarme toque pontualmente com o app fechado.

## 3. Arquitetura

- `src/domain/game.ts`: regras puras para jogadores, turnos, sessões e placares.
- `src/domain/storage.ts`: validação, migração e salvamento local versionado.
- `src/domain/report.ts`: criação do relatório Markdown.
- `src/app/useGame.ts`: relógio, recuperação da sessão e integração com o armazenamento.
- `src/app/LeonidaApp.tsx`: telas e interações do aplicativo.
- `src/app/i18n.tsx`: textos em português, inglês e espanhol.
- `src/app/pwa.ts`: registro do service worker apenas no endereço publicado autorizado.
- `src/routes/`: rotas e documento HTML do TanStack Router.
- `src/styles.css`: estilos, fontes e identidade visual.
- `public/`: manifesto, ícones, imagens e arquivos públicos.

## 4. Estrutura de pastas

```text
public/              Ícones, manifesto e imagens
src/app/             Interface, idioma, relógio e PWA
src/domain/          Regras, persistência e relatórios
src/routes/          Rotas do TanStack
src/components/ui/   Componentes de interface
src/assets/          Imagens e áudio importados pelo app
.github/workflows/   Publicação automatizada no GitHub Pages
```

## 5. Requisitos

- Node.js 22 ou superior.
- npm, incluído com o Node.js.

## 6. Instalação e execução

Na pasta do projeto, instale as dependências e inicie o servidor de desenvolvimento:

```bash
npm ci
npm run dev
```

O Vite informa no terminal o endereço local para abrir no navegador. O service worker não é registrado em desenvolvimento nem em preview local.

## 7. Comandos disponíveis

| Comando              | O que faz                                                                    |
| -------------------- | ---------------------------------------------------------------------------- |
| `npm run dev`        | Inicia o modo de desenvolvimento.                                            |
| `npm run build`      | Gera a versão de produção e verifica os tipos TypeScript.                    |
| `npm run build:dev`  | Gera um build com modo de desenvolvimento.                                   |
| `npm run preview`    | Abre localmente um build para conferência; o service worker fica desativado. |
| `npm run typecheck`  | Verifica os tipos TypeScript.                                                |
| `npm run test`       | Executa os testes automatizados existentes.                                  |
| `npm run test:watch` | Executa os testes novamente quando arquivos mudam.                           |
| `npm run lint`       | Verifica o código com ESLint.                                                |
| `npm run format`     | Formata os arquivos com Prettier.                                            |

## 8. Publicação no GitHub Pages

O workflow em `.github/workflows/deploy.yml` compila o app, ajusta o caminho do projeto, prepara o fallback de rotas e envia o conteúdo estático ao GitHub Pages. No repositório, habilite Pages usando **GitHub Actions** como origem de publicação. Repositórios de usuário, no formato `usuario.github.io`, usam a raiz do domínio; outros repositórios usam o caminho do próprio repositório.

O worker offline só é permitido no endereço público calculado pelo workflow. O app não o instala em desenvolvimento, preview local ou incorporado em outra página.

## 9. Dados e limites offline

As informações ficam no armazenamento deste navegador e deste endereço. Se o navegador estiver em modo privado, se os dados do site forem apagados ou se o sistema remover o armazenamento, as cópias locais podem desaparecer. Baixe uma cópia JSON e guarde-a fora do navegador para proteger jogadores, sessão, histórico e ajustes. O arquivo JSON não inclui o áudio personalizado.

O primeiro carregamento da publicação precisa de internet para baixar o app. Depois que o service worker terminar a instalação, os arquivos locais precacheados permitem reabrir e usar o fluxo principal offline. Alarmes com o app fechado dependem do suporte e das regras de execução em segundo plano do aparelho.

## 10. Licença

O código-fonte é distribuído sob a licença MIT, conforme o arquivo `LICENSE`. Essa licença não concede direitos sobre marcas, nomes, imagens, logotipos, fontes ou áudio que tenham licença própria ou pertençam a terceiros. Confira os direitos dos materiais incluídos antes de redistribuir o projeto.

## Referências

- [React — documentação oficial](https://react.dev/learn)
- [Vite — documentação oficial](https://vite.dev/guide/)
- [TanStack Start — modo SPA](https://tanstack.com/start/latest/docs/framework/react/guide/spa-mode)
- [TanStack Start — publicação estática](https://tanstack.com/start/latest/docs/framework/react/guide/static-prerendering)
- [vite-plugin-pwa — documentação](https://vite-pwa-org.netlify.app/)
- [GitHub Pages — documentação](https://docs.github.com/pages)
