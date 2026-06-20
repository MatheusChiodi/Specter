import { useRef } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { togglePanel } from "../../ipc";

/** Limiar (px) acima do qual o movimento conta como arrasto, não clique. */
const DRAG_THRESHOLD = 6;

/**
 * Botão flutuante circular e arrastável do Specter (US-30, corrige US-03).
 *
 * Renderizado na janela `launcher` (56x56, borderless, transparente,
 * always-on-top). O botão preenche a janela como um círculo real (cantos
 * transparentes). Arrastar move a janela via `startDragging`; soltar sem
 * mover alterna o painel via `togglePanel`.
 */
export default function Launcher() {
  // Origem do mousedown em coordenadas de tela; null = sem pressionar.
  const originRef = useRef<{ x: number; y: number } | null>(null);
  // Marca que o movimento ultrapassou o limiar (virou arrasto).
  const draggingRef = useRef(false);

  function handleMouseDown(e: ReactMouseEvent<HTMLButtonElement>) {
    if (e.button !== 0) return; // só botão esquerdo
    originRef.current = { x: e.screenX, y: e.screenY };
    draggingRef.current = false;
  }

  function handleMouseMove(e: ReactMouseEvent<HTMLButtonElement>) {
    const origin = originRef.current;
    if (!origin || draggingRef.current) return;
    const dx = e.screenX - origin.x;
    const dy = e.screenY - origin.y;
    if (Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      draggingRef.current = true;
      void getCurrentWindow().startDragging();
    }
  }

  function handleMouseUp() {
    const pressed = originRef.current !== null;
    const dragged = draggingRef.current;
    originRef.current = null;
    draggingRef.current = false;
    if (pressed && !dragged) {
      void togglePanel().catch(() => {
        // Falha silenciosa: o launcher continua utilizável (catch exigido pela US-03).
      });
    }
  }

  return (
    <button
      type="button"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      aria-label="Abrir/fechar Specter (arraste para mover)"
      title="Specter — clique para abrir/fechar, arraste para mover"
      className={[
        "group relative grid h-14 w-14 place-items-center rounded-full",
        "border border-white/10 bg-neutral-900/70 backdrop-blur-md",
        "shadow-lg shadow-black/40 transition-transform duration-150",
        "hover:scale-105 active:scale-95",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent,#FF5555)]/70",
      ].join(" ")}
    >
      {/* Realce/anel no accent da identidade Specter. */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--color-accent,#FF5555)]/30 to-transparent opacity-80 transition-opacity group-hover:opacity-100"
      />
      <span
        aria-hidden
        className="absolute inset-[3px] rounded-full ring-1 ring-[var(--color-accent,#FF5555)]/40"
      />
      <span className="relative select-none text-xl font-semibold tracking-tight text-[var(--color-accent,#FF5555)]">
        S
      </span>
    </button>
  );
}
