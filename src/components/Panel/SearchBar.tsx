import { useState, type JSX, type KeyboardEvent } from "react";

/** Barra de busca no buffer do terminal (US-21). */
interface SearchBarProps {
  onNext: (query: string) => void;
  onPrev: (query: string) => void;
  onClose: () => void;
}

export default function SearchBar({
  onNext,
  onPrev,
  onClose,
}: SearchBarProps): JSX.Element {
  const [query, setQuery] = useState("");

  function handleKey(event: KeyboardEvent<HTMLInputElement>): void {
    if (event.key === "Enter") {
      event.preventDefault();
      if (event.shiftKey) onPrev(query);
      else onNext(query);
    } else if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  }

  const btn =
    "rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-gray-300 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]";

  return (
    <div className="flex items-center gap-2 border-b border-white/10 bg-[var(--color-base)]/90 px-3 py-1.5 backdrop-blur-md">
      <input
        type="search"
        aria-label="Buscar no terminal"
        value={query}
        autoFocus
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Buscar no terminal…"
        className="min-w-0 flex-1 rounded-md border border-white/10 bg-black/30 px-2 py-1 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
      />
      <button type="button" aria-label="Ocorrência anterior" onClick={() => onPrev(query)} className={btn}>
        ↑
      </button>
      <button type="button" aria-label="Próxima ocorrência" onClick={() => onNext(query)} className={btn}>
        ↓
      </button>
      <button type="button" aria-label="Fechar busca" onClick={onClose} className={btn}>
        ✕
      </button>
    </div>
  );
}
