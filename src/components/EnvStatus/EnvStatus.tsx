import { useCallback, useEffect, useState, type JSX } from "react";
import { detectEnvironment, type ToolVersion } from "../../ipc";

/**
 * Status do ambiente (US-18): detecta e exibe as versões de Node, npm, pnpm,
 * git e Claude. A detecção roda no mount de forma não-bloqueante e pode ser
 * re-disparada pelo botão "Atualizar". Ferramentas ausentes mostram um estado
 * vazio didático com uma dica curta — sem instalar nada.
 */

/** Dica de instalação por ferramenta, exibida quando ela não é encontrada. */
const HINTS: Record<string, string> = {
  Node: "instale o Node.js (nodejs.org) para rodar comandos JS.",
  npm: "vem com o Node.js — instale o Node para usar o npm.",
  pnpm: "instale com `npm i -g pnpm` para usar o pnpm.",
  git: "instale o Git (git-scm.com) para versionar projetos.",
  Claude: "instale o Claude Code (`npm i -g @anthropic-ai/claude-code`).",
};

/** Linha de uma ferramenta: versão detectada ou estado "não encontrado". */
function ToolRow({ tool }: { tool: ToolVersion }): JSX.Element {
  const found = tool.version !== null;
  const hint = HINTS[tool.name];

  return (
    <li
      className="flex items-start justify-between gap-3 rounded-lg border border-white/5 bg-black/20 p-2.5"
      aria-label={tool.name}
    >
      <div className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-gray-100">
          {tool.name}
        </span>
        {!found && hint && (
          <span className="mt-0.5 block text-xs text-gray-400">{hint}</span>
        )}
      </div>

      {found ? (
        <code className="shrink-0 rounded-md border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/15 px-2 py-1 font-mono text-xs text-[var(--color-accent)]">
          {tool.version}
        </code>
      ) : (
        <span className="shrink-0 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-medium text-gray-400">
          não encontrado
        </span>
      )}
    </li>
  );
}

function EnvStatus(): JSX.Element {
  const [tools, setTools] = useState<ToolVersion[]>([]);
  const [loading, setLoading] = useState(true);

  const detect = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      setTools(await detectEnvironment());
    } catch {
      // Falha de detecção não deve derrubar a UI; mantém o último resultado.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void detect();
  }, [detect]);

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
          Status do ambiente
        </h3>
        <button
          type="button"
          onClick={() => void detect()}
          disabled={loading}
          title="Re-detectar as ferramentas do ambiente"
          aria-label="Atualizar status do ambiente"
          className="rounded-md border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/15 px-2.5 py-1 text-xs font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Detectando…" : "Atualizar"}
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
        {tools.length === 0 ? (
          <p className="py-8 text-center text-sm italic text-gray-500">
            {loading
              ? "Detectando ferramentas do ambiente…"
              : "Nenhuma ferramenta detectada. Clique em Atualizar para tentar de novo."}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tools.map((tool) => (
              <ToolRow key={tool.name} tool={tool} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default EnvStatus;
