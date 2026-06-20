import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import suggest from "./suggest";
import Autocomplete from "./Autocomplete";

const history = ["git status", "git commit", "git status", "pnpm dev"];

describe("suggest", () => {
  it("retorna [] para input vazio", () => {
    expect(suggest("", history)).toEqual([]);
    expect(suggest("   ", history)).toEqual([]);
  });

  it("casa por prefixo case-insensitive", () => {
    expect(suggest("git", history)).toEqual(["git status", "git commit"]);
    expect(suggest("GIT", history)).toEqual(["git status", "git commit"]);
  });

  it("remove duplicatas preservando a ordem", () => {
    expect(suggest("git s", history)).toEqual(["git status"]);
  });

  it("exclui o comando idêntico ao input já digitado", () => {
    expect(suggest("pnpm dev", history)).toEqual([]);
  });

  it("limita a 8 sugestões", () => {
    const many = Array.from({ length: 20 }, (_, i) => `cmd-${i}`);
    expect(suggest("cmd", many)).toHaveLength(8);
  });
});

describe("Autocomplete", () => {
  it("não renderiza nada quando input é vazio", () => {
    const { container } = render(
      <Autocomplete input="" history={history} onAccept={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renderiza as sugestões do histórico", () => {
    render(<Autocomplete input="git" history={history} onAccept={vi.fn()} />);
    expect(screen.getByRole("option", { name: "git status" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "git commit" })).toBeInTheDocument();
  });

  it("Enter aceita a primeira sugestão", async () => {
    const onAccept = vi.fn();
    render(<Autocomplete input="git" history={history} onAccept={onAccept} />);

    screen.getByRole("listbox").focus();
    await userEvent.keyboard("{Enter}");

    expect(onAccept).toHaveBeenCalledWith("git status");
  });

  it("↓ move o realce e Enter aceita a sugestão ativa", async () => {
    const onAccept = vi.fn();
    render(<Autocomplete input="git" history={history} onAccept={onAccept} />);

    screen.getByRole("listbox").focus();
    await userEvent.keyboard("{ArrowDown}{Enter}");

    expect(onAccept).toHaveBeenCalledWith("git commit");
  });

  it("Esc fecha a lista", async () => {
    render(<Autocomplete input="git" history={history} onAccept={vi.fn()} />);

    screen.getByRole("listbox").focus();
    await userEvent.keyboard("{Escape}");

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("clique aceita a sugestão", async () => {
    const onAccept = vi.fn();
    render(<Autocomplete input="git" history={history} onAccept={onAccept} />);

    await userEvent.click(screen.getByRole("option", { name: "git commit" }));

    expect(onAccept).toHaveBeenCalledWith("git commit");
  });
});
