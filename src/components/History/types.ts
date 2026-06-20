/** Tipos do módulo de Histórico de comandos (US-08). */

/** Entrada do histórico: um comando executado, com contexto e tempo. */
export interface HistoryEntry {
  /** Identificador único da entrada. */
  id: string;
  /** Texto do comando executado. */
  command: string;
  /** Diretório de trabalho na hora da execução, ou `null` se desconhecido. */
  cwd: string | null;
  /** Timestamp de criação (epoch ms). */
  ts: number;
  /** Duração da execução em ms, quando medida (US-29). */
  durationMs?: number;
}
