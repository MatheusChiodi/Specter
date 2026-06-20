/** Wrappers tipados dos comandos de janela (US-03/14/15). */
import { invoke } from "@tauri-apps/api/core";

/** Alterna a visibilidade do painel; retorna o novo estado (visível?). */
export function togglePanel(): Promise<boolean> {
  return invoke<boolean>("toggle_panel");
}

/** Liga/desliga o always-on-top do painel (US-15). */
export function setPanelAlwaysOnTop(value: boolean): Promise<void> {
  return invoke("set_panel_always_on_top", { value });
}

/** Boss key: oculta launcher e panel (US-14). */
export function hideAll(): Promise<void> {
  return invoke("hide_all");
}

/** Restaura launcher e panel após a boss key (US-14). */
export function showAll(): Promise<void> {
  return invoke("show_all");
}
