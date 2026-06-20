import { useCallback, useEffect, useRef, useState } from "react";
import { loadJson, saveJson } from "../../store/persist";
import type { CommandItem } from "./types";

/** Chave de persistência da paleta de comandos (US-06). */
const STORAGE_KEY = "commands";

/** Pré-comandos padrão, categorizados (Claude Code, git, npm/pnpm, utilidades). */
export const DEFAULTS: CommandItem[] = [
  {
    id: "claude",
    label: "Claude Code (interativo)",
    command: "claude",
    category: "Claude Code",
    mode: "run",
  },
  {
    id: "claude-continue",
    label: "Continuar última sessão",
    command: "claude --continue",
    category: "Claude Code",
    mode: "insert",
  },
  {
    id: "git-status",
    label: "Status do repositório",
    command: "git status",
    category: "git",
    mode: "run",
  },
  {
    id: "git-pull",
    label: "Atualizar (pull)",
    command: "git pull",
    category: "git",
    mode: "run",
  },
  {
    id: "git-log",
    label: "Log resumido",
    command: "git log --oneline -10",
    category: "git",
    mode: "insert",
  },
  {
    id: "pnpm-install",
    label: "Instalar dependências",
    command: "pnpm install",
    category: "npm/pnpm",
    mode: "run",
  },
  {
    id: "pnpm-dev",
    label: "Servidor de desenvolvimento",
    command: "pnpm dev",
    category: "npm/pnpm",
    mode: "run",
  },
  {
    id: "pnpm-build",
    label: "Build de produção",
    command: "pnpm build",
    category: "npm/pnpm",
    mode: "insert",
  },
  {
    id: "clear",
    label: "Limpar terminal",
    command: "cls",
    category: "Utilidades",
    mode: "run",
  },
  {
    id: "list-dir",
    label: "Listar diretório",
    command: "ls",
    category: "Utilidades",
    mode: "run",
  },
];

/** Gera um id único para novos comandos sem depender de libs externas. */
function makeId(): string {
  return `cmd-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Dados de criação de um comando (id é gerado internamente). */
export type NewCommand = Omit<CommandItem, "id">;

export interface UseCommands {
  /** Lista atual de comandos. */
  items: CommandItem[];
  /** `true` enquanto o carregamento inicial não terminou. */
  loading: boolean;
  /** Cria um novo comando, persiste e retorna o item criado. */
  add: (data: NewCommand) => CommandItem;
  /** Atualiza campos de um comando existente por id e persiste. */
  update: (id: string, patch: Partial<NewCommand>) => void;
  /** Remove um comando por id e persiste. */
  remove: (id: string) => void;
}

/**
 * Hook de estado da paleta de comandos (US-06).
 * Carrega de `loadJson("commands", DEFAULTS)` e persiste com `saveJson`
 * a cada mutação (add/update/remove). A escrita é disparada por efeito,
 * evitando salvar a carga inicial e mantendo o estado como fonte da verdade.
 */
export function useCommands(): UseCommands {
  const [items, setItems] = useState<CommandItem[]>([]);
  const [loading, setLoading] = useState(true);
  // Suprime a persistência da primeira renderização (carga inicial).
  const hydrated = useRef(false);

  useEffect(() => {
    let active = true;
    loadJson<CommandItem[]>(STORAGE_KEY, DEFAULTS).then((loaded) => {
      if (!active) return;
      setItems(loaded);
      setLoading(false);
      // Após a carga, qualquer próxima mudança de `items` é mutação do usuário.
      hydrated.current = true;
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    // Persiste só mutações do usuário; ignora a carga inicial.
    if (!hydrated.current) return;
    void saveJson(STORAGE_KEY, items);
  }, [items]);

  const add = useCallback((data: NewCommand): CommandItem => {
    const item: CommandItem = { ...data, id: makeId() };
    setItems((prev) => [...prev, item]);
    return item;
  }, []);

  const update = useCallback((id: string, patch: Partial<NewCommand>): void => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }, []);

  const remove = useCallback((id: string): void => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return { items, loading, add, update, remove };
}
