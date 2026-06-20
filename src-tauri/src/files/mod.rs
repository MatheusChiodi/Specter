//! Leitura/escrita de arquivos de texto: export de log (US-20) e `.env` (US-19).

use crate::error::{Result, SpecterError};

/// Lê um arquivo de texto (ex.: um `.env` de perfil).
#[tauri::command]
pub fn read_text_file(path: String) -> Result<String> {
    std::fs::read_to_string(&path).map_err(|e| SpecterError::Persist(e.to_string()))
}

/// Escreve um arquivo de texto (ex.: log de sessão exportado).
#[tauri::command]
pub fn write_text_file(path: String, content: String) -> Result<()> {
    std::fs::write(&path, content).map_err(|e| SpecterError::Persist(e.to_string()))
}
