/** Tipos da paleta de pré-comandos (US-06). */

/** Modo de acionamento de um comando da paleta. */
export type CommandMode = "insert" | "run";

/** Um pré-comando categorizado, editável e persistido. */
export interface CommandItem {
  /** Identificador estável (usado como key e para update/remove). */
  id: string;
  /** Rótulo legível exibido na lista. */
  label: string;
  /** Texto do comando a inserir/executar. */
  command: string;
  /** Categoria para agrupamento (Claude Code, git, npm/pnpm, etc.). */
  category: string;
  /** Define se 1 clique insere no prompt ("insert") ou executa direto ("run"). */
  mode: CommandMode;
}
