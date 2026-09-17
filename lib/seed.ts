import type {
  Contact,
  Invoice,
  Item,
  Payment,
  PurchaseOrder,
  SalesOrder,
  StockMovement,
  User,
  Warehouse,
} from "./types"

export const seedUsers: User[] = [
  { id: "u_admin", name: "Alex Rivera", email: "alex@northpeak.co", role: "admin" },
  { id: "u_manager", name: "Priya Nair", email: "priya@northpeak.co", role: "manager" },
  { id: "u_staff", name: "Sam Cole", email: "sam@northpeak.co", role: "staff" },
]

export const seedWarehouses: Warehouse[] = [
  { id: "wh_main", name: "Main Distribution Center", code: "MDC", city: "Austin", country: "USA", isPrimary: true },
  { id: "wh_east", name: "East Coast Hub", code: "ECH", city: "Newark", country: "USA", isPrimary: false },
  { id: "wh_west", name: "West Coast Hub", code: "WCH", city: "Oakland", country: "USA", isPrimary: false },
]

export const seedItems: Item[] = [
  {
    id: "it_1", sku: "AUD-WH-100", name: "Aurora Wireless Headphones", category: "Audio", unit: "pcs",
    costPrice: 48, sellingPrice: 129, reorderLevel: 40,
    stockByWarehouse: { wh_main: 120, wh_east: 34, wh_west: 60 }, status: "active",
  },
  {
    id: "it_2", sku: "AUD-SPK-220", name: "Pulse Portable Speaker", category: "Audio", unit: "pcs",
    costPrice: 32, sellingPrice: 89, reorderLevel: 30,
    stockByWarehouse: { wh_main: 18, wh_east: 8, wh_west: 12 }, status: "active",
  },
  {
    id: "it_3", sku: "WCH-SMT-300", name: "Nimbus Smartwatch", category: "Wearables", unit: "pcs",
    costPrice: 74, sellingPrice: 199, reorderLevel: 25,
    stockByWarehouse: { wh_main: 64, wh_east: 22, wh_west: 30 }, status: "active",
  },
  {
    id: "it_4", sku: "CAB-USB-410", name: "USB-C Braided Cable 2m", category: "Accessories", unit: "pcs",
    costPrice: 3.5, sellingPrice: 14, reorderLevel: 200,
    stockByWarehouse: { wh_main: 540, wh_east: 210, wh_west: 320 }, status: "active",
  },
  {
    id: "it_5", sku: "PWR-BNK-500", name: "Voltcore 20K Power Bank", category: "Power", unit: "pcs",
    costPrice: 21, sellingPrice: 59, reorderLevel: 50,
    stockByWarehouse: { wh_main: 44, wh_east: 6, wh_west: 0 }, status: "active",
  },
  {
    id: "it_6", sku: "HUB-USB-610", name: "Meridian 7-Port USB Hub", category: "Accessories", unit: "pcs",
    costPrice: 12, sellingPrice: 39, reorderLevel: 60,
    stockByWarehouse: { wh_main: 88, wh_east: 40, wh_west: 52 }, status: "active",
  },
  {
    id: "it_7", sku: "KEY-MEC-700", name: "Tactile Mechanical Keyboard", category: "Peripherals", unit: "pcs",
    costPrice: 41, sellingPrice: 119, reorderLevel: 35,
    stockByWarehouse: { wh_main: 51, wh_east: 18, wh_west: 27 }, status: "active",
  },
  {
    id: "it_8", sku: "MOU-ERG-800", name: "Contour Ergonomic Mouse", category: "Peripherals", unit: "pcs",
    costPrice: 16, sellingPrice: 49, reorderLevel: 45,
    stockByWarehouse: { wh_main: 12, wh_east: 4, wh_west: 9 }, status: "active",
  },
  {
    id: "it_9", sku: "CAM-WEB-900", name: "ClearView 4K Webcam", category: "Video", unit: "pcs",
    costPrice: 38, sellingPrice: 109, reorderLevel: 30,
    stockByWarehouse: { wh_main: 73, wh_east: 25, wh_west: 33 }, status: "active",
  },
  {
    id: "it_10", sku: "STD-LAP-950", name: "Altitude Laptop Stand", category: "Accessories", unit: "pcs",
    costPrice: 9, sellingPrice: 34, reorderLevel: 80,
    stockByWarehouse: { wh_main: 140, wh_east: 55, wh_west: 70 }, status: "active",
  },
  {
    id: "it_11", sku: "MIC-USB-970", name: "Studio USB Microphone", category: "Audio", unit: "pcs",
    costPrice: 44, sellingPrice: 139, reorderLevel: 20,
    stockByWarehouse: { wh_main: 5, wh_east: 2, wh_west: 0 }, status: "active",
  },
  {
    id: "it_12", sku: "LGT-RNG-980", name: "Halo Ring Light 18in", category: "Video", unit: "pcs",
    costPrice: 19, sellingPrice: 64, reorderLevel: 40,
    stockByWarehouse: { wh_main: 96, wh_east: 30, wh_west: 41 }, status: "active",
  },
]

