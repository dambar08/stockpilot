"use client"

import { NewOrderModal } from "@/components/new-order-modal"
import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select } from "@/components/ui/field"
import { Modal } from "@/components/ui/modal"
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table"
import { useAuth } from "@/lib/auth"
import { useI18n } from "@/lib/i18n/context"
import { formatCurrency, formatDate } from "@/lib/format"
import { useStore } from "@/lib/store"
import { documentTotal, type SalesOrder, type SalesOrderStatus } from "@/lib/types"
import { CircleCheck, FileText, Plus, ShoppingCart } from "lucide-react"
import { useMemo, useState } from "react"

const SO_STATUSES: SalesOrderStatus[] = ["draft", "confirmed", "packed", "shipped", "delivered", "cancelled"]

export default function SalesOrdersPage() {
  const { can } = useAuth()
  const { t } = useI18n()
  const { salesOrders, customers, items, warehouses, createSalesOrder, contactName } = useStore()
  const [statusFilter, setStatusFilter] = useState("all")
  const [newOpen, setNewOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)

  const filtered = useMemo(
    () => salesOrders.filter((so) => statusFilter === "all" || so.status === statusFilter),
    [salesOrders, statusFilter],
  )

  const openCount = salesOrders.filter((s) => s.status !== "delivered" && s.status !== "cancelled").length
  const pipelineValue = salesOrders
    .filter((s) => s.status !== "delivered" && s.status !== "cancelled")
    .reduce((s, so) => s + documentTotal(so.lineItems), 0)
  const deliveredCount = salesOrders.filter((s) => s.status === "delivered").length

  const detailOrder = salesOrders.find((s) => s.id === detailId) ?? null

  return (
    <>
      <PageHeader
        title={t("page.salesOrders.title")}
        description={t("page.salesOrders.desc")}
        actions={
          can("manageSales") && (
            <Button onClick={() => setNewOpen(true)}>
              <Plus /> New sales order
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Open orders" value={String(openCount)} icon={ShoppingCart} tone="primary" />
        <StatCard label="Pipeline value" value={formatCurrency(pipelineValue)} icon={FileText} tone="success" />
        <StatCard label="Delivered" value={String(deliveredCount)} icon={CircleCheck} tone="success" />
      </div>

      <Card className="p-4">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-52">
          <option value="all">All statuses</option>
          {SO_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </Select>
      </Card>

      <Card>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Order</TH>
              <TH>Customer</TH>
              <TH>Date</TH>
              <TH>Expected</TH>
              <TH className="text-right">Total</TH>
              <TH>Status</TH>
              <TH className="text-right">Action</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((so) => (
              <TR key={so.id}>
                <TD className="font-mono text-sm font-medium">{so.number}</TD>
                <TD>{contactName(so.customerId)}</TD>
                <TD className="whitespace-nowrap text-muted-foreground">{formatDate(so.date)}</TD>
                <TD className="whitespace-nowrap text-muted-foreground">{formatDate(so.expectedShipment)}</TD>
                <TD className="text-right font-medium tabular-nums">{formatCurrency(documentTotal(so.lineItems))}</TD>
                <TD>
                  <StatusBadge status={so.status} />
                </TD>
                <TD className="text-right">
                  <Button variant="outline" size="sm" onClick={() => setDetailId(so.id)}>
                    View
                  </Button>
                </TD>
              </TR>
            ))}
            {filtered.length === 0 && (
              <TR className="hover:bg-transparent">
                <TD colSpan={7} className="py-10 text-center text-muted-foreground">
                  No sales orders found.
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </Card>

      {newOpen && (
        <NewOrderModal
          variant="sales"
          contacts={customers}
          items={items}
          warehouses={warehouses}
          onClose={() => setNewOpen(false)}
          onSubmit={createSalesOrder}
        />
      )}
      {detailOrder && <SalesOrderDetail order={detailOrder} onClose={() => setDetailId(null)} />}
    </>
  )
}

function SalesOrderDetail({ order, onClose }: { order: SalesOrder; onClose: () => void }) {
  const { can } = useAuth()
  const { contactName, warehouseName, setSalesOrderStatus, convertSalesOrderToInvoice, invoices } = useStore()
  const hasInvoice = invoices.some((inv) => inv.salesOrderId === order.id)
  const total = documentTotal(order.lineItems)
  const canConvert = !hasInvoice && (order.status === "confirmed" || order.status === "shipped" || order.status === "delivered" || order.status === "packed")

  return (
    <Modal
      open
      onClose={onClose}
      title={order.number}
      description={`${contactName(order.customerId)} · ${warehouseName(order.warehouseId)}`}
      className="max-w-2xl"
      footer={
        can("manageSales") ? (
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Status</span>
              <Select
                value={order.status}
                onChange={(e) => setSalesOrderStatus(order.id, e.target.value as SalesOrderStatus)}
                className="w-40"
              >
                {SO_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </Select>
            </div>
            <Button onClick={() => convertSalesOrderToInvoice(order.id)} disabled={!canConvert}>
              <FileText /> {hasInvoice ? "Invoiced" : "Convert to invoice"}
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Order date</div>
            <div className="font-medium">{formatDate(order.date)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Expected shipment</div>
            <div className="font-medium">{formatDate(order.expectedShipment)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Status</div>
            <StatusBadge status={order.status} />
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH>Item</TH>
                <TH className="text-right">Qty</TH>
                <TH className="text-right">Rate</TH>
                <TH className="text-right">Amount</TH>
              </TR>
            </THead>
            <TBody>
              {order.lineItems.map((l) => (
                <TR key={l.itemId} className="hover:bg-transparent">
                  <TD className="font-medium">{l.name}</TD>
                  <TD className="text-right tabular-nums">{l.quantity}</TD>
                  <TD className="text-right tabular-nums text-muted-foreground">{formatCurrency(l.rate)}</TD>
                  <TD className="text-right font-medium tabular-nums">{formatCurrency(l.quantity * l.rate)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>

        {order.notes && (
          <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">{order.notes}</p>
        )}

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-lg font-semibold tabular-nums">{formatCurrency(total)}</span>
        </div>
      </div>
    </Modal>
  )
}
