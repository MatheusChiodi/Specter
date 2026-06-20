import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { loadJson, saveJson } from "../../store/persist";
import type { Profile } from "./types";
import Profiles from "./Profiles";

vi.mock("../../store/persist", () => ({
  loadJson: vi.fn(),
  saveJson: vi.fn(),
}));

const loadJsonMock = vi.mocked(loadJson);
const saveJsonMock = vi.mocked(saveJson);

const SAMPLE: Profile = {
  id: "p1",
  name: "API de pagamentos",
  path: "C:\\proj\\api",
  initCommands: ["pnpm install", "pnpm dev"],
  envFile: "C:\\proj\\api\\.env",
};

describe("Profiles", () => {
  beforeEach(() => {
    loadJsonMock.mockReset();
    saveJsonMock.mockReset();
    saveJsonMock.mockResolvedValue(undefined);
  });

  it("renderiza os perfis carregados (nome + path)", async () => {
    loadJsonMock.mockResolvedValue([SAMPLE]);
    render(<Profiles onOpen={vi.fn()} />);

    expect(await screen.findByText("API de pagamentos")).toBeInTheDocument();
    expect(screen.getByText("C:\\proj\\api")).toBeInTheDocument();
  });

  it("mostra estado vazio quando não há perfis", async () => {
    loadJsonMock.mockResolvedValue([]);
    render(<Profiles onOpen={vi.fn()} />);

    expect(
      await screen.findByText(/nenhum perfil ainda/i),
    ).toBeInTheDocument();
  });

  it("criar perfil chama saveJson com os dados do formulário", async () => {
    loadJsonMock.mockResolvedValue([]);
    render(<Profiles onOpen={vi.fn()} />);
    await screen.findByText(/nenhum perfil ainda/i);

    await userEvent.type(
      screen.getByLabelText("Nome do perfil"),
      "Novo projeto",
    );
    await userEvent.type(
      screen.getByLabelText("Caminho da pasta do perfil"),
      "C:\\proj\\novo",
    );
    await userEvent.type(
      screen.getByLabelText("Comandos de inicialização do perfil"),
      "pnpm install\npnpm dev",
    );
    await userEvent.type(
      screen.getByLabelText("Caminho do arquivo .env do perfil"),
      "C:\\proj\\novo\\.env",
    );

    await userEvent.click(
      screen.getByRole("button", { name: /criar perfil/i }),
    );

    await waitFor(() => {
      expect(saveJsonMock).toHaveBeenCalledWith("profiles", [
        expect.objectContaining({
          name: "Novo projeto",
          path: "C:\\proj\\novo",
          initCommands: ["pnpm install", "pnpm dev"],
          envFile: "C:\\proj\\novo\\.env",
        }),
      ]);
    });
  });

  it('"Abrir" chama onOpen com o perfil correto', async () => {
    loadJsonMock.mockResolvedValue([SAMPLE]);
    const onOpen = vi.fn();
    render(<Profiles onOpen={onOpen} />);
    await screen.findByText("API de pagamentos");

    await userEvent.click(
      screen.getByRole("button", { name: /abrir perfil api de pagamentos/i }),
    );

    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledWith(SAMPLE);
  });

  it("remover perfil chama saveJson sem o item", async () => {
    loadJsonMock.mockResolvedValue([SAMPLE]);
    render(<Profiles onOpen={vi.fn()} />);
    await screen.findByText("API de pagamentos");

    await userEvent.click(
      screen.getByRole("button", { name: /remover perfil api de pagamentos/i }),
    );

    await waitFor(() => {
      expect(saveJsonMock).toHaveBeenCalledWith("profiles", []);
    });
  });
});
