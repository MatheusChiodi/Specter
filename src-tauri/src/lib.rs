//! Specter — backend Tauri (scaffold).
//!
//! Os módulos reais (`pty`, `windows`, `capture`, `commands`, `persistence`,
//! `env_detect`, `shortcuts`) entram nas próximas fases. Por ora só o comando
//! de exemplo e um teste de fumaça para o gate da FASE 2.0.

/// Comando de exemplo do scaffold (será substituído pelos comandos reais).
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Olá, {name}! Specter pronto.")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn greet_inclui_o_nome() {
        assert!(greet("Specter").contains("Specter"));
    }
}
