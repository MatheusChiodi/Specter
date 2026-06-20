/** Tipos do módulo de Snippets/favoritos (US-09). */

/** Modo de acionamento do snippet, igual ao mecanismo da US-06. */
export type SnippetMode = "insert" | "run";

/**
 * Snippet/favorito de comando.
 * Placeholders são trechos `{nome}` dentro de `command`, preenchidos antes do acionamento.
 */
export interface Snippet {
  id: string;
  label: string;
  command: string;
  category: string;
  mode: SnippetMode;
}
