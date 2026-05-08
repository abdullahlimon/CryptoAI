/** Pick the best TradingView symbol guess for a coin symbol. */
export function tvSymbol(symbol: string): string {
  const s = symbol.toUpperCase();
  if (s === "BTC") return "BINANCE:BTCUSDT";
  if (s === "ETH") return "BINANCE:ETHUSDT";
  return `BINANCE:${s}USDT`;
}
