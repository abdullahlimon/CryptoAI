"use client";

import { useEffect, useRef } from "react";

/**
 * TradingView "advanced chart" widget. Free, no key required.
 * `symbol` examples: "BINANCE:BTCUSDT", "COINBASE:ETHUSD".
 */
export function TradingViewChart({
  symbol,
  height = 460,
  interval = "240",
}: {
  symbol: string;
  height?: number;
  interval?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.type = "text/javascript";
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval,
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      hide_top_toolbar: false,
      hide_legend: false,
      withdateranges: true,
      allow_symbol_change: true,
      backgroundColor: "rgba(8, 9, 12, 1)",
      gridColor: "rgba(40, 42, 50, 1)",
      studies: ["MASimple@tv-basicstudies"],
      support_host: "https://www.tradingview.com",
    });
    ref.current.appendChild(script);
  }, [symbol, interval]);

  return (
    <div className="w-full overflow-hidden rounded-md border border-border" style={{ height }}>
      <div ref={ref} className="tradingview-widget-container h-full w-full" />
    </div>
  );
}

/** Pick the best TradingView symbol guess for a coin symbol. */
export function tvSymbol(symbol: string): string {
  const s = symbol.toUpperCase();
  if (s === "BTC") return "BINANCE:BTCUSDT";
  if (s === "ETH") return "BINANCE:ETHUSDT";
  return `BINANCE:${s}USDT`;
}
