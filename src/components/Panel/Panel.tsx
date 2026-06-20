import { useEffect, useRef, useState, type JSX } from "react";
import Terminal, { type TerminalHandle } from "../Terminal";
import FolderPicker from "../FolderPicker";
import CommandPalette from "../CommandPalette";
import Snippets from "../Snippets";
import History from "../History";
import Profiles from "../Profiles";
import CheatSheet from "../CheatSheet";
import QuickActions from "../QuickActions";
import { applyCaptureExclusion } from "../../ipc";
import type { CaptureStatus } from "../../types/ipc";
import type { Profile } from "../Profiles/types";

/** Ferramentas da toolbar lateral. */
type Tool = "commands" | "snippets" | "history" | "profiles" | "cheat" | "quick";

const TOOLS: ReadonlyArray<{ id: Tool; label: string }> = [
  { id: "commands", label: "Comandos" },
  { id: "snippets", label: "Snippets" },
  { id: "history", label: "Histórico" },
  { id: "profiles", label: "Perfis" },
  { id: "cheat", label: "Cheat Sheet" },
  { id: "quick", label: "Ações" },
];

/**
 * Painel principal (US-07): cabeçalho arrastável + seletor de pasta (US-02) +
 * toolbar de produtividade (US-06/08/09/12/25/26) + terminal (US-01) + aviso
 * de stealth (US-04). Renderizado na janela `panel`.
 */
export default function Panel(): JSX.Element {
  const [cwd, setCwd] = useState<string | null>(null);
  const [initCommands, setInitCommands] = useState<string[]>([]);
  const [capture, setCapture] = useState<CaptureStatus | null>(null);
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const termRef = useRef<TerminalHandle>(null);

  useEffect(() => {
    // Reaplica/checa o stealth e informa o usuário se não suportado (US-04).
    void applyCaptureExclusion()
      .then(setCapture)
      .catch(() => setCapture("failed"));
  }, []);

  const insert = (cmd: string): void => termRef.current?.insertText(cmd);
  const run = (cmd: string): void => termRef.current?.runCommand(cmd);

  /** Abre um perfil: nova sessão no path rodando os comandos de init (US-12). */
  function openProfile(profile: Profile): void {
    setInitCommands(profile.initCommands);
    setCwd(profile.path);
    setActiveTool(null);
  }

  function chooseCwd(path: string | null): void {
    setInitCommands([]);
    setCwd(path);
  }

  const stealthWarning = capture === "unsupported" || capture === "failed";

  function renderTool(): JSX.Element | null {
    switch (activeTool) {
      case "commands":
        return <CommandPalette onInsert={insert} onRun={run} />;
      case "snippets":
        return <Snippets onInsert={insert} onRun={run} />;
      case "history":
        return <History onRun={run} />;
      case "profiles":
        return <Profiles onOpen={openProfile} />;
      case "cheat":
        return <CheatSheet onInsert={insert} />;
      case "quick":
        return <QuickActions cwd={cwd} />;
      default:
        return null;
    }
  }

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
          <FolderPicker value={cwd} onChange={chooseCwd} />
        </div>
      </header>

      <nav className="flex flex-wrap gap-1 border-b border-white/10 px-3 py-1.5">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() =>
              setActiveTool((current) => (current === tool.id ? null : tool.id))
            }
            aria-pressed={activeTool === tool.id}
            title={tool.label}
            className={[
              "rounded-md px-2.5 py-1 text-xs transition-colors",
              activeTool === tool.id
                ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
                : "text-gray-400 hover:bg-white/5 hover:text-gray-200",
            ].join(" ")}
          >
            {tool.label}
          </button>
        ))}
      </nav>

      {stealthWarning && (
        <div
          role="alert"
          className="border-b border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-3 py-1.5 text-xs text-[var(--color-accent)]"
        >
          Atenção: este sistema não suporta exclusão de captura — a janela pode
          aparecer em compartilhamento de tela.
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        {activeTool && (
          <aside className="w-80 shrink-0 overflow-y-auto border-r border-white/10 p-2">
            {renderTool()}
          </aside>
        )}
        <main className="min-h-0 flex-1 p-2">
          {/* Trocar a pasta/abrir perfil remonta o terminal: nova sessão (US-02/12). */}
          <Terminal
            key={cwd ?? "default"}
            ref={termRef}
            cwd={cwd}
            initCommands={initCommands}
          />
        </main>
      </div>

      <footer className="flex items-center justify-between px-3 py-1 text-[10px] text-gray-600">
        <span>MChiodi</span>
        <span className="truncate">{cwd ?? "pasta padrão"}</span>
      </footer>
    </div>
  );
}
