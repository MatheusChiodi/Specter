import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("./components/Panel", () => ({
  default: () => <div data-testid="panel-mock" />,
}));

import App from "./App";

describe("App", () => {
  it("renderiza o painel principal", () => {
    render(<App />);
    expect(screen.getByTestId("panel-mock")).toBeInTheDocument();
  });
});
