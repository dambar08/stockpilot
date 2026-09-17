import { NextResponse } from "next/server"
import { getItems, getWarehouses } from "@/lib/server/inventory"

export const dynamic = "force-dynamic"

export async function GET() {
  const items = getItems()
  const data = getWarehouses().map((w) => {
    const units = items.reduce((s, i) => s + (i.stockByWarehouse[w.id] ?? 0), 0)
    const value = items.reduce((s, i) => s + (i.stockByWarehouse[w.id] ?? 0) * i.costPrice, 0)
    return { ...w, units, value: Math.round(value) }
  })
  return NextResponse.json({ data, meta: { total: data.length } })
}
