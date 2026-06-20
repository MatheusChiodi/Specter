import { useMemo, useState, type FormEvent, type JSX } from "react";
import { useCommands } from "./useCommands";
import type { CommandItem, CommandMode } from "./types";

/**
 * Paleta de pré-comandos (US-06): comandos categorizados, busca textual e
 * CRUD persistido. 1 clique insere no prompt ou executa direto, conforme o
 * `mode` de cada comando.
 */

interface CommandPaletteProps {
  /** Insere o comando no prompt (modo "insert"). */
  onInsert: (command: string) => void;
  /** Executa o comando na sessão ativa (modo "run"). */
  onRun: (command: string) => void;
}

interface FormState {
  label: string;
  command: string;
  category: string;
  mode: CommandMode;
}

const EMPTY_FORM: FormState = {
  label: "",
  command: "",
  category: "",
  mode: "run",
};

function CommandPalette({ onInsert, onRun }: CommandPaletteProps): JSX.Element {
  const { items, loading, add, update, remove } = useCommands();
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const isEditing = editingId !== null;
  const canSubmit =
    form.label.trim().length > 0 && form.command.trim().length > 0;

  // Filtra por rótulo/comando/categoria e agrupa por categoria.
  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered =
      q.length === 0
        ? items
        : items.filter(
            (it) =>
              it.label.toLowerCase().includes(q) ||
              it.command.toLowerCase().includes(q) ||
              it.category.toLowerCase().includes(q),
          );
    const map = new Map<string, CommandItem[]>();
    for (const it of filtered) {
      const key = it.category.trim().length > 0 ? it.category : "Sem categoria";
      const list = map.get(key) ?? [];
      list.push(it);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [items, query]);

  function resetForm(): void {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function startEdit(item: CommandItem): void {
    setEditingId(item.id);
    setForm({
      label: item.label,
      command: item.command,
      category: item.category,
      mode: item.mode,
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!canSubmit) return;
    const data = {
      label: form.label.trim(),
      command: form.command.trim(),
      category: form.category.trim(),
      mode: form.mode,
    };
    if (editingId !== null) {
      update(editingId, data);
    } else {
      add(data);
    }
    resetForm();
  }

  function trigger(item: CommandItem): void {
    if (item.mode === "run") {
      onRun(item.command);
    } else {
      onInsert(item.command);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-200 placeholder:text-gray-500 backdrop-blur-md focus:border-[var(--color-accent)]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]";

  const hasResults = grouped.length > 0;

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto rounded-xl border border-white/10 bg-[#0a0a0f]/95 p-4 backdrop-blur-md">
      <header className="flex flex-col gap-3">
        <h2 className="text-sm font-bold tracking-tight text-gray-200">
          Paleta de <span className="text-[var(--color-accent)]">comandos</span>
        </h2>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar comando..."
          aria-label="Buscar comando"
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        />
      </header>

      {/* Formulário de criação/edição */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <label className="flex flex-1 flex-col gap-1 text-xs text-gray-400">
            Rótulo
            <input
              type="text"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="Ex.: Status do repositório"
              aria-label="Rótulo do comando"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-gray-400">
            Modo
            <select
              value={form.mode}
              onChange={(e) =>
                setForm({ ...form, mode: e.target.value as CommandMode })
              }
              aria-label="Modo do comando"
              className={inputClass}
            >
              <option value="run">Executar</option>
              <option value="insert">Inserir</option>
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-1 text-xs text-gray-400">
          Comando
          <input
            type="text"
            value={form.command}
            onChange={(e) => setForm({ ...form, command: e.target.value })}
            placeholder="git status"
            aria-label="Texto do comando"
            className={`${inputClass} font-mono`}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-400">
          Categoria
          <input
            type="text"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="git"
            aria-label="Categoria do comando"
            className={inputClass}
          />
        </label>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-lg border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/15 px-3 py-1.5 text-sm font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isEditing ? "Salvar" : "Adicionar comando"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista categorizada */}
      <div className="min-h-0 flex-1">
        {loading ? (
          <p className="text-xs text-gray-500">Carregando comandos…</p>
        ) : !hasResults ? (
          <p className="text-xs italic text-gray-500">
            {items.length === 0
              ? "Nenhum comando ainda — adicione um acima."
              : "Nenhum comando corresponde à busca."}
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {grouped.map(([category, list]) => (
              <section key={category} className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {category}
                </h3>
                <ul className="flex flex-col gap-2">
                  {list.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md"
                    >
                      <button
                        type="button"
                        onClick={() => trigger(item)}
                        title={
                          item.mode === "run"
                            ? "Executar comando"
                            : "Inserir comando no prompt"
                        }
                        className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left focus:outline-none"
                      >
                        <span className="truncate text-sm font-medium text-gray-200">
                          {item.label}
                        </span>
                        <span className="truncate font-mono text-xs text-gray-500">
                          {item.command}
                        </span>
                      </button>
                      <span className="shrink-0 rounded-md border border-white/10 px-2 py-0.5 text-[10px] uppercase text-gray-500">
                        {item.mode === "run" ? "exec" : "insert"}
                      </span>
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        aria-label={`Editar comando ${item.label}`}
                        className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-gray-300 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        aria-label={`Remover comando ${item.label}`}
                        className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-gray-400 transition-colors hover:bg-[var(--color-accent)]/15 hover:text-[var(--color-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CommandPalette;
