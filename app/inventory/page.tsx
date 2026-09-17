"use client"

import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Card } from "@/components/ui/card"
import { Input, Select } from "@/components/ui/field"
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table"
import { useI18n } from "@/lib/i18n/context"
import { formatDate, formatNumber } from "@/lib/format"
import { useStore } from "@/lib/store"
import { Search } from "lucide-react"
import { useMemo, useState } from "react"

export default function InventoryLedgerPage() {
  const { movements, warehouses, itemById, warehouseName } = useStore()
  const { t } = useI18n()
  const [query, setQuery] = useState("")
  const [type, setType] = useState("all")
  const [warehouse, setWarehouse] = useState("all")

  const filtered = useMemo(
    () =>
      movements.filter((m) => {
        const item = itemById(m.itemId)
        const name = (item?.name ?? "") + (item?.sku ?? "") + m.reference
        const matchesQuery = name.toLowerCase().includes(query.toLowerCase())
        const matchesType = type === "all" || m.type === type
        const matchesWarehouse = warehouse === "all" || m.warehouseId === warehouse
        return matchesQuery && matchesType && matchesWarehouse
      }),
    [movements, query, type, warehouse, itemById],
  )

  return (
    <>
      <PageHeader
        title={t("page.movements.title")}
        description={t("page.movements.desc")}
      />

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by item, SKU, or reference..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={type} onChange={(e) => setType(e.target.value)} className="lg:w-48">
            <option value="all">All types</option>
            <option value="purchase">Purchase</option>
            <option value="sale">Sale</option>
            <option value="adjustment_in">Adjustment In</option>
            <option value="adjustment_out">Adjustment Out</option>
            <option value="transfer">Transfer</option>
          </Select>
          <Select value={warehouse} onChange={(e) => setWarehouse(e.target.value)} className="lg:w-48">
            <option value="all">All warehouses</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Date</TH>
              <TH>Item</TH>
              <TH>Warehouse</TH>
              <TH>Type</TH>
              <TH>Reference</TH>
              <TH>Note</TH>
              <TH className="text-right">Change</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((m) => {
              const item = itemById(m.itemId)
              return (
                <TR key={m.id}>
                  <TD className="whitespace-nowrap text-muted-foreground">{formatDate(m.date)}</TD>
                  <TD>
                    <div className="font-medium">{item?.name ?? m.itemId}</div>
                    {item && <div className="font-mono text-xs text-muted-foreground">{item.sku}</div>}
                  </TD>
                  <TD className="text-muted-foreground">{warehouseName(m.warehouseId)}</TD>
                  <TD>
                    <StatusBadge status={m.type} />
                  </TD>
                  <TD className="font-mono text-xs text-muted-foreground">{m.reference}</TD>
                  <TD className="text-muted-foreground">{m.note ?? "—"}</TD>
                  <TD
                    className={`text-right font-medium tabular-nums ${m.quantity >= 0 ? "text-success" : "text-destructive"}`}
                  >
                    {m.quantity >= 0 ? "+" : ""}
                    {formatNumber(m.quantity)}
                  </TD>
                </TR>
              )
            })}
            {filtered.length === 0 && (
              <TR className="hover:bg-transparent">
                <TD colSpan={7} className="py-10 text-center text-muted-foreground">
                  No movements match your filters.
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </Card>
    </>
  )
}
