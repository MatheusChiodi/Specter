import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DEFAULT_SETTINGS } from "../../types/settings";

vi.mock("../Terminal", () => ({
  default: () => <div data-testid="terminal-mock" />,
}));
vi.mock("../FolderPicker", () => ({
  default: ({ value }: { value: string | null }) => (
    <div data-testid="folderpicker-mock">{value ?? "none"}</div>
  ),
}));
vi.mock("../../store/settings", () => ({
  useSettings: () => ({
    settings: DEFAULT_SETTINGS,
    loading: false,
    update: vi.fn(),
  }),
}));
vi.mock("../Settings/useTheme", () => ({ useTheme: vi.fn() }));
vi.mock("../../hooks/useShortcuts", () => ({ useShortcuts: vi.fn() }));
vi.mock("../../ipc", () => ({
  applyCaptureExclusion: vi.fn().mockResolvedValue("applied"),
  togglePanel: vi.fn(),
  hideAll: vi.fn(),
}));

import Panel from "./Panel";
import { applyCaptureExclusion } from "../../ipc";

describe("Panel", () => {
  beforeEach(() => vi.clearAllMocks());

  it("compõe seletor de pasta, terminal, marca e toolbar", async () => {
    render(<Panel />);
    expect(screen.getByTestId("folderpicker-mock")).toBeInTheDocument();
    expect(screen.getByTestId("terminal-mock")).toBeInTheDocument();
    expect(screen.getByText("MChiodi")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Comandos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Config" })).toBeInTheDocument();
    await waitFor(() => expect(applyCaptureExclusion).toHaveBeenCalled());
  });

  it("checa o stealth no mount", async () => {
    render(<Panel />);
    await waitFor(() =>
      expect(applyCaptureExclusion).toHaveBeenCalledTimes(1),
    );
  });

  it("avisa quando o stealth não é suportado", async () => {
    vi.mocked(applyCaptureExclusion).mockResolvedValueOnce("unsupported");
    render(<Panel />);
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });
});
