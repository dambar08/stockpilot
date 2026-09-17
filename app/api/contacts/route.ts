import { NextResponse } from "next/server"
import { getContacts } from "@/lib/server/inventory"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")
  let data = getContacts()
  if (type === "customer" || type === "vendor") {
    data = data.filter((c) => c.type === type)
  }
  return NextResponse.json({ data, meta: { total: data.length } })
}
