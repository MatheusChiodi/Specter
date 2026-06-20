import { useEffect } from "react";
import type { Settings } from "../../types/settings";

/**
 * Aplica tema e accent ao `<html>` (US-17). O `data-theme` alterna dark/light
 * no Tailwind e `--color-accent` propaga a cor de destaque para toda a UI.
 * A opacidade (US-16) é responsabilidade do Panel, não deste hook.
 */
export function useTheme(settings: Settings): void {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.style.setProperty("--color-accent", settings.accent);
  }, [settings.theme, settings.accent]);
}
