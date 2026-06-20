/** Hook que encapsula o ciclo de vida do xterm + PTY (US-01, busca em US-21). */
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

export interface UseXtermOptions {
  /** Diretório inicial da sessão; `null` usa o default do processo. */
  cwd?: string | null;
  /** Executável do shell. */
  shell?: string;
  /** Comandos executados em ordem assim que a sessão abre (US-12). */
  initCommands?: string[];
}

export interface UseXtermResult {
  /** Ref do container onde o xterm é montado. */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Ref da instância do terminal (null antes do mount). */
  termRef: React.RefObject<Terminal | null>;
  /** Ref do SearchAddon, exposto para a busca futura (US-21). */
  searchRef: React.RefObject<SearchAddon | null>;
  /** Ref do id da sessão de PTY ativa (null antes do spawn). */
  sessionRef: React.RefObject<SessionId | null>;
  /** Envia texto bruto ao PTY ativo (não adiciona Enter). */
  sendInput: (text: string) => void;
}

/**
 * Cria o terminal, conecta-o ao PTY e gerencia o ciclo de vida.
 *
 * React 19 / StrictMode monta o effect duas vezes em dev. A guarda em
 * `termRef.current` evita criar um segundo terminal no double-mount; o
 * cleanup faz `dispose()` + `ptyClose()` para não vazar PTYs.
 */
export function useXterm(options: UseXtermOptions = {}): UseXtermResult {
  const { cwd = null, shell = "powershell.exe", initCommands } = options;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<Terminal | null>(null);
  const searchRef = useRef<SearchAddon | null>(null);
  const sessionRef = useRef<SessionId | null>(null);

  // Opções em ref: o effect roda só no mount, mas precisa do valor atual.
  const optsRef = useRef({ cwd, shell, initCommands });
  optsRef.current = { cwd, shell, initCommands };

  const sendInput = useCallback((text: string): void => {
    const id = sessionRef.current;
    if (id !== null) {
      void ptyWrite(id, Array.from(new TextEncoder().encode(text)));
    }
  }, []);

  useEffect(() => {
    // Guarda contra double-mount do StrictMode.
    if (termRef.current || !containerRef.current) return;

    const term = new Terminal({ theme: THEME, cursorBlink: true });
    termRef.current = term;

    const fit = new FitAddon();
    const search = new SearchAddon();
    searchRef.current = search;
    term.loadAddon(fit);
    term.loadAddon(new WebLinksAddon());
    term.loadAddon(search);

    term.open(containerRef.current);
    fit.fit();

    // Stream de saída do PTY → escreve no terminal preservando os bytes.
    const channel = new Channel<number[]>();
    channel.onmessage = (bytes) => term.write(Uint8Array.from(bytes));

    const encoder = new TextEncoder();
    let disposed = false;

    const inputDisposable = term.onData((data) => {
      const id = sessionRef.current;
      if (id !== null) void ptyWrite(id, Array.from(encoder.encode(data)));
    });

    void ptySpawn(
      {
        shell: optsRef.current.shell,
        args: [],
        cwd: optsRef.current.cwd,
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
      // Comandos de init do perfil, em ordem (US-12).
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

  return { containerRef, termRef, searchRef, sessionRef, sendInput };
}
