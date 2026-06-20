/** Tipos do módulo de Perfis de projeto (US-12). */

/**
 * Perfil de projeto: abre uma sessão pronta no `path` rodando `initCommands`
 * em ordem e, opcionalmente, carregando o `.env` referenciado por `envFile`
 * (US-19).
 */
export interface Profile {
  id: string;
  name: string;
  path: string;
  initCommands: string[];
  /** Caminho do `.env` a carregar, ou `null` quando nenhum. */
  envFile: string | null;
}
