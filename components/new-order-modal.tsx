"use client"

import { Button } from "@/components/ui/button"
import { Input, Label, Select, Textarea } from "@/components/ui/field"
import { Modal } from "@/components/ui/modal"
import { formatCurrency } from "@/lib/format"
import type { Contact, Item, LineItem, Warehouse } from "@/lib/types"
import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"

interface DraftLine {
  itemId: string
  quantity: number
  rate: number
}

export function NewOrderModal({
  variant,
  contacts,
  items,
  warehouses,
  onClose,
  onSubmit,
}: {
  variant: "sales" | "purchase"
  contacts: Contact[]
  items: Item[]
  warehouses: Warehouse[]
  onClose: () => void
  onSubmit: (input: {
    contactId: string
    warehouseId: string
    date: string
    dueDate: string
    lineItems: LineItem[]
    notes?: string
  }) => void
}) {
  const isSales = variant === "sales"
  const today = new Date().toISOString().slice(0, 10)
  const defaultDue = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10)

  const [contactId, setContactId] = useState(contacts[0]?.id ?? "")
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id ?? "")
  const [date, setDate] = useState(today)
  const [dueDate, setDueDate] = useState(defaultDue)
  const [notes, setNotes] = useState("")
  const [lines, setLines] = useState<DraftLine[]>([{ itemId: items[0]?.id ?? "", quantity: 1, rate: rateFor(items[0]) }])

  function rateFor(item?: Item): number {
    if (!item) return 0
    return isSales ? item.sellingPrice : item.costPrice
  }

  const addLine = () => setLines((l) => [...l, { itemId: items[0]?.id ?? "", quantity: 1, rate: rateFor(items[0]) }])
  const removeLine = (idx: number) => setLines((l) => l.filter((_, i) => i !== idx))

  const updateLine = (idx: number, patch: Partial<DraftLine>) =>
    setLines((l) =>
      l.map((line, i) => {
        if (i !== idx) return line
        const next = { ...line, ...patch }
        if (patch.itemId) next.rate = rateFor(items.find((it) => it.id === patch.itemId))
        return next
      }),
    )

  const total = lines.reduce((s, l) => s + l.quantity * l.rate, 0)
  const valid = contactId && warehouseId && lines.length > 0 && lines.every((l) => l.itemId && l.quantity > 0)

  const submit = () => {
    if (!valid) return
    onSubmit({
      contactId,
      warehouseId,
      date,
      dueDate,
      notes: notes || undefined,
      lineItems: lines.map((l) => ({
        itemId: l.itemId,
        name: items.find((it) => it.id === l.itemId)?.name ?? "",
        quantity: l.quantity,
        rate: l.rate,
      })),
    })
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={isSales ? "New sales order" : "New purchase order"}
      description={isSales ? "Create an order for a customer." : "Raise a purchase order to a vendor."}
      className="max-w-2xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!valid}>
            Create order
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label>{isSales ? "Customer" : "Vendor"}</Label>
            <Select value={contactId} onChange={(e) => setContactId(e.target.value)}>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company} — {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Warehouse</Label>
            <Select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>{isSales ? "Expected shipment" : "Expected delivery"}</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="mb-0">Line items</Label>
            <Button variant="ghost" size="sm" onClick={addLine}>
              <Plus /> Add line
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {lines.map((line, idx) => (
              <div key={idx} className="flex items-end gap-2 rounded-lg border border-border p-2">
                <div className="flex-1">
                  <Label className="text-[0.68rem]">Item</Label>
                  <Select value={line.itemId} onChange={(e) => updateLine(idx, { itemId: e.target.value })}>
                    {items.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="w-16">
                  <Label className="text-[0.68rem]">Qty</Label>
                  <Input
                    type="number"
                    min="1"
                    value={line.quantity}
                    onChange={(e) => updateLine(idx, { quantity: Number(e.target.value) })}
                  />
                </div>
                <div className="w-24">
                  <Label className="text-[0.68rem]">Rate</Label>
                  <Input
                    type="number"
                    min="0"
                    value={line.rate}
                    onChange={(e) => updateLine(idx, { rate: Number(e.target.value) })}
                  />
                </div>
                <div className="w-24 pb-2 text-right text-sm font-medium tabular-nums">
                  {formatCurrency(line.quantity * line.rate)}
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="mb-1"
                  onClick={() => removeLine(idx)}
                  disabled={lines.length === 1}
                  aria-label="Remove line"
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes for this order" />
        </div>

        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
          <span className="text-sm text-muted-foreground">Order total</span>
          <span className="text-lg font-semibold tabular-nums">{formatCurrency(total)}</span>
        </div>
      </div>
    </Modal>
  )
}
