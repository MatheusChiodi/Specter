import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import SearchBar from "./SearchBar";

describe("SearchBar", () => {
  it("Enter dispara onNext com a query", () => {
    const onNext = vi.fn();
    render(<SearchBar onNext={onNext} onPrev={vi.fn()} onClose={vi.fn()} />);
    const input = screen.getByLabelText("Buscar no terminal");
    fireEvent.change(input, { target: { value: "erro" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onNext).toHaveBeenCalledWith("erro");
  });

  it("Shift+Enter dispara onPrev", () => {
    const onPrev = vi.fn();
    render(<SearchBar onNext={vi.fn()} onPrev={onPrev} onClose={vi.fn()} />);
    const input = screen.getByLabelText("Buscar no terminal");
    fireEvent.change(input, { target: { value: "x" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: true });
    expect(onPrev).toHaveBeenCalledWith("x");
  });

  it("Esc fecha", () => {
    const onClose = vi.fn();
    render(<SearchBar onNext={vi.fn()} onPrev={vi.fn()} onClose={onClose} />);
    fireEvent.keyDown(screen.getByLabelText("Buscar no terminal"), {
      key: "Escape",
    });
    expect(onClose).toHaveBeenCalled();
  });
});
