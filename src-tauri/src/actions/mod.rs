//! Quick actions de sistema (US-26): abrir a pasta no Explorer / VS Code.
//!
//! Copiar o caminho fica no front (clipboard do webview). Detecção de
//! presença do VS Code é da US-18 (FASE 2.5); aqui apenas tentamos abrir.

use crate::error::{Result, SpecterError};

#[cfg(windows)]
#[tauri::command]
pub fn open_in_explorer(path: String) -> Result<()> {
    std::process::Command::new("explorer")
        .arg(&path)
        .spawn()
        .map_err(|e| SpecterError::Action(e.to_string()))?;
    Ok(())
}

#[cfg(windows)]
#[tauri::command]
pub fn open_in_vscode(path: String) -> Result<()> {
    // `code` é um .cmd no Windows; chamamos via `cmd /C`.
    std::process::Command::new("cmd")
        .args(["/C", "code", &path])
        .spawn()
        .map_err(|e| SpecterError::Action(e.to_string()))?;
    Ok(())
}

#[cfg(not(windows))]
#[tauri::command]
pub fn open_in_explorer(path: String) -> Result<()> {
    let _ = path;
    Err(SpecterError::Action("disponível apenas no Windows".into()))
}

#[cfg(not(windows))]
#[tauri::command]
pub fn open_in_vscode(path: String) -> Result<()> {
    let _ = path;
    Err(SpecterError::Action("disponível apenas no Windows".into()))
}
