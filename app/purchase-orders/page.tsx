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
import { documentTotal, type PurchaseOrder, type PurchaseOrderStatus } from "@/lib/types"
import { ClipboardList, PackageCheck, Plus, Truck } from "lucide-react"
import { useMemo, useState } from "react"

const PO_STATUSES: PurchaseOrderStatus[] = ["draft", "issued", "partially_received", "received", "billed", "cancelled"]

export default function PurchaseOrdersPage() {
  const { can } = useAuth()
  const { t } = useI18n()
  const { purchaseOrders, vendors, items, warehouses, createPurchaseOrder, contactName } = useStore()
  const [statusFilter, setStatusFilter] = useState("all")
  const [newOpen, setNewOpen] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)

  const filtered = useMemo(
    () => purchaseOrders.filter((po) => statusFilter === "all" || po.status === statusFilter),
    [purchaseOrders, statusFilter],
  )

  const openPos = purchaseOrders.filter((p) => p.status !== "received" && p.status !== "billed" && p.status !== "cancelled")
  const onOrderValue = openPos.reduce((s, po) => s + documentTotal(po.lineItems), 0)
  const receivedCount = purchaseOrders.filter((p) => p.status === "received" || p.status === "billed").length

  const detailOrder = purchaseOrders.find((p) => p.id === detailId) ?? null

  return (
    <>
      <PageHeader
        title={t("page.purchaseOrders.title")}
        description={t("page.purchaseOrders.desc")}
        actions={
          can("managePurchases") && (
            <Button onClick={() => setNewOpen(true)}>
              <Plus /> New purchase order
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Open POs" value={String(openPos.length)} icon={ClipboardList} tone="primary" />
        <StatCard label="On-order value" value={formatCurrency(onOrderValue)} icon={Truck} tone="warning" />
        <StatCard label="Received" value={String(receivedCount)} icon={PackageCheck} tone="success" />
      </div>

      <Card className="p-4">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-56">
          <option value="all">All statuses</option>
          {PO_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ")}
            </option>
          ))}
        </Select>
      </Card>

      <Card>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Order</TH>
              <TH>Vendor</TH>
              <TH>Date</TH>
              <TH>Expected</TH>
              <TH className="text-right">Total</TH>
              <TH>Status</TH>
              <TH className="text-right">Action</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((po) => (
              <TR key={po.id}>
                <TD className="font-mono text-sm font-medium">{po.number}</TD>
                <TD>{contactName(po.vendorId)}</TD>
                <TD className="whitespace-nowrap text-muted-foreground">{formatDate(po.date)}</TD>
                <TD className="whitespace-nowrap text-muted-foreground">{formatDate(po.expectedDelivery)}</TD>
                <TD className="text-right font-medium tabular-nums">{formatCurrency(documentTotal(po.lineItems))}</TD>
                <TD>
                  <StatusBadge status={po.status} />
                </TD>
                <TD className="text-right">
                  <Button variant="outline" size="sm" onClick={() => setDetailId(po.id)}>
                    View
                  </Button>
                </TD>
              </TR>
            ))}
            {filtered.length === 0 && (
              <TR className="hover:bg-transparent">
                <TD colSpan={7} className="py-10 text-center text-muted-foreground">
                  No purchase orders found.
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </Card>

      {newOpen && (
        <NewOrderModal
          variant="purchase"
          contacts={vendors}
          items={items}
          warehouses={warehouses}
          onClose={() => setNewOpen(false)}
          onSubmit={createPurchaseOrder}
        />
      )}
      {detailOrder && <PurchaseOrderDetail order={detailOrder} onClose={() => setDetailId(null)} />}
    </>
  )
}

function PurchaseOrderDetail({ order, onClose }: { order: PurchaseOrder; onClose: () => void }) {
  const { can } = useAuth()
  const { contactName, warehouseName, receivePurchaseOrder } = useStore()
  const total = documentTotal(order.lineItems)
  const canReceive = order.status !== "received" && order.status !== "billed" && order.status !== "cancelled"

  return (
    <Modal
      open
      onClose={onClose}
      title={order.number}
      description={`${contactName(order.vendorId)} · receive into ${warehouseName(order.warehouseId)}`}
      className="max-w-2xl"
      footer={
        can("managePurchases") ? (
          <>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={() => {
                receivePurchaseOrder(order.id)
                onClose()
              }}
              disabled={!canReceive}
            >
              <PackageCheck /> {canReceive ? "Receive stock" : "Received"}
            </Button>
          </>
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
            <div className="text-xs text-muted-foreground">Expected delivery</div>
            <div className="font-medium">{formatDate(order.expectedDelivery)}</div>
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

        {order.notes && <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">{order.notes}</p>}

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="text-lg font-semibold tabular-nums">{formatCurrency(total)}</span>
        </div>
      </div>
    </Modal>
  )
}
