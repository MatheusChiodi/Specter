import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { loadJson, saveJson } from "../../store/persist";
import type { HistoryEntry } from "./types";
import History from "./History";

// O store usa IPC do Tauri (ausente em teste): mockamos a camada de persistência.
vi.mock("../../store/persist", () => ({
  loadJson: vi.fn(),
  saveJson: vi.fn().mockResolvedValue(undefined),
}));

const loadJsonMock = vi.mocked(loadJson);
const saveJsonMock = vi.mocked(saveJson);

const seed: HistoryEntry[] = [
  { id: "a", command: "git status", cwd: "C:\\proj", ts: 1_700_000_000_000 },
  { id: "b", command: "pnpm install", cwd: "C:\\proj", ts: 1_700_000_100_000 },
];

beforeEach(() => {
  loadJsonMock.mockReset();
  saveJsonMock.mockReset().mockResolvedValue(undefined);
  loadJsonMock.mockResolvedValue(seed);
});

describe("History", () => {
  it("lista as entradas carregadas do store", async () => {
    render(<History onRun={vi.fn()} />);
    expect(await screen.findByText("git status")).toBeInTheDocument();
    expect(screen.getByText("pnpm install")).toBeInTheDocument();
  });

  it("filtra a lista pela busca textual", async () => {
    render(<History onRun={vi.fn()} />);
    await screen.findByText("git status");

    await userEvent.type(
      screen.getByRole("searchbox", { name: /buscar no histórico/i }),
      "pnpm",
    );

    expect(screen.queryByText("git status")).not.toBeInTheDocument();
    expect(screen.getByText("pnpm install")).toBeInTheDocument();
  });

  it("chama onRun com o comando ao clicar na entrada", async () => {
    const onRun = vi.fn();
    render(<History onRun={onRun} />);
    await screen.findByText("git status");

    await userEvent.click(screen.getByText("git status"));

    expect(onRun).toHaveBeenCalledWith("git status");
  });

  it("limpa o histórico e persiste vazio", async () => {
    render(<History onRun={vi.fn()} />);
    await screen.findByText("git status");

    await userEvent.click(
      screen.getByRole("button", { name: /limpar histórico/i }),
    );

    expect(screen.queryByText("git status")).not.toBeInTheDocument();
    await waitFor(() => {
      expect(saveJsonMock).toHaveBeenCalledWith("history", []);
    });
  });

  it("registra uma nova entrada via useHistory (record/prepend/persist)", async () => {
    // Exercita o hook diretamente para cobrir o record sem depender da UI.
    const { renderHook, act } = await import("@testing-library/react");
    const { useHistory } = await import("./useHistory");
    loadJsonMock.mockResolvedValue([]);

    const { result } = renderHook(() => useHistory());
    await waitFor(() => expect(loadJsonMock).toHaveBeenCalled());

    act(() => {
      result.current.record("echo oi", "C:\\x", 42);
    });

    expect(result.current.entries[0]).toMatchObject({
      command: "echo oi",
      cwd: "C:\\x",
      durationMs: 42,
    });
    await waitFor(() => {
      expect(saveJsonMock).toHaveBeenCalledWith(
        "history",
        expect.arrayContaining([
          expect.objectContaining({ command: "echo oi" }),
        ]),
      );
    });
  });
});
