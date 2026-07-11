import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/higgsfield";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ demo: isDemoMode() });
}
