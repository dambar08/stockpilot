"use client"

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import {
  seedContacts,
  seedInvoices,
  seedItems,
  seedMovements,
  seedPayments,
  seedPurchaseOrders,
  seedSalesOrders,
  seedWarehouses,
} from "./seed"
import {
  documentTotal,
  type Contact,
  type Invoice,
  type InvoiceStatus,
  type Item,
  type LineItem,
  type Payment,
  type PaymentMode,
  type PurchaseOrder,
  type SalesOrder,
  type SalesOrderStatus,
  type StockMovement,
  type Warehouse,
} from "./types"

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

function pad(n: number, width = 5): string {
  return String(n).padStart(width, "0")
}

interface NewItemInput {
  sku: string
  name: string
  category: string
  unit: string
  costPrice: number
  sellingPrice: number
  reorderLevel: number
  openingStock: number
  warehouseId: string
}

interface NewContactInput {
  type: "customer" | "vendor"
  name: string
  company: string
  email: string
  phone: string
  city: string
}

interface NewOrderInput {
  contactId: string
  warehouseId: string
  date: string
  dueDate: string
  lineItems: LineItem[]
  notes?: string
}

interface StoreValue {
  warehouses: Warehouse[]
  items: Item[]
  contacts: Contact[]
  salesOrders: SalesOrder[]
  purchaseOrders: PurchaseOrder[]
  invoices: Invoice[]
  payments: Payment[]
  movements: StockMovement[]
  customers: Contact[]
  vendors: Contact[]
  createItem: (input: NewItemInput) => void
  updateItem: (id: string, patch: Partial<Item>) => void
  adjustStock: (itemId: string, warehouseId: string, delta: number, reason: string) => void
  createContact: (input: NewContactInput) => void
  createSalesOrder: (input: NewOrderInput) => void
  setSalesOrderStatus: (id: string, status: SalesOrderStatus) => void
  createPurchaseOrder: (input: NewOrderInput) => void
  receivePurchaseOrder: (id: string) => void
  convertSalesOrderToInvoice: (salesOrderId: string) => void
  recordPayment: (invoiceId: string, amount: number, mode: PaymentMode) => void
  contactName: (id: string) => string
  warehouseName: (id: string) => string
  itemById: (id: string) => Item | undefined
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(seedWarehouses)
  const [items, setItems] = useState<Item[]>(seedItems)
  const [contacts, setContacts] = useState<Contact[]>(seedContacts)
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>(seedSalesOrders)
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(seedPurchaseOrders)
  const [invoices, setInvoices] = useState<Invoice[]>(seedInvoices)
  const [payments, setPayments] = useState<Payment[]>(seedPayments)
  const [movements, setMovements] = useState<StockMovement[]>(seedMovements)

  const itemById = useCallback((id: string) => items.find((i) => i.id === id), [items])
  const contactName = useCallback((id: string) => contacts.find((c) => c.id === id)?.company ?? "Unknown", [contacts])
  const warehouseName = useCallback((id: string) => warehouses.find((w) => w.id === id)?.name ?? "Unknown", [warehouses])

  const createItem = useCallback((input: NewItemInput) => {
    setItems((prev) => [
      {
        id: uid("it"),
        sku: input.sku,
        name: input.name,
        category: input.category,
        unit: input.unit,
        costPrice: input.costPrice,
        sellingPrice: input.sellingPrice,
        reorderLevel: input.reorderLevel,
        stockByWarehouse: { [input.warehouseId]: input.openingStock },
        status: "active",
      },
      ...prev,
    ])
    if (input.openingStock > 0) {
      setMovements((prev) => [
        {
          id: uid("mv"),
          date: new Date().toISOString().slice(0, 10),
          itemId: input.sku,
          warehouseId: input.warehouseId,
          type: "adjustment_in",
          quantity: input.openingStock,
          reference: "OPENING",
          note: "Opening stock",
        },
        ...prev,
      ])
    }
  }, [])

