"use client"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input, Label, Select } from "@/components/ui/field"
import { Modal } from "@/components/ui/modal"
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table"
import { useAuth } from "@/lib/auth"
import { useI18n } from "@/lib/i18n/context"
import { formatCurrency, formatNumber } from "@/lib/format"
import { useStore } from "@/lib/store"
import { itemStock, type Item } from "@/lib/types"
import { PackagePlus, Pencil, Search } from "lucide-react"
import { useMemo, useState } from "react"

function stockTone(item: Item): { tone: "success" | "warning" | "destructive"; label: string } {
  const stock = itemStock(item)
  if (stock === 0) return { tone: "destructive", label: "Out of stock" }
  if (stock <= item.reorderLevel) return { tone: "warning", label: "Low stock" }
  return { tone: "success", label: "In stock" }
}

export default function ItemsPage() {
  const { can } = useAuth()
  const { t } = useI18n()
  const { items, warehouses, createItem, adjustStock } = useStore()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [addOpen, setAddOpen] = useState(false)
  const [adjustItem, setAdjustItem] = useState<Item | null>(null)

  const categories = useMemo(() => Array.from(new Set(items.map((i) => i.category))).sort(), [items])

  const filtered = useMemo(
    () =>
      items.filter((i) => {
        const matchesQuery =
          i.name.toLowerCase().includes(query.toLowerCase()) || i.sku.toLowerCase().includes(query.toLowerCase())
        const matchesCategory = category === "all" || i.category === category
        return matchesQuery && matchesCategory
      }),
    [items, query, category],
  )

  return (
    <>
      <PageHeader
        title={t("page.items.title")}
        description={t("page.items.desc")}
        actions={
          can("manageInventory") && (
            <Button onClick={() => setAddOpen(true)}>
              <PackagePlus /> New item
            </Button>
          )
        }
      />

      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or SKU..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={category} onChange={(e) => setCategory(e.target.value)} className="sm:w-52">
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Item</TH>
              <TH>Category</TH>
              <TH className="text-right">Cost</TH>
              <TH className="text-right">Price</TH>
              <TH className="text-right">In stock</TH>
              <TH>Status</TH>
              {can("manageInventory") && <TH className="text-right">Actions</TH>}
            </TR>
          </THead>
          <TBody>
            {filtered.map((item) => {
              const status = stockTone(item)
              return (
                <TR key={item.id}>
                  <TD>
                    <div className="font-medium">{item.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{item.sku}</div>
                  </TD>
                  <TD className="text-muted-foreground">{item.category}</TD>
                  <TD className="text-right tabular-nums text-muted-foreground">{formatCurrency(item.costPrice)}</TD>
                  <TD className="text-right tabular-nums">{formatCurrency(item.sellingPrice)}</TD>
                  <TD className="text-right font-medium tabular-nums">
                    {formatNumber(itemStock(item))} <span className="text-xs text-muted-foreground">{item.unit}</span>
                  </TD>
                  <TD>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </TD>
                  {can("manageInventory") && (
                    <TD className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setAdjustItem(item)}>
                        <Pencil /> Adjust
                      </Button>
                    </TD>
                  )}
                </TR>
              )
            })}
            {filtered.length === 0 && (
              <TR className="hover:bg-transparent">
                <TD colSpan={7} className="py-10 text-center text-muted-foreground">
                  No items match your filters.
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </Card>

      {addOpen && <AddItemModal onClose={() => setAddOpen(false)} warehouses={warehouses} onCreate={createItem} />}
      {adjustItem && (
        <AdjustStockModal
          item={adjustItem}
          warehouses={warehouses}
          onClose={() => setAdjustItem(null)}
          onAdjust={adjustStock}
        />
      )}
    </>
  )
}

function AddItemModal({
  onClose,
  warehouses,
  onCreate,
}: {
  onClose: () => void
  warehouses: { id: string; name: string }[]
  onCreate: ReturnType<typeof useStore>["createItem"]
}) {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    unit: "pcs",
    costPrice: "",
    sellingPrice: "",
    reorderLevel: "",
    openingStock: "",
    warehouseId: warehouses[0]?.id ?? "",
  })

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const valid = form.name && form.sku && form.category

  const submit = () => {
    if (!valid) return
    onCreate({
      name: form.name,
      sku: form.sku,
      category: form.category,
      unit: form.unit,
      costPrice: Number(form.costPrice) || 0,
      sellingPrice: Number(form.sellingPrice) || 0,
      reorderLevel: Number(form.reorderLevel) || 0,
      openingStock: Number(form.openingStock) || 0,
      warehouseId: form.warehouseId,
    })
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="New item"
      description="Add a product to your catalog with opening stock."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!valid}>
            Create item
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Item name</Label>
          <Input value={form.name} onChange={set("name")} placeholder="e.g. Wireless Headphones" />
        </div>
        <div>
          <Label>SKU</Label>
          <Input value={form.sku} onChange={set("sku")} placeholder="AUD-WH-100" />
        </div>
        <div>
          <Label>Category</Label>
          <Input value={form.category} onChange={set("category")} placeholder="Audio" />
        </div>
        <div>
          <Label>Cost price</Label>
          <Input type="number" value={form.costPrice} onChange={set("costPrice")} placeholder="0.00" />
        </div>
        <div>
          <Label>Selling price</Label>
          <Input type="number" value={form.sellingPrice} onChange={set("sellingPrice")} placeholder="0.00" />
        </div>
        <div>
          <Label>Unit</Label>
          <Input value={form.unit} onChange={set("unit")} placeholder="pcs" />
        </div>
        <div>
          <Label>Reorder level</Label>
          <Input type="number" value={form.reorderLevel} onChange={set("reorderLevel")} placeholder="0" />
        </div>
        <div>
          <Label>Opening stock</Label>
          <Input type="number" value={form.openingStock} onChange={set("openingStock")} placeholder="0" />
        </div>
        <div>
          <Label>Warehouse</Label>
          <Select value={form.warehouseId} onChange={set("warehouseId")}>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </Modal>
  )
}

