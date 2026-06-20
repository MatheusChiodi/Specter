//! Specter — backend Tauri.
//!
//! Módulos por responsabilidade: `pty` (ConPTY), `capture` (stealth Win32),
//! `windowing` (janelas launcher/panel), `commands` (camada exposta) e `error`.

mod capture;
mod commands;
mod error;
mod pty;
mod windowing;

use pty::PtyManager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(PtyManager::new())
        .setup(|_app| {
            // Stealth aplicado desde o startup (US-04). No-op fora do Windows.
            #[cfg(windows)]
            windowing::apply_stealth_all(&_app.handle());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::pty_spawn,
            commands::pty_write,
            commands::pty_resize,
            commands::pty_close,
            commands::pty_list,
            commands::apply_capture_exclusion,
            windowing::toggle_panel,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
