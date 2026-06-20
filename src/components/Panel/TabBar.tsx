import { useState, type JSX } from "react";
import type { Tab } from "./useTabs";

/** Barra de abas de terminal (US-10). */
interface TabBarProps {
  tabs: Tab[];
  activeId: string;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onAdd: () => void;
  onRename: (id: string, title: string) => void;
}

export default function TabBar({
  tabs,
  activeId,
  onSelect,
  onClose,
  onAdd,
  onRename,
}: TabBarProps): JSX.Element {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  function commit(): void {
    if (editingId) {
      onRename(editingId, draft.trim() || "Terminal");
      setEditingId(null);
    }
  }

  return (
    <div
      role="tablist"
      className="flex items-center gap-1 overflow-x-auto border-b border-white/10 px-2 py-1"
    >
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <div
            key={tab.id}
            className={[
              "flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs",
              active
                ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
                : "text-gray-400 hover:bg-white/5",
            ].join(" ")}
          >
            {editingId === tab.id ? (
              <input
                aria-label="Renomear aba"
                value={draft}
                autoFocus
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commit();
                  if (e.key === "Escape") setEditingId(null);
                }}
                className="w-24 rounded bg-black/30 px-1 text-gray-200 focus:outline-none"
              />
            ) : (
              <button
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onSelect(tab.id)}
                onDoubleClick={() => {
                  setEditingId(tab.id);
                  setDraft(tab.title);
                }}
                className="max-w-[10rem] truncate"
              >
                {tab.title}
              </button>
            )}
            <button
              type="button"
              aria-label={`Fechar ${tab.title}`}
              onClick={() => onClose(tab.id)}
              className="text-gray-500 hover:text-[var(--color-accent)]"
            >
              ✕
            </button>
          </div>
        );
      })}
      <button
        type="button"
        aria-label="Nova aba"
        onClick={onAdd}
        className="shrink-0 rounded-md px-2 py-1 text-sm text-gray-400 hover:bg-white/5 hover:text-gray-200"
      >
        +
      </button>
    </div>
  );
}
