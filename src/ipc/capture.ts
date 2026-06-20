/** Wrapper tipado do comando de stealth (US-04). */
import { invoke } from "@tauri-apps/api/core";
import type { CaptureStatus } from "../types/ipc";

/** Reaplica a exclusão de captura à janela atual e retorna o status. */
export function applyCaptureExclusion(): Promise<CaptureStatus> {
  return invoke<CaptureStatus>("apply_capture_exclusion");
}
