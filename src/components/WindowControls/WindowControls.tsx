import type { JSX } from "react";
import { minimizePanel, togglePanel } from "../../ipc";

/**
 * Controles de janela do painel (US-31): botões de minimizar e fechar
 * alinhados à direita de uma barra. "Fechar" apenas oculta o painel — o
 * launcher continua ativo. Erros de IPC são silenciados para nunca quebrar
 * a UI.
 */

function WindowControls(): JSX.Element {
  function handleMinimize(): void {
    void minimizePanel().catch(() => {
      // Falha ao minimizar não deve derrubar a UI.
    });
  }

  function handleClose(): void {
    void togglePanel().catch(() => {
      // Falha ao ocultar o painel não deve derrubar a UI.
    });
  }

  const buttonClass =
    "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm text-white/70 transition-colors hover:bg-[var(--color-accent)]/20 hover:text-[var(--color-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]";

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleMinimize}
        title="Minimizar"
        aria-label="Minimizar"
        className={buttonClass}
      >
        <span aria-hidden="true">—</span>
      </button>

      <button
        type="button"
        onClick={handleClose}
        title="Fechar (oculta o painel)"
        aria-label="Fechar painel"
        className={buttonClass}
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  );
}

export default WindowControls;
