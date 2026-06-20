import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { loadJson, saveJson } from "../../store/persist";
import type { DirsState } from "./types";
import FavoriteDirs from "./FavoriteDirs";

// O store usa IPC do Tauri (ausente em teste): mockamos a camada de persistência.
vi.mock("../../store/persist", () => ({
  loadJson: vi.fn(),
  saveJson: vi.fn().mockResolvedValue(undefined),
}));

const loadJsonMock = vi.mocked(loadJson);
const saveJsonMock = vi.mocked(saveJson);

const seed: DirsState = {
  recents: ["C:\\proj\\app", "C:\\proj\\api"],
  favorites: ["C:\\proj\\fav"],
};

beforeEach(() => {
  loadJsonMock.mockReset();
  saveJsonMock.mockReset().mockResolvedValue(undefined);
  loadJsonMock.mockResolvedValue(seed);
});

describe("FavoriteDirs", () => {
  it("renderiza recentes e favoritos carregados do store", async () => {
    render(<FavoriteDirs onPick={vi.fn()} />);
    expect(await screen.findByText("C:\\proj\\fav")).toBeInTheDocument();
    expect(screen.getByText("C:\\proj\\app")).toBeInTheDocument();
    expect(screen.getByText("C:\\proj\\api")).toBeInTheDocument();
  });

  it("chama onPick com o caminho ao clicar (quick-jump)", async () => {
    const onPick = vi.fn();
    render(<FavoriteDirs onPick={onPick} />);
    await screen.findByText("C:\\proj\\app");

    await userEvent.click(screen.getByText("C:\\proj\\app"));

    expect(onPick).toHaveBeenCalledWith("C:\\proj\\app");
  });

  it("fixa um recente como favorito e persiste via saveJson", async () => {
    render(<FavoriteDirs onPick={vi.fn()} />);
    await screen.findByText("C:\\proj\\api");

    await userEvent.click(
      screen.getByRole("button", {
        name: /fixar nos favoritos: c:\\proj\\api/i,
      }),
    );

    await waitFor(() => {
      expect(saveJsonMock).toHaveBeenCalledWith(
        "dirs",
        expect.objectContaining({
          favorites: expect.arrayContaining(["C:\\proj\\fav", "C:\\proj\\api"]),
        }),
      );
    });
  });
});
