//! Erros do backend, serializáveis para o front (Tauri exige `Serialize`).

use serde::Serialize;
use std::fmt;

/// Erro unificado do Specter. Serializa como `{ "kind": ..., "message": ... }`.
#[derive(Debug, Serialize)]
#[serde(tag = "kind", content = "message")]
pub enum SpecterError {
    /// Sessão de PTY inexistente.
    SessionNotFound(String),
    /// Falha na camada de PTY/ConPTY.
    Pty(String),
    /// Janela do Tauri não encontrada / sem handle nativo.
    WindowNotFound(String),
    /// Falha de leitura/escrita na persistência local.
    Persist(String),
    /// Falha ao executar uma quick action de sistema.
    Action(String),
}

impl fmt::Display for SpecterError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SpecterError::SessionNotFound(s) => write!(f, "sessão não encontrada: {s}"),
            SpecterError::Pty(s) => write!(f, "falha de PTY: {s}"),
            SpecterError::WindowNotFound(s) => write!(f, "janela não encontrada: {s}"),
            SpecterError::Persist(s) => write!(f, "falha de persistência: {s}"),
            SpecterError::Action(s) => write!(f, "falha na ação: {s}"),
        }
    }
}

impl std::error::Error for SpecterError {}

/// Alias de `Result` do backend.
pub type Result<T> = std::result::Result<T, SpecterError>;
