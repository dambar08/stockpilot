"use client"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table"
import { useI18n } from "@/lib/i18n/context"
import { formatCurrency, formatNumber } from "@/lib/format"
import { useStore } from "@/lib/store"
import { Boxes, MapPin, Warehouse as WarehouseIcon } from "lucide-react"
import { useMemo } from "react"

export default function WarehousesPage() {
  const { warehouses, items } = useStore()
  const { t } = useI18n()

  const stats = useMemo(
    () =>
      warehouses.map((w) => {
        let units = 0
        let value = 0
        let skus = 0
        for (const item of items) {
          const qty = item.stockByWarehouse[w.id] ?? 0
          if (qty > 0) skus += 1
          units += qty
          value += qty * item.costPrice
        }
        return { warehouse: w, units, value, skus }
      }),
    [warehouses, items],
  )

  return (
    <>
      <PageHeader title={t("page.warehouses.title")} description={t("page.warehouses.desc")} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map(({ warehouse: w, units, value, skus }) => (
          <Card key={w.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <WarehouseIcon className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold tracking-tight">{w.name}</h3>
                    {w.isPrimary && <Badge tone="primary">Primary</Badge>}
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">{w.code}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5" />
              {w.city}, {w.country}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4">
              <div>
                <div className="text-lg font-semibold tabular-nums">{formatNumber(units)}</div>
                <div className="text-xs text-muted-foreground">units</div>
              </div>
              <div>
                <div className="text-lg font-semibold tabular-nums">{skus}</div>
                <div className="text-xs text-muted-foreground">SKUs</div>
              </div>
              <div>
                <div className="text-lg font-semibold tabular-nums">{formatCurrency(value)}</div>
                <div className="text-xs text-muted-foreground">value</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock distribution</CardTitle>
          <p className="text-sm text-muted-foreground">On-hand quantity per item across each warehouse</p>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH>Item</TH>
                {warehouses.map((w) => (
                  <TH key={w.id} className="text-right">
                    {w.code}
                  </TH>
                ))}
                <TH className="text-right">Total</TH>
              </TR>
            </THead>
            <TBody>
              {items.map((item) => {
                const total = warehouses.reduce((s, w) => s + (item.stockByWarehouse[w.id] ?? 0), 0)
                return (
                  <TR key={item.id}>
                    <TD>
                      <div className="font-medium">{item.name}</div>
                      <div className="font-mono text-xs text-muted-foreground">{item.sku}</div>
                    </TD>
                    {warehouses.map((w) => {
                      const qty = item.stockByWarehouse[w.id] ?? 0
                      return (
                        <TD key={w.id} className="text-right tabular-nums">
                          <span className="flex items-center justify-end gap-1.5">
                            <Boxes className="size-3.5 text-muted-foreground" />
                            {formatNumber(qty)}
                          </span>
                        </TD>
                      )
                    })}
                    <TD className="text-right font-semibold tabular-nums">{formatNumber(total)}</TD>
                  </TR>
                )
              })}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </>
  )
}
