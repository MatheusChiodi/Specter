import { useEffect, useState, type JSX } from "react";
import Terminal from "../Terminal";
import FolderPicker from "../FolderPicker";
import { applyCaptureExclusion } from "../../ipc";
import type { CaptureStatus } from "../../types/ipc";

/**
 * Painel principal (US-07): cabeçalho arrastável + seletor de pasta (US-02) +
 * terminal (US-01) + aviso de stealth (US-04). Renderizado na janela `panel`.
 */
export default function Panel(): JSX.Element {
  const [cwd, setCwd] = useState<string | null>(null);
  const [capture, setCapture] = useState<CaptureStatus | null>(null);

  useEffect(() => {
    // Reaplica/checa o stealth e informa o usuário se não suportado (US-04).
    void applyCaptureExclusion()
      .then(setCapture)
      .catch(() => setCapture("failed"));
  }, []);

  const stealthWarning = capture === "unsupported" || capture === "failed";

  return (
    <div className="flex h-screen flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0f]/95 backdrop-blur-md">
      <header
        data-tauri-drag-region
        className="flex items-center gap-3 border-b border-white/10 px-3 py-2"
      >
        <span className="select-none text-sm font-bold tracking-tight">
          Spec<span className="text-[var(--color-accent)]">ter</span>
        </span>
        <div className="min-w-0 flex-1">
          <FolderPicker value={cwd} onChange={setCwd} />
        </div>
      </header>

      {stealthWarning && (
        <div
          role="alert"
          className="border-b border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-3 py-1.5 text-xs text-[var(--color-accent)]"
        >
          Atenção: este sistema não suporta exclusão de captura — a janela pode
          aparecer em compartilhamento de tela.
        </div>
      )}

      {/* Trocar a pasta remonta o terminal: nova sessão no cwd escolhido (US-02). */}
      <main className="min-h-0 flex-1 p-2">
        <Terminal key={cwd ?? "default"} cwd={cwd} />
      </main>

      <footer className="flex items-center justify-between px-3 py-1 text-[10px] text-gray-600">
        <span>MChiodi</span>
        <span className="truncate">{cwd ?? "pasta padrão"}</span>
      </footer>
    </div>
  );
}
