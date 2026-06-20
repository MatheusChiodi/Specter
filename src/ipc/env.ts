/** Wrapper tipado da detecção de ambiente (US-18). */
import { invoke } from "@tauri-apps/api/core";

/** Versão detectada de uma ferramenta (`version` nulo se ausente). */
export interface ToolVersion {
  name: string;
  version: string | null;
}

/** Detecta Node, npm, pnpm, git e Claude no ambiente. */
export function detectEnvironment(): Promise<ToolVersion[]> {
  return invoke<ToolVersion[]>("detect_environment");
}
