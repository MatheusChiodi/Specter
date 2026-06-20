/** Wrappers tipados das quick actions de sistema (US-26). */
import { invoke } from "@tauri-apps/api/core";

/** Abre o caminho no Explorer do Windows. */
export function openInExplorer(path: string): Promise<void> {
  return invoke("open_in_explorer", { path });
}

/** Abre o caminho no VS Code (se instalado). */
export function openInVscode(path: string): Promise<void> {
  return invoke("open_in_vscode", { path });
}
