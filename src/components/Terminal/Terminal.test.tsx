import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// xterm precisa de canvas (ausente no jsdom) e o invoke do Tauri não existe
// em teste: mockamos a classe Terminal, os addons, a camada IPC e o Channel.

const onDataDispose = vi.fn();

vi.mock("@xterm/xterm", () => {
  class Terminal {
    rows = 24;
    cols = 80;
    open = vi.fn();
    write = vi.fn();
    loadAddon = vi.fn();
    dispose = vi.fn();
    onData = vi.fn(() => ({ dispose: onDataDispose }));
  }
  return { Terminal };
});

vi.mock("@xterm/xterm/css/xterm.css", () => ({}));

vi.mock("@xterm/addon-fit", () => {
  class FitAddon {
    fit = vi.fn();
  }
  return { FitAddon };
});

vi.mock("@xterm/addon-web-links", () => {
  class WebLinksAddon {}
  return { WebLinksAddon };
});

vi.mock("@xterm/addon-search", () => {
  class SearchAddon {}
  return { SearchAddon };
});

const ptySpawn = vi.fn().mockResolvedValue(1);
const ptyWrite = vi.fn().mockResolvedValue(undefined);
const ptyResize = vi.fn().mockResolvedValue(undefined);
const ptyClose = vi.fn().mockResolvedValue(undefined);

vi.mock("../../ipc", () => ({
  ptySpawn: (...args: unknown[]) => ptySpawn(...args),
  ptyWrite: (...args: unknown[]) => ptyWrite(...args),
  ptyResize: (...args: unknown[]) => ptyResize(...args),
  ptyClose: (...args: unknown[]) => ptyClose(...args),
}));

vi.mock("@tauri-apps/api/core", () => {
  class Channel<T> {
    onmessage: ((message: T) => void) | null = null;
  }
  return { Channel };
});

// ResizeObserver não existe no jsdom.
beforeEach(() => {
  vi.clearAllMocks();
  globalThis.ResizeObserver = class {
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
  } as unknown as typeof ResizeObserver;
});

import Terminal from "./index";

describe("Terminal", () => {
  it("renderiza o container do terminal", () => {
    render(<Terminal />);
    expect(screen.getByTestId("terminal")).toBeInTheDocument();
  });

  it("abre a sessão de PTY no mount", async () => {
    render(<Terminal cwd="C:/tmp" shell="cmd.exe" />);
    await waitFor(() => expect(ptySpawn).toHaveBeenCalledTimes(1));
    const [opts] = ptySpawn.mock.calls[0];
    expect(opts).toMatchObject({
      shell: "cmd.exe",
      cwd: "C:/tmp",
      rows: 24,
      cols: 80,
    });
  });

  it("encerra a sessão ao desmontar", async () => {
    const { unmount } = render(<Terminal />);
    await waitFor(() => expect(ptySpawn).toHaveBeenCalledTimes(1));
    unmount();
    await waitFor(() => expect(ptyClose).toHaveBeenCalledWith(1));
  });
});
