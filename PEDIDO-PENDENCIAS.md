# Pedido consolidado: pendências do projeto

Este documento reúne em um só lugar os pedidos que ainda não foram implementados ou verificados. Ele serve como roteiro para retomar o trabalho no projeto **Minutos em Leonida**.

## 1. Documentação e publicação

- Criar um `README.md` em português, claro para pessoas iniciantes, organizado com estrutura acadêmica inspirada na ABNT: resumo, objetivo, funcionamento, arquitetura, estrutura de pastas, instalação, execução, comandos disponíveis e referências.
- Incluir badges das tecnologias realmente usadas no projeto, conferindo-as no `package.json` e no arquivo de lock.
- Definir e documentar uma licença para o código.
- Preparar o deploy estático para GitHub Pages, corrigindo o `base` para o caminho do repositório e configurando o modo SPA, fallback de rotas e workflow do GitHub Actions.
- Conferir o remoto Git e a autenticação; validar o workflow do GitHub Pages no repositório atual antes de qualquer publicação.

## 2. Relatório final em Markdown

- Melhorar o relatório Markdown exportado para parecer uma TUI legível em preview, com hierarquia visual, espaçamento integrado, dados úteis e emojis usados com moderação.
- Na classificação por tempo jogado, exibir medalhas de ouro, prata e bronze.
- Mostrar o tempo de cada participante com minutos, segundos e milissegundos.
- Adicionar barras TUI proporcionais à participação de cada jogador no tempo total, mostrando também o percentual numérico. Os percentuais devem somar aproximadamente 100%, considerando arredondamentos.
- Dar ao arquivo exportado um nome descritivo e adequado à sessão.

## 3. Identidade visual e interface

- Aplicar por CSS/código um desfoque mais intenso à imagem de fundo, mantendo textos e controles nítidos.
- Na barra, tornar a exibição do logo VI controlável por uma opção booleana `true`/`false`, iniciada em `false`; adicionar o asset correspondente ao `.gitignore` conforme solicitado.
- Na tela inicial, manter o ícone de “Sortear ordem”; trocar o ícone de “Jogar turno” por um controle de videogame; usar mãos dadas para representar “Passar a vez”; substituir por mãos dadas o logo que atualmente aparece como uma TV.
- Simplificar o seletor de idioma para um botão compacto, sem caixas aninhadas, e corrigir a renderização das bandeiras junto às opções de idioma.
- Na tela de jogadores, oferecer 10 cores e permitir escolher um símbolo para cada personagem, mantendo a letra do nome como opção. Ideias de símbolos: pistola, isqueiro, garrafa quebrada, faca, colete, dinheiro, carro, estrela, dados e chama.
- Remover da home o texto “01 / O TEMPO É REI”.
- Nas sessões suspensas, permitir excluir uma sessão.

## 4. Funcionamento sem internet e recuperação da sessão

- Garantir que a PWA instalada baixe e mantenha disponíveis offline todos os recursos necessários: código, estilos, fontes, ícones, sons e demais assets locais.
- Eliminar dependências de CDN ou outras requisições externas necessárias para abrir e usar o app offline.
- Verificar a estratégia do service worker e o precache dos assets da versão publicada, sem registrar o worker em desenvolvimento, preview local ou preview embutido.
- Conferir a recuperação do contador e da sessão após fechar o navegador, suspender/desligar o celular ou perder energia. Persistir estado da sessão e referências de tempo no armazenamento local versionado; ao reabrir, calcular o tempo restante e reconciliar turnos vencidos.
- Documentar o limite de recuperação quando os dados locais são apagados, o navegador usa modo privado ou o sistema remove o armazenamento do site.

## 5. Auditoria dos arquivos de configuração

Conferir o que já existe, corrigir o que estiver incorreto e criar apenas o que fizer sentido:

- `.gitignore`: ignorar `.env` real, dependências, saídas de build, cache e arquivos de sistema; manter versionado o arquivo de lock.
- `.env.example` ou `.env.template`: criar apenas se o projeto realmente consumir variáveis de ambiente, sem segredos.
- `vercel.json` ou `netlify.toml`: não criar por obrigação; só usar se aquela plataforma for escolhida. Para GitHub Pages, resolver build e roteamento pelo Vite/TanStack e GitHub Actions.
- `robots.txt` e `sitemap.xml`: conferir se existem; manter `robots.txt` útil para o site. Criar `sitemap.xml` somente se houver endereço público e rotas indexáveis.
- `favicon.ico`, variações de favicon e `apple-touch-icon.png`: conferir que existem e são válidos.
- `manifest.webmanifest`/`manifest.json`: validar nome, escopo, caminhos, ícones e modo de exibição da PWA.
- `package-lock.json`, `pnpm-lock.yaml` ou `yarn.lock`: confirmar que o arquivo correspondente ao gerenciador usado está versionado e consistente.
- `.github/workflows/deploy.yml` (ou nome equivalente): criar/validar pipeline do GitHub Actions para build e publicação do GitHub Pages.
- ESLint e Prettier: conferir configurações e scripts existentes; não adicionar configurações duplicadas se o projeto já tiver equivalente.

## Critérios de conclusão

- O README descreve o código e os comandos reais do projeto.
- O relatório, as opções de aparência dos jogadores, o seletor de idioma e as sessões suspensas refletem os pedidos acima.
- O build público funciona no GitHub Pages sob o caminho do repositório.
- A instalação da PWA e o uso principal são verificados sem conexão depois do primeiro carregamento.

## Situação dos arquivos conferidos

- `public/robots.txt`, `public/favicon.ico`, `public/favicon.png`, `public/apple-touch-icon.png` e os ícones do manifesto existem. O `favicon.ico` foi gerado a partir do favicon do próprio projeto.
- `public/sitemap.xml` não existe. Só será necessário criá-lo quando houver um endereço público definido e páginas que devam aparecer em buscadores.
- `.env.example` foi criado porque o projeto usa `VITE_PUBLISHED_URL`; não contém segredos.
- `package-lock.json`, `.prettierrc`, `eslint.config.js` e `.github/workflows/deploy.yml` já existem.
- A personalização de jogadores agora oferece dez cores e dez ícones, além da inicial do nome.
