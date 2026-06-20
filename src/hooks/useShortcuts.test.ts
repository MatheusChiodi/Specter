import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  register,
  unregister,
  isRegistered,
} from "@tauri-apps/plugin-global-shortcut";
import { useShortcuts } from "./useShortcuts";

vi.mock("@tauri-apps/plugin-global-shortcut", () => ({
  register: vi.fn().mockResolvedValue(undefined),
  unregister: vi.fn().mockResolvedValue(undefined),
  isRegistered: vi.fn().mockResolvedValue(false),
}));

const registerMock = vi.mocked(register);
const unregisterMock = vi.mocked(unregister);
const isRegisteredMock = vi.mocked(isRegistered);

type ShortcutHandler = (event: {
  shortcut: string;
  state: "Pressed" | "Released";
}) => void;

/** Recupera o handler registrado para um atalho específico. */
function handlerFor(shortcut: string): ShortcutHandler {
  const call = registerMock.mock.calls.find(([s]) => s === shortcut);
  if (!call) throw new Error(`nenhum register para ${shortcut}`);
  return call[1] as ShortcutHandler;
}

const config = {
  toggleShortcut: "CommandOrControl+Space",
  bossKey: "CommandOrControl+Shift+H",
};

describe("useShortcuts", () => {
  beforeEach(() => {
    registerMock.mockClear();
    unregisterMock.mockClear();
    isRegisteredMock.mockClear();
    isRegisteredMock.mockResolvedValue(false);
  });

  it("registra toggleShortcut e bossKey no mount", async () => {
    renderHook(() =>
      useShortcuts({ ...config, onToggle: vi.fn(), onBoss: vi.fn() }),
    );

    // Aguarda o registro assíncrono dentro do efeito concluir.
    await vi.waitFor(() => {
      expect(registerMock).toHaveBeenCalledTimes(2);
    });
    const shortcuts = registerMock.mock.calls.map(([s]) => s);
    expect(shortcuts).toContain(config.toggleShortcut);
    expect(shortcuts).toContain(config.bossKey);
  });

  it("chama onToggle só quando o estado é Pressed", async () => {
    const onToggle = vi.fn();
    renderHook(() =>
      useShortcuts({ ...config, onToggle, onBoss: vi.fn() }),
    );

    await vi.waitFor(() => {
      expect(registerMock).toHaveBeenCalledTimes(2);
    });
    const toggleHandler = handlerFor(config.toggleShortcut);

    toggleHandler({ shortcut: config.toggleShortcut, state: "Released" });
    expect(onToggle).not.toHaveBeenCalled();

    toggleHandler({ shortcut: config.toggleShortcut, state: "Pressed" });
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("chama onBoss só quando o estado é Pressed", async () => {
    const onBoss = vi.fn();
    renderHook(() =>
      useShortcuts({ ...config, onToggle: vi.fn(), onBoss }),
    );

    await vi.waitFor(() => {
      expect(registerMock).toHaveBeenCalledTimes(2);
    });
    const bossHandler = handlerFor(config.bossKey);

    bossHandler({ shortcut: config.bossKey, state: "Released" });
    expect(onBoss).not.toHaveBeenCalled();

    bossHandler({ shortcut: config.bossKey, state: "Pressed" });
    expect(onBoss).toHaveBeenCalledTimes(1);
  });

  it("desmontar faz unregister dos atalhos registrados", async () => {
    const { unmount } = renderHook(() =>
      useShortcuts({ ...config, onToggle: vi.fn(), onBoss: vi.fn() }),
    );

    await vi.waitFor(() => {
      expect(registerMock).toHaveBeenCalledTimes(2);
    });

    unmount();

    await vi.waitFor(() => {
      const unregistered = unregisterMock.mock.calls.map(([s]) => s);
      expect(unregistered).toContain(config.toggleShortcut);
      expect(unregistered).toContain(config.bossKey);
    });
  });

  it("não re-registra atalhos quando só os callbacks mudam", async () => {
    const { rerender } = renderHook(
      (props: { onToggle: () => void; onBoss: () => void }) =>
        useShortcuts({ ...config, ...props }),
      { initialProps: { onToggle: vi.fn(), onBoss: vi.fn() } },
    );

    await vi.waitFor(() => {
      expect(registerMock).toHaveBeenCalledTimes(2);
    });
    registerMock.mockClear();

    rerender({ onToggle: vi.fn(), onBoss: vi.fn() });

    // Strings inalteradas: o efeito não roda de novo.
    expect(registerMock).not.toHaveBeenCalled();
  });
});
