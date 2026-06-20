import { useEffect, useRef } from "react";
import {
  register,
  unregister,
  isRegistered,
} from "@tauri-apps/plugin-global-shortcut";

/** Configuração dos atalhos globais (US-13 toggle, US-14 boss key). */
export interface ShortcutsConfig {
  /** Atalho global que alterna mostrar/ocultar o painel (US-13). */
  toggleShortcut: string;
  /** Tecla de pânico que oculta tudo instantaneamente (US-14). */
  bossKey: string;
  /** Disparado quando o atalho de toggle é pressionado. */
  onToggle: () => void;
  /** Disparado quando a boss key é pressionada. */
  onBoss: () => void;
}

/** Evento entregue pelo handler do plugin global-shortcut. */
interface ShortcutEvent {
  shortcut: string;
  state: "Pressed" | "Released";
}

/**
 * Registra atalhos globais de teclado (US-13 mostrar/ocultar; US-14 boss key).
 *
 * O efeito depende apenas das strings `toggleShortcut`/`bossKey`: mudar os
 * callbacks NÃO re-registra os atalhos (ficam em refs), evitando churn de
 * registro a cada render. Cada handler só dispara no estado "Pressed" para
 * não duplicar a ação no release. Falhas de registro (ex.: atalho já em uso
 * por outro programa) são capturadas para não quebrar a aplicação.
 */
export function useShortcuts(config: ShortcutsConfig): void {
  const { toggleShortcut, bossKey, onToggle, onBoss } = config;

  // Refs mantêm os callbacks atuais sem entrar nas deps do efeito.
  const onToggleRef = useRef(onToggle);
  const onBossRef = useRef(onBoss);
  onToggleRef.current = onToggle;
  onBossRef.current = onBoss;

  useEffect(() => {
    // Sinaliza se o efeito foi limpo antes do registro assíncrono concluir,
    // para não deixar atalhos órfãos registrados.
    let active = true;
    const registered: string[] = [];

    const bind = async (
      shortcut: string,
      onPress: () => void,
    ): Promise<void> => {
      try {
        if (await isRegistered(shortcut)) {
          await unregister(shortcut);
        }
        await register(shortcut, (event: ShortcutEvent) => {
          if (event.state === "Pressed") onPress();
        });
        if (!active) {
          // Efeito já limpo durante o await: desfaz o registro tardio.
          await unregister(shortcut).catch(() => {});
          return;
        }
        registered.push(shortcut);
      } catch {
        // Conflito de registro ou plugin indisponível: ignora para não
        // derrubar a app; a UI sinaliza o conflito separadamente.
      }
    };

    void bind(toggleShortcut, () => onToggleRef.current());
    void bind(bossKey, () => onBossRef.current());

    return () => {
      active = false;
      for (const shortcut of registered) {
        void unregister(shortcut).catch(() => {});
      }
    };
  }, [toggleShortcut, bossKey]);
}
