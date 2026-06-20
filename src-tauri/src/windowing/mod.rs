//! Janelas da aplicação: `launcher` (botão flutuante) e `panel` (UI/terminal).
//!
//! Nome `windowing` (e não `windows`) para não colidir com a crate `windows`.
//! Cobre US-03 (botão alterna o painel) e US-04 (stealth nas duas janelas).

use tauri::{AppHandle, Manager};

use crate::error::{Result, SpecterError};

/// Label da janela do botão flutuante.
pub const LAUNCHER_LABEL: &str = "launcher";
/// Label da janela principal (terminal + UI).
pub const PANEL_LABEL: &str = "panel";

/// Alterna a visibilidade do painel; retorna o novo estado (visível?) — US-03.
#[tauri::command]
pub fn toggle_panel(app: AppHandle) -> Result<bool> {
    let panel = app
        .get_webview_window(PANEL_LABEL)
        .ok_or_else(|| SpecterError::WindowNotFound(PANEL_LABEL.to_string()))?;
    if panel.is_visible().unwrap_or(false) {
        let _ = panel.hide();
        Ok(false)
    } else {
        let _ = panel.show();
        let _ = panel.set_focus();
        Ok(true)
    }
}

/// Aplica a exclusão de captura a launcher e panel logo no startup (US-04).
#[cfg(windows)]
pub fn apply_stealth_all(app: &AppHandle) {
    for label in [LAUNCHER_LABEL, PANEL_LABEL] {
        if let Some(window) = app.get_webview_window(label) {
            if let Ok(handle) = window.hwnd() {
                let _ = crate::capture::apply_stealth(handle.0);
            }
        }
    }
}
