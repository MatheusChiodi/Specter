import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CheatSheet from "./CheatSheet";
import { CHEAT_SHEET } from "./data";

const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue();

beforeEach(() => {
  writeText.mockClear();
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
});

describe("CheatSheet", () => {
  it("renderiza todas as seções", () => {
    render(<CheatSheet />);
    for (const section of CHEAT_SHEET) {
      expect(
        screen.getByRole("heading", { name: section.title }),
      ).toBeInTheDocument();
    }
  });

  it("renderiza os comandos dos itens", () => {
    render(<CheatSheet />);
    // `claude` é o primeiro item da primeira seção.
    expect(screen.getByText("claude")).toBeInTheDocument();
    expect(screen.getByText("/help")).toBeInTheDocument();
  });

  it("filtra itens conforme a busca", async () => {
    render(<CheatSheet />);

    const search = screen.getByRole("searchbox", {
      name: /buscar no cheat sheet/i,
    });
    await userEvent.type(search, "/clear");

    expect(screen.getByText("/clear")).toBeInTheDocument();
    expect(screen.queryByText("claude")).not.toBeInTheDocument();
  });

  it("mostra estado vazio quando nada casa a busca", async () => {
    render(<CheatSheet />);

    await userEvent.type(
      screen.getByRole("searchbox", { name: /buscar no cheat sheet/i }),
      "zzzznaoexiste",
    );

    expect(screen.getByText(/nenhum resultado/i)).toBeInTheDocument();
  });

  it("clicar em Inserir chama onInsert com o comando", async () => {
    const onInsert = vi.fn();
    render(<CheatSheet onInsert={onInsert} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Inserir claude" }),
    );

    expect(onInsert).toHaveBeenCalledTimes(1);
    expect(onInsert).toHaveBeenCalledWith("claude");
  });

  it("clicar em Copiar usa a clipboard e chama onCopy", async () => {
    const onCopy = vi.fn();
    render(<CheatSheet onCopy={onCopy} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Copiar claude" }),
    );

    expect(writeText).toHaveBeenCalledWith("claude");
    await waitFor(() => {
      expect(onCopy).toHaveBeenCalledWith("claude");
    });
  });
});
