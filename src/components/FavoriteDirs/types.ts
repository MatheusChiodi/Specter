/** Estado persistido de diretórios (US-11). */
export interface DirsState {
  /** Pastas usadas recentemente, mais recentes primeiro (máx. 10). */
  recents: string[];
  /** Pastas fixadas manualmente pelo usuário. */
  favorites: string[];
}
