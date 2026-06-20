import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { loadJson, saveJson } from "../../store/persist";
import type { CommandItem } from "./types";
import CommandPalette from "./CommandPalette";

vi.mock("../../store/persist", () => ({
  loadJson: vi.fn(),
  saveJson: vi.fn().mockResolvedValue(undefined),
}));

const loadJsonMock = vi.mocked(loadJson);
const saveJsonMock = vi.mocked(saveJson);

const SEED: CommandItem[] = [
  {
    id: "git-status",
    label: "Status do repositório",
    command: "git status",
    category: "git",
    mode: "run",
  },
  {
    id: "git-log",
    label: "Log resumido",
    command: "git log --oneline -10",
    category: "git",
    mode: "insert",
  },
];

beforeEach(() => {
  loadJsonMock.mockReset();
  saveJsonMock.mockReset().mockResolvedValue(undefined);
});

describe("CommandPalette", () => {
  it("lista os comandos carregados agrupados por categoria", async () => {
    loadJsonMock.mockResolvedValue(SEED);
    render(<CommandPalette onInsert={vi.fn()} onRun={vi.fn()} />);

    expect(await screen.findByText("Status do repositório")).toBeInTheDocument();
    expect(screen.getByText("Log resumido")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "git" })).toBeInTheDocument();
  });

  it("filtra por busca textual", async () => {
    loadJsonMock.mockResolvedValue(SEED);
    render(<CommandPalette onInsert={vi.fn()} onRun={vi.fn()} />);
    await screen.findByText("Status do repositório");

    await userEvent.type(
      screen.getByRole("searchbox", { name: /buscar comando/i }),
      "log",
    );

    expect(
      screen.queryByText("Status do repositório"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Log resumido")).toBeInTheDocument();
  });

  it("modo run chama onRun ao acionar o comando", async () => {
    loadJsonMock.mockResolvedValue(SEED);
    const onRun = vi.fn();
    const onInsert = vi.fn();
    render(<CommandPalette onInsert={onInsert} onRun={onRun} />);
    await screen.findByText("Status do repositório");

    await userEvent.click(screen.getByText("Status do repositório"));

    expect(onRun).toHaveBeenCalledWith("git status");
    expect(onInsert).not.toHaveBeenCalled();
  });

  it("modo insert chama onInsert ao acionar o comando", async () => {
    loadJsonMock.mockResolvedValue(SEED);
    const onInsert = vi.fn();
    render(<CommandPalette onInsert={onInsert} onRun={vi.fn()} />);
    await screen.findByText("Log resumido");

    await userEvent.click(screen.getByText("Log resumido"));

    expect(onInsert).toHaveBeenCalledWith("git log --oneline -10");
  });

  it("adicionar comando persiste a lista incluindo o novo item", async () => {
    loadJsonMock.mockResolvedValue([]);
    render(<CommandPalette onInsert={vi.fn()} onRun={vi.fn()} />);
    // Aguarda a hidratação (carga inicial não persiste).
    await screen.findByText(/nenhum comando ainda/i);

    await userEvent.type(
      screen.getByLabelText("Rótulo do comando"),
      "Deploy",
    );
    await userEvent.type(
      screen.getByLabelText("Texto do comando"),
      "pnpm deploy",
    );
    await userEvent.type(screen.getByLabelText("Categoria do comando"), "ci");

    await userEvent.click(
      screen.getByRole("button", { name: /adicionar comando/i }),
    );

    await waitFor(() => {
      expect(saveJsonMock).toHaveBeenCalledWith(
        "commands",
        expect.arrayContaining([
          expect.objectContaining({
            label: "Deploy",
            command: "pnpm deploy",
            category: "ci",
            mode: "run",
          }),
        ]),
      );
    });
  });

  it("remover comando persiste a lista sem o item", async () => {
    loadJsonMock.mockResolvedValue(SEED);
    render(<CommandPalette onInsert={vi.fn()} onRun={vi.fn()} />);
    await screen.findByText("Status do repositório");

    await userEvent.click(
      screen.getByRole("button", { name: /remover comando status do repositório/i }),
    );

    await waitFor(() => {
      expect(saveJsonMock).toHaveBeenCalledWith(
        "commands",
        expect.not.arrayContaining([
          expect.objectContaining({ id: "git-status" }),
        ]),
      );
    });
  });
});
