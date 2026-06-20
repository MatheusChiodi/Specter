import { useEffect, useMemo, useState, type JSX, type KeyboardEvent } from "react";
import suggest from "./suggest";

/**
 * Camada de UI de autocomplete por prefixo sobre o histórico (US-24).
 * Não interfere no autocomplete nativo do shell: é puramente visual e desligável
 * (sem sugestões → não renderiza). Navegação por ↑/↓, Enter aceita, Esc fecha.
 */

interface AutocompleteProps {
  /** Texto atual digitado pelo usuário. */
  input: string;
  /** Comandos do histórico (mais recentes primeiro). */
  history: string[];
  /** Disparado com o comando aceito. */
  onAccept: (cmd: string) => void;
}

function Autocomplete({
  input,
  history,
  onAccept,
}: AutocompleteProps): JSX.Element | null {
  const suggestions = useMemo(
    () => suggest(input, history),
    [input, history],
  );
  const [active, setActive] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  // Reabre e reseta o realce sempre que o conjunto de sugestões muda.
  useEffect(() => {
    setActive(0);
    setDismissed(false);
  }, [input, history]);

  if (dismissed || suggestions.length === 0) return null;

  function handleKeyDown(e: KeyboardEvent<HTMLUListElement>): void {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      onAccept(suggestions[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setDismissed(true);
    }
  }

  return (
    <ul
      role="listbox"
      aria-label="Sugestões de comando"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="flex flex-col gap-0.5 rounded-xl border border-white/10 bg-black/60 p-1 backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
    >
      {suggestions.map((cmd, i) => (
        <li
          key={cmd}
          role="option"
          aria-selected={i === active}
          onMouseEnter={() => setActive(i)}
          onMouseDown={(e) => {
            // mousedown evita perder foco do input antes do clique resolver
            e.preventDefault();
            onAccept(cmd);
          }}
          className={`cursor-pointer truncate rounded-lg px-3 py-1.5 font-mono text-sm transition-colors ${
            i === active
              ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
              : "text-gray-300 hover:bg-white/5"
          }`}
        >
          {cmd}
        </li>
      ))}
    </ul>
  );
}

export default Autocomplete;
