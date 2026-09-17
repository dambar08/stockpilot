"use client"

import { CategoryDonut, MovementAreaChart, WarehouseBarChart } from "@/components/dashboard/charts"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table"
import { useAuth } from "@/lib/auth"
import { useI18n } from "@/lib/i18n/context"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"
import { useStore } from "@/lib/store"
import { documentTotal, itemStock } from "@/lib/types"
import { Boxes, DollarSign, ShoppingCart, TriangleAlert } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"

export default function DashboardPage() {
  const { can } = useAuth()
  const { t } = useI18n()
  const { items, warehouses, salesOrders, customers, vendors, movements, itemById, warehouseName } = useStore()

  const metrics = useMemo(() => {
    const inventoryValue = items.reduce((s, i) => s + itemStock(i) * i.costPrice, 0)
    const retailValue = items.reduce((s, i) => s + itemStock(i) * i.sellingPrice, 0)
    const lowStock = items.filter((i) => itemStock(i) <= i.reorderLevel)
    const openOrders = salesOrders.filter((s) => s.status !== "delivered" && s.status !== "cancelled")
    const openOrdersValue = openOrders.reduce((s, so) => s + documentTotal(so.lineItems), 0)
    const receivables = customers.reduce((s, c) => s + c.balance, 0)
    const payables = vendors.reduce((s, v) => s + v.balance, 0)
    const totalUnits = items.reduce((s, i) => s + itemStock(i), 0)
    return { inventoryValue, retailValue, lowStock, openOrders, openOrdersValue, receivables, payables, totalUnits }
  }, [items, salesOrders, customers, vendors])

  const movementData = useMemo(() => {
    const days: { day: string; inbound: number; outbound: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      const dayMoves = movements.filter((m) => m.date === key)
      const inbound = dayMoves.filter((m) => m.quantity > 0).reduce((s, m) => s + m.quantity, 0)
      const outbound = dayMoves.filter((m) => m.quantity < 0).reduce((s, m) => s - m.quantity, 0)
      days.push({ day: label, inbound, outbound })
    }
    return days
  }, [movements])

  const warehouseData = useMemo(
    () =>
      warehouses.map((w) => ({
        name: w.code,
        units: items.reduce((s, i) => s + (i.stockByWarehouse[w.id] ?? 0), 0),
      })),
    [warehouses, items],
  )

  const categoryData = useMemo(() => {
    const map = new Map<string, number>()
    for (const i of items) {
      map.set(i.category, (map.get(i.category) ?? 0) + itemStock(i) * i.costPrice)
    }
    return Array.from(map, ([name, value]) => ({ name, value: Math.round(value) })).sort((a, b) => b.value - a.value)
  }, [items])

  const recentMovements = useMemo(() => movements.slice(0, 6), [movements])

  return (
    <>
      <PageHeader title={t("page.dashboard.title")} description={t("page.dashboard.desc")} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t("dash.kpi.invValue")}
          value={formatCurrency(metrics.inventoryValue)}
          icon={DollarSign}
          trend={{ value: "8.2%", up: true }}
          hint={t("dash.kpi.invValueHint")}
        />
        <StatCard
          label={t("dash.kpi.units")}
          value={formatNumber(metrics.totalUnits)}
          icon={Boxes}
          hint={t("dash.kpi.unitsHint", { count: warehouses.length })}
          tone="primary"
        />
        <StatCard
          label={t("dash.kpi.openOrders")}
          value={String(metrics.openOrders.length)}
          icon={ShoppingCart}
          hint={t("dash.kpi.openOrdersHint", { amount: formatCurrency(metrics.openOrdersValue) })}
          tone="success"
        />
        <StatCard
          label={t("dash.kpi.lowStock")}
          value={String(metrics.lowStock.length)}
          icon={TriangleAlert}
          hint={t("dash.kpi.lowStockHint")}
          tone={metrics.lowStock.length > 0 ? "warning" : "success"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>{t("dash.movement.title")}</CardTitle>
              <p className="text-sm text-muted-foreground">{t("dash.movement.subtitle")}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-chart-1" /> {t("dash.movement.inbound")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-chart-2" /> {t("dash.movement.outbound")}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <MovementAreaChart data={movementData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dash.category.title")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("dash.category.subtitle")}</p>
          </CardHeader>
          <CardContent>
            <CategoryDonut data={categoryData} />
            <div className="mt-2 flex flex-col gap-1.5">
              {categoryData.slice(0, 5).map((c, i) => (
                <div key={c.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: `var(--chart-${(i % 5) + 1})` }}
                    />
                    {c.name}
                  </span>
                  <span className="font-medium tabular-nums">{formatCurrency(c.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("dash.warehouse.title")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("dash.warehouse.subtitle")}</p>
          </CardHeader>
          <CardContent>
            <WarehouseBarChart data={warehouseData} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{t("dash.low.title")}</CardTitle>
            <Link href="/items" className="text-xs font-medium text-primary hover:underline">
              {t("dash.low.viewAll")}
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {metrics.lowStock.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t("dash.low.empty")}</p>
            ) : (
              <Table>
                <THead>
                  <TR className="hover:bg-transparent">
                    <TH>{t("dash.low.item")}</TH>
                    <TH className="text-right">{t("dash.low.inStock")}</TH>
                    <TH className="text-right">{t("dash.low.reorderAt")}</TH>
                    <TH className="text-right">{t("dash.low.shortfall")}</TH>
                  </TR>
                </THead>
                <TBody>
                  {metrics.lowStock.map((i) => (
                    <TR key={i.id}>
                      <TD>
                        <div className="font-medium">{i.name}</div>
                        <div className="text-xs text-muted-foreground">{i.sku}</div>
                      </TD>
                      <TD className="text-right tabular-nums">{formatNumber(itemStock(i))}</TD>
                      <TD className="text-right tabular-nums text-muted-foreground">{formatNumber(i.reorderLevel)}</TD>
                      <TD className="text-right font-medium tabular-nums text-destructive">
                        {formatNumber(Math.max(0, i.reorderLevel - itemStock(i)))}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>{t("dash.recent.title")}</CardTitle>
          {can("manageInventory") && (
            <Link href="/inventory" className="text-xs font-medium text-primary hover:underline">
              {t("dash.recent.viewLedger")}
            </Link>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH>{t("dash.recent.date")}</TH>
                <TH>{t("dash.recent.item")}</TH>
                <TH>{t("dash.recent.warehouse")}</TH>
                <TH>{t("dash.recent.reference")}</TH>
                <TH className="text-right">{t("dash.recent.change")}</TH>
              </TR>
            </THead>
            <TBody>
              {recentMovements.map((m) => {
                const item = itemById(m.itemId)
                return (
                  <TR key={m.id}>
                    <TD className="whitespace-nowrap text-muted-foreground">{formatDate(m.date)}</TD>
                    <TD className="font-medium">{item?.name ?? m.itemId}</TD>
                    <TD className="text-muted-foreground">{warehouseName(m.warehouseId)}</TD>
                    <TD>
                      <StatusBadge status={m.type} />
                      <span className="ml-2 text-xs text-muted-foreground">{m.reference}</span>
                    </TD>
                    <TD
                      className={`text-right font-medium tabular-nums ${m.quantity >= 0 ? "text-success" : "text-destructive"}`}
                    >
                      {m.quantity >= 0 ? "+" : ""}
                      {formatNumber(m.quantity)}
                    </TD>
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
