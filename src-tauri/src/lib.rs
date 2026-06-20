//! Specter — backend Tauri.
//!
//! Módulos por responsabilidade: `pty` (ConPTY), `capture` (stealth Win32),
//! `windowing` (janelas), `persistence` (JSON local), `actions` (quick actions),
//! `env_detect` (versões do ambiente), `files` (texto), `commands` e `error`.

mod actions;
mod capture;
mod commands;
mod env_detect;
mod error;
mod files;
mod persistence;
mod pty;
mod windowing;

use pty::PtyManager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
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
            commands::pty_sessions,
            commands::apply_capture_exclusion,
            windowing::toggle_panel,
            windowing::set_panel_always_on_top,
            windowing::minimize_panel,
            windowing::hide_all,
            windowing::show_all,
            persistence::store_get,
            persistence::store_set,
            persistence::store_remove,
            actions::open_in_explorer,
            actions::open_in_vscode,
            env_detect::detect_environment,
            files::read_text_file,
            files::write_text_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
