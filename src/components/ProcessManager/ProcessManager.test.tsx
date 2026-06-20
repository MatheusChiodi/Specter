import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ptySessions, ptyClose } from "../../ipc";
import { formatUptime } from "./format";
import ProcessManager from "./index";

vi.mock("../../ipc", () => ({
  ptySessions: vi
    .fn()
    .mockResolvedValue([{ id: 1, shell: "powershell.exe", uptimeMs: 5000 }]),
  ptyClose: vi.fn().mockResolvedValue(undefined),
}));

const ptySessionsMock = vi.mocked(ptySessions);
const ptyCloseMock = vi.mocked(ptyClose);

beforeEach(() => {
  vi.clearAllMocks();
  ptySessionsMock.mockResolvedValue([
    { id: 1, shell: "powershell.exe", uptimeMs: 5000 },
  ]);
  ptyCloseMock.mockResolvedValue(undefined);
});

describe("formatUptime", () => {
  it("formata segundos abaixo de 1 minuto", () => {
    expect(formatUptime(1500)).toBe("1s");
  });

  it("formata minutos e segundos", () => {
    expect(formatUptime(65000)).toBe("1m 5s");
  });

  it("formata horas, minutos e segundos", () => {
    expect(formatUptime(3661000)).toBe("1h 1m 1s");
  });

  it("omite segundos zerados quando há minuto", () => {
    expect(formatUptime(60000)).toBe("1m");
  });

  it("colapsa valores < 1s e negativos para 0s", () => {
    expect(formatUptime(500)).toBe("0s");
    expect(formatUptime(-1000)).toBe("0s");
  });
});

describe("ProcessManager", () => {
  it("lista a sessão ativa com shell, PID e duração", async () => {
    render(<ProcessManager />);

    expect(await screen.findByText("powershell.exe")).toBeInTheDocument();
    expect(screen.getByText(/PID 1 · 5s/)).toBeInTheDocument();
  });

  it("encerra a sessão ao clicar em Encerrar", async () => {
    render(<ProcessManager />);

    const button = await screen.findByRole("button", {
      name: /encerrar sessão 1/i,
    });
    await userEvent.click(button);

    await waitFor(() => expect(ptyCloseMock).toHaveBeenCalledWith(1));
  });

  it("mostra estado vazio didático quando não há sessões", async () => {
    ptySessionsMock.mockResolvedValue([]);
    render(<ProcessManager />);

    expect(await screen.findByText(/nenhuma sessão ativa/i)).toBeInTheDocument();
  });
});
