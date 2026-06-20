/** Wrappers tipados dos comandos de PTY (US-01/10/23/27). */
import { invoke, Channel } from "@tauri-apps/api/core";
import type { SessionId, SpawnOptions } from "../types/ipc";

/**
 * Abre uma sessão de PTY. A saída chega em streaming pelo `Channel`
 * (bytes como `number[]`, ordenados por sessão).
 */
export function ptySpawn(
  opts: SpawnOptions,
  onOutput: Channel<number[]>,
): Promise<SessionId> {
  return invoke<SessionId>("pty_spawn", {
    shell: opts.shell,
    args: opts.args,
    cwd: opts.cwd,
    rows: opts.rows,
    cols: opts.cols,
    onOutput,
  });
}

/** Escreve bytes no stdin do PTY. */
export function ptyWrite(id: SessionId, data: number[]): Promise<void> {
  return invoke("pty_write", { id, data });
}

/** Redimensiona o PTY (chamado no fit do terminal). */
export function ptyResize(
  id: SessionId,
  rows: number,
  cols: number,
): Promise<void> {
  return invoke("pty_resize", { id, rows, cols });
}

/** Encerra a sessão (mata o processo). */
export function ptyClose(id: SessionId): Promise<void> {
  return invoke("pty_close", { id });
}

/** Lista os ids das sessões ativas. */
export function ptyList(): Promise<SessionId[]> {
  return invoke<SessionId[]>("pty_list");
}
