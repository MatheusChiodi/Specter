/** Tipos compartilhados da fronteira IPC (front ↔ Rust). */

/** Id de sessão de PTY (monotônico no backend). */
export type SessionId = number;

/** Resultado de aplicar o stealth (espelha `CaptureStatus` no Rust). */
export type CaptureStatus = "applied" | "unsupported" | "failed";

/** Parâmetros para abrir uma sessão de terminal. */
export interface SpawnOptions {
  /** Executável do shell (ex.: "powershell.exe", "cmd.exe"). */
  shell: string;
  /** Argumentos do shell. */
  args: string[];
  /** Diretório de trabalho inicial; `null` usa o default do processo. */
  cwd: string | null;
  /** Variáveis de ambiente extras (pares chave/valor) — US-19. */
  env: [string, string][];
  /** Linhas do terminal. */
  rows: number;
  /** Colunas do terminal. */
  cols: number;
}
