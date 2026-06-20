/** Lógica pura de sugestão por prefixo a partir do histórico (US-24). */

/** Máximo de sugestões retornadas. */
const MAX_SUGGESTIONS = 8;

/**
 * Sugere comandos do histórico que começam com `input` (case-insensitive).
 * Remove duplicatas (preservando a primeira ocorrência) e o próprio `input` exato.
 * Retorna `[]` para input vazio. Limita a 8 resultados.
 */
export function suggest(input: string, history: string[]): string[] {
  const prefix = input.trim();
  if (prefix.length === 0) return [];

  const lower = prefix.toLowerCase();
  const seen = new Set<string>();
  const out: string[] = [];

  for (const command of history) {
    const cmd = command.trim();
    if (cmd.length === 0) continue;
    if (seen.has(cmd)) continue;
    if (cmd.toLowerCase() === lower) continue; // já digitado por completo
    if (!cmd.toLowerCase().startsWith(lower)) continue;
    seen.add(cmd);
    out.push(cmd);
    if (out.length >= MAX_SUGGESTIONS) break;
  }

  return out;
}

export default suggest;
