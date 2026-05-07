import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { hasSupabase, supabaseAdmin } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export const runtime = "nodejs";

const Body = z.object({ coin_id: z.string().min(1).max(64) });

export async function POST(req: NextRequest) {
  if (!hasSupabase()) return NextResponse.json({ error: "supabase not configured" }, { status: 500 });
  const { coin_id } = Body.parse(await req.json());
  const sb = supabaseAdmin();
  const { error } = await sb.from("watchlists").upsert({ coin_id }, { onConflict: "coin_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath("/watchlist");
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!hasSupabase()) return NextResponse.json({ error: "supabase not configured" }, { status: 500 });
  const { coin_id } = Body.parse(await req.json());
  const sb = supabaseAdmin();
  const { error } = await sb.from("watchlists").delete().eq("coin_id", coin_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidatePath("/watchlist");
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
