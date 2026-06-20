import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { open } from "@tauri-apps/plugin-dialog";
import FolderPicker from "./FolderPicker";

vi.mock("@tauri-apps/plugin-dialog", () => ({
  open: vi.fn().mockResolvedValue("C:\\proj\\x"),
}));

const openMock = vi.mocked(open);

describe("FolderPicker", () => {
  beforeEach(() => {
    openMock.mockClear();
    openMock.mockResolvedValue("C:\\proj\\x");
  });

  it("mostra o placeholder quando value é null", () => {
    render(<FolderPicker value={null} onChange={vi.fn()} />);
    expect(screen.getByText("Nenhuma pasta selecionada")).toBeInTheDocument();
  });

  it("mostra o caminho quando value é fornecido", () => {
    const path = "C:\\proj";
    render(<FolderPicker value={path} onChange={vi.fn()} />);
    expect(screen.getByText(path)).toBeInTheDocument();
  });

  it("chama open e depois onChange com o caminho ao clicar", async () => {
    const onChange = vi.fn();
    render(<FolderPicker value={null} onChange={onChange} />);

    await userEvent.click(
      screen.getByRole("button", { name: /escolher pasta/i }),
    );

    expect(openMock).toHaveBeenCalledWith({
      directory: true,
      multiple: false,
    });
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith("C:\\proj\\x");
    });
  });

  it("não chama onChange quando o dialog é cancelado (null)", async () => {
    openMock.mockResolvedValueOnce(null);
    const onChange = vi.fn();
    render(<FolderPicker value={null} onChange={onChange} />);

    await userEvent.click(
      screen.getByRole("button", { name: /escolher pasta/i }),
    );

    await waitFor(() => {
      expect(openMock).toHaveBeenCalled();
    });
    expect(onChange).not.toHaveBeenCalled();
  });
});
