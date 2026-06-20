/** Estado de preferências, carregado e persistido em `settings.json`. */
import { useCallback, useEffect, useRef, useState } from "react";
import { loadJson, saveJson } from "./persist";
import { DEFAULT_SETTINGS, type Settings } from "../types/settings";

const KEY = "settings";

export interface UseSettings {
  settings: Settings;
  /** `true` até o carregamento inicial terminar. */
  loading: boolean;
  /** Aplica um patch parcial e persiste. */
  update: (patch: Partial<Settings>) => void;
}

/**
 * Hook único de preferências (deve ser chamado uma vez, no Panel, e
 * distribuído por props para evitar instâncias de estado divergentes).
 */
export function useSettings(): UseSettings {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const hydrated = useRef(false);

  useEffect(() => {
    let active = true;
    loadJson<Settings>(KEY, DEFAULT_SETTINGS).then((loaded) => {
      if (!active) return;
      // Mescla com os defaults para tolerar settings.json antigos/parciais.
      setSettings({ ...DEFAULT_SETTINGS, ...loaded });
      setLoading(false);
      hydrated.current = true;
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    void saveJson(KEY, settings);
  }, [settings]);

  const update = useCallback((patch: Partial<Settings>): void => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  return { settings, loading, update };
}
