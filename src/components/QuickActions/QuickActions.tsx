import { useState, type JSX } from "react";
import { openInExplorer, openInVscode } from "../../ipc";

/**
 * Ações rápidas sobre o `cwd` da sessão (US-26): abrir no Explorer, abrir no
 * VS Code e copiar o caminho. Sem `cwd` os botões ficam desabilitados (com
 * tooltip explicativo). Erros são silenciados para nunca quebrar a UI.
 */

interface QuickActionsProps {
  /** Diretório de trabalho atual, ou `null` quando nenhum está definido. */
  cwd: string | null;
}

function QuickActions({ cwd }: QuickActionsProps): JSX.Element {
  // Feedback transitório do "Copiar caminho" (ícone vira ✓ por um instante).
  const [copied, setCopied] = useState(false);

  const hasCwd = cwd !== null && cwd.length > 0;
  const disabledTitle = "Selecione uma pasta primeiro";

  async function handleExplorer(): Promise<void> {
    if (!hasCwd) return;
    try {
      await openInExplorer(cwd);
    } catch {
      // Falha de abertura não deve derrubar a UI.
    }
  }

  async function handleVscode(): Promise<void> {
    if (!hasCwd) return;
    try {
      await openInVscode(cwd);
    } catch {
      // VS Code ausente/erro: ignora silenciosamente.
    }
  }

  async function handleCopy(): Promise<void> {
    if (!hasCwd) return;
    try {
      await navigator.clipboard.writeText(cwd);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard indisponível: ignora silenciosamente.
    }
  }

  const buttonClass =
    "inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/15 px-3 py-1.5 text-sm font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-2 backdrop-blur-md">
      <button
        type="button"
        onClick={handleExplorer}
        disabled={!hasCwd}
        title={hasCwd ? "Abrir no Explorer" : disabledTitle}
        aria-label="Abrir no Explorer"
        className={buttonClass}
      >
        Abrir no Explorer
      </button>

      <button
        type="button"
        onClick={handleVscode}
        disabled={!hasCwd}
        title={hasCwd ? "Abrir no VS Code" : disabledTitle}
        aria-label="Abrir no VS Code"
        className={buttonClass}
      >
        Abrir no VS Code
      </button>

      <button
        type="button"
        onClick={handleCopy}
        disabled={!hasCwd}
        title={hasCwd ? "Copiar caminho" : disabledTitle}
        aria-label="Copiar caminho"
        className={buttonClass}
      >
        {copied ? "Copiado!" : "Copiar caminho"}
      </button>
    </div>
  );
}

export default QuickActions;
