import { useMemo, useState, type FormEvent, type JSX } from "react";
import { useSnippets } from "./useSnippets";
import { extractPlaceholders, applyPlaceholders } from "./placeholders";
import type { Snippet, SnippetMode } from "./types";

/**
 * Snippets/favoritos de comandos (US-09): CRUD persistido com rótulo, comando,
 * categoria e modo (inserir | executar). Suporta placeholders `{nome}`
 * preenchidos antes de acionar. Estende o mecanismo da US-06.
 */

interface SnippetsProps {
  /** Insere o comando (já com placeholders aplicados) no prompt. */
  onInsert: (command: string) => void;
  /** Executa o comando (já com placeholders aplicados) na sessão ativa. */
  onRun: (command: string) => void;
}

/** Estado do formulário de criação/edição. */
interface FormState {
  label: string;
  command: string;
  category: string;
  mode: SnippetMode;
}

const EMPTY_FORM: FormState = {
  label: "",
  command: "",
  category: "",
  mode: "insert",
};

function Snippets({ onInsert, onRun }: SnippetsProps): JSX.Element {
  const { snippets, loading, addSnippet, updateSnippet, removeSnippet } =
    useSnippets();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  // Valores de placeholders por snippet, preenchidos antes do acionamento.
  const [fillValues, setFillValues] = useState<Record<string, string>>({});

  const isEditing = editingId !== null;
  const canSubmit =
    form.label.trim().length > 0 && form.command.trim().length > 0;

  // Agrupa por categoria para exibição categorizada.
  const grouped = useMemo(() => {
    const map = new Map<string, Snippet[]>();
    for (const s of snippets) {
      const key = s.category.trim().length > 0 ? s.category : "Sem categoria";
      const list = map.get(key) ?? [];
      list.push(s);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [snippets]);

  function resetForm(): void {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function startEdit(snippet: Snippet): void {
    setEditingId(snippet.id);
    setForm({
      label: snippet.label,
      command: snippet.command,
      category: snippet.category,
      mode: snippet.mode,
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
      updateSnippet(editingId, data);
    } else {
      addSnippet(data);
    }
    resetForm();
  }

  /** Resolve placeholders do snippet com os valores preenchidos e aciona pelo modo. */
  function trigger(snippet: Snippet): void {
    const names = extractPlaceholders(snippet.command);
    const values: Record<string, string> = {};
    for (const name of names) {
      values[name] = fillValues[`${snippet.id}:${name}`] ?? "";
    }
    const resolved = applyPlaceholders(snippet.command, values);
    if (snippet.mode === "run") {
      onRun(resolved);
    } else {
      onInsert(resolved);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-200 placeholder:text-gray-500 backdrop-blur-md focus:border-[var(--color-accent)]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]";

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto rounded-xl border border-white/10 bg-[#0a0a0f]/95 p-4 backdrop-blur-md">
      <header>
        <h2 className="text-sm font-bold tracking-tight text-gray-200">
          Snippets de <span className="text-[var(--color-accent)]">comando</span>
        </h2>
      </header>

      {/* Formulário de criação/edição */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label className="flex flex-col gap-1 text-xs text-gray-400">
          Rótulo
          <input
            type="text"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="Ex.: Deploy de produção"
            aria-label="Rótulo do snippet"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-gray-400">
          Comando
          <input
            type="text"
            value={form.command}
            onChange={(e) => setForm({ ...form, command: e.target.value })}
            placeholder="git checkout {branch}"
            aria-label="Comando do snippet"
            className={`${inputClass} font-mono`}
          />
        </label>

        <div className="flex gap-2">
          <label className="flex flex-1 flex-col gap-1 text-xs text-gray-400">
            Categoria
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="git"
              aria-label="Categoria do snippet"
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-gray-400">
            Modo
            <select
              value={form.mode}
              onChange={(e) =>
                setForm({ ...form, mode: e.target.value as SnippetMode })
              }
              aria-label="Modo do snippet"
              className={inputClass}
            >
              <option value="insert">Inserir</option>
              <option value="run">Executar</option>
            </select>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-lg border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/15 px-3 py-1.5 text-sm font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isEditing ? "Salvar" : "Adicionar snippet"}
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
          <p className="text-xs text-gray-500">Carregando snippets…</p>
        ) : snippets.length === 0 ? (
          <p className="text-xs italic text-gray-500">
            Nenhum snippet ainda — guarde comandos longos que você repete.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {grouped.map(([category, list]) => (
              <section key={category} className="flex flex-col gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {category}
                </h3>
                <ul className="flex flex-col gap-2">
                  {list.map((snippet) => {
                    const placeholders = extractPlaceholders(snippet.command);
                    return (
                      <li
                        key={snippet.id}
                        className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-200">
                              {snippet.label}
                            </p>
                            <p
                              className="truncate font-mono text-xs text-gray-500"
                              title={snippet.command}
                            >
                              {snippet.command}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => trigger(snippet)}
                            aria-label={`${
                              snippet.mode === "run" ? "Executar" : "Inserir"
                            } snippet ${snippet.label}`}
                            className="shrink-0 rounded-lg border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/15 px-3 py-1.5 text-sm font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                          >
                            {snippet.mode === "run" ? "Executar" : "Inserir"}
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(snippet)}
                            aria-label={`Editar snippet ${snippet.label}`}
                            className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-gray-300 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSnippet(snippet.id)}
                            aria-label={`Remover snippet ${snippet.label}`}
                            className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-sm text-gray-400 transition-colors hover:bg-[var(--color-accent)]/15 hover:text-[var(--color-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                          >
                            Remover
                          </button>
                        </div>

                        {/* Campos de placeholder, preenchidos antes do acionamento. */}
                        {placeholders.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {placeholders.map((name) => (
                              <input
                                key={name}
                                type="text"
                                value={
                                  fillValues[`${snippet.id}:${name}`] ?? ""
                                }
                                onChange={(e) =>
                                  setFillValues((prev) => ({
                                    ...prev,
                                    [`${snippet.id}:${name}`]: e.target.value,
                                  }))
                                }
                                placeholder={name}
                                aria-label={`Valor de ${name} para ${snippet.label}`}
                                className="min-w-24 flex-1 rounded-md border border-white/10 bg-black/30 px-2 py-1 text-xs text-gray-200 placeholder:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                              />
                            ))}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Snippets;
