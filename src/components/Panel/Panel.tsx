import { useCallback, useEffect, useRef, useState, type JSX } from "react";
import { save } from "@tauri-apps/plugin-dialog";
import {
  sendNotification,
  isPermissionGranted,
  requestPermission,
} from "@tauri-apps/plugin-notification";
import Terminal, { type TerminalHandle } from "../Terminal";
import FolderPicker from "../FolderPicker";
import TabBar from "./TabBar";
import SearchBar from "./SearchBar";
import ToolPanel, { type Tool, TOOL_LABELS } from "./ToolPanel";
import { parseEnv } from "./parseEnv";
import { useTabs } from "./useTabs";
import { useTheme } from "../Settings/useTheme";
import { useSettings } from "../../store/settings";
import { useShortcuts } from "../../hooks/useShortcuts";
import { useHistory } from "../History/useHistory";
import { useDirs } from "../FavoriteDirs";
import {
  applyCaptureExclusion,
  togglePanel,
  hideAll,
  readTextFile,
  writeTextFile,
} from "../../ipc";
import type { CaptureStatus } from "../../types/ipc";
import type { Profile } from "../Profiles/types";

/**
 * Painel principal (US-07): orquestra abas (US-10), split (US-23), busca
 * (US-21), export (US-20), tema/opacidade/atalhos (US-13..17), as ferramentas
 * de produtividade/ambiente e o aviso de stealth (US-04).
 */