export const seedContacts: Contact[] = [
  { id: "cu_1", type: "customer", name: "Dana Whitfield", company: "BrightRetail Inc.", email: "dana@brightretail.com", phone: "+1 512 555 0182", city: "Austin", balance: 4820 },
  { id: "cu_2", type: "customer", name: "Marcus Lee", company: "Urban Gadgets", email: "marcus@urbangadgets.com", phone: "+1 646 555 0110", city: "New York", balance: 12750 },
  { id: "cu_3", type: "customer", name: "Sofia Romero", company: "TechNest LLC", email: "sofia@technest.io", phone: "+1 415 555 0144", city: "San Francisco", balance: 0 },
  { id: "cu_4", type: "customer", name: "Liam Patel", company: "Peak Outfitters", email: "liam@peakoutfitters.com", phone: "+1 303 555 0166", city: "Denver", balance: 2310 },
  { id: "cu_5", type: "customer", name: "Grace Kim", company: "Nova Electronics", email: "grace@novaelec.com", phone: "+1 206 555 0199", city: "Seattle", balance: 8640 },
  { id: "vn_1", type: "vendor", name: "Henry Fontaine", company: "Shenzhen SoundWorks", email: "henry@ssoundworks.com", phone: "+86 755 8888 0001", city: "Shenzhen", balance: 15400 },
  { id: "vn_2", type: "vendor", name: "Isabel Cruz", company: "CablePro Manufacturing", email: "isabel@cablepro.com", phone: "+1 213 555 0233", city: "Los Angeles", balance: 3200 },
  { id: "vn_3", type: "vendor", name: "Omar Haddad", company: "PowerCell Industries", email: "omar@powercell.com", phone: "+1 312 555 0277", city: "Chicago", balance: 9850 },
  { id: "vn_4", type: "vendor", name: "Yuki Tanaka", company: "Precision Peripherals Co.", email: "yuki@precisionp.jp", phone: "+81 3 5555 0300", city: "Tokyo", balance: 0 },
]

