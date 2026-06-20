/** Terminal real embutido (xterm + PTY ConPTY) — US-01. */
import { useXterm } from "./useXterm";

export interface TerminalProps {
  /** Diretório de trabalho inicial; `null`/ausente usa o default. */
  cwd?: string | null;
  /** Executável do shell; default `powershell.exe`. */
  shell?: string;
}

export default function Terminal({ cwd = null, shell = "powershell.exe" }: TerminalProps) {
  const { containerRef } = useXterm({ cwd, shell });

  return (
    <div
      ref={containerRef}
      data-testid="terminal"
      className="h-full w-full"
      style={{ background: "#0a0a0f" }}
    />
  );
}
