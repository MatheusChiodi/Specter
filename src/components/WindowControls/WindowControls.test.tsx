import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { minimizePanel, togglePanel } from "../../ipc";
import WindowControls from "./index";

vi.mock("../../ipc", () => ({
  minimizePanel: vi.fn().mockResolvedValue(undefined),
  togglePanel: vi.fn().mockResolvedValue(false),
}));

const minimizePanelMock = vi.mocked(minimizePanel);
const togglePanelMock = vi.mocked(togglePanel);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("WindowControls", () => {
  it("chama minimizePanel ao clicar em Minimizar", async () => {
    render(<WindowControls />);

    await userEvent.click(screen.getByRole("button", { name: /minimizar/i }));

    await waitFor(() => expect(minimizePanelMock).toHaveBeenCalledTimes(1));
  });

  it("chama togglePanel ao clicar em Fechar painel", async () => {
    render(<WindowControls />);

    await userEvent.click(
      screen.getByRole("button", { name: /fechar painel/i }),
    );

    await waitFor(() => expect(togglePanelMock).toHaveBeenCalledTimes(1));
  });
});
