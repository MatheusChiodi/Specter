/**
 * Conteúdo do Cheat Sheet do Claude Code (US-25).
 * 100% local (sem rede), didático e categorizado por seção.
 * Cada item é copiável/inserível na sessão de terminal ativa.
 */

/** Um comando/flag/atalho com sua descrição curta. */
export interface CheatItem {
  /** Texto a copiar/inserir (comando, flag ou atalho). */
  command: string;
  /** Explicação curta do que faz. */
  description: string;
}

/** Grupo de itens correlatos exibido como uma seção do painel. */
export interface CheatSection {
  title: string;
  items: CheatItem[];
}

/** Cheat sheet completo, ordenado do mais usado ao mais avançado. */
export const CHEAT_SHEET: CheatSection[] = [
  {
    title: "Iniciar",
    items: [
      {
        command: "claude",
        description: "Abre a sessão interativa (REPL) do Claude Code no diretório atual.",
      },
      {
        command: 'claude "explique este projeto"',
        description: "Inicia já com um prompt; responde e abre a sessão interativa.",
      },
      {
        command: "claude -p \"resuma o README\"",
        description: "Modo print: roda o prompt, imprime a resposta e encerra (ideal para scripts).",
      },
      {
        command: "claude -c",
        description: "Continua a conversa mais recente neste diretório.",
      },
      {
        command: "claude -r",
        description: "Retoma uma conversa anterior escolhendo numa lista (resume).",
      },
      {
        command: "claude update",
        description: "Atualiza o Claude Code para a versão mais recente.",
      },
      {
        command: "claude --version",
        description: "Mostra a versão instalada do Claude Code.",
      },
    ],
  },
  {
    title: "Slash-commands",
    items: [
      {
        command: "/help",
        description: "Lista os comandos disponíveis e atalhos da sessão.",
      },
      {
        command: "/clear",
        description: "Limpa o histórico do contexto atual e começa do zero.",
      },
      {
        command: "/compact",
        description: "Resume a conversa para liberar contexto sem perder o essencial.",
      },
      {
        command: "/init",
        description: "Cria/atualiza o CLAUDE.md analisando o repositório.",
      },
      {
        command: "/model",
        description: "Troca o modelo usado na sessão (ex.: Opus, Sonnet).",
      },
      {
        command: "/review",
        description: "Pede uma revisão de código das mudanças atuais.",
      },
      {
        command: "/memory",
        description: "Edita os arquivos de memória (CLAUDE.md) do projeto e do usuário.",
      },
      {
        command: "/config",
        description: "Abre as configurações da sessão (tema, permissões, etc.).",
      },
      {
        command: "/cost",
        description: "Mostra o consumo de tokens e custo estimado da sessão.",
      },
      {
        command: "/login",
        description: "Autentica a conta Anthropic/Claude usada pelo CLI.",
      },
      {
        command: "/exit",
        description: "Encerra a sessão interativa do Claude Code.",
      },
    ],
  },
  {
    title: "Modos",
    items: [
      {
        command: "claude --permission-mode plan",
        description: "Modo plano: Claude planeja sem editar arquivos até você aprovar.",
      },
      {
        command: "claude --permission-mode acceptEdits",
        description: "Aceita edições de arquivo automaticamente (menos confirmações).",
      },
      {
        command: "claude --dangerously-skip-permissions",
        description: "Pula todas as confirmações; use só em ambiente isolado/confiável.",
      },
      {
        command: "Shift+Tab",
        description: "Alterna o modo de permissão direto na sessão (normal / plan / auto-accept).",
      },
    ],
  },
  {
    title: "Flags úteis",
    items: [
      {
        command: "--model <nome>",
        description: "Define o modelo ao iniciar (ex.: --model opus).",
      },
      {
        command: "--add-dir <caminho>",
        description: "Dá acesso a um diretório extra fora do cwd.",
      },
      {
        command: "--allowedTools \"Bash,Edit\"",
        description: "Restringe as ferramentas que o Claude pode usar sem perguntar.",
      },
      {
        command: "--output-format json",
        description: "Em modo print, retorna a resposta em JSON (para automação).",
      },
      {
        command: "--verbose",
        description: "Loga detalhes de cada turno; útil para depurar o que o agente faz.",
      },
      {
        command: "--continue",
        description: "Equivalente a -c: continua a última conversa do diretório.",
      },
    ],
  },
  {
    title: "Atalhos da sessão",
    items: [
      {
        command: "Esc",
        description: "Interrompe a geração atual do Claude sem fechar a sessão.",
      },
      {
        command: "Esc Esc",
        description: "Abre o histórico para editar/voltar a uma mensagem anterior.",
      },
      {
        command: "Ctrl+C",
        description: "Cancela a entrada atual; pressione de novo para sair.",
      },
      {
        command: "Ctrl+L",
        description: "Limpa a tela do terminal mantendo o contexto da conversa.",
      },
      {
        command: "Ctrl+R",
        description: "Busca reversa no histórico de comandos digitados.",
      },
      {
        command: "#",
        description: "Inicia a linha com # para gravar uma nota direto no CLAUDE.md.",
      },
      {
        command: "@",
        description: "Use @ para referenciar um arquivo/pasta no prompt.",
      },
    ],
  },
];