  const updateItem = useCallback((id: string, patch: Partial<Item>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)))
  }, [])

  const adjustStock = useCallback((itemId: string, warehouseId: string, delta: number, reason: string) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== itemId) return i
        const current = i.stockByWarehouse[warehouseId] ?? 0
        return { ...i, stockByWarehouse: { ...i.stockByWarehouse, [warehouseId]: Math.max(0, current + delta) } }
      }),
    )
    setMovements((prev) => [
      {
        id: uid("mv"),
        date: new Date().toISOString().slice(0, 10),
        itemId,
        warehouseId,
        type: delta >= 0 ? "adjustment_in" : "adjustment_out",
        quantity: delta,
        reference: `ADJ-${pad(Math.floor(Math.random() * 9000) + 1000, 4)}`,
        note: reason,
      },
      ...prev,
    ])
  }, [])

  const createContact = useCallback((input: NewContactInput) => {
    setContacts((prev) => [{ id: uid(input.type === "customer" ? "cu" : "vn"), balance: 0, ...input }, ...prev])
  }, [])

  const createSalesOrder = useCallback((input: NewOrderInput) => {
    setSalesOrders((prev) => [
      {
        id: uid("so"),
        number: `SO-${pad(200 + prev.length)}`,
        customerId: input.contactId,
        warehouseId: input.warehouseId,
        date: input.date,
        expectedShipment: input.dueDate,
        status: "draft",
        lineItems: input.lineItems,
        notes: input.notes,
      },
      ...prev,
    ])
  }, [])

  const setSalesOrderStatus = useCallback((id: string, status: SalesOrderStatus) => {
    setSalesOrders((prev) =>
      prev.map((so) => {
        if (so.id !== id) return so
        if ((status === "shipped" || status === "delivered") && so.status !== "shipped" && so.status !== "delivered") {
          setItems((items) =>
            items.map((it) => {
              const line = so.lineItems.find((l) => l.itemId === it.id)
              if (!line) return it
              const current = it.stockByWarehouse[so.warehouseId] ?? 0
              return {
                ...it,
                stockByWarehouse: { ...it.stockByWarehouse, [so.warehouseId]: Math.max(0, current - line.quantity) },
              }
            }),
          )
          setMovements((prev) => [
            ...so.lineItems.map((l) => ({
              id: uid("mv"),
              date: new Date().toISOString().slice(0, 10),
              itemId: l.itemId,
              warehouseId: so.warehouseId,
              type: "sale" as const,
              quantity: -l.quantity,
              reference: so.number,
            })),
            ...prev,
          ])
        }
        return { ...so, status }
      }),
    )
  }, [])

  const createPurchaseOrder = useCallback((input: NewOrderInput) => {
    setPurchaseOrders((prev) => [
      {
        id: uid("po"),
        number: `PO-${pad(100 + prev.length)}`,
        vendorId: input.contactId,
        warehouseId: input.warehouseId,
        date: input.date,
        expectedDelivery: input.dueDate,
        status: "issued",
        lineItems: input.lineItems,
        notes: input.notes,
      },
      ...prev,
    ])
  }, [])

  const receivePurchaseOrder = useCallback((id: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id !== id || po.status === "received" || po.status === "billed") return po
        setItems((items) =>
          items.map((it) => {
            const line = po.lineItems.find((l) => l.itemId === it.id)
            if (!line) return it
            const current = it.stockByWarehouse[po.warehouseId] ?? 0
            return {
              ...it,
              stockByWarehouse: { ...it.stockByWarehouse, [po.warehouseId]: current + line.quantity },
            }
          }),
        )
        setMovements((mv) => [
          ...po.lineItems.map((l) => ({
            id: uid("mv"),
            date: new Date().toISOString().slice(0, 10),
            itemId: l.itemId,
            warehouseId: po.warehouseId,
            type: "purchase" as const,
            quantity: l.quantity,
            reference: po.number,
          })),
          ...mv,
        ])
        return { ...po, status: "received" }
      }),
    )
  }, [])

  const convertSalesOrderToInvoice = useCallback((salesOrderId: string) => {
    setSalesOrders((sos) => {
      const so = sos.find((s) => s.id === salesOrderId)
      if (so) {
        setInvoices((prev) => {
          if (prev.some((inv) => inv.salesOrderId === salesOrderId)) return prev
          const due = new Date(so.date)
          due.setDate(due.getDate() + 15)
          return [
            {
              id: uid("inv"),
              number: `INV-${pad(2316 + prev.length, 6)}`,
              customerId: so.customerId,
              salesOrderId: so.id,
              date: new Date().toISOString().slice(0, 10),
              dueDate: due.toISOString().slice(0, 10),
              status: "sent",
              lineItems: so.lineItems,
              amountPaid: 0,
            },
            ...prev,
          ]
        })
      }
      return sos
    })
  }, [])

  const recordPayment = useCallback((invoiceId: string, amount: number, mode: PaymentMode) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invoiceId) return inv
        const total = documentTotal(inv.lineItems)
        const paid = inv.amountPaid + amount
        let status: InvoiceStatus = inv.status
        if (paid >= total) status = "paid"
        else if (paid > 0) status = "partially_paid"
        setContacts((cs) => cs.map((c) => (c.id === inv.customerId ? { ...c, balance: Math.max(0, c.balance - amount) } : c)))
        setPayments((pms) => [
          {
            id: uid("pm"),
            number: `PMT-${pad(452 + pms.length, 4)}`,
            contactId: inv.customerId,
            invoiceId: inv.id,
            direction: "received",
            date: new Date().toISOString().slice(0, 10),
            amount,
            mode,
          },
          ...pms,
        ])
        return { ...inv, amountPaid: paid, status }
      }),
    )
  }, [])

  const customers = useMemo(() => contacts.filter((c) => c.type === "customer"), [contacts])
  const vendors = useMemo(() => contacts.filter((c) => c.type === "vendor"), [contacts])

  const value: StoreValue = {
    warehouses,
    items,
    contacts,
    salesOrders,
    purchaseOrders,
    invoices,
    payments,
    movements,
    customers,
    vendors,
    createItem,
    updateItem,
    adjustStock,
    createContact,
    createSalesOrder,
    setSalesOrderStatus,
    createPurchaseOrder,
    receivePurchaseOrder,
    convertSalesOrderToInvoice,
    recordPayment,
    contactName,
    warehouseName,
    itemById,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}
