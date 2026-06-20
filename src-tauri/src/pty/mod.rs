//! Backend de PTY real (ConPTY via `portable-pty`).
//!
//! Cobre US-01 (terminal), US-10 (múltiplas sessões), US-23 (split) e
//! US-27 (encerrar processos). Uma PTY por sessão; streaming da saída por
//! callback (no command, ligado a um `Channel` do Tauri).

mod manager;
mod size;

pub use manager::{PtyManager, SessionId, SessionInfo};
