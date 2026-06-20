import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { setPanelAlwaysOnTop } from "../../ipc";
import { DEFAULT_SETTINGS, type Settings as SettingsType } from "../../types/settings";
import Settings, { useTheme } from "./index";

vi.mock("../../ipc", () => ({
  setPanelAlwaysOnTop: vi.fn().mockResolvedValue(undefined),
}));

const setPanelAlwaysOnTopMock = vi.mocked(setPanelAlwaysOnTop);

beforeEach(() => {
  vi.clearAllMocks();
});

function makeSettings(patch: Partial<SettingsType> = {}): SettingsType {
  return { ...DEFAULT_SETTINGS, ...patch };
}

describe("Settings", () => {
  it("mexer no slider de opacidade chama onUpdate com número", () => {
    const onUpdate = vi.fn();
    render(<Settings settings={makeSettings({ opacity: 1 })} onUpdate={onUpdate} />);

    const slider = screen.getByRole("slider", { name: /opacidade do painel/i });
    fireEvent.change(slider, { target: { value: "0.5" } });

    expect(onUpdate).toHaveBeenCalledTimes(1);
    const patch = onUpdate.mock.calls[0][0] as Partial<SettingsType>;
    expect(typeof patch.opacity).toBe("number");
    expect(patch.opacity).toBe(0.5);
  });

  it("marcar always-on-top chama onUpdate({alwaysOnTop:true}) e setPanelAlwaysOnTop(true)", async () => {
    const onUpdate = vi.fn();
    render(
      <Settings settings={makeSettings({ alwaysOnTop: false })} onUpdate={onUpdate} />,
    );

    await userEvent.click(
      screen.getByRole("checkbox", { name: /painel sempre no topo/i }),
    );

    expect(onUpdate).toHaveBeenCalledWith({ alwaysOnTop: true });
    await waitFor(() =>
      expect(setPanelAlwaysOnTopMock).toHaveBeenCalledWith(true),
    );
  });

  it("trocar tema chama onUpdate", async () => {
    const onUpdate = vi.fn();
    render(<Settings settings={makeSettings({ theme: "dark" })} onUpdate={onUpdate} />);

    await userEvent.click(
      screen.getByRole("button", { name: /alternar tema claro\/escuro/i }),
    );

    expect(onUpdate).toHaveBeenCalledWith({ theme: "light" });
  });

  it("alterar o accent chama onUpdate com a nova cor", () => {
    const onUpdate = vi.fn();
    render(<Settings settings={makeSettings()} onUpdate={onUpdate} />);

    // input[type=color] não responde a type(); change direto é o idiomático.
    const picker = screen.getByLabelText(/cor de destaque/i);
    fireEvent.change(picker, { target: { value: "#00ff00" } });

    expect(onUpdate).toHaveBeenCalledWith({ accent: "#00ff00" });
  });
});

describe("useTheme", () => {
  function Harness({ settings }: { settings: SettingsType }): null {
    useTheme(settings);
    return null;
  }

  it("aplica data-theme e --color-accent ao <html>", () => {
    render(<Harness settings={makeSettings({ theme: "light", accent: "#123456" })} />);

    const root = document.documentElement;
    expect(root.dataset.theme).toBe("light");
    expect(root.style.getPropertyValue("--color-accent")).toBe("#123456");
  });
});
