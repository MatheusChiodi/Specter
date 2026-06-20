/** Preferências persistidas do Specter (US-13/14/15/16/17). */

export type ThemeMode = "dark" | "light";

export interface Settings {
  /** Tema da interface. */
  theme: ThemeMode;
  /** Cor de destaque (accent), ex.: "#FF5555". */
  accent: string;
  /** Opacidade do painel, faixa 0.3–1.0 (US-16). */
  opacity: number;
  /** Painel sempre no topo (US-15). */
  alwaysOnTop: boolean;
  /** Atalho global de mostrar/ocultar (US-13), ex.: "Control+Space". */
  toggleShortcut: string;
  /** Boss key — oculta tudo (US-14), ex.: "Control+Shift+H". */
  bossKey: string;
  /** Limiar (ms) para notificar a conclusão de um comando longo (US-22). */
  longCommandMs: number;
  /** Tamanho da fonte do terminal em px (US-32). */
  terminalFontSize: number;
}

/** Padrões da identidade Specter. */
export const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  accent: "#FF5555",
  opacity: 1,
  alwaysOnTop: true,
  toggleShortcut: "Control+Space",
  bossKey: "Control+Shift+H",
  longCommandMs: 10000,
  terminalFontSize: 14,
};

/** Limite mínimo de opacidade legível (US-16). */
export const MIN_OPACITY = 0.3;
