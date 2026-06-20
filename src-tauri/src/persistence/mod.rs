//! Persistência local em JSON sob `%LOCALAPPDATA%/com.mchiodi.specter/`.
//!
//! Store genérico chave→JSON usado pelas features (US-06/08/09/11/12).
//! Roaming (`%APPDATA%`) é descartado de propósito (ver ARQUITETURA §7).

use std::fs;
use std::path::{Path, PathBuf};

use serde_json::Value;
use tauri::{AppHandle, Manager};

use crate::error::{Result, SpecterError};

/// Remove caracteres perigosos de `key` para formar um nome de arquivo seguro.
fn sanitize(key: &str) -> String {
    key.chars()
        .filter(|c| c.is_alphanumeric() || *c == '_' || *c == '-')
        .collect()
}

/// Caminho do arquivo JSON de `key` dentro de `dir`.
fn json_path(dir: &Path, key: &str) -> PathBuf {
    dir.join(format!("{}.json", sanitize(key)))
}

/// Lê e desserializa o JSON; `None` se o arquivo não existir.
fn read_json(path: &Path) -> Result<Option<Value>> {
    if !path.exists() {
        return Ok(None);
    }
    let text = fs::read_to_string(path).map_err(|e| SpecterError::Persist(e.to_string()))?;
    let value = serde_json::from_str(&text).map_err(|e| SpecterError::Persist(e.to_string()))?;
    Ok(Some(value))
}

/// Serializa e grava o JSON (cria o diretório-pai se necessário).
fn write_json(path: &Path, value: &Value) -> Result<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| SpecterError::Persist(e.to_string()))?;
    }
    let text = serde_json::to_string_pretty(value).map_err(|e| SpecterError::Persist(e.to_string()))?;
    fs::write(path, text).map_err(|e| SpecterError::Persist(e.to_string()))
}

/// Diretório base de dados local da app.
fn data_dir(app: &AppHandle) -> Result<PathBuf> {
    app.path()
        .app_local_data_dir()
        .map_err(|e| SpecterError::Persist(e.to_string()))
}

/// Lê o JSON persistido em `key` (ou `null`).
#[tauri::command]
pub fn store_get(app: AppHandle, key: String) -> Result<Option<Value>> {
    read_json(&json_path(&data_dir(&app)?, &key))
}

/// Persiste `value` em `key`.
#[tauri::command]
pub fn store_set(app: AppHandle, key: String, value: Value) -> Result<()> {
    write_json(&json_path(&data_dir(&app)?, &key), &value)
}

/// Remove o JSON de `key` (no-op se ausente).
#[tauri::command]
pub fn store_remove(app: AppHandle, key: String) -> Result<()> {
    let path = json_path(&data_dir(&app)?, &key);
    if path.exists() {
        fs::remove_file(&path).map_err(|e| SpecterError::Persist(e.to_string()))?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::env;

    #[test]
    fn sanitize_remove_caracteres_perigosos() {
        assert_eq!(sanitize("com/mands..json"), "commandsjson");
        assert_eq!(sanitize("hist_ory-1"), "hist_ory-1");
        assert_eq!(sanitize("../escape"), "escape");
    }

    #[test]
    fn roundtrip_escreve_e_le() {
        let dir = env::temp_dir().join("specter_test_store");
        let path = json_path(&dir, "unit");
        let value = serde_json::json!({ "a": 1, "b": [1, 2, 3] });
        write_json(&path, &value).unwrap();
        assert_eq!(read_json(&path).unwrap(), Some(value));
        let _ = fs::remove_file(&path);
    }

    #[test]
    fn read_inexistente_retorna_none() {
        let dir = env::temp_dir().join("specter_test_store");
        let path = json_path(&dir, "nao_existe_xyz");
        let _ = fs::remove_file(&path);
        assert_eq!(read_json(&path).unwrap(), None);
    }
}
