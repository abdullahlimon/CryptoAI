/**
 * Normalize CoinGecko's name/symbol fields for display.
 *
 * The trending and search endpoints sometimes return symbol-prefixed names
 * ("jtoJito", "dydxdYdX"), names that already end with the symbol in
 * parentheses, or duplicated casing. We strip those so the UI can render
 * the pair cleanly as "Jito · JTO".
 */
export function prettifyCoinName(rawName: string, rawSymbol: string): string {
  const name = (rawName ?? "").trim();
  const symbol = (rawSymbol ?? "").trim();
  if (!name) return symbol.toUpperCase();
  if (!symbol) return name;

  const sym = symbol.toLowerCase();
  let n = name;

  // Drop "(XYZ)" suffix — we render the symbol separately.
  n = n.replace(/\s*\([^)]+\)\s*$/u, "").trim();

  // Strip a lowercased symbol prefix glued to the name (e.g. "jtoJito").
  const lower = n.toLowerCase();
  if (lower.startsWith(sym) && n.length > sym.length) {
    const rest = n.slice(sym.length);
    if (/^[A-Z]/.test(rest)) n = rest;
  }

  // Strip a trailing symbol token if it's literally repeated ("Jito JTO").
  const tail = new RegExp(`\\s+${escapeRegex(symbol)}$`, "i");
  n = n.replace(tail, "").trim();

  return n || symbol.toUpperCase();
}

export function prettifyCoinSymbol(rawSymbol: string): string {
  return (rawSymbol ?? "").trim().toUpperCase();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
