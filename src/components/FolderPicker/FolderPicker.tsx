import { useState, type JSX } from "react";
import { open } from "@tauri-apps/plugin-dialog";

/**
 * Seletor da pasta de abertura do terminal (US-02, parte básica).
 * Abre o dialog nativo de pasta e propaga o caminho escolhido via `onChange`.
 * Cancelamento (retorno `null`) é tratado sem erro.
 */

interface FolderPickerProps {
  /** Pasta atualmente selecionada, ou `null` quando nenhuma. */
  value: string | null;
  /** Disparado com o caminho escolhido (string) ou `null` ao limpar. */
  onChange: (path: string | null) => void;
}

function FolderPicker({ value, onChange }: FolderPickerProps): JSX.Element {
  // Evita cliques concorrentes enquanto o dialog nativo está aberto.
  const [selecting, setSelecting] = useState(false);

  async function handleSelect(): Promise<void> {
    if (selecting) return;
    setSelecting(true);
    try {
      const selected = await open({ directory: true, multiple: false });
      // `open` retorna `string | null`; ignoramos o cancelamento (null).
      if (typeof selected === "string") {
        onChange(selected);
      }
    } finally {
      setSelecting(false);
    }
  }

  const hasValue = value !== null && value.length > 0;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md">
      <span
        className={`min-w-0 flex-1 truncate text-sm ${
          hasValue ? "text-gray-200" : "text-gray-500 italic"
        }`}
        title={hasValue ? value : undefined}
      >
        {hasValue ? value : "Nenhuma pasta selecionada"}
      </span>

      <button
        type="button"
        onClick={handleSelect}
        disabled={selecting}
        aria-label="Escolher pasta de abertura do terminal"
        className="shrink-0 rounded-lg border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/15 px-3 py-1.5 text-sm font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Escolher pasta
      </button>
    </div>
  );
}

export default FolderPicker;
