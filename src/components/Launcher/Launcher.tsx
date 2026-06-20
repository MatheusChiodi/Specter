import { useState } from "react";
import { togglePanel } from "../../ipc";

/**
 * Botão flutuante do Specter (US-03).
 *
 * Renderizado na janela `launcher` (56x56, borderless, transparente,
 * always-on-top). O container raiz é a drag region da janela; o clique no
 * botão alterna a visibilidade do painel principal via `togglePanel`.
 */
export default function Launcher() {
  // Trava reentrância enquanto o toggle do painel está em voo.
  const [busy, setBusy] = useState(false);

  function handleClick() {
    if (busy) return;
    setBusy(true);
    togglePanel()
      .catch(() => {
        // Falha silenciosa: o launcher continua utilizável (catch exigido pela US-03).
      })
      .finally(() => setBusy(false));
  }

  return (
    // `data-tauri-drag-region` torna a janela inteira arrastável.
    <div
      data-tauri-drag-region
      className="flex h-screen w-screen items-center justify-center bg-transparent"
    >
      <button
        type="button"
        onClick={handleClick}
        aria-label="Abrir/fechar Specter"
        title="Specter — clique para abrir/fechar, arraste para mover"
        className={[
          "group relative grid h-14 w-14 place-items-center rounded-full",
          "border border-white/10 bg-neutral-900/70 backdrop-blur-md",
          "shadow-lg shadow-black/40 transition-transform duration-150",
          "hover:scale-105 active:scale-95",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5555]/70",
          busy ? "opacity-70" : "",
        ].join(" ")}
      >
        {/* Realce/anel no accent da identidade Specter. */}
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-gradient-to-br from-[#FF5555]/30 to-transparent opacity-80 transition-opacity group-hover:opacity-100"
        />
        <span
          aria-hidden
          className="absolute inset-[3px] rounded-full ring-1 ring-[#FF5555]/40"
        />
        <span className="relative select-none text-xl font-semibold tracking-tight text-[#FF5555]">
          S
        </span>
      </button>
    </div>
  );
}
