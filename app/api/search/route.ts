import { NextRequest, NextResponse } from "next/server";
import { cgSearch } from "@/lib/providers/coingecko";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ coins: [] });
  try {
    const data = await cgSearch(q);
    const coins = data.coins.slice(0, 8).map((c) => ({
      id: c.id,
      name: c.name,
      symbol: c.symbol,
      thumb: c.thumb,
      rank: c.market_cap_rank,
    }));
    return NextResponse.json({ coins });
  } catch {
    return NextResponse.json({ coins: [] }, { status: 200 });
  }
}
