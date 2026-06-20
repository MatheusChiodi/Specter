import { useCallback, useEffect, useState, type JSX } from "react";
import { ptySessions, ptyClose, type SessionInfo } from "../../ipc";
import { formatUptime } from "./format";

/**
 * Gerenciador de processos (US-27): lista as sessões/PTYs ativas (shell, id e
 * duração) e permite encerrar cada uma. A lista é atualizada em tempo quase
 * real por um intervalo de 1s, limpo no unmount. Erros de IPC são silenciados
 * para nunca derrubar a UI.
 */

/** Período de atualização da lista, em ms. */
const REFRESH_MS = 1000;

function ProcessManager(): JSX.Element {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  // Distingue "ainda não carregou" de "carregou e está vazio" (estado vazio).
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async (): Promise<void> => {
    try {
      const list = await ptySessions();
      setSessions(list);
    } catch {
      // Falha de IPC: mantém a lista anterior, não quebra a UI.
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const handle = window.setInterval(() => void refresh(), REFRESH_MS);
    return () => window.clearInterval(handle);
  }, [refresh]);

  const handleClose = useCallback(
    async (id: number): Promise<void> => {
      try {
        await ptyClose(id);
      } catch {
        // Encerramento pode falhar se a sessão já morreu: ignora.
      }
      await refresh();
    },
    [refresh],
  );

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-200">
          Processos ativos
        </h2>
        <span className="shrink-0 rounded-md bg-white/5 px-2 py-0.5 text-xs text-gray-400">
          {sessions.length}
        </span>
      </div>

      {loaded && sessions.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 px-4 py-8 text-center">
          <p className="text-sm text-gray-400">Nenhuma sessão ativa.</p>
          <p className="text-xs text-gray-500">
            Abra um terminal para ver os processos aqui.
          </p>
        </div>
      ) : (
        <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="group flex items-center gap-3 rounded-lg border border-transparent px-2.5 py-1.5 transition-colors hover:border-white/10 hover:bg-white/5"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="w-full truncate font-mono text-sm text-gray-200">
                  {session.shell}
                </span>
                <span className="w-full truncate text-xs text-gray-500">
                  PID {session.id} · {formatUptime(session.uptimeMs)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => void handleClose(session.id)}
                title={`Encerrar sessão ${session.id}`}
                aria-label={`Encerrar sessão ${session.id}`}
                className="shrink-0 rounded-lg border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/15 px-3 py-1.5 text-sm font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              >
                Encerrar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProcessManager;
