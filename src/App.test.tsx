import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App", () => {
  it("renderiza a marca Specter", () => {
    render(<App />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Specter",
    );
  });

  it("exibe a marca MChiodi", () => {
    render(<App />);
    expect(screen.getByText("MChiodi")).toBeInTheDocument();
  });
});
