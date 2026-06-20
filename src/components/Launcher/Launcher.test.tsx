import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { togglePanel } from "../../ipc";
import Launcher from "./Launcher";

const startDragging = vi.fn();

vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => ({ startDragging }),
}));

vi.mock("../../ipc", () => ({
  togglePanel: vi.fn().mockResolvedValue(true),
}));

const togglePanelMock = vi.mocked(togglePanel);

function getButton() {
  return screen.getByRole("button", {
    name: "Abrir/fechar Specter (arraste para mover)",
  });
}

describe("Launcher", () => {
  beforeEach(() => {
    togglePanelMock.mockClear();
    startDragging.mockClear();
  });

  it("renderiza um button circular com o aria-label de arrasto", () => {
    render(<Launcher />);
    expect(getButton()).toBeInTheDocument();
  });

  it("alterna o painel ao clicar sem mover (mousedown + mouseup)", () => {
    render(<Launcher />);
    const btn = getButton();

    fireEvent.mouseDown(btn, { button: 0, screenX: 100, screenY: 100 });
    fireEvent.mouseUp(btn, { button: 0, screenX: 100, screenY: 100 });

    expect(togglePanelMock).toHaveBeenCalledTimes(1);
    expect(startDragging).not.toHaveBeenCalled();
  });

  it("arrasta a janela ao mover acima do limiar e não alterna o painel", () => {
    render(<Launcher />);
    const btn = getButton();

    fireEvent.mouseDown(btn, { button: 0, screenX: 100, screenY: 100 });
    fireEvent.mouseMove(btn, { screenX: 140, screenY: 100 });
    fireEvent.mouseUp(btn, { button: 0, screenX: 140, screenY: 100 });

    expect(startDragging).toHaveBeenCalledTimes(1);
    expect(togglePanelMock).not.toHaveBeenCalled();
  });

  it("ignora mousedown que não seja do botão esquerdo", () => {
    render(<Launcher />);
    const btn = getButton();

    fireEvent.mouseDown(btn, { button: 2, screenX: 100, screenY: 100 });
    fireEvent.mouseUp(btn, { button: 2, screenX: 100, screenY: 100 });

    expect(togglePanelMock).not.toHaveBeenCalled();
    expect(startDragging).not.toHaveBeenCalled();
  });
});
