import { NextResponse } from "next/server"
import {
  createItemRecord,
  filterItems,
  getItems,
  paginate,
  validateNewItem,
} from "@/lib/server/inventory"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const filtered = filterItems(getItems(), {
    search: searchParams.get("search"),
    category: searchParams.get("category"),
    status: searchParams.get("status"),
  })
  const page = Number(searchParams.get("page") ?? "1")
  const pageSize = Number(searchParams.get("pageSize") ?? "20")
  const result = paginate(filtered, Number.isFinite(page) ? page : 1, Number.isFinite(pageSize) ? pageSize : 20)

  return NextResponse.json(
    { data: result.data, meta: { page: result.page, pageSize: result.pageSize, total: result.total, totalPages: result.totalPages } },
    { headers: { "X-Total-Count": String(result.total) } },
  )
}

export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  const validation = validateNewItem(payload as Record<string, unknown>)
  if (!validation.valid) {
    return NextResponse.json({ error: "Validation failed.", errors: validation.errors }, { status: 400 })
  }

  const item = createItemRecord(payload as Record<string, unknown>)
  return NextResponse.json({ data: item }, { status: 201 })
}
