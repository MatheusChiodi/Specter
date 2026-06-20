/** Wrappers tipados do store JSON local (US-06/08/09/11/12). */
import { invoke } from "@tauri-apps/api/core";

/** Lê o JSON persistido em `key`, ou `null` se ausente. */
export function storeGet<T>(key: string): Promise<T | null> {
  return invoke<T | null>("store_get", { key });
}

/** Persiste `value` em `key`. */
export function storeSet(key: string, value: unknown): Promise<void> {
  return invoke("store_set", { key, value });
}

/** Remove o JSON de `key`. */
export function storeRemove(key: string): Promise<void> {
  return invoke("store_remove", { key });
}
