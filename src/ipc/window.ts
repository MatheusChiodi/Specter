/** Wrappers tipados dos comandos de janela (US-03). */
import { invoke } from "@tauri-apps/api/core";

/** Alterna a visibilidade do painel; retorna o novo estado (visível?). */
export function togglePanel(): Promise<boolean> {
  return invoke<boolean>("toggle_panel");
}
