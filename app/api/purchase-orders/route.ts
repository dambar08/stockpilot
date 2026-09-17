import { NextResponse } from "next/server"
import { getPurchaseOrders } from "@/lib/server/inventory"
import { documentTotal } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  let orders = getPurchaseOrders()
  if (status && status !== "all") orders = orders.filter((o) => o.status === status)
  const data = orders.map((o) => ({ ...o, total: documentTotal(o.lineItems) }))
  return NextResponse.json({ data, meta: { total: data.length } })
}
