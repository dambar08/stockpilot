"use client"

import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input, Label, Select } from "@/components/ui/field"
import { Modal } from "@/components/ui/modal"
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table"
import { useAuth } from "@/lib/auth"
import { useI18n } from "@/lib/i18n/context"
import { daysUntil, formatCurrency, formatDate } from "@/lib/format"
import { useStore } from "@/lib/store"
import { documentTotal, type Invoice, type PaymentMode } from "@/lib/types"
import { CreditCard, FileText, TriangleAlert, Wallet } from "lucide-react"
import { useMemo, useState } from "react"

export default function InvoicesPage() {
  const { can } = useAuth()
  const { t } = useI18n()
  const { invoices, contactName, recordPayment } = useStore()
  const [statusFilter, setStatusFilter] = useState("all")
  const [payInvoice, setPayInvoice] = useState<Invoice | null>(null)

  const filtered = useMemo(
    () => invoices.filter((inv) => statusFilter === "all" || inv.status === statusFilter),
    [invoices, statusFilter],
  )

  const totals = useMemo(() => {
    let outstanding = 0
    let overdue = 0
    let collected = 0
    for (const inv of invoices) {
      const total = documentTotal(inv.lineItems)
      outstanding += total - inv.amountPaid
      collected += inv.amountPaid
      if (inv.status === "overdue") overdue += total - inv.amountPaid
    }
    return { outstanding, overdue, collected }
  }, [invoices])

  return (
    <>
      <PageHeader title={t("page.invoices.title")} description={t("page.invoices.desc")} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Outstanding" value={formatCurrency(totals.outstanding)} icon={Wallet} tone="warning" />
        <StatCard label="Overdue" value={formatCurrency(totals.overdue)} icon={TriangleAlert} tone="destructive" />
        <StatCard label="Collected" value={formatCurrency(totals.collected)} icon={CreditCard} tone="success" />
      </div>

      <Card className="p-4">
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-52">
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="partially_paid">Partially paid</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </Select>
      </Card>

      <Card>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Invoice</TH>
              <TH>Customer</TH>
              <TH>Due date</TH>
              <TH className="text-right">Total</TH>
              <TH className="text-right">Balance</TH>
              <TH>Status</TH>
              {can("manageSales") && <TH className="text-right">Action</TH>}
            </TR>
          </THead>
          <TBody>
            {filtered.map((inv) => {
              const total = documentTotal(inv.lineItems)
              const balance = total - inv.amountPaid
              const days = daysUntil(inv.dueDate)
              const isOverdue = inv.status === "overdue" || (balance > 0 && days < 0)
              return (
                <TR key={inv.id}>
                  <TD className="font-mono text-sm font-medium">{inv.number}</TD>
                  <TD>{contactName(inv.customerId)}</TD>
                  <TD className="whitespace-nowrap">
                    <span className="text-muted-foreground">{formatDate(inv.dueDate)}</span>
                    {balance > 0 && (
                      <div className={`text-xs ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                        {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Due today" : `in ${days}d`}
                      </div>
                    )}
                  </TD>
                  <TD className="text-right tabular-nums">{formatCurrency(total)}</TD>
                  <TD className="text-right font-medium tabular-nums">
                    {balance > 0 ? formatCurrency(balance) : <span className="text-muted-foreground">Settled</span>}
                  </TD>
                  <TD>
                    <StatusBadge status={inv.status} />
                  </TD>
                  {can("manageSales") && (
                    <TD className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPayInvoice(inv)}
                        disabled={balance <= 0}
                      >
                        Record payment
                      </Button>
                    </TD>
                  )}
                </TR>
              )
            })}
            {filtered.length === 0 && (
              <TR className="hover:bg-transparent">
                <TD colSpan={7} className="py-10 text-center text-muted-foreground">
                  No invoices found.
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </Card>

      {payInvoice && (
        <RecordPaymentModal invoice={payInvoice} onClose={() => setPayInvoice(null)} onRecord={recordPayment} contactName={contactName} />
      )}
    </>
  )
}

function RecordPaymentModal({
  invoice,
  onClose,
  onRecord,
  contactName,
}: {
  invoice: Invoice
  onClose: () => void
  onRecord: ReturnType<typeof useStore>["recordPayment"]
  contactName: (id: string) => string
}) {
  const total = documentTotal(invoice.lineItems)
  const balance = total - invoice.amountPaid
  const [amount, setAmount] = useState(String(balance))
  const [mode, setMode] = useState<PaymentMode>("bank_transfer")

  const value = Number(amount) || 0
  const valid = value > 0 && value <= balance

  const submit = () => {
    if (!valid) return
    onRecord(invoice.id, value, mode)
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Record payment — ${invoice.number}`}
      description={`${contactName(invoice.customerId)} · balance ${formatCurrency(balance)}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!valid}>
            <FileText /> Record payment
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Amount</Label>
            <Input type="number" min="0" max={balance} value={amount} onChange={(e) => setAmount(e.target.value)} />
            {!valid && value > balance && (
              <p className="mt-1 text-xs text-destructive">Cannot exceed the balance.</p>
            )}
          </div>
          <div>
            <Label>Payment mode</Label>
            <Select value={mode} onChange={(e) => setMode(e.target.value as PaymentMode)}>
              <option value="bank_transfer">Bank transfer</option>
              <option value="credit_card">Credit card</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-muted p-3 text-sm">
          <span className="text-muted-foreground">Remaining after payment</span>
          <span className="font-semibold tabular-nums">{formatCurrency(Math.max(0, balance - value))}</span>
        </div>
      </div>
    </Modal>
  )
}
