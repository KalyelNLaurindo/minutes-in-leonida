# Minutes in Leonida

Aplicativo privado para sortear jogadores e controlar turnos durante sessões locais. As regras, jogadores, presets e histórico ficam no navegador; não há conta nem servidor de dados.

## Arquitetura

- `src/domain/game.ts` contém as regras puras do jogo. Cada sessão registra a duração escolhida na criação, então editar o preset não altera uma partida em andamento.
- `src/domain/storage.ts` valida o formato versionado, migra os dados v1, mantém cópia principal e backup com revisões e limita o histórico às 100 sessões mais recentes.
- `src/app/useGame.ts` coordena regras, persistência, relógio, recuperação e estado de erro apresentado à interface.
- `src/app/LeonidaApp.tsx` apresenta o fluxo de jogadores, sessão, presets, alertas e cópias de segurança.
- `src/app/pwa.ts` registra o service worker apenas em builds de produção fora de desenvolvimento, preview e origem local.

## Proteção dos dados

As configurações permitem baixar uma cópia JSON e restaurá-la mais tarde. A restauração valida o conteúdo e pede confirmação antes de substituir os dados atuais. A cópia local dupla ajuda a recuperar uma gravação parcial; o arquivo exportado é a proteção contra limpeza dos dados do navegador, troca de aparelho ou perda das duas cópias locais.

## Alertas e operação offline

Enquanto a página está aberta, o app verifica o relógio e avança o turno vencido. Ao voltar à página, ele reconcilia o tempo decorrido e emite o aviso. Navegadores e sistemas móveis podem suspender o JavaScript em segundo plano; sem um servidor ou tarefa agendada pelo sistema operacional, nenhum app web consegue garantir um alarme pontual depois de ser suspenso ou fechado. Notificações do navegador são uma opção adicional quando disponíveis.

O service worker continua desativado em desenvolvimento e preview para evitar caches antigos nesses ambientes. A operação offline precisa ser confirmada numa instalação publicada.

## Desenvolvimento

Instale as dependências com `npm install` e execute `npm run dev`. Os comandos disponíveis incluem `npm run lint`, `npm run typecheck` e `npm run build`.
