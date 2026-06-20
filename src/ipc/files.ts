/** Wrappers tipados de leitura/escrita de texto (US-19 .env, US-20 export). */
import { invoke } from "@tauri-apps/api/core";

/** Lê um arquivo de texto. */
export function readTextFile(path: string): Promise<string> {
  return invoke<string>("read_text_file", { path });
}

/** Escreve um arquivo de texto. */
export function writeTextFile(path: string, content: string): Promise<void> {
  return invoke("write_text_file", { path, content });
}
