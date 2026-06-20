/** Hook de estado + CRUD persistido dos perfis de projeto (US-12). */
import { useCallback, useEffect, useState } from "react";
import { loadJson, saveJson } from "../../store/persist";
import type { Profile } from "./types";

const STORE_KEY = "profiles";

/** Gera um id razoavelmente único sem depender de libs externas. */
function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface UseProfilesResult {
  profiles: Profile[];
  /** `true` até o carregamento inicial do JSON terminar. */
  loading: boolean;
  /** Cria um perfil (id gerado) e persiste; retorna o perfil criado. */
  add: (data: Omit<Profile, "id">) => Profile;
  /** Atualiza campos de um perfil existente e persiste. */
  update: (id: string, patch: Partial<Omit<Profile, "id">>) => void;
  /** Remove um perfil e persiste. */
  remove: (id: string) => void;
}

export function useProfiles(): UseProfilesResult {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadJson<Profile[]>(STORE_KEY, [])
      .then((loaded) => {
        if (active) setProfiles(loaded);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const add = useCallback((data: Omit<Profile, "id">): Profile => {
    const profile: Profile = { id: makeId(), ...data };
    setProfiles((prev) => {
      const next = [...prev, profile];
      void saveJson(STORE_KEY, next);
      return next;
    });
    return profile;
  }, []);

  const update = useCallback(
    (id: string, patch: Partial<Omit<Profile, "id">>) => {
      setProfiles((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, ...patch } : p));
        void saveJson(STORE_KEY, next);
        return next;
      });
    },
    [],
  );

  const remove = useCallback((id: string) => {
    setProfiles((prev) => {
      const next = prev.filter((p) => p.id !== id);
      void saveJson(STORE_KEY, next);
      return next;
    });
  }, []);

  return { profiles, loading, add, update, remove };
}
