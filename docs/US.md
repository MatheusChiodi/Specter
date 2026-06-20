---
tipo: user-stories
projeto: Specter
versao: 1.0.0
status: draft
---
# User Stories — Specter

> Terminal flutuante stealth + launcher de Claude Code, distribuído como `.exe` per-user (sem admin), invisível em compartilhamento de tela.

**Personas:**
- **Dev** — quer abrir um terminal sobre qualquer janela, escolher a pasta, rodar Claude Code e comandos prontos, rápido.
- **Corp** — usuário em PC corporativo travado, sem admin, não pode instalar nada system-wide.

**Legenda de prioridade:** `P0` core (Definition of Done) · `P1` extra obrigatória · `P2` bônus.

**Numeração:** segue o briefing (core US-01..07; extras US-08..29 na ordem da especificação). O agrupamento abaixo é **por épico/área**, logo a numeração não é monotônica dentro de cada épico — intencional.

**DoD dos extras:** cumpre-se com os **20 P1** entregues; os **2 P2** são bônus, **não** contam para o mínimo nem substituem um P1.

---

## Épico: Core

### US-01 — Rodar terminal + Claude Code `P0`
**História:** Como **dev**, quero um terminal real embutido que rode `claude` e qualquer comando do shell, para trabalhar sem abrir o terminal do sistema.
**Critérios de Aceite:**
- [ ] PTY real via ConPTY (não emulação por pipe) com suporte a cores e sequências ANSI.
- [ ] Rodar `claude` interativo funciona (prompt interativo, TUI, não quebra o redraw).
- [ ] Entrada e saída em streaming (sem esperar o comando terminar para exibir).
- [ ] O shell padrão é detectado (PowerShell) e pode ser trocado nas configurações.
- [ ] Redimensionar a janela propaga o resize para o PTY (sem corromper a renderização).
**Notas:** [[ARQUITETURA#3-terminal--pty-conpty--portable-pty]]

### US-02 — Escolher o local de abertura `P0`
**História:** Como **dev**, quero escolher a pasta onde o terminal abre, para rodar no diretório certo do projeto.
**Critérios de Aceite:**
- [ ] Seletor nativo de pasta (dialog) define o `cwd` da sessão.
- [ ] Lista de pastas recentes e favoritas com quick-jump.
- [ ] A pasta escolhida vira o `cwd` da PTY ao abrir/recarregar a sessão.
- [ ] Caminho inválido/sem permissão exibe erro claro e mantém a sessão anterior.
**Notas:** [[ARQUITETURA#3-terminal--pty-conpty--portable-pty]] · relacionado: US-11

### US-03 — Botão flutuante `P0`
**História:** Como **dev**, quero acionar o app por um botão flutuante sempre visível, para abrir/fechar o painel em 1 clique.
**Critérios de Aceite:**
- [ ] Botão circular (~56px) always-on-top, borderless e transparente.
- [ ] Arrastável e reposicionável; a posição persiste entre execuções.
- [ ] Clique alterna (abre/fecha) o painel principal.
- [ ] Atalho global de teclado também alterna o painel.
- [ ] O botão recebe exclusão de captura na criação.
**Notas:** [[ARQUITETURA#2-modelo-de-janelas-launcher--panel]]

### US-04 — Invisível em compartilhamento de tela `P0`
**História:** Como **usuário**, quero que o app não apareça em screen share/gravação, para que ele nunca seja capturado.
**Critérios de Aceite:**
- [ ] Botão e painel excluídos da captura via `SetWindowDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE)`.
- [ ] Aplicado a cada janela após a criação e reaplicado se o handle mudar.
- [ ] Visível para o usuário local; ausente em screen share, gravação e print de tela.
- [ ] Em SO sem suporte (Windows < 10 2004), o app avisa de forma clara e não falha silenciosamente.
- [ ] macOS/Linux documentados como não-suportados nesta versão.
**Notas:** [[ARQUITETURA#4-stealth--exclusão-de-captura]]

### US-05 — `.exe` sem admin `P0`
**História:** Como **corp**, quero instalar/rodar sem privilégio de administrador, para funcionar em qualquer máquina travada.
**Critérios de Aceite:**
- [ ] Instalador per-user (NSIS `currentUser`): sem HKLM, sem elevação UAC, sem PATH global.
- [ ] Versão portátil (`.exe` standalone) que roda sem instalar.
- [ ] Toda escrita ocorre em `%APPDATA%`/`%LOCALAPPDATA%`; nada em `%PROGRAMFILES%`.
- [ ] Se a pasta de config não for gravável, cai para `%TEMP%`/modo portátil e avisa.
**Notas:** [[ARQUITETURA#5-no-admin--empacotamento]] · escrita automática só em appdata; export/.env (US-20/US-19) gravam em destino escolhido pelo usuário via dialog explícito

### US-06 — Pré-comandos setados `P0`
**História:** Como **dev**, quero comandos prontos dentro do app, para executar tarefas comuns sem digitar.
**Critérios de Aceite:**
- [ ] Paleta de comandos categorizada (Claude Code, git, npm/pnpm, utilidades).
- [ ] 1 clique insere o comando no prompt OU executa direto (escolha por comando).
- [ ] Lista editável pelo usuário (criar/editar/remover/recategorizar), persistida em JSON.
- [ ] Busca textual dentro da paleta.
**Notas:** [[ARQUITETURA#7-persistência]] · relacionado: US-09

### US-07 — Interface didática sobre outras janelas `P0`
**História:** Como **usuário**, quero uma interface fácil de entender que abre por cima de tudo, para usar sem curva de aprendizado.
**Critérios de Aceite:**
- [ ] Painel principal always-on-top.
- [ ] Onboarding na primeira execução com **≤ 4 passos**, pulável e reabrível pelo about.
- [ ] **Tooltip presente em 100%** dos controles da toolbar.
- [ ] Tema dark glassmorphism, accent `#FF5555`, marca "MChiodi" em splash/about.
- [ ] Cada estado vazio (ex.: Claude/Node ausentes, sem perfis) exibe **mensagem + 1 ação sugerida (CTA)** que leva ao próximo passo.
**Notas:** [[ARQUITETURA#1-stack-e-justificativa]] · [[ARQUITETURA#8-riscos-e-mitigações]]

---

## Épico: Comandos & Produtividade

### US-08 — Histórico de comandos `P1`
**História:** Como **dev**, quero um histórico de comandos pesquisável e persistente, para reexecutar o que já rodei.
**Critérios de Aceite:**
- [ ] Cada comando executado é registrado com cwd e timestamp.
- [ ] Busca textual no histórico; `Enter`/clique reexecuta na sessão ativa.
- [ ] Persiste entre execuções em JSON; limite configurável de tamanho.
- [ ] Limpar histórico (total ou por entrada).
**Notas:** [[ARQUITETURA#7-persistência]]

### US-09 — Snippets/favoritos de comandos `P1`
**História:** Como **dev**, quero salvar snippets/favoritos customizáveis, para guardar comandos longos que repito.
**Critérios de Aceite:**
- [ ] Criar/editar/remover snippets com rótulo, comando e categoria.
- [ ] Suporte a placeholders simples (ex.: `{branch}`) preenchidos antes de executar.
- [ ] Cada snippet tem **modo definido (inserir | executar)**, igual ao mecanismo da US-06; clique aplica o modo; persistidos em JSON.
**Notas:** [[ARQUITETURA#7-persistência]] · estende US-06

### US-12 — Perfis de projeto `P1`
**História:** Como **dev**, quero perfis de projeto (nome + path + comandos de init), para abrir um projeto pronto em 1 clique.
**Critérios de Aceite:**
- [ ] Criar perfil com nome, path e lista de comandos de init.
- [ ] Abrir o perfil cria a sessão com o `cwd` correto e roda os comandos de init em ordem.
- [ ] Perfil pode referenciar um `.env` a carregar (ver US-19).
- [ ] Perfis persistidos em JSON; editáveis e removíveis.
**Notas:** [[ARQUITETURA#7-persistência]] · usa US-19

### US-24 — Autocomplete/sugestões `P1`
**História:** Como **dev**, quero sugestões baseadas no histórico, para digitar menos.
**Critérios de Aceite:**
- [ ] Ao digitar, sugere comandos do histórico/snippets (prefixo).
- [ ] `Tab`/`↑`/`↓` navegam e aceitam a sugestão.
- [ ] Não interfere no autocomplete nativo do shell dentro do PTY (sugestão é camada da UI, opcional/desligável).
**Notas:** [[ARQUITETURA#3-terminal--pty-conpty--portable-pty]] · usa US-08

### US-25 — Cheat sheet do Claude Code `P1`
**História:** Como **usuário**, quero um cheat sheet do Claude Code integrado, para aprender os comandos sem sair do app.
**Critérios de Aceite:**
- [ ] Painel com comandos/flags/atalhos principais do Claude Code, categorizado e pesquisável.
- [ ] Cada item tem ações explícitas **copiar** e **inserir** (botões distintos), consistente com o mecanismo da US-06.
- [ ] Conteúdo local (sem rede); didático.
**Notas:** [[ARQUITETURA#1-stack-e-justificativa]]

### US-26 — Quick actions `P1`
**História:** Como **dev**, quero ações rápidas sobre o cwd, para alternar com outras ferramentas sem digitar caminhos.
**Critérios de Aceite:**
- [ ] Abrir o cwd no Explorer.
- [ ] Abrir o cwd no VS Code (se detectado).
- [ ] Copiar o path do cwd para a área de transferência.
- [ ] Ações desabilitadas com tooltip quando a dependência não existe (ex.: VS Code ausente).
**Notas:** [[ARQUITETURA#4.5-detecção-de-dependências]]

---

## Épico: Janela & Stealth

### US-13 — Atalho global de teclado `P1`
**História:** Como **dev**, quero um atalho global para mostrar/ocultar, para acessar o app de qualquer lugar.
**Critérios de Aceite:**
- [ ] Atalho global padrão (ex.: `Ctrl+Espaço`) alterna o painel mesmo sem foco no app.
- [ ] Atalho reconfigurável nas configurações; persiste.
- [ ] Conflito de registro é detectado e avisado ao usuário.
**Notas:** [[ARQUITETURA#2-modelo-de-janelas-launcher--panel]]

### US-14 — Boss key / pânico `P1`
**História:** Como **usuário**, quero esconder tudo instantaneamente com uma tecla, para ocultar o app na hora.
**Critérios de Aceite:**
- [ ] Tecla de pânico oculta painel e botão imediatamente (sem animação perceptível).
- [ ] Reabrir restaura o estado anterior (sessões e posição intactas).
- [ ] Tecla configurável; funciona como atalho global.
**Notas:** [[ARQUITETURA#2-modelo-de-janelas-launcher--panel]]

### US-15 — Always-on-top toggle `P1`
**História:** Como **dev**, quero ligar/desligar o always-on-top, para deixar o painel atrás quando precisar.
**Critérios de Aceite:**
- [ ] Toggle na UI alterna o always-on-top só do painel.
- [ ] Estado persiste entre execuções.
- [ ] O botão flutuante permanece sempre on-top independente do toggle do painel.
**Notas:** [[ARQUITETURA#2-modelo-de-janelas-launcher--panel]]

### US-16 — Controle de opacidade `P1`
**História:** Como **dev**, quero ajustar a transparência da janela, para enxergar o conteúdo por baixo.
**Critérios de Aceite:**
- [ ] Slider de opacidade do painel na faixa **0.3–1.0** (mínimo 30% para preservar legibilidade).
- [ ] Aplica em tempo real; valor persiste.
**Notas:** [[ARQUITETURA#2-modelo-de-janelas-launcher--panel]]

### US-17 — Temas `P1`
**História:** Como **usuário**, quero temas e accent configurável, para adaptar o visual.
**Critérios de Aceite:**
- [ ] Alternância dark/light mantendo o glassmorphism.
- [ ] Accent configurável (padrão `#FF5555`).
- [ ] Tema do terminal (xterm) acompanha o tema do app.
- [ ] Preferência persiste.
**Notas:** [[ARQUITETURA#1-stack-e-justificativa]]

---

## Épico: Sessões & Terminal

### US-10 — Múltiplas abas/sessões `P1`
**História:** Como **dev**, quero várias abas/sessões de terminal simultâneas, para tocar tarefas em paralelo.
**Critérios de Aceite:**
- [ ] Criar/fechar abas; cada aba é uma PTY independente com seu `cwd`.
- [ ] Trocar de aba preserva buffer e processo em execução.
- [ ] Fechar a aba encerra a PTY correspondente (sem processos órfãos).
- [ ] Renomear aba.
**Notas:** [[ARQUITETURA#3-terminal--pty-conpty--portable-pty]]

### US-23 — Split view `P1`
**História:** Como **dev**, quero dividir o terminal em painéis, para ver duas sessões lado a lado.
**Critérios de Aceite:**
- [ ] Dividir a aba ativa em 2 painéis (horizontal/vertical).
- [ ] Cada painel é uma PTY independente; foco indica o painel ativo.
- [ ] Redimensionar o divisor propaga resize para as PTYs.
- [ ] Fechar um painel mantém o outro.
**Notas:** [[ARQUITETURA#3-terminal--pty-conpty--portable-pty]]

### US-21 — Busca dentro do output `P1`
**História:** Como **dev**, quero buscar dentro do output do terminal, para achar texto no buffer.
**Critérios de Aceite:**
- [ ] Campo de busca (find) usando o search addon do xterm.
- [ ] Navegação próximo/anterior com destaque; contagem de ocorrências.
- [ ] Atalho de teclado abre a busca.
**Notas:** [[ARQUITETURA#3-terminal--pty-conpty--portable-pty]]

### US-20 — Exportar log da sessão `P1`
**História:** Como **dev**, quero exportar o log da sessão para arquivo, para guardar/compartilhar a saída.
**Critérios de Aceite:**
- [ ] Exportar o buffer da sessão ativa para `.txt` (e opção sem códigos ANSI).
- [ ] Dialog nativo escolhe o destino; default em pasta gravável per-user.
- [ ] Feedback de sucesso/erro.
**Notas:** [[ARQUITETURA#7-persistência]]

### US-22 — Notificação ao concluir comando longo `P1`
**História:** Como **dev**, quero ser notificado ao concluir um comando longo, para não ficar olhando o terminal.
**Critérios de Aceite:**
- [ ] Comando acima de um limiar de duração (configurável) dispara notificação ao terminar.
- [ ] Notificação só quando o app não está em foco.
- [ ] Mostra comando e duração; clicar foca a aba correspondente.
- [ ] A duração usada é a **medida pela US-29** (fonte única de verdade do tempo).
**Notas:** [[ARQUITETURA#3-terminal--pty-conpty--portable-pty]] · consome a duração da US-29

### US-27 — Gerenciador de processos `P1`
**História:** Como **dev**, quero ver e encerrar processos da sessão, para matar algo travado.
**Critérios de Aceite:**
- [ ] Lista os processos/PTYs ativos da aplicação (aba, comando, PID, duração).
- [ ] Encerrar um processo a partir da lista (kill da árvore da PTY).
- [ ] Atualização em tempo quase real.
**Notas:** [[ARQUITETURA#3-terminal--pty-conpty--portable-pty]]

### US-28 — Drag & drop de arquivo `P2`
**História:** Como **dev**, quero arrastar um arquivo para o terminal, para inserir o caminho sem digitar.
**Critérios de Aceite:**
- [ ] Soltar arquivo/pasta insere o caminho (com aspas se houver espaços) no prompt.
- [ ] Múltiplos itens inserem múltiplos caminhos separados por espaço.
**Notas:** [[ARQUITETURA#3-terminal--pty-conpty--portable-pty]]

### US-29 — Cronômetro de execução `P2`
**História:** Como **dev**, quero um cronômetro por comando, para saber quanto cada um demorou.
**Critérios de Aceite:**
- [ ] Mostra duração do comando em execução e a final ao concluir.
- [ ] Duração registrada no histórico (US-08).
- [ ] É a **fonte única de duração** consumida pela US-22.
**Notas:** [[ARQUITETURA#7-persistência]] · fonte de duração da US-22

---

## Épico: Ambiente

### US-11 — Diretórios favoritos / recentes `P1`
**História:** Como **dev**, quero diretórios favoritos e recentes com quick-jump, para abrir pastas usadas com frequência.
**Critérios de Aceite:**
- [ ] Lista de recentes (auto) e favoritos (fixados pelo usuário).
- [ ] Quick-jump abre nova sessão (ou troca o cwd) na pasta escolhida.
- [ ] Persistem em JSON; remover/fixar itens.
**Notas:** [[ARQUITETURA#7-persistência]] · base da US-02

### US-18 — Status do ambiente `P1`
**História:** Como **dev**, quero ver as versões de Node, npm/pnpm, git e `claude`, para saber o que está disponível.
**Critérios de Aceite:**
- [ ] Detecta e exibe versões de Node, npm/pnpm, git e `claude` (ou "não encontrado").
- [ ] Detecção é não-bloqueante e atualizável sob demanda.
- [ ] Ausência mostra estado vazio didático com orientação (sem instalar nada com privilégio).
**Notas:** [[ARQUITETURA#4.5-detecção-de-dependências]]

### US-19 — Gerenciador de variáveis de ambiente `P1`
**História:** Como **dev**, quero gerenciar variáveis de ambiente por perfil (carregar `.env`), para configurar o projeto sem exportar manualmente.
**Critérios de Aceite:**
- [ ] Carregar um arquivo `.env` para a sessão/perfil; variáveis entram no ambiente da PTY.
- [ ] Listar/editar/remover variáveis do perfil na UI.
- [ ] Valores sensíveis nunca são logados nem exibidos em claro por padrão (mascarados).
- [ ] `.env` referenciado por caminho; conteúdo não é commitado nem exposto.
**Notas:** [[ARQUITETURA#7-persistência]] · usado por US-12

---

## Épico: Qualidade de vida & Responsividade

### US-30 — Launcher circular arrastável `P1`
**História:** Como **dev**, quero que o botão flutuante seja uma bolinha que eu possa arrastar, para reposicioná-lo livremente na tela.
**Critérios de Aceite:**
- [ ] O launcher é um **círculo** real — sem fundo retangular (cantos da janela transparentes).
- [ ] Arrastar o botão **move a janela**; soltar sem mover (clique) alterna o painel.
- [ ] Distinção clara entre clique e arrasto por limiar de movimento (evita toggle acidental ao arrastar).
- [ ] A posição definida persiste entre execuções.
**Notas:** [[ARQUITETURA#2-modelo-de-janelas-launcher--panel]] · corrige US-03

### US-31 — Controles de janela e layout responsivo `P1`
**História:** Como **usuário**, quero controles de janela (minimizar/fechar) e um layout que se adapta ao tamanho, para usar o app de forma confortável.
**Critérios de Aceite:**
- [ ] Barra superior do painel com **minimizar** e **fechar (ocultar)** acessíveis e rotulados.
- [ ] A barra superior é arrastável (move o painel).
- [ ] O layout se adapta a larguras menores: toolbar/sidebar não quebram o conteúdo; nada é cortado.
- [ ] A sidebar de ferramentas tem largura responsiva (`max-w` relativo) e é fechável.
**Notas:** [[ARQUITETURA#2-modelo-de-janelas-launcher--panel]]

### US-32 — Ajustes de qualidade de vida `P1`
**História:** Como **dev**, quero ajustar a fonte do terminal e demais preferências de conforto, para adaptar o app ao meu gosto.
**Critérios de Aceite:**
- [ ] Tamanho da fonte do terminal configurável nas Configurações (faixa sã, ex.: 10–24); aplica a novas sessões.
- [ ] O ajuste persiste em `settings.json`.
- [ ] Convive com os ajustes existentes (tema, accent, opacidade, atalhos, limiar de comando longo).
**Notas:** [[ARQUITETURA#7-persistência]] · estende US-17

## Rastreabilidade

| US | Prioridade | Módulo principal |
|----|------------|------------------|
| US-01 | P0 | `src-tauri/pty/`, `src/components/Terminal/` |
| US-02 | P0 | `tauri-plugin-dialog`, `src/components/FolderPicker/`, `src-tauri/persistence/` |
| US-03 | P0 | `src-tauri/windows/`, launcher window |
| US-04 | P0 | `src-tauri/capture/` |
| US-05 | P0 | `tauri.conf.json` (nsis currentUser + portable) |
| US-06 | P0 | `src/components/CommandPalette/`, `src-tauri/commands/` |
| US-07 | P0 | `src/components/` (tema, onboarding) |
| US-08..US-29 | P1/P2 | ver `## 9` em [[ARQUITETURA#9-rastreabilidade-us--módulo]] |

> Total: 32 user stories (7 core P0 + 23 extras P1 + 2 bônus P2). DoD exige ≥20 extras entregues.
>
> US-30/31/32 (FASE 2.7) — qualidade de vida e responsividade: launcher circular arrastável, controles de janela + layout responsivo, ajustes (fonte do terminal).
