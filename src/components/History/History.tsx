import { useMemo, useState, type JSX } from "react";
import useHistory from "./useHistory";
import type { HistoryEntry } from "./types";

/**
 * Painel de Histórico de comandos (US-08).
 * Busca textual, reexecução por clique/Enter via `onRun`, limpar total ou por entrada.
 */

interface HistoryProps {
  /** Disparado com o comando a reexecutar na sessão ativa. */
  onRun: (cmd: string) => void;
}

/** Formata o timestamp para um horário curto e legível. */
function formatTime(ts: number): string {
  return new Date(ts).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function History({ onRun }: HistoryProps): JSX.Element {
  const { entries, clear, remove } = useHistory();
  const [query, setQuery] = useState("");

  const filtered = useMemo<HistoryEntry[]>(() => {
    const q = query.trim().toLowerCase();
    if (q.length === 0) return entries;
    return entries.filter((e) => e.command.toLowerCase().includes(q));
  }, [entries, query]);

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar no histórico..."
          aria-label="Buscar no histórico"
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        />
        <button
          type="button"
          onClick={clear}
          disabled={entries.length === 0}
          aria-label="Limpar histórico"
          className="shrink-0 rounded-lg border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/15 px-3 py-1.5 text-sm font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Limpar
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="px-1 py-6 text-center text-sm text-gray-500 italic">
          {entries.length === 0
            ? "Nenhum comando no histórico ainda."
            : "Nenhum comando corresponde à busca."}
        </p>
      ) : (
        <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {filtered.map((entry) => (
            <li key={entry.id} className="group flex items-center gap-2">
              <button
                type="button"
                onClick={() => onRun(entry.command)}
                title="Reexecutar comando"
                className="flex min-w-0 flex-1 flex-col items-start gap-0.5 rounded-lg border border-transparent px-2.5 py-1.5 text-left transition-colors hover:border-white/10 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              >
                <span className="w-full truncate font-mono text-sm text-gray-200">
                  {entry.command}
                </span>
                <span className="w-full truncate text-xs text-gray-500">
                  {entry.cwd ?? "sem cwd"} · {formatTime(entry.ts)}
                  {entry.durationMs !== undefined
                    ? ` · ${entry.durationMs}ms`
                    : ""}
                </span>
              </button>
              <button
                type="button"
                onClick={() => remove(entry.id)}
                aria-label={`Remover do histórico: ${entry.command}`}
                className="shrink-0 rounded-md px-2 py-1 text-xs text-gray-500 opacity-0 transition-opacity hover:text-[var(--color-accent)] focus:opacity-100 focus:outline-none group-hover:opacity-100"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default History;
