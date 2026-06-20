import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TabBar from "./TabBar";
import type { Tab } from "./useTabs";

const tabs: Tab[] = [
  { id: "a", title: "Terminal 1", cwd: null, initCommands: [], env: [], split: false },
  { id: "b", title: "Build", cwd: null, initCommands: [], env: [], split: false },
];

describe("TabBar", () => {
  it("renderiza as abas e seleciona ao clicar", () => {
    const onSelect = vi.fn();
    render(
      <TabBar
        tabs={tabs}
        activeId="a"
        onSelect={onSelect}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        onRename={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: "Build" }));
    expect(onSelect).toHaveBeenCalledWith("b");
  });

  it("fecha e adiciona aba", () => {
    const onClose = vi.fn();
    const onAdd = vi.fn();
    render(
      <TabBar
        tabs={tabs}
        activeId="a"
        onSelect={vi.fn()}
        onClose={onClose}
        onAdd={onAdd}
        onRename={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText("Fechar Build"));
    expect(onClose).toHaveBeenCalledWith("b");
    fireEvent.click(screen.getByLabelText("Nova aba"));
    expect(onAdd).toHaveBeenCalled();
  });

  it("renomeia via duplo-clique + Enter", () => {
    const onRename = vi.fn();
    render(
      <TabBar
        tabs={tabs}
        activeId="a"
        onSelect={vi.fn()}
        onClose={vi.fn()}
        onAdd={vi.fn()}
        onRename={onRename}
      />,
    );
    fireEvent.doubleClick(screen.getByRole("tab", { name: "Terminal 1" }));
    const input = screen.getByLabelText("Renomear aba");
    fireEvent.change(input, { target: { value: "Logs" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onRename).toHaveBeenCalledWith("a", "Logs");
  });
});