const today = new Date()
function iso(offsetDays: number): string {
  const d = new Date(today)
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

export const seedSalesOrders: SalesOrder[] = [
  {
    id: "so_1", number: "SO-00142", customerId: "cu_2", warehouseId: "wh_east", date: iso(-6), expectedShipment: iso(1),
    status: "confirmed",
    lineItems: [
      { itemId: "it_1", name: "Aurora Wireless Headphones", quantity: 20, rate: 129 },
      { itemId: "it_4", name: "USB-C Braided Cable 2m", quantity: 50, rate: 14 },
    ],
  },
  {
    id: "so_2", number: "SO-00143", customerId: "cu_1", warehouseId: "wh_main", date: iso(-4), expectedShipment: iso(-1),
    status: "shipped",
    lineItems: [
      { itemId: "it_3", name: "Nimbus Smartwatch", quantity: 10, rate: 199 },
      { itemId: "it_7", name: "Tactile Mechanical Keyboard", quantity: 8, rate: 119 },
    ],
  },
  {
    id: "so_3", number: "SO-00144", customerId: "cu_5", warehouseId: "wh_west", date: iso(-3), expectedShipment: iso(2),
    status: "packed",
    lineItems: [
      { itemId: "it_9", name: "ClearView 4K Webcam", quantity: 15, rate: 109 },
      { itemId: "it_12", name: "Halo Ring Light 18in", quantity: 15, rate: 64 },
    ],
  },
  {
    id: "so_4", number: "SO-00145", customerId: "cu_4", warehouseId: "wh_main", date: iso(-1), expectedShipment: iso(4),
    status: "draft",
    lineItems: [
      { itemId: "it_5", name: "Voltcore 20K Power Bank", quantity: 30, rate: 59 },
    ],
  },
  {
    id: "so_5", number: "SO-00146", customerId: "cu_3", warehouseId: "wh_main", date: iso(-10), expectedShipment: iso(-6),
    status: "delivered",
    lineItems: [
      { itemId: "it_6", name: "Meridian 7-Port USB Hub", quantity: 40, rate: 39 },
      { itemId: "it_10", name: "Altitude Laptop Stand", quantity: 25, rate: 34 },
    ],
  },
]

export const seedPurchaseOrders: PurchaseOrder[] = [
  {
    id: "po_1", number: "PO-00088", vendorId: "vn_1", warehouseId: "wh_main", date: iso(-8), expectedDelivery: iso(3),
    status: "issued",
    lineItems: [
      { itemId: "it_1", name: "Aurora Wireless Headphones", quantity: 100, rate: 48 },
      { itemId: "it_2", name: "Pulse Portable Speaker", quantity: 80, rate: 32 },
    ],
  },
  {
    id: "po_2", number: "PO-00089", vendorId: "vn_3", warehouseId: "wh_west", date: iso(-5), expectedDelivery: iso(1),
    status: "partially_received",
    lineItems: [
      { itemId: "it_5", name: "Voltcore 20K Power Bank", quantity: 120, rate: 21 },
    ],
  },
  {
    id: "po_3", number: "PO-00090", vendorId: "vn_2", warehouseId: "wh_main", date: iso(-2), expectedDelivery: iso(6),
    status: "issued",
    lineItems: [
      { itemId: "it_4", name: "USB-C Braided Cable 2m", quantity: 1000, rate: 3.5 },
    ],
  },
  {
    id: "po_4", number: "PO-00091", vendorId: "vn_4", warehouseId: "wh_main", date: iso(-12), expectedDelivery: iso(-3),
    status: "received",
    lineItems: [
      { itemId: "it_7", name: "Tactile Mechanical Keyboard", quantity: 60, rate: 41 },
      { itemId: "it_8", name: "Contour Ergonomic Mouse", quantity: 90, rate: 16 },
    ],
  },
]

export const seedInvoices: Invoice[] = [
  {
    id: "inv_1", number: "INV-002310", customerId: "cu_2", salesOrderId: "so_1", date: iso(-6), dueDate: iso(9),
    status: "partially_paid",
    lineItems: [
      { itemId: "it_1", name: "Aurora Wireless Headphones", quantity: 20, rate: 129 },
      { itemId: "it_4", name: "USB-C Braided Cable 2m", quantity: 50, rate: 14 },
    ],
    amountPaid: 2000,
  },
  {
    id: "inv_2", number: "INV-002311", customerId: "cu_1", salesOrderId: "so_2", date: iso(-4), dueDate: iso(11),
    status: "sent",
    lineItems: [
      { itemId: "it_3", name: "Nimbus Smartwatch", quantity: 10, rate: 199 },
      { itemId: "it_7", name: "Tactile Mechanical Keyboard", quantity: 8, rate: 119 },
    ],
    amountPaid: 0,
  },
  {
    id: "inv_3", number: "INV-002298", customerId: "cu_5", date: iso(-20), dueDate: iso(-5),
    status: "overdue",
    lineItems: [
      { itemId: "it_9", name: "ClearView 4K Webcam", quantity: 30, rate: 109 },
    ],
    amountPaid: 0,
  },
  {
    id: "inv_4", number: "INV-002280", customerId: "cu_3", salesOrderId: "so_5", date: iso(-10), dueDate: iso(-2),
    status: "paid",
    lineItems: [
      { itemId: "it_6", name: "Meridian 7-Port USB Hub", quantity: 40, rate: 39 },
      { itemId: "it_10", name: "Altitude Laptop Stand", quantity: 25, rate: 34 },
    ],
    amountPaid: 2410,
  },
  {
    id: "inv_5", number: "INV-002315", customerId: "cu_4", date: iso(-1), dueDate: iso(14),
    status: "sent",
    lineItems: [
      { itemId: "it_5", name: "Voltcore 20K Power Bank", quantity: 30, rate: 59 },
    ],
    amountPaid: 0,
  },
]

export const seedPayments: Payment[] = [
  { id: "pm_1", number: "PMT-0451", contactId: "cu_2", invoiceId: "inv_1", direction: "received", date: iso(-3), amount: 2000, mode: "bank_transfer" },
  { id: "pm_2", number: "PMT-0450", contactId: "cu_3", invoiceId: "inv_4", direction: "received", date: iso(-8), amount: 2410, mode: "credit_card" },
  { id: "pm_3", number: "PMT-0449", contactId: "vn_4", direction: "made", date: iso(-9), amount: 3900, mode: "bank_transfer" },
  { id: "pm_4", number: "PMT-0448", contactId: "vn_1", direction: "made", date: iso(-11), amount: 6800, mode: "bank_transfer" },
]

export const seedMovements: StockMovement[] = [
  { id: "mv_1", date: iso(-12), itemId: "it_7", warehouseId: "wh_main", type: "purchase", quantity: 60, reference: "PO-00091" },
  { id: "mv_2", date: iso(-12), itemId: "it_8", warehouseId: "wh_main", type: "purchase", quantity: 90, reference: "PO-00091" },
  { id: "mv_3", date: iso(-10), itemId: "it_6", warehouseId: "wh_main", type: "sale", quantity: -40, reference: "SO-00146" },
  { id: "mv_4", date: iso(-10), itemId: "it_10", warehouseId: "wh_main", type: "sale", quantity: -25, reference: "SO-00146" },
  { id: "mv_5", date: iso(-5), itemId: "it_5", warehouseId: "wh_west", type: "purchase", quantity: 40, reference: "PO-00089" },
  { id: "mv_6", date: iso(-4), itemId: "it_3", warehouseId: "wh_main", type: "sale", quantity: -10, reference: "SO-00143" },
  { id: "mv_7", date: iso(-2), itemId: "it_2", warehouseId: "wh_main", type: "adjustment_out", quantity: -4, reference: "ADJ-0031", note: "Damaged in transit" },
  { id: "mv_8", date: iso(-1), itemId: "it_11", warehouseId: "wh_main", type: "adjustment_in", quantity: 5, reference: "ADJ-0032", note: "Stock recount" },
]
