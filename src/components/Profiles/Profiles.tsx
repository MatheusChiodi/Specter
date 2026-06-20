import { useState, type FormEvent, type JSX } from "react";
import { useProfiles } from "./useProfiles";
import type { Profile } from "./types";

/**
 * Perfis de projeto (US-12): lista os perfis (nome + path) com ação "Abrir"
 * que chama `onOpen(profile)`, mais CRUD persistido (nome, path, comandos de
 * init e caminho opcional de `.env` — US-19).
 */

interface ProfilesProps {
  /** Disparado ao abrir um perfil: o consumidor cria a sessão pronta. */
  onOpen: (profile: Profile) => void;
}

/** Estado do formulário em texto bruto; comandos vão um por linha. */
interface FormState {
  name: string;
  path: string;
  initCommands: string;
  envFile: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  path: "",
  initCommands: "",
  envFile: "",
};

/** Converte o textarea (uma linha por comando) numa lista limpa. */
function parseCommands(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function Profiles({ onOpen }: ProfilesProps): JSX.Element {
  const { profiles, loading, add, update, remove } = useProfiles();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const isEditing = editingId !== null;
  const canSubmit = form.name.trim().length > 0 && form.path.trim().length > 0;

  function resetForm(): void {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function startEdit(profile: Profile): void {
    setEditingId(profile.id);
    setForm({
      name: profile.name,
      path: profile.path,
      initCommands: profile.initCommands.join("\n"),
      envFile: profile.envFile ?? "",
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!canSubmit) return;

    const data: Omit<Profile, "id"> = {
      name: form.name.trim(),
      path: form.path.trim(),
      initCommands: parseCommands(form.initCommands),
      envFile: form.envFile.trim().length > 0 ? form.envFile.trim() : null,
    };

    if (editingId !== null) {
      update(editingId, data);
    } else {
      add(data);
    }
    resetForm();
  }

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-200 placeholder:text-gray-500 backdrop-blur-md focus:border-[var(--color-accent)]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]";

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto rounded-xl border border-white/10 bg-[#0a0a0f]/95 p-4 backdrop-blur-md">
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-tight text-gray-200">
          Perfis de <span className="text-[var(--color-accent)]">projeto</span>
        </h2>
      </header>

      {/* Formulário de criação/edição */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label className="flex flex-col gap-1 text-xs text-gray-400">
          Nome
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ex.: API de pagamentos"
            aria-label="Nome do perfil"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-gray-400">
          Pasta (path)
          <input
            type="text"
            value={form.path}
            onChange={(e) => setForm({ ...form, path: e.target.value })}
            placeholder="C:\\proj\\meu-projeto"
            aria-label="Caminho da pasta do perfil"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-gray-400">
          Comandos de init (um por linha)
          <textarea
            value={form.initCommands}
            onChange={(e) =>
              setForm({ ...form, initCommands: e.target.value })
            }
            placeholder={"pnpm install\npnpm dev"}
            aria-label="Comandos de inicialização do perfil"
            rows={3}
            className={`${inputClass} resize-y font-mono`}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs text-gray-400">
          Caminho do .env (opcional)
          <input
            type="text"
            value={form.envFile}
            onChange={(e) => setForm({ ...form, envFile: e.target.value })}
            placeholder="C:\\proj\\meu-projeto\\.env"
            aria-label="Caminho do arquivo .env do perfil"
            className={inputClass}
          />
        </label>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-lg border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/15 px-3 py-1.5 text-sm font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isEditing ? "Salvar" : "Criar perfil"}
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

      {/* Lista de perfis */}
      <div className="min-h-0 flex-1">
        {loading ? (
          <p className="text-xs text-gray-500">Carregando perfis…</p>
        ) : profiles.length === 0 ? (
          <p className="text-xs italic text-gray-500">
            Nenhum perfil ainda — crie um acima para abrir um projeto em 1
            clique.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {profiles.map((profile) => (
              <li
                key={profile.id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-200">
                    {profile.name}
                  </p>
                  <p
                    className="truncate text-xs text-gray-500"
                    title={profile.path}
                  >
                    {profile.path}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpen(profile)}
                  aria-label={`Abrir perfil ${profile.name}`}
                  className="shrink-0 rounded-lg border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/15 px-3 py-1.5 text-sm font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                >
                  Abrir
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(profile)}
                  aria-label={`Editar perfil ${profile.name}`}
                  className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => remove(profile.id)}
                  aria-label={`Remover perfil ${profile.name}`}
                  className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-400 transition-colors hover:bg-[var(--color-accent)]/15 hover:text-[var(--color-accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Profiles;
