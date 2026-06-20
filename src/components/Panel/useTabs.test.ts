import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useTabs } from "./useTabs";

describe("useTabs", () => {
  it("começa com uma aba ativa", () => {
    const { result } = renderHook(() => useTabs());
    expect(result.current.tabs).toHaveLength(1);
    expect(result.current.activeId).toBe(result.current.tabs[0].id);
  });

  it("adiciona aba e a torna ativa", () => {
    const { result } = renderHook(() => useTabs());
    let id = "";
    act(() => {
      id = result.current.addTab({ cwd: "C:\\x" });
    });
    expect(result.current.tabs).toHaveLength(2);
    expect(result.current.activeId).toBe(id);
    expect(result.current.activeTab?.cwd).toBe("C:\\x");
  });

  it("fechar a aba ativa troca a ativa", () => {
    const { result } = renderHook(() => useTabs());
    const firstId = result.current.tabs[0].id;
    act(() => {
      result.current.addTab();
    });
    const secondId = result.current.activeId;
    act(() => {
      result.current.closeTab(secondId);
    });
    expect(result.current.tabs).toHaveLength(1);
    expect(result.current.activeId).toBe(firstId);
  });

  it("fechar a última aba cria uma nova", () => {
    const { result } = renderHook(() => useTabs());
    act(() => {
      result.current.closeTab(result.current.tabs[0].id);
    });
    expect(result.current.tabs).toHaveLength(1);
  });

  it("renomeia e alterna split", () => {
    const { result } = renderHook(() => useTabs());
    const id = result.current.tabs[0].id;
    act(() => {
      result.current.renameTab(id, "Build");
      result.current.toggleSplit(id);
    });
    expect(result.current.activeTab?.title).toBe("Build");
    expect(result.current.activeTab?.split).toBe(true);
  });
});
