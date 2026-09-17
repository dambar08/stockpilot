import { NextResponse } from "next/server"
import { getPayments } from "@/lib/server/inventory"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const direction = searchParams.get("direction")
  let data = getPayments()
  if (direction === "received" || direction === "made") {
    data = data.filter((p) => p.direction === direction)
  }
  return NextResponse.json({ data, meta: { total: data.length } })
}
