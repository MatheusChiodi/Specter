/** Hook que encapsula o ciclo de vida do xterm + PTY (US-01, US-20/21/22/29). */
import { useCallback, useEffect, useRef } from "react";
import { Channel } from "@tauri-apps/api/core";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { SearchAddon } from "@xterm/addon-search";
import { ptySpawn, ptyWrite, ptyResize, ptyClose } from "../../ipc";
import type { SessionId } from "../../types/ipc";
import "@xterm/xterm/css/xterm.css";

/** Tema dark alinhado à identidade visual do Specter (accent #FF5555). */
const THEME = {
  background: "#0a0a0f",
  foreground: "#e5e7eb",
  cursor: "#FF5555",
} as const;

/** Limite do buffer acumulado para export (US-20). */
const MAX_BUFFER = 500_000;
/** Ociosidade que marca o fim heurístico de um comando (US-22/29). */
const IDLE_MS = 700;

export interface UseXtermOptions {
  /** Diretório inicial da sessão; `null` usa o default do processo. */
  cwd?: string | null;
  /** Executável do shell. */
  shell?: string;
  /** Comandos executados em ordem assim que a sessão abre (US-12). */
  initCommands?: string[];
  /** Variáveis de ambiente extras (US-19). */
  env?: [string, string][];
  /** Tamanho da fonte do terminal em px (US-32). */
  fontSize?: number;
  /**
   * Chamado quando um comando "termina" (heurística por ociosidade do output):
   * recebe o comando digitado e a duração em ms (US-22/29).
   */
  onCommandComplete?: (command: string, durationMs: number) => void;
}

export interface UseXtermResult {
  containerRef: React.RefObject<HTMLDivElement | null>;
  termRef: React.RefObject<Terminal | null>;
  searchRef: React.RefObject<SearchAddon | null>;
  sessionRef: React.RefObject<SessionId | null>;
  /** Envia texto bruto ao PTY ativo (não adiciona Enter). */
  sendInput: (text: string) => void;
  /** Retorna o conteúdo acumulado da sessão (para export — US-20). */
  getBuffer: () => string;
}

/**
 * Cria o terminal, conecta-o ao PTY e gerencia o ciclo de vida.
 * Guarda contra double-mount do StrictMode; cleanup faz `dispose()`+`ptyClose()`.
 */
export function useXterm(options: UseXtermOptions = {}): UseXtermResult {
  const {
    cwd = null,
    shell = "powershell.exe",
    initCommands,
    env,
    fontSize = 14,
  } = options;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const searchRef = useRef<SearchAddon | null>(null);
  const sessionRef = useRef<SessionId | null>(null);
  const bufferRef = useRef<string>("");

  const optsRef = useRef({ cwd, shell, initCommands, env, fontSize });
  optsRef.current = { cwd, shell, initCommands, env, fontSize };
  const onCompleteRef = useRef(options.onCommandComplete);
  onCompleteRef.current = options.onCommandComplete;

  const sendInput = useCallback((text: string): void => {
    const id = sessionRef.current;
    if (id !== null) {
      void ptyWrite(id, Array.from(new TextEncoder().encode(text)));
    }
  }, []);

  const getBuffer = useCallback((): string => bufferRef.current, []);

  useEffect(() => {
    if (termRef.current || !containerRef.current) return;

    const term = new Terminal({
      theme: THEME,
      cursorBlink: true,
      fontSize: optsRef.current.fontSize,
    });
    termRef.current = term;

    const fit = new FitAddon();
    const search = new SearchAddon();
    searchRef.current = search;
    term.loadAddon(fit);
    term.loadAddon(new WebLinksAddon());
    term.loadAddon(search);

    term.open(containerRef.current);
    fit.fit();

    // Heurística de fim de comando (US-22/29): início no Enter, fim na ociosidade.
    let currentLine = "";
    let pendingCommand: string | null = null;
    let commandStart = 0;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleIdleCheck = (): void => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (pendingCommand !== null && pendingCommand.length > 0) {
          onCompleteRef.current?.(pendingCommand, Date.now() - commandStart);
        }
        pendingCommand = null;
      }, IDLE_MS);
    };

    const channel = new Channel<number[]>();
    const decoder = new TextDecoder();
    channel.onmessage = (bytes) => {
      const chunk = Uint8Array.from(bytes);
      term.write(chunk);
      bufferRef.current = (
        bufferRef.current + decoder.decode(chunk, { stream: true })
      ).slice(-MAX_BUFFER);
      if (pendingCommand !== null) scheduleIdleCheck();
    };

    const encoder = new TextEncoder();
    let disposed = false;

    const inputDisposable = term.onData((data) => {
      const id = sessionRef.current;
      if (id !== null) void ptyWrite(id, Array.from(encoder.encode(data)));
      // Acompanha a linha digitada para cronometrar o comando.
      for (const ch of data) {
        if (ch === "\r" || ch === "\n") {
          pendingCommand = currentLine.trim();
          currentLine = "";
          commandStart = Date.now();
          scheduleIdleCheck();
        } else if (ch === "\x7f" || ch === "\b") {
          currentLine = currentLine.slice(0, -1);
        } else if (ch >= " ") {
          currentLine += ch;
        }
      }
    });

    void ptySpawn(
      {
        shell: optsRef.current.shell,
        args: [],
        cwd: optsRef.current.cwd,
        env: optsRef.current.env ?? [],
        rows: term.rows,
        cols: term.cols,
      },
      channel,
    ).then((id) => {
      if (disposed) {
        void ptyClose(id);
        return;
      }
      sessionRef.current = id;
      for (const cmd of optsRef.current.initCommands ?? []) {
        void ptyWrite(id, Array.from(encoder.encode(`${cmd}\r`)));
      }
    });

    const observer = new ResizeObserver(() => {
      fit.fit();
      const id = sessionRef.current;
      if (id !== null) void ptyResize(id, term.rows, term.cols);
    });
    observer.observe(containerRef.current);

    return () => {
      disposed = true;
      if (idleTimer) clearTimeout(idleTimer);
      observer.disconnect();
      inputDisposable.dispose();
      const id = sessionRef.current;
      if (id !== null) void ptyClose(id);
      sessionRef.current = null;
      searchRef.current = null;
      term.dispose();
      termRef.current = null;
    };
  }, []);

  return {
    containerRef,
    termRef,
    searchRef,
    sessionRef,
    sendInput,
    getBuffer,
  };
}
