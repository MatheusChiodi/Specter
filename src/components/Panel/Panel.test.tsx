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
vi.mock("../History/useHistory", () => ({
  useHistory: () => ({
    entries: [],
    record: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn(),
  }),
}));
vi.mock("../FavoriteDirs", () => ({
  default: () => <div data-testid="dirs-mock" />,
  useDirs: () => ({
    recents: [],
    favorites: [],
    addRecent: vi.fn(),
    toggleFavorite: vi.fn(),
    removeRecent: vi.fn(),
  }),
}));
vi.mock("@tauri-apps/plugin-dialog", () => ({ save: vi.fn() }));
vi.mock("@tauri-apps/plugin-notification", () => ({
  sendNotification: vi.fn(),
  isPermissionGranted: vi.fn().mockResolvedValue(true),
  requestPermission: vi.fn().mockResolvedValue("granted"),
}));
vi.mock("../../ipc", () => ({
  applyCaptureExclusion: vi.fn().mockResolvedValue("applied"),
  togglePanel: vi.fn(),
  hideAll: vi.fn(),
  readTextFile: vi.fn(),
  writeTextFile: vi.fn(),
}));

import Panel from "./Panel";
import { applyCaptureExclusion } from "../../ipc";

describe("Panel", () => {
  beforeEach(() => vi.clearAllMocks());

  it("compõe seletor, terminal, abas, marca e ferramentas", async () => {
    render(<Panel />);
    expect(screen.getByTestId("folderpicker-mock")).toBeInTheDocument();
    expect(screen.getByTestId("terminal-mock")).toBeInTheDocument();
    expect(screen.getByText("MChiodi")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Comandos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Processos" })).toBeInTheDocument();
    expect(screen.getByLabelText("Exportar log")).toBeInTheDocument();
    expect(screen.getByLabelText("Nova aba")).toBeInTheDocument();
    await waitFor(() => expect(applyCaptureExclusion).toHaveBeenCalled());
  });

  it("abre a busca ao clicar em Buscar", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");
    const user = userEvent.setup();
    render(<Panel />);
    await user.click(screen.getByLabelText("Abrir busca"));
    expect(screen.getByLabelText("Buscar no terminal")).toBeInTheDocument();
  });

  it("avisa quando o stealth não é suportado", async () => {
    vi.mocked(applyCaptureExclusion).mockResolvedValueOnce("unsupported");
    render(<Panel />);
    await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  });
});
