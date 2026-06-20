//! Stealth: exclusão de captura de tela (US-04).
//!
//! Usa `SetWindowDisplayAffinity(hwnd, WDA_EXCLUDEFROMCAPTURE)` — e **não**
//! `set_content_protected` do Tauri (que aplica `WDA_MONITOR`, insuficiente).

use serde::Serialize;

/// Build mínimo do Windows 10 com `WDA_EXCLUDEFROMCAPTURE` (versão 2004).
pub const MIN_BUILD_EXCLUDE_FROM_CAPTURE: u32 = 19041;

/// Resultado da tentativa de aplicar o stealth, reportado ao front (US-04).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum CaptureStatus {
    /// Janela excluída da captura com sucesso.
    Applied,
    /// SO sem suporte (Windows < build 19041 ou plataforma não-Windows).
    Unsupported,
    /// API disponível, mas a chamada falhou.
    Failed,
}

/// Regra pura: a exclusão de captura exige Windows 10 build 19041+.
pub fn supports_capture_exclusion(build: u32) -> bool {
    build >= MIN_BUILD_EXCLUDE_FROM_CAPTURE
}

#[cfg(windows)]
mod platform {
    use super::{supports_capture_exclusion, CaptureStatus};
    use windows::Wdk::System::SystemServices::RtlGetVersion;
    use windows::Win32::Foundation::HWND;
    use windows::Win32::System::SystemInformation::OSVERSIONINFOW;
    use windows::Win32::UI::WindowsAndMessaging::{
        SetWindowDisplayAffinity, WDA_EXCLUDEFROMCAPTURE,
    };

    /// Build real do Windows (via `RtlGetVersion`, que não mente sem manifesto).
    fn current_build() -> u32 {
        let mut info = OSVERSIONINFOW {
            dwOSVersionInfoSize: core::mem::size_of::<OSVERSIONINFOW>() as u32,
            ..Default::default()
        };
        // SAFETY: `info` está inicializado; RtlGetVersion preenche-o e retorna sucesso.
        unsafe {
            let _ = RtlGetVersion(&mut info);
        }
        info.dwBuildNumber
    }

    /// Aplica o stealth à janela do ponteiro `raw` (de `WebviewWindow::hwnd()?.0`).
    ///
    /// O ponteiro bruto desacopla da versão da crate `windows` usada pelo Tauri.
    pub fn apply_stealth(raw: *mut core::ffi::c_void) -> CaptureStatus {
        if !supports_capture_exclusion(current_build()) {
            return CaptureStatus::Unsupported;
        }
        // SAFETY: `raw` é um HWND válido fornecido pelo runtime do Tauri.
        match unsafe { SetWindowDisplayAffinity(HWND(raw), WDA_EXCLUDEFROMCAPTURE) } {
            Ok(()) => CaptureStatus::Applied,
            Err(_) => CaptureStatus::Failed,
        }
    }
}

#[cfg(windows)]
pub use platform::apply_stealth;

/// Em plataformas não-Windows o stealth não é suportado nesta versão.
#[cfg(not(windows))]
pub fn apply_stealth(_raw: *mut core::ffi::c_void) -> CaptureStatus {
    CaptureStatus::Unsupported
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn build_abaixo_do_minimo_nao_suporta() {
        assert!(!supports_capture_exclusion(19040));
        assert!(!supports_capture_exclusion(0));
    }

    #[test]
    fn build_no_minimo_ou_acima_suporta() {
        assert!(supports_capture_exclusion(MIN_BUILD_EXCLUDE_FROM_CAPTURE));
        assert!(supports_capture_exclusion(22631));
    }

    #[test]
    fn status_serializa_em_minusculo() {
        let json = serde_json::to_string(&CaptureStatus::Applied).unwrap();
        assert_eq!(json, "\"applied\"");
    }
}
