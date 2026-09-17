"use client"

import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Select } from "@/components/ui/field"
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table"
import { useI18n } from "@/lib/i18n/context"
import { formatCurrency, formatDate, titleCase } from "@/lib/format"
import { useStore } from "@/lib/store"
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { useMemo, useState } from "react"

export default function PaymentsPage() {
  const { payments, contactName } = useStore()
  const { t } = useI18n()
  const [direction, setDirection] = useState("all")

  const filtered = useMemo(
    () => payments.filter((p) => direction === "all" || p.direction === direction),
    [payments, direction],
  )

  const received = payments.filter((p) => p.direction === "received").reduce((s, p) => s + p.amount, 0)
  const made = payments.filter((p) => p.direction === "made").reduce((s, p) => s + p.amount, 0)

  return (
    <>
      <PageHeader title={t("page.payments.title")} description={t("page.payments.desc")} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Received" value={formatCurrency(received)} icon={ArrowDownLeft} tone="success" />
        <StatCard label="Paid out" value={formatCurrency(made)} icon={ArrowUpRight} tone="warning" />
        <StatCard label="Net flow" value={formatCurrency(received - made)} icon={ArrowDownLeft} tone="primary" />
      </div>

      <Card className="p-4">
        <Select value={direction} onChange={(e) => setDirection(e.target.value)} className="sm:w-52">
          <option value="all">All payments</option>
          <option value="received">Received</option>
          <option value="made">Made</option>
        </Select>
      </Card>

      <Card>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>Payment</TH>
              <TH>Date</TH>
              <TH>Contact</TH>
              <TH>Direction</TH>
              <TH>Mode</TH>
              <TH className="text-right">Amount</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((p) => (
              <TR key={p.id}>
                <TD className="font-mono text-sm font-medium">{p.number}</TD>
                <TD className="whitespace-nowrap text-muted-foreground">{formatDate(p.date)}</TD>
                <TD>{contactName(p.contactId)}</TD>
                <TD>
                  <Badge tone={p.direction === "received" ? "success" : "warning"}>
                    {p.direction === "received" ? "Received" : "Made"}
                  </Badge>
                </TD>
                <TD className="text-muted-foreground">{titleCase(p.mode)}</TD>
                <TD
                  className={`text-right font-medium tabular-nums ${p.direction === "received" ? "text-success" : "text-foreground"}`}
                >
                  {p.direction === "received" ? "+" : "-"}
                  {formatCurrency(p.amount)}
                </TD>
              </TR>
            ))}
            {filtered.length === 0 && (
              <TR className="hover:bg-transparent">
                <TD colSpan={6} className="py-10 text-center text-muted-foreground">
                  No payments found.
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </Card>
    </>
  )
}
