import { useCallback, useEffect, useRef, useState } from "react";
import { loadJson, saveJson } from "../../store/persist";
import type { HistoryEntry } from "./types";

/** Chave de persistência do histórico no store. */
const STORAGE_KEY = "history";
/** Limite de entradas mantidas (mais recentes primeiro). */
const MAX_ENTRIES = 500;

/** Gera um id razoavelmente único sem dependências externas. */
function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface UseHistory {
  /** Entradas do histórico, mais recentes primeiro. */
  entries: HistoryEntry[];
  /** Registra um comando executado (prepend, limita a 500, persiste). */
  record: (command: string, cwd: string | null, durationMs?: number) => void;
  /** Remove uma entrada por id. */
  remove: (id: string) => void;
  /** Limpa todo o histórico. */
  clear: () => void;
}

/**
 * Histórico de comandos persistente (US-08).
 * Carrega de `loadJson("history", [])` no mount e persiste a cada mutação.
 */
export function useHistory(): UseHistory {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  // Evita persistir o estado inicial vazio antes do carregamento concluir.
  const loaded = useRef(false);

  useEffect(() => {
    let active = true;
    void loadJson<HistoryEntry[]>(STORAGE_KEY, []).then((stored) => {
      if (!active) return;
      setEntries(stored);
      loaded.current = true;
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    void saveJson(STORAGE_KEY, entries);
  }, [entries]);

  const record = useCallback(
    (command: string, cwd: string | null, durationMs?: number) => {
      const trimmed = command.trim();
      if (trimmed.length === 0) return;
      const entry: HistoryEntry = {
        id: makeId(),
        command: trimmed,
        cwd,
        ts: Date.now(),
        ...(durationMs !== undefined ? { durationMs } : {}),
      };
      setEntries((prev) => [entry, ...prev].slice(0, MAX_ENTRIES));
    },
    [],
  );

  const remove = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clear = useCallback(() => {
    setEntries([]);
  }, []);

  return { entries, record, remove, clear };
}

export default useHistory;
