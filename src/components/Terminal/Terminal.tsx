/** Terminal real embutido (xterm + PTY ConPTY) — US-01. */
import { useImperativeHandle, type Ref } from "react";
import { useXterm } from "./useXterm";

/** API imperativa do terminal, usada pela toolbar do Panel. */
export interface TerminalHandle {
  /** Executa um comando (texto + Enter). */
  runCommand: (command: string) => void;
  /** Insere texto no prompt, sem executar. */
  insertText: (text: string) => void;
}

export interface TerminalProps {
  /** Diretório de trabalho inicial; `null`/ausente usa o default. */
  cwd?: string | null;
  /** Executável do shell; default `powershell.exe`. */
  shell?: string;
  /** Comandos rodados em ordem ao abrir a sessão (US-12). */
  initCommands?: string[];
  /** Handle imperativo (React 19: ref como prop). */
  ref?: Ref<TerminalHandle>;
}

export default function Terminal({
  cwd = null,
  shell = "powershell.exe",
  initCommands,
  ref,
}: TerminalProps) {
  const { containerRef, sendInput } = useXterm({ cwd, shell, initCommands });

  useImperativeHandle(
    ref,
    () => ({
      runCommand: (command: string) => sendInput(`${command}\r`),
      insertText: (text: string) => sendInput(text),
    }),
    [sendInput],
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
