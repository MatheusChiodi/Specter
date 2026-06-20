import { useMemo, useState, type JSX } from "react";
import { CHEAT_SHEET, type CheatItem, type CheatSection } from "./data";

/**
 * Cheat sheet do Claude Code (US-25).
 * Painel local (sem rede), categorizado e pesquisável; cada item tem ações
 * explícitas "Copiar" (clipboard) e "Inserir" (no prompt da sessão ativa),
 * consistente com o mecanismo da US-06.
 */

interface CheatSheetProps {
  /** Chamado após copiar o texto para a área de transferência. */
  onCopy?: (text: string) => void;
  /** Chamado ao inserir o texto no prompt da sessão ativa. */
  onInsert?: (text: string) => void;
}

/** Filtra seções/itens por termo, casando em comando ou descrição. */
function filterSections(sections: CheatSection[], query: string): CheatSection[] {
  const term = query.trim().toLowerCase();
  if (term.length === 0) return sections;

  const matches = (item: CheatItem): boolean =>
    item.command.toLowerCase().includes(term) ||
    item.description.toLowerCase().includes(term);

  return sections
    .map((section) => ({ ...section, items: section.items.filter(matches) }))
    .filter((section) => section.items.length > 0);
}

function CheatSheet({ onCopy, onInsert }: CheatSheetProps): JSX.Element {
  const [query, setQuery] = useState("");

  const sections = useMemo(() => filterSections(CHEAT_SHEET, query), [query]);

  async function handleCopy(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      onCopy?.(text);
    } catch {
      // Clipboard pode falhar sem foco/permissão; silencioso para não quebrar a UI.
    }
  }

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar comando, flag ou atalho…"
        aria-label="Buscar no cheat sheet do Claude Code"
        className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-gray-200 placeholder:text-gray-500 focus:border-[var(--color-accent)]/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
      />

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
        {sections.length === 0 ? (
          <p className="py-8 text-center text-sm italic text-gray-500">
            Nenhum resultado para “{query.trim()}”.
          </p>
        ) : (
          sections.map((section) => (
            <section key={section.title} aria-label={section.title}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
                {section.title}
              </h3>
              <ul className="flex flex-col gap-2">
                {section.items.map((item) => (
                  <li
                    key={item.command}
                    className="flex items-start gap-3 rounded-lg border border-white/5 bg-black/20 p-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <code className="block break-words font-mono text-sm text-gray-100">
                        {item.command}
                      </code>
                      <span className="mt-0.5 block text-xs text-gray-400">
                        {item.description}
                      </span>
                    </div>

                    <div className="flex shrink-0 gap-1.5">
                      <button
                        type="button"
                        onClick={() => void handleCopy(item.command)}
                        title="Copiar para a área de transferência"
                        aria-label={`Copiar ${item.command}`}
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-medium text-gray-300 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                      >
                        Copiar
                      </button>
                      <button
                        type="button"
                        onClick={() => onInsert?.(item.command)}
                        title="Inserir no prompt da sessão ativa"
                        aria-label={`Inserir ${item.command}`}
                        className="rounded-md border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/15 px-2 py-1 text-xs font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                      >
                        Inserir
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

export default CheatSheet;
