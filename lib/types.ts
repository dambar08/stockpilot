export type Role = "admin" | "manager" | "staff"

export interface User {
  id: string
  name: string
  email: string
  role: Role
}

export interface Warehouse {
  id: string
  name: string
  code: string
  city: string
  country: string
  isPrimary: boolean
}

export interface Item {
  id: string
  sku: string
  name: string
  category: string
  unit: string
  costPrice: number
  sellingPrice: number
  reorderLevel: number
  /** quantity on hand per warehouse id */
  stockByWarehouse: Record<string, number>
  imageUrl?: string
  status: "active" | "inactive"
}

export interface Contact {
  id: string
  type: "customer" | "vendor"
  name: string
  company: string
  email: string
  phone: string
  city: string
  /** outstanding receivable (customer) or payable (vendor) */
  balance: number
}

export interface LineItem {
  itemId: string
  name: string
  quantity: number
  rate: number
}

export type SalesOrderStatus = "draft" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled"
export type PurchaseOrderStatus = "draft" | "issued" | "partially_received" | "received" | "billed" | "cancelled"
export type InvoiceStatus = "draft" | "sent" | "partially_paid" | "paid" | "overdue"

export interface SalesOrder {
  id: string
  number: string
  customerId: string
  warehouseId: string
  date: string
  expectedShipment: string
  status: SalesOrderStatus
  lineItems: LineItem[]
  notes?: string
}

export interface PurchaseOrder {
  id: string
  number: string
  vendorId: string
  warehouseId: string
  date: string
  expectedDelivery: string
  status: PurchaseOrderStatus
  lineItems: LineItem[]
  notes?: string
}

export interface Invoice {
  id: string
  number: string
  customerId: string
  salesOrderId?: string
  date: string
  dueDate: string
  status: InvoiceStatus
  lineItems: LineItem[]
  amountPaid: number
}

export type PaymentMode = "bank_transfer" | "credit_card" | "cash" | "cheque"

export interface Payment {
  id: string
  number: string
  contactId: string
  invoiceId?: string
  direction: "received" | "made"
  date: string
  amount: number
  mode: PaymentMode
}

export type MovementType = "purchase" | "sale" | "adjustment_in" | "adjustment_out" | "transfer"

export interface StockMovement {
  id: string
  date: string
  itemId: string
  warehouseId: string
  type: MovementType
  quantity: number
  reference: string
  note?: string
}

export function lineTotal(line: LineItem): number {
  return line.quantity * line.rate
}

export function documentTotal(lines: LineItem[]): number {
  return lines.reduce((sum, l) => sum + lineTotal(l), 0)
}

export function itemStock(item: Item): number {
  return Object.values(item.stockByWarehouse).reduce((a, b) => a + b, 0)
}
