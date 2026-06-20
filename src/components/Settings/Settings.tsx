import { type JSX } from "react";
import { type Settings as AppSettings, MIN_OPACITY } from "../../types/settings";
import { setPanelAlwaysOnTop } from "../../ipc";

/**
 * Painel de configurações (US-15 always-on-top, US-16 opacidade, US-17 temas).
 * É controlado: cada mudança emite um patch via `onUpdate`; a persistência e o
 * estado vivem no pai. O always-on-top também aciona o IPC do painel.
 */

interface SettingsProps {
  /** Preferências atuais. */
  settings: AppSettings;
  /** Emite um patch parcial das preferências ao pai. */
  onUpdate: (patch: Partial<AppSettings>) => void;
}

function Settings({ settings, onUpdate }: SettingsProps): JSX.Element {
  function handleAlwaysOnTop(value: boolean): void {
    onUpdate({ alwaysOnTop: value });
    // Espelha no painel nativo; falha não deve quebrar a UI nem reverter o toggle.
    void setPanelAlwaysOnTop(value).catch(() => {});
  }

  const fieldClass =
    "flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-md";
  const labelClass = "text-sm font-medium text-white/80";
  const textInputClass =
    "w-44 rounded-md border border-white/10 bg-black/30 px-2 py-1 text-sm text-white/90 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
      <h2 className="text-base font-semibold text-white/90">Configurações</h2>

      {/* US-17: tema dark/light */}
      <div className={fieldClass}>
        <span className={labelClass}>Tema</span>
        <button
          type="button"
          aria-label="Alternar tema claro/escuro"
          onClick={() =>
            onUpdate({ theme: settings.theme === "dark" ? "light" : "dark" })
          }
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/15 px-3 py-1 text-sm font-medium text-[var(--color-accent)] transition-colors hover:bg-[var(--color-accent)]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
        >
          {settings.theme === "dark" ? "Escuro" : "Claro"}
        </button>
      </div>

      {/* US-17: accent configurável */}
      <div className={fieldClass}>
        <span className={labelClass}>Cor de destaque</span>
        <input
          type="color"
          aria-label="Cor de destaque (accent)"
          value={settings.accent}
          onChange={(e) => onUpdate({ accent: e.target.value })}
          className="h-8 w-12 cursor-pointer rounded border border-white/10 bg-transparent"
        />
      </div>

      {/* US-16: opacidade do painel (0.3–1.0) */}
      <div className={fieldClass}>
        <span className={labelClass}>
          Opacidade
          <span className="ml-2 text-white/50">
            {Math.round(settings.opacity * 100)}%
          </span>
        </span>
        <input
          type="range"
          aria-label="Opacidade do painel"
          min={MIN_OPACITY}
          max={1}
          step={0.05}
          value={settings.opacity}
          onChange={(e) => onUpdate({ opacity: Number(e.target.value) })}
          className="w-44 accent-[var(--color-accent)]"
        />
      </div>

      {/* US-15: always-on-top do painel */}
      <div className={fieldClass}>
        <span className={labelClass}>Sempre no topo</span>
        <input
          type="checkbox"
          aria-label="Painel sempre no topo"
          checked={settings.alwaysOnTop}
          onChange={(e) => handleAlwaysOnTop(e.target.checked)}
          className="h-4 w-4 cursor-pointer accent-[var(--color-accent)]"
        />
      </div>

      {/* US-13: atalho global de mostrar/ocultar */}
      <div className={fieldClass}>
        <span className={labelClass}>Atalho global</span>
        <input
          type="text"
          aria-label="Atalho global de mostrar/ocultar"
          value={settings.toggleShortcut}
          onChange={(e) => onUpdate({ toggleShortcut: e.target.value })}
          className={textInputClass}
        />
      </div>

      {/* US-14: boss key */}
      <div className={fieldClass}>
        <span className={labelClass}>Boss key</span>
        <input
          type="text"
          aria-label="Boss key (ocultar tudo)"
          value={settings.bossKey}
          onChange={(e) => onUpdate({ bossKey: e.target.value })}
          className={textInputClass}
        />
      </div>

      {/* US-22: limiar de comando longo para notificação */}
      <div className={fieldClass}>
        <span className={labelClass}>Comando longo (ms)</span>
        <input
          type="number"
          min={1000}
          step={1000}
          aria-label="Limiar de comando longo em milissegundos"
          value={settings.longCommandMs}
          onChange={(e) => onUpdate({ longCommandMs: Number(e.target.value) })}
          className={textInputClass}
        />
      </div>
    </div>
  );
}

export default Settings;
