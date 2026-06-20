//! Comandos Tauri expostos ao front.

use tauri::ipc::Channel;
use tauri::State;

use crate::capture::CaptureStatus;
use crate::error::Result;
use crate::pty::{PtyManager, SessionId};

/// Abre uma sessão de PTY; a saída é transmitida em streaming pelo `Channel`.
#[tauri::command]
pub fn pty_spawn(
    state: State<'_, PtyManager>,
    shell: String,
    args: Vec<String>,
    cwd: Option<String>,
    rows: u16,
    cols: u16,
    on_output: Channel<Vec<u8>>,
) -> Result<SessionId> {
    state.spawn(&shell, &args, cwd.as_deref(), rows, cols, move |chunk| {
        let _ = on_output.send(chunk);
    })
}

/// Escreve bytes no stdin do PTY.
#[tauri::command]
pub fn pty_write(state: State<'_, PtyManager>, id: SessionId, data: Vec<u8>) -> Result<()> {
    state.write(id, &data)
}

/// Redimensiona o PTY.
#[tauri::command]
pub fn pty_resize(state: State<'_, PtyManager>, id: SessionId, rows: u16, cols: u16) -> Result<()> {
    state.resize(id, rows, cols)
}

/// Encerra a sessão (mata o processo).
#[tauri::command]
pub fn pty_close(state: State<'_, PtyManager>, id: SessionId) -> Result<()> {
    state.close(id)
}

/// Lista os ids das sessões ativas.
#[tauri::command]
pub fn pty_list(state: State<'_, PtyManager>) -> Vec<SessionId> {
    state.list()
}

/// Aplica a exclusão de captura à janela que chamou o comando (US-04).
#[tauri::command]
pub fn apply_capture_exclusion(window: tauri::WebviewWindow) -> Result<CaptureStatus> {
    #[cfg(windows)]
    {
        use crate::error::SpecterError;
        let hwnd = window
            .hwnd()
            .map_err(|e| SpecterError::WindowNotFound(e.to_string()))?;
        return Ok(crate::capture::apply_stealth(hwnd.0));
    }
    #[cfg(not(windows))]
    {
        let _ = window;
        Ok(crate::capture::apply_stealth(core::ptr::null_mut()))
    }
}
