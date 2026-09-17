import { NextResponse } from "next/server"
import { computeDashboardStats } from "@/lib/server/inventory"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({ data: computeDashboardStats() })
}
