"use client"

import { CategoryDonut, WarehouseBarChart } from "@/components/dashboard/charts"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table"
import { useI18n } from "@/lib/i18n/context"
import { daysUntil, formatCurrency, formatNumber } from "@/lib/format"
import { useStore } from "@/lib/store"
import { documentTotal, itemStock } from "@/lib/types"
import { DollarSign, Package, TrendingUp, Wallet } from "lucide-react"
import { useMemo } from "react"

export default function ReportsPage() {
  const { items, invoices, salesOrders, itemById } = useStore()
  const { t } = useI18n()

  const valuation = useMemo(() => {
    const cost = items.reduce((s, i) => s + itemStock(i) * i.costPrice, 0)
    const retail = items.reduce((s, i) => s + itemStock(i) * i.sellingPrice, 0)
    return { cost, retail, margin: retail - cost }
  }, [items])

  const revenueByCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const inv of invoices) {
      for (const l of inv.lineItems) {
        const cat = itemById(l.itemId)?.category ?? "Other"
        map.set(cat, (map.get(cat) ?? 0) + l.quantity * l.rate)
      }
    }
    return Array.from(map, ([name, value]) => ({ name, value: Math.round(value) })).sort((a, b) => b.value - a.value)
  }, [invoices, itemById])

  const topItems = useMemo(() => {
    const map = new Map<string, { name: string; units: number; revenue: number }>()
    for (const so of salesOrders) {
      for (const l of so.lineItems) {
        const prev = map.get(l.itemId) ?? { name: l.name, units: 0, revenue: 0 }
        prev.units += l.quantity
        prev.revenue += l.quantity * l.rate
        map.set(l.itemId, prev)
      }
    }
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 6)
  }, [salesOrders])

  const topItemsChart = topItems.map((i) => ({ name: i.name.split(" ")[0], units: i.revenue }))

  const aging = useMemo(() => {
    const buckets = { current: 0, d30: 0, d60: 0, older: 0 }
    for (const inv of invoices) {
      const balance = documentTotal(inv.lineItems) - inv.amountPaid
      if (balance <= 0) continue
      const overdueDays = -daysUntil(inv.dueDate)
      if (overdueDays <= 0) buckets.current += balance
      else if (overdueDays <= 30) buckets.d30 += balance
      else if (overdueDays <= 60) buckets.d60 += balance
      else buckets.older += balance
    }
    return buckets
  }, [invoices])

  const totalReceivable = aging.current + aging.d30 + aging.d60 + aging.older

  return (
    <>
      <PageHeader title={t("page.reports.title")} description={t("page.reports.desc")} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Inventory at cost" value={formatCurrency(valuation.cost)} icon={Package} />
        <StatCard label="Inventory at retail" value={formatCurrency(valuation.retail)} icon={DollarSign} tone="primary" />
        <StatCard label="Potential margin" value={formatCurrency(valuation.margin)} icon={TrendingUp} tone="success" />
        <StatCard label="Total receivable" value={formatCurrency(totalReceivable)} icon={Wallet} tone="warning" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top items by order revenue</CardTitle>
            <p className="text-sm text-muted-foreground">Revenue booked across all sales orders</p>
          </CardHeader>
          <CardContent>
            <WarehouseBarChart data={topItemsChart} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by category</CardTitle>
            <p className="text-sm text-muted-foreground">Invoiced amount per category</p>
          </CardHeader>
          <CardContent>
            <CategoryDonut data={revenueByCategory} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receivables aging</CardTitle>
            <p className="text-sm text-muted-foreground">Outstanding balances by overdue period</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col gap-3">
              {[
                { label: "Current", value: aging.current, tone: "bg-success" },
                { label: "1–30 days", value: aging.d30, tone: "bg-warning" },
                { label: "31–60 days", value: aging.d60, tone: "bg-chart-5" },
                { label: "60+ days", value: aging.older, tone: "bg-destructive" },
              ].map((bucket) => {
                const pct = totalReceivable > 0 ? (bucket.value / totalReceivable) * 100 : 0
                return (
                  <div key={bucket.label} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{bucket.label}</span>
                      <span className="font-medium tabular-nums">{formatCurrency(bucket.value)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className={`h-full rounded-full ${bucket.tone}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top selling items</CardTitle>
            <p className="text-sm text-muted-foreground">Ranked by revenue across sales orders</p>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <THead>
                <TR className="hover:bg-transparent">
                  <TH>Item</TH>
                  <TH className="text-right">Units</TH>
                  <TH className="text-right">Revenue</TH>
                </TR>
              </THead>
              <TBody>
                {topItems.map((i) => (
                  <TR key={i.name}>
                    <TD className="font-medium">{i.name}</TD>
                    <TD className="text-right tabular-nums">{formatNumber(i.units)}</TD>
                    <TD className="text-right font-medium tabular-nums">{formatCurrency(i.revenue)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
