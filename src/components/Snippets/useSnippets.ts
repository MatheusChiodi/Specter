/** Hook de estado + CRUD persistido dos snippets (US-09). */
import { useCallback, useEffect, useState } from "react";
import { loadJson, saveJson } from "../../store/persist";
import type { Snippet } from "./types";

const STORE_KEY = "snippets";

/** Gera um id razoavelmente único sem depender de libs externas. */
function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface UseSnippetsResult {
  snippets: Snippet[];
  /** `true` até o carregamento inicial do JSON terminar. */
  loading: boolean;
  /** Cria um snippet (id gerado) e persiste; retorna o snippet criado. */
  addSnippet: (data: Omit<Snippet, "id">) => Snippet;
  /** Atualiza campos de um snippet existente e persiste. */
  updateSnippet: (id: string, patch: Partial<Omit<Snippet, "id">>) => void;
  /** Remove um snippet e persiste. */
  removeSnippet: (id: string) => void;
}

export function useSnippets(): UseSnippetsResult {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadJson<Snippet[]>(STORE_KEY, [])
      .then((loaded) => {
        if (active) setSnippets(loaded);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const addSnippet = useCallback(
    (data: Omit<Snippet, "id">): Snippet => {
      const snippet: Snippet = { id: makeId(), ...data };
      setSnippets((prev) => {
        const next = [...prev, snippet];
        void saveJson(STORE_KEY, next);
        return next;
      });
      return snippet;
    },
    [],
  );

  const updateSnippet = useCallback(
    (id: string, patch: Partial<Omit<Snippet, "id">>) => {
      setSnippets((prev) => {
        const next = prev.map((s) => (s.id === id ? { ...s, ...patch } : s));
        void saveJson(STORE_KEY, next);
        return next;
      });
    },
    [],
  );

  const removeSnippet = useCallback((id: string) => {
    setSnippets((prev) => {
      const next = prev.filter((s) => s.id !== id);
      void saveJson(STORE_KEY, next);
      return next;
    });
  }, []);

  return { snippets, loading, addSnippet, updateSnippet, removeSnippet };
}
