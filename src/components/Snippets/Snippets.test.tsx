import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { loadJson, saveJson } from "../../store/persist";
import type { Snippet } from "./types";
import Snippets from "./Snippets";

vi.mock("../../store/persist", () => ({
  loadJson: vi.fn(),
  saveJson: vi.fn().mockResolvedValue(undefined),
}));

const loadJsonMock = vi.mocked(loadJson);
const saveJsonMock = vi.mocked(saveJson);

const INSERT_SNIPPET: Snippet = {
  id: "s1",
  label: "Log resumido",
  command: "git log --oneline -10",
  category: "git",
  mode: "insert",
};

const RUN_PLACEHOLDER: Snippet = {
  id: "s2",
  label: "Checkout branch",
  command: "git checkout {branch}",
  category: "git",
  mode: "run",
};

beforeEach(() => {
  loadJsonMock.mockReset();
  saveJsonMock.mockReset().mockResolvedValue(undefined);
});

describe("Snippets", () => {
  it("lista os snippets carregados agrupados por categoria", async () => {
    loadJsonMock.mockResolvedValue([INSERT_SNIPPET]);
    render(<Snippets onInsert={vi.fn()} onRun={vi.fn()} />);

    expect(await screen.findByText("Log resumido")).toBeInTheDocument();
    expect(screen.getByText("git log --oneline -10")).toBeInTheDocument();
    expect(screen.getByText("git")).toBeInTheDocument();
  });

  it("estado vazio quando não há snippets", async () => {
    loadJsonMock.mockResolvedValue([]);
    render(<Snippets onInsert={vi.fn()} onRun={vi.fn()} />);
    expect(await screen.findByText(/nenhum snippet ainda/i)).toBeInTheDocument();
  });

  it("adicionar snippet chama saveJson com os dados do formulário", async () => {
    loadJsonMock.mockResolvedValue([]);
    render(<Snippets onInsert={vi.fn()} onRun={vi.fn()} />);
    await screen.findByText(/nenhum snippet ainda/i);

    await userEvent.type(screen.getByLabelText("Rótulo do snippet"), "Deploy");
    await userEvent.type(
      screen.getByLabelText("Comando do snippet"),
      "pnpm deploy",
    );
    await userEvent.type(screen.getByLabelText("Categoria do snippet"), "ci");

    await userEvent.click(
      screen.getByRole("button", { name: /adicionar snippet/i }),
    );

    await waitFor(() => {
      expect(saveJsonMock).toHaveBeenCalledWith("snippets", [
        expect.objectContaining({
          label: "Deploy",
          command: "pnpm deploy",
          category: "ci",
          mode: "insert",
        }),
      ]);
    });
  });

  it("modo insert chama onInsert com o comando ao acionar", async () => {
    loadJsonMock.mockResolvedValue([INSERT_SNIPPET]);
    const onInsert = vi.fn();
    const onRun = vi.fn();
    render(<Snippets onInsert={onInsert} onRun={onRun} />);
    await screen.findByText("Log resumido");

    await userEvent.click(
      screen.getByRole("button", { name: /inserir snippet log resumido/i }),
    );

    expect(onInsert).toHaveBeenCalledWith("git log --oneline -10");
    expect(onRun).not.toHaveBeenCalled();
  });

  it("modo run aplica placeholders e chama onRun com o valor preenchido", async () => {
    loadJsonMock.mockResolvedValue([RUN_PLACEHOLDER]);
    const onRun = vi.fn();
    render(<Snippets onInsert={vi.fn()} onRun={onRun} />);
    await screen.findByText("Checkout branch");

    await userEvent.type(
      screen.getByLabelText("Valor de branch para Checkout branch"),
      "main",
    );
    await userEvent.click(
      screen.getByRole("button", { name: /executar snippet checkout branch/i }),
    );

    expect(onRun).toHaveBeenCalledWith("git checkout main");
  });

  it("remover snippet chama saveJson sem o item", async () => {
    loadJsonMock.mockResolvedValue([INSERT_SNIPPET]);
    render(<Snippets onInsert={vi.fn()} onRun={vi.fn()} />);
    await screen.findByText("Log resumido");

    await userEvent.click(
      screen.getByRole("button", { name: /remover snippet log resumido/i }),
    );

    await waitFor(() => {
      expect(saveJsonMock).toHaveBeenCalledWith("snippets", []);
    });
  });
});
