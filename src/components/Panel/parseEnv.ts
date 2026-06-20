/** Parser simples de `.env` → pares [chave, valor] (US-19). */
export function parseEnv(content: string): [string, string][] {
  const result: [string, string][] = [];
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.length === 0 || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    // Remove aspas envolventes simples ou duplas.
    const quoted =
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")));
    if (quoted) value = value.slice(1, -1);
    if (key) result.push([key, value]);
  }
  return result;
}