function AdjustStockModal({
  item,
  warehouses,
  onClose,
  onAdjust,
}: {
  item: Item
  warehouses: { id: string; name: string }[]
  onClose: () => void
  onAdjust: ReturnType<typeof useStore>["adjustStock"]
}) {
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? "")
  const [mode, setMode] = useState<"in" | "out">("in")
  const [qty, setQty] = useState("")
  const [reason, setReason] = useState("")

  const current = item.stockByWarehouse[warehouseId] ?? 0
  const delta = (mode === "in" ? 1 : -1) * (Number(qty) || 0)

  const submit = () => {
    if (!qty || !reason) return
    onAdjust(item.id, warehouseId, delta, reason)
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Adjust stock — ${item.name}`}
      description="Record a manual stock adjustment. This posts to the movement ledger."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!qty || !reason}>
            Post adjustment
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <Label>Warehouse</Label>
          <Select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} — {item.stockByWarehouse[w.id] ?? 0} {item.unit} on hand
              </option>
            ))}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Direction</Label>
            <Select value={mode} onChange={(e) => setMode(e.target.value as "in" | "out")}>
              <option value="in">Add stock (+)</option>
              <option value="out">Remove stock (-)</option>
            </Select>
          </div>
          <div>
            <Label>Quantity</Label>
            <Input type="number" min="0" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" />
          </div>
        </div>
        <div>
          <Label>Reason</Label>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Cycle count correction" />
        </div>
        <div className="rounded-lg bg-muted p-3 text-sm">
          <span className="text-muted-foreground">New quantity at this warehouse: </span>
          <span className="font-semibold tabular-nums">{Math.max(0, current + delta)}</span>
          <span className="text-muted-foreground"> {item.unit}</span>
        </div>
      </div>
    </Modal>
  )
}
