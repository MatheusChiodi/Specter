/** Estado das abas/sessões de terminal (US-10). */
import { useCallback, useState } from "react";

export interface Tab {
  id: string;
  title: string;
  cwd: string | null;
  initCommands: string[];
  env: [string, string][];
  /** Aba dividida em dois painéis (US-23). */
  split: boolean;
}

export interface NewTab {
  title?: string;
  cwd?: string | null;
  initCommands?: string[];
  env?: [string, string][];
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function createTab(data: NewTab, index: number): Tab {
  return {
    id: makeId(),
    title: data.title ?? `Terminal ${index}`,
    cwd: data.cwd ?? null,
    initCommands: data.initCommands ?? [],
    env: data.env ?? [],
    split: false,
  };
}

interface TabsState {
  tabs: Tab[];
  activeId: string;
}

export interface UseTabs {
  tabs: Tab[];
  activeId: string;
  activeTab: Tab | undefined;
  addTab: (data?: NewTab) => string;
  closeTab: (id: string) => void;
  setActive: (id: string) => void;
  renameTab: (id: string, title: string) => void;
  setTabCwd: (id: string, cwd: string | null) => void;
  toggleSplit: (id: string) => void;
}

export function useTabs(): UseTabs {
  const [state, setState] = useState<TabsState>(() => {
    const first = createTab({}, 1);
    return { tabs: [first], activeId: first.id };
  });

  const addTab = useCallback((data: NewTab = {}): string => {
    const tab = createTab(data, 0);
    setState((s) => ({
      tabs: [...s.tabs, { ...tab, title: data.title ?? `Terminal ${s.tabs.length + 1}` }],
      activeId: tab.id,
    }));
    return tab.id;
  }, []);

  const closeTab = useCallback((id: string): void => {
    setState((s) => {
      const remaining = s.tabs.filter((t) => t.id !== id);
      // Nunca fica sem abas: fechar a última cria uma nova.
      if (remaining.length === 0) {
        const fresh = createTab({}, 1);
        return { tabs: [fresh], activeId: fresh.id };
      }
      const activeId =
        s.activeId === id ? remaining[remaining.length - 1].id : s.activeId;
      return { tabs: remaining, activeId };
    });
  }, []);

  const setActive = useCallback((id: string): void => {
    setState((s) => ({ ...s, activeId: id }));
  }, []);

  const patchTab = useCallback((id: string, patch: Partial<Tab>): void => {
    setState((s) => ({
      ...s,
      tabs: s.tabs.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  }, []);

  const renameTab = useCallback(
    (id: string, title: string) => patchTab(id, { title }),
    [patchTab],
  );
  const setTabCwd = useCallback(
    (id: string, cwd: string | null) => patchTab(id, { cwd }),
    [patchTab],
  );
  const toggleSplit = useCallback((id: string): void => {
    setState((s) => ({
      ...s,
      tabs: s.tabs.map((t) => (t.id === id ? { ...t, split: !t.split } : t)),
    }));
  }, []);

  return {
    tabs: state.tabs,
    activeId: state.activeId,
    activeTab: state.tabs.find((t) => t.id === state.activeId),
    addTab,
    closeTab,
    setActive,
    renameTab,
    setTabCwd,
    toggleSplit,
  };
}
