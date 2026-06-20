import { useCallback, useEffect, useRef, useState } from "react";
import { loadJson, saveJson } from "../../store/persist";
import type { DirsState } from "./types";

/** Chave de persistência dos diretórios no store. */
const STORAGE_KEY = "dirs";
/** Limite de recentes mantidos (mais recentes primeiro). */
const MAX_RECENTS = 10;

/** Estado inicial vazio usado como fallback de carga. */
const EMPTY: DirsState = { recents: [], favorites: [] };

export interface UseDirs {
  /** Pastas recentes, mais recentes primeiro. */
  recents: string[];
  /** Pastas favoritas (fixadas). */
  favorites: string[];
  /** Registra uma pasta como recente (prepend, dedup, máx. 10). */
  addRecent: (path: string) => void;
  /** Fixa/desafixa uma pasta nos favoritos. */
  toggleFavorite: (path: string) => void;
  /** Remove uma pasta da lista de recentes. */
  removeRecent: (path: string) => void;
}

/**
 * Diretórios favoritos e recentes persistentes (US-11).
 * Carrega de `loadJson("dirs", { recents: [], favorites: [] })` no mount e
 * persiste a cada mutação.
 */
export function useDirs(): UseDirs {
  const [state, setState] = useState<DirsState>(EMPTY);
  // Evita persistir o estado inicial vazio antes do carregamento concluir.
  const loaded = useRef(false);

  useEffect(() => {
    let active = true;
    void loadJson<DirsState>(STORAGE_KEY, EMPTY).then((stored) => {
      if (!active) return;
      setState({
        recents: stored.recents ?? [],
        favorites: stored.favorites ?? [],
      });
      loaded.current = true;
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    void saveJson(STORAGE_KEY, state);
  }, [state]);

  const addRecent = useCallback((path: string) => {
    const trimmed = path.trim();
    if (trimmed.length === 0) return;
    setState((prev) => ({
      ...prev,
      recents: [
        trimmed,
        ...prev.recents.filter((p) => p !== trimmed),
      ].slice(0, MAX_RECENTS),
    }));
  }, []);

  const toggleFavorite = useCallback((path: string) => {
    const trimmed = path.trim();
    if (trimmed.length === 0) return;
    setState((prev) => ({
      ...prev,
      favorites: prev.favorites.includes(trimmed)
        ? prev.favorites.filter((p) => p !== trimmed)
        : [...prev.favorites, trimmed],
    }));
  }, []);

  const removeRecent = useCallback((path: string) => {
    setState((prev) => ({
      ...prev,
      recents: prev.recents.filter((p) => p !== path),
    }));
  }, []);

  return {
    recents: state.recents,
    favorites: state.favorites,
    addRecent,
    toggleFavorite,
    removeRecent,
  };
}

export default useDirs;
