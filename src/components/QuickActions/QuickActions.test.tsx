import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { openInExplorer, openInVscode } from "../../ipc";
import QuickActions from "./index";

vi.mock("../../ipc", () => ({
  openInExplorer: vi.fn().mockResolvedValue(undefined),
  openInVscode: vi.fn().mockResolvedValue(undefined),
}));

const openInExplorerMock = vi.mocked(openInExplorer);
const openInVscodeMock = vi.mocked(openInVscode);
const writeText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
});

describe("QuickActions", () => {
  it("desabilita os três botões quando cwd é null", () => {
    render(<QuickActions cwd={null} />);
    expect(screen.getByRole("button", { name: /abrir no explorer/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /abrir no vs code/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /copiar caminho/i })).toBeDisabled();
  });

  it("chama openInExplorer com o cwd ao clicar em Abrir no Explorer", async () => {
    const cwd = "C:\\proj\\x";
    render(<QuickActions cwd={cwd} />);

    await userEvent.click(
      screen.getByRole("button", { name: /abrir no explorer/i }),
    );

    await waitFor(() => expect(openInExplorerMock).toHaveBeenCalledWith(cwd));
  });

  it("copia o caminho via clipboard ao clicar em Copiar caminho", async () => {
    const cwd = "C:\\proj\\x";
    render(<QuickActions cwd={cwd} />);

    await userEvent.click(
      screen.getByRole("button", { name: /copiar caminho/i }),
    );

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(cwd));
  });

  it("chama openInVscode com o cwd ao clicar em Abrir no VS Code", async () => {
    const cwd = "C:\\proj\\x";
    render(<QuickActions cwd={cwd} />);

    await userEvent.click(
      screen.getByRole("button", { name: /abrir no vs code/i }),
    );

    await waitFor(() => expect(openInVscodeMock).toHaveBeenCalledWith(cwd));
  });
});
