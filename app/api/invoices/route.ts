import { NextResponse } from "next/server"
import { getInvoices } from "@/lib/server/inventory"
import { documentTotal } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  let invoices = getInvoices()
  if (status && status !== "all") invoices = invoices.filter((i) => i.status === status)
  const data = invoices.map((inv) => {
    const total = documentTotal(inv.lineItems)
    return { ...inv, total, balance: total - inv.amountPaid }
  })
  return NextResponse.json({ data, meta: { total: data.length } })
}
