/** Formatação de duração para o gerenciador de processos (US-27). */

/**
 * Converte uma duração em milissegundos para um rótulo curto e legível.
 *
 * Exemplos: `1500 → "1s"`, `65000 → "1m 5s"`, `3661000 → "1h 1m 1s"`.
 * Valores < 1s e negativos colapsam para `"0s"`. Apenas as unidades não-zero
 * mais significativas aparecem (segundos sempre presentes quando < 1m).
 */
export function formatUptime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  // Segundos aparecem sempre que não houver hora/minuto ou houver resto.
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(" ");
}
