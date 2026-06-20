//! Detecção das ferramentas do ambiente (US-18): Node, npm, pnpm, git, Claude.

use serde::Serialize;
use std::process::Command;

/// Versão detectada de uma ferramenta (ou `None` se ausente).
#[derive(Serialize)]
pub struct ToolVersion {
    pub name: String,
    pub version: Option<String>,
}

/// Extrai a primeira linha não-vazia da saída de `--version`.
fn parse_version(stdout: &[u8]) -> Option<String> {
    let text = String::from_utf8_lossy(stdout);
    let line = text.lines().next().unwrap_or("").trim().to_string();
    if line.is_empty() {
        None
    } else {
        Some(line)
    }
}

#[cfg(windows)]
fn run_version(program: &str) -> Option<String> {
    // Muitas ferramentas são `.cmd` no Windows (npm, pnpm, claude) → via `cmd /C`.
    let out = Command::new("cmd")
        .args(["/C", program, "--version"])
        .output()
        .ok()?;
    parse_version(&out.stdout)
}

#[cfg(not(windows))]
fn run_version(program: &str) -> Option<String> {
    let out = Command::new(program).arg("--version").output().ok()?;
    parse_version(&out.stdout)
}

fn detect(name: &str, program: &str) -> ToolVersion {
    ToolVersion {
        name: name.to_string(),
        version: run_version(program),
    }
}

/// Detecta as versões das ferramentas usadas pelo Specter (US-18).
#[tauri::command]
pub fn detect_environment() -> Vec<ToolVersion> {
    vec![
        detect("Node", "node"),
        detect("npm", "npm"),
        detect("pnpm", "pnpm"),
        detect("git", "git"),
        detect("Claude", "claude"),
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_pega_primeira_linha_trim() {
        assert_eq!(parse_version(b"v20.0.0\n"), Some("v20.0.0".to_string()));
        assert_eq!(
            parse_version(b"  git version 2.40  \nextra"),
            Some("git version 2.40".to_string())
        );
    }

    #[test]
    fn parse_vazio_retorna_none() {
        assert_eq!(parse_version(b""), None);
        assert_eq!(parse_version(b"   \n"), None);
    }
}
