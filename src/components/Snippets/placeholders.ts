/** Suporte a placeholders simples `{nome}` em comandos de snippet (US-09). */

// Um placeholder é `{` + nome (sem chaves/espaços, ao menos 1 char) + `}`.
const PLACEHOLDER_RE = /\{([^{}\s]+)\}/g;

/**
 * Extrai os nomes de placeholders únicos de `command`, na ordem de primeira ocorrência.
 * Ex.: `git checkout {branch} && git pull {branch}` -> `["branch"]`.
 */
export function extractPlaceholders(command: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const match of command.matchAll(PLACEHOLDER_RE)) {
    const name = match[1];
    if (!seen.has(name)) {
      seen.add(name);
      result.push(name);
    }
  }
  return result;
}

/**
 * Substitui cada `{nome}` em `command` pelo valor correspondente em `values`.
 * Placeholders sem valor mapeado são mantidos como estão (`{nome}`).
 */
export function applyPlaceholders(
  command: string,
  values: Record<string, string>,
): string {
  return command.replace(PLACEHOLDER_RE, (whole, name: string) =>
    Object.prototype.hasOwnProperty.call(values, name) ? values[name] : whole,
  );
}
