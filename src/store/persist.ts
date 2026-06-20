/** Helpers de persistência JSON tipada sobre a camada IPC de store. */
import { storeGet, storeSet } from "../ipc/store";

/** Carrega o JSON de `key`; retorna `fallback` se ausente. */
export async function loadJson<T>(key: string, fallback: T): Promise<T> {
  const value = await storeGet<T>(key);
  return value ?? fallback;
}

/** Persiste `value` em `key`. */
export function saveJson<T>(key: string, value: T): Promise<void> {
  return storeSet(key, value);
}