export default function Panel(): JSX.Element {
  const { settings, update } = useSettings();
  const tabs = useTabs();
  const history = useHistory();
  const dirs = useDirs();
  const [capture, setCapture] = useState<CaptureStatus | null>(null);
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const termRefs = useRef<Map<string, TerminalHandle>>(new Map());

  useTheme(settings);
  useShortcuts({
    toggleShortcut: settings.toggleShortcut,
    bossKey: settings.bossKey,
    onToggle: () => void togglePanel(),
    onBoss: () => void hideAll(),
  });

  useEffect(() => {
    void applyCaptureExclusion()
      .then(setCapture)
      .catch(() => setCapture("failed"));
  }, []);

  const setRef = useCallback(
    (id: string, handle: TerminalHandle | null): void => {
      if (handle) termRefs.current.set(id, handle);
      else termRefs.current.delete(id);
    },
    [],
  );

  const activeHandle = (): TerminalHandle | undefined =>
    termRefs.current.get(tabs.activeId);

  const insert = (cmd: string): void => activeHandle()?.insertText(cmd);
  const run = (cmd: string): void => activeHandle()?.runCommand(cmd);

  function notifyLong(command: string, durationMs: number): void {
    void (async () => {
      try {
        let granted = await isPermissionGranted();
        if (!granted) granted = (await requestPermission()) === "granted";
        if (granted) {
          sendNotification({
            title: "Comando concluído",
            body: `${command} — ${Math.round(durationMs / 1000)}s`,
          });
        }
      } catch {
        // Sem permissão de notificação: ignora.
      }
    })();
  }

  const onCommandComplete = useCallback(
    (cwd: string | null) => (command: string, durationMs: number) => {
      history.record(command, cwd, durationMs);
      if (durationMs >= settings.longCommandMs && document.hidden) {
        notifyLong(command, durationMs);
      }
    },
    [history, settings.longCommandMs],
  );

  async function openProfile(profile: Profile): Promise<void> {
    let env: [string, string][] = [];
    if (profile.envFile) {
      try {
        env = parseEnv(await readTextFile(profile.envFile));
      } catch {
        env = [];
      }
    }
    tabs.addTab({
      title: profile.name,
      cwd: profile.path,
      initCommands: profile.initCommands,
      env,
    });
    if (profile.path) dirs.addRecent(profile.path);
    setActiveTool(null);
  }

  function chooseCwd(path: string | null): void {
    tabs.setTabCwd(tabs.activeId, path);
    if (path) dirs.addRecent(path);
  }

  async function exportLog(): Promise<void> {
    const handle = activeHandle();
    if (!handle) return;
    try {
      const path = await save({
        defaultPath: "specter-log.txt",
        filters: [{ name: "Texto", extensions: ["txt"] }],
      });
      if (path) await writeTextFile(path, handle.getBuffer());
    } catch {
      // Cancelado ou erro: ignora.
    }
  }

  const stealthWarning = capture === "unsupported" || capture === "failed";
  const btn = (active: boolean): string =>
    [
      "rounded-md px-2.5 py-1 text-xs transition-colors",
      active
        ? "bg-[var(--color-accent)]/20 text-[var(--color-accent)]"
        : "text-gray-400 hover:bg-white/5 hover:text-gray-200",
    ].join(" ");

  return (
    <div
      style={{ opacity: settings.opacity }}
      className="flex h-screen flex-col overflow-hidden rounded-xl border border-white/10 bg-[var(--color-base)]/95 backdrop-blur-md"
    >
      <header
        data-tauri-drag-region
        className="flex items-center gap-3 border-b border-white/10 px-3 py-2"
      >
        <span className="select-none text-sm font-bold tracking-tight">
          Spec<span className="text-[var(--color-accent)]">ter</span>
        </span>
        <div className="min-w-0 flex-1">
          <FolderPicker value={tabs.activeTab?.cwd ?? null} onChange={chooseCwd} />
        </div>
        <button type="button" onClick={() => setSearchOpen((v) => !v)} aria-label="Abrir busca" className={btn(searchOpen)}>
          Buscar
        </button>
        <button type="button" onClick={() => void exportLog()} aria-label="Exportar log" className={btn(false)}>
          Exportar
        </button>
        <button type="button" onClick={() => tabs.toggleSplit(tabs.activeId)} aria-label="Dividir terminal" aria-pressed={tabs.activeTab?.split ?? false} className={btn(tabs.activeTab?.split ?? false)}>
          Split
        </button>
      </header>

      <nav className="flex flex-wrap gap-1 border-b border-white/10 px-3 py-1.5">
        {TOOL_LABELS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() =>
              setActiveTool((cur) => (cur === tool.id ? null : tool.id))
            }
            aria-pressed={activeTool === tool.id}
            title={tool.label}
            className={btn(activeTool === tool.id)}
          >
            {tool.label}
          </button>
        ))}
      </nav>

      <TabBar
        tabs={tabs.tabs}
        activeId={tabs.activeId}
        onSelect={tabs.setActive}
        onClose={tabs.closeTab}
        onAdd={() => tabs.addTab()}
        onRename={tabs.renameTab}
      />

      {stealthWarning && (
        <div role="alert" className="border-b border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 px-3 py-1.5 text-xs text-[var(--color-accent)]">
          Atenção: este sistema não suporta exclusão de captura — a janela pode
          aparecer em compartilhamento de tela.
        </div>
      )}

      {searchOpen && (
        <SearchBar
          onNext={(q) => activeHandle()?.searchNext(q)}
          onPrev={(q) => activeHandle()?.searchPrevious(q)}
          onClose={() => setSearchOpen(false)}
        />
      )}

      <div className="flex min-h-0 flex-1">
        {activeTool && (
          <aside className="w-80 shrink-0 overflow-y-auto border-r border-white/10 p-2">
            <ToolPanel
              tool={activeTool}
              cwd={tabs.activeTab?.cwd ?? null}
              settings={settings}
              onInsert={insert}
              onRun={run}
              onOpenProfile={(p) => void openProfile(p)}
              onPickDir={chooseCwd}
              onUpdateSettings={update}
            />
          </aside>
        )}
        <div className="relative min-h-0 flex-1">
          {tabs.tabs.map((tab) => (
            <div
              key={tab.id}
              className={
                tab.id === tabs.activeId
                  ? "absolute inset-0 flex gap-1 p-1"
                  : "hidden"
              }
            >
              <div className="min-w-0 flex-1">
                <Terminal
                  ref={(h) => setRef(tab.id, h)}
                  cwd={tab.cwd}
                  initCommands={tab.initCommands}
                  env={tab.env}
                  onCommandComplete={onCommandComplete(tab.cwd)}
                />
              </div>
              {tab.split && (
                <div className="min-w-0 flex-1 border-l border-white/10">
                  <Terminal cwd={tab.cwd} env={tab.env} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <footer className="flex items-center justify-between px-3 py-1 text-[10px] text-gray-600">
        <span>MChiodi</span>
        <span className="truncate">{tabs.activeTab?.cwd ?? "pasta padrão"}</span>
      </footer>
    </div>
  );
}
