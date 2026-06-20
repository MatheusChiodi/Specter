//! Specter — backend Tauri.
//!
//! Módulos por responsabilidade (regra de engenharia): `pty` (ConPTY),
//! `capture` (stealth Win32), `commands` (camada exposta ao front) e `error`.
//! As janelas launcher/panel entram na FASE 2.2 (junto com a UI).

mod capture;
mod commands;
mod error;
mod pty;

use pty::PtyManager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(PtyManager::new())
        .invoke_handler(tauri::generate_handler![
            commands::pty_spawn,
            commands::pty_write,
            commands::pty_resize,
            commands::pty_close,
            commands::pty_list,
            commands::apply_capture_exclusion,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
