//! Gerenciador de sessões de PTY: spawn, escrita, resize, kill e listagem.

use std::collections::HashMap;
use std::io::{Read, Write};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Mutex;
use std::thread;

use portable_pty::{native_pty_system, Child, CommandBuilder, MasterPty};

use super::size::pty_size;
use crate::error::{Result, SpecterError};

/// Identificador monotônico de sessão.
pub type SessionId = u64;

/// Recursos vivos de uma sessão de PTY.
struct Session {
    child: Box<dyn Child + Send + Sync>,
    writer: Box<dyn Write + Send>,
    master: Box<dyn MasterPty + Send>,
}

/// Mantém todas as sessões de PTY ativas da aplicação.
pub struct PtyManager {
    sessions: Mutex<HashMap<SessionId, Session>>,
    next_id: AtomicU64,
}

impl PtyManager {
    pub fn new() -> Self {
        Self {
            sessions: Mutex::new(HashMap::new()),
            next_id: AtomicU64::new(1),
        }
    }

    /// Abre uma PTY, spawna `shell` no `cwd` e inicia a thread de leitura.
    /// Cada chunk lido é entregue a `on_output` (ligado ao `Channel` no command).
    pub fn spawn<F>(
        &self,
        shell: &str,
        args: &[String],
        cwd: Option<&str>,
        rows: u16,
        cols: u16,
        mut on_output: F,
    ) -> Result<SessionId>
    where
        F: FnMut(Vec<u8>) + Send + 'static,
    {
        let pty_system = native_pty_system();
        let pair = pty_system
            .openpty(pty_size(rows, cols))
            .map_err(|e| SpecterError::Pty(e.to_string()))?;

        let mut cmd = CommandBuilder::new(shell);
        for a in args {
            cmd.arg(a);
        }
        if let Some(dir) = cwd {
            cmd.cwd(dir);
        }

        let child = pair
            .slave
            .spawn_command(cmd)
            .map_err(|e| SpecterError::Pty(e.to_string()))?;
        // Fecha o lado slave no processo pai para que o reader receba EOF no fim.
        drop(pair.slave);

        let mut reader = pair
            .master
            .try_clone_reader()
            .map_err(|e| SpecterError::Pty(e.to_string()))?;
        let writer = pair
            .master
            .take_writer()
            .map_err(|e| SpecterError::Pty(e.to_string()))?;

        thread::spawn(move || {
            let mut buf = [0u8; 8192];
            loop {
                match reader.read(&mut buf) {
                    Ok(0) | Err(_) => break,
                    Ok(n) => on_output(buf[..n].to_vec()),
                }
            }
        });

        let id = self.next_id.fetch_add(1, Ordering::Relaxed);
        self.sessions.lock().unwrap().insert(
            id,
            Session {
                child,
                writer,
                master: pair.master,
            },
        );
        Ok(id)
    }

    /// Escreve `data` no stdin do PTY da sessão.
    pub fn write(&self, id: SessionId, data: &[u8]) -> Result<()> {
        let mut guard = self.sessions.lock().unwrap();
        let s = guard
            .get_mut(&id)
            .ok_or_else(|| SpecterError::SessionNotFound(id.to_string()))?;
        s.writer
            .write_all(data)
            .map_err(|e| SpecterError::Pty(e.to_string()))?;
        s.writer
            .flush()
            .map_err(|e| SpecterError::Pty(e.to_string()))
    }

    /// Redimensiona o PTY (chamado no resize do terminal/fit-addon).
    pub fn resize(&self, id: SessionId, rows: u16, cols: u16) -> Result<()> {
        let guard = self.sessions.lock().unwrap();
        let s = guard
            .get(&id)
            .ok_or_else(|| SpecterError::SessionNotFound(id.to_string()))?;
        s.master
            .resize(pty_size(rows, cols))
            .map_err(|e| SpecterError::Pty(e.to_string()))
    }

    /// Encerra a sessão: mata o processo e libera o PTY (reader termina em EOF).
    pub fn close(&self, id: SessionId) -> Result<()> {
        let mut s = self
            .sessions
            .lock()
            .unwrap()
            .remove(&id)
            .ok_or_else(|| SpecterError::SessionNotFound(id.to_string()))?;
        let _ = s.child.kill();
        Ok(())
    }

    /// Ids das sessões ativas, ordenados.
    pub fn list(&self) -> Vec<SessionId> {
        let mut ids: Vec<SessionId> = self.sessions.lock().unwrap().keys().copied().collect();
        ids.sort_unstable();
        ids
    }

    /// Encerra todas as sessões (chamado no shutdown da app).
    pub fn close_all(&self) {
        let mut guard = self.sessions.lock().unwrap();
        for (_, mut s) in guard.drain() {
            let _ = s.child.kill();
        }
    }
}

impl Default for PtyManager {
    fn default() -> Self {
        Self::new()
    }
}

impl Drop for PtyManager {
    fn drop(&mut self) {
        self.close_all();
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::mpsc;
    use std::time::{Duration, Instant};

    #[test]
    fn list_inicia_vazia() {
        let mgr = PtyManager::new();
        assert!(mgr.list().is_empty());
    }

    #[test]
    fn operacoes_em_sessao_inexistente_falham() {
        let mgr = PtyManager::new();
        assert!(mgr.close(999).is_err());
        assert!(mgr.write(999, b"x").is_err());
        assert!(mgr.resize(999, 10, 10).is_err());
    }

    #[test]
    fn spawn_inicia_streaming_e_aceita_io() {
        let mgr = PtyManager::new();
        let (tx, rx) = mpsc::channel();
        let id = mgr
            .spawn("cmd.exe", &[], None, 24, 80, move |chunk| {
                let _ = tx.send(chunk);
            })
            .expect("spawn deve funcionar");

        assert_eq!(mgr.list(), vec![id]);

        // O ConPTY emite bytes assim que inicializa — valida o streaming
        // master → callback (independente do texto renderizado).
        let mut total = 0usize;
        let deadline = Instant::now() + Duration::from_secs(8);
        while Instant::now() < deadline {
            match rx.recv_timeout(Duration::from_millis(200)) {
                Ok(chunk) => {
                    total += chunk.len();
                    if total > 0 {
                        break;
                    }
                }
                Err(mpsc::RecvTimeoutError::Timeout) => continue,
                Err(_) => break,
            }
        }
        assert!(total > 0, "o PTY não emitiu nenhuma saída");

        // I/O numa sessão viva não deve falhar.
        mgr.write(id, b"echo specter\r\n").expect("write deve funcionar");
        mgr.resize(id, 30, 100).expect("resize deve funcionar");
        mgr.close(id).expect("close deve funcionar");
        assert!(mgr.list().is_empty());
    }
}
