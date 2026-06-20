import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { togglePanel } from "../../ipc";
import Launcher from "./Launcher";

vi.mock("../../ipc", () => ({
  togglePanel: vi.fn().mockResolvedValue(true),
}));

const togglePanelMock = vi.mocked(togglePanel);

describe("Launcher", () => {
  beforeEach(() => {
    togglePanelMock.mockClear();
  });

  it("renderiza um button com o aria-label de abrir/fechar", () => {
    render(<Launcher />);
    expect(
      screen.getByRole("button", { name: "Abrir/fechar Specter" }),
    ).toBeInTheDocument();
  });

  it("chama togglePanel uma vez ao clicar", async () => {
    const user = userEvent.setup();
    render(<Launcher />);

    await user.click(
      screen.getByRole("button", { name: "Abrir/fechar Specter" }),
    );

    expect(togglePanelMock).toHaveBeenCalledTimes(1);
  });
});
