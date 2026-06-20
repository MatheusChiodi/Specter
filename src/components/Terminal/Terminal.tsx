/** Terminal real embutido (xterm + PTY ConPTY) — US-01/20/21/22/29. */
import { useImperativeHandle, type Ref } from "react";
import { useXterm } from "./useXterm";

/** API imperativa do terminal, usada pela toolbar do Panel. */
export interface TerminalHandle {
  /** Executa um comando (texto + Enter). */
  runCommand: (command: string) => void;
  /** Insere texto no prompt, sem executar. */
  insertText: (text: string) => void;
  /** Busca a próxima ocorrência no buffer (US-21). */
  searchNext: (query: string) => void;
  /** Busca a ocorrência anterior no buffer (US-21). */
  searchPrevious: (query: string) => void;
  /** Retorna o conteúdo acumulado da sessão (US-20). */
  getBuffer: () => string;
}

export interface TerminalProps {
  /** Diretório de trabalho inicial; `null`/ausente usa o default. */
  cwd?: string | null;
  /** Executável do shell; default `powershell.exe`. */
  shell?: string;
  /** Comandos rodados em ordem ao abrir a sessão (US-12). */
  initCommands?: string[];
  /** Variáveis de ambiente extras (US-19). */
  env?: [string, string][];
  /** Chamado ao concluir um comando (heurística): comando + duração (US-22/29). */
  onCommandComplete?: (command: string, durationMs: number) => void;
  /** Handle imperativo (React 19: ref como prop). */
  ref?: Ref<TerminalHandle>;
}

export default function Terminal({
  cwd = null,
  shell = "powershell.exe",
  initCommands,
  env,
  onCommandComplete,
  ref,
}: TerminalProps) {
  const { containerRef, searchRef, sendInput, getBuffer } = useXterm({
    cwd,
    shell,
    initCommands,
    env,
    onCommandComplete,
  });

  useImperativeHandle(
    ref,
    () => ({
      runCommand: (command: string) => sendInput(`${command}\r`),
      insertText: (text: string) => sendInput(text),
      searchNext: (query: string) => {
        if (query) searchRef.current?.findNext(query);
      },
      searchPrevious: (query: string) => {
        if (query) searchRef.current?.findPrevious(query);
      },
      getBuffer,
    }),
    [sendInput, getBuffer, searchRef],
  );

  return (
    <div
      ref={containerRef}
      data-testid="terminal"
      className="h-full w-full"
      style={{ background: "#0a0a0f" }}
    />
  );
}
