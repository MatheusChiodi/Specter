import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { detectEnvironment } from "../../ipc";
import EnvStatus from "./index";

vi.mock("../../ipc", () => ({
  detectEnvironment: vi.fn().mockResolvedValue([
    { name: "Node", version: "v20.0.0" },
    { name: "Claude", version: null },
  ]),
}));

const detectEnvironmentMock = vi.mocked(detectEnvironment);

beforeEach(() => {
  vi.clearAllMocks();
  detectEnvironmentMock.mockResolvedValue([
    { name: "Node", version: "v20.0.0" },
    { name: "Claude", version: null },
  ]);
});

describe("EnvStatus", () => {
  it("mostra a versão do Node após carregar", async () => {
    render(<EnvStatus />);
    expect(await screen.findByText("v20.0.0")).toBeInTheDocument();
  });

  it('mostra "não encontrado" para o Claude ausente', async () => {
    render(<EnvStatus />);
    expect(await screen.findByText(/não encontrado/i)).toBeInTheDocument();
  });

  it('clicar em "Atualizar" re-detecta o ambiente', async () => {
    render(<EnvStatus />);
    await screen.findByText("v20.0.0");
    expect(detectEnvironmentMock).toHaveBeenCalledTimes(1);

    await userEvent.click(
      screen.getByRole("button", { name: /atualizar status do ambiente/i }),
    );

    await waitFor(() => expect(detectEnvironmentMock).toHaveBeenCalledTimes(2));
  });
});
