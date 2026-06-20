import type { JSX } from "react";
import useDirs from "./useDirs";

/**
 * Painel de Diretórios favoritos e recentes (US-11).
 * Quick-jump: clicar num caminho dispara `onPick(path)`. Estrela fixa/desafixa
 * o favorito; recentes podem ser removidos. Caminhos longos são truncados com
 * `title` mostrando o caminho completo.
 */

interface FavoriteDirsProps {
  /** Disparado com a pasta escolhida (abre nova sessão / troca o cwd). */
  onPick: (path: string) => void;
}

/** Deriva um rótulo curto (último segmento) do caminho para exibição. */
function baseName(path: string): string {
  const parts = path.split(/[\\/]/).filter((p) => p.length > 0);
  return parts.length > 0 ? parts[parts.length - 1] : path;
}

function FavoriteDirs({ onPick }: FavoriteDirsProps): JSX.Element {
  const { recents, favorites, addRecent, toggleFavorite, removeRecent } =
    useDirs();

  const favoriteSet = new Set(favorites);

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md">
      <section className="flex min-h-0 flex-col gap-2">
        <h3 className="px-1 text-xs font-semibold tracking-wide text-gray-400 uppercase">
          Favoritos
        </h3>
        {favorites.length === 0 ? (
          <p className="px-1 py-3 text-center text-sm text-gray-500 italic">
            Fixe uma pasta na estrela para vê-la aqui.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {favorites.map((path) => (
              <li key={path} className="group flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPick(path)}
                  title={path}
                  className="flex min-w-0 flex-1 flex-col items-start gap-0.5 rounded-lg border border-transparent px-2.5 py-1.5 text-left transition-colors hover:border-white/10 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                >
                  <span className="w-full truncate text-sm text-gray-200">
                    {baseName(path)}
                  </span>
                  <span className="w-full truncate font-mono text-xs text-gray-500">
                    {path}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite(path)}
                  aria-label={`Desafixar dos favoritos: ${path}`}
                  title="Desafixar"
                  className="shrink-0 rounded-md px-2 py-1 text-sm text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent)]/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                >
                  ★
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex min-h-0 flex-1 flex-col gap-2">
        <h3 className="px-1 text-xs font-semibold tracking-wide text-gray-400 uppercase">
          Recentes
        </h3>
        {recents.length === 0 ? (
          <p className="px-1 py-3 text-center text-sm text-gray-500 italic">
            Nenhuma pasta recente ainda.
          </p>
        ) : (
          <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
            {recents.map((path) => {
              const fav = favoriteSet.has(path);
              return (
                <li key={path} className="group flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      addRecent(path);
                      onPick(path);
                    }}
                    title={path}
                    className="flex min-w-0 flex-1 flex-col items-start gap-0.5 rounded-lg border border-transparent px-2.5 py-1.5 text-left transition-colors hover:border-white/10 hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                  >
                    <span className="w-full truncate text-sm text-gray-200">
                      {baseName(path)}
                    </span>
                    <span className="w-full truncate font-mono text-xs text-gray-500">
                      {path}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(path)}
                    aria-label={
                      fav
                        ? `Desafixar dos favoritos: ${path}`
                        : `Fixar nos favoritos: ${path}`
                    }
                    title={fav ? "Desafixar" : "Fixar"}
                    className={`shrink-0 rounded-md px-2 py-1 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                      fav
                        ? "text-[var(--color-accent)] hover:text-[var(--color-accent)]/70"
                        : "text-gray-500 hover:text-[var(--color-accent)]"
                    }`}
                  >
                    {fav ? "★" : "☆"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeRecent(path)}
                    aria-label={`Remover dos recentes: ${path}`}
                    title="Remover"
                    className="shrink-0 rounded-md px-2 py-1 text-xs text-gray-500 opacity-0 transition-opacity hover:text-[var(--color-accent)] focus:opacity-100 focus:outline-none group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export default FavoriteDirs;
