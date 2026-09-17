"use client"

import { PageHeader } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input, Label } from "@/components/ui/field"
import { Modal } from "@/components/ui/modal"
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table"
import { useAuth } from "@/lib/auth"
import { useI18n } from "@/lib/i18n/context"
import { formatCurrency } from "@/lib/format"
import { useStore } from "@/lib/store"
import type { Contact } from "@/lib/types"
import { Mail, Phone, Search, UserPlus, Users, Wallet } from "lucide-react"
import { useMemo, useState } from "react"

export function ContactsView({ type }: { type: "customer" | "vendor" }) {
  const { can } = useAuth()
  const { t } = useI18n()
  const { customers, vendors, createContact } = useStore()
  const list = type === "customer" ? customers : vendors
  const [query, setQuery] = useState("")
  const [addOpen, setAddOpen] = useState(false)

  const isCustomer = type === "customer"
  const balanceLabel = isCustomer ? t("contacts.receivables") : t("contacts.payables")

  const filtered = useMemo(
    () =>
      list.filter(
        (c) =>
          c.company.toLowerCase().includes(query.toLowerCase()) ||
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.email.toLowerCase().includes(query.toLowerCase()),
      ),
    [list, query],
  )

  const totalBalance = list.reduce((s, c) => s + c.balance, 0)
  const withBalance = list.filter((c) => c.balance > 0).length

  return (
    <>
      <PageHeader
        title={isCustomer ? t("page.customers.title") : t("page.vendors.title")}
        description={isCustomer ? t("page.customers.desc") : t("page.vendors.desc")}
        actions={
          can("manageContacts") && (
            <Button onClick={() => setAddOpen(true)}>
              <UserPlus /> {isCustomer ? t("contacts.newCustomer") : t("contacts.newVendor")}
            </Button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={isCustomer ? t("contacts.totalCustomers") : t("contacts.totalVendors")} value={String(list.length)} icon={Users} />
        <StatCard label={`${t("contacts.outstanding")} ${balanceLabel}`} value={formatCurrency(totalBalance)} icon={Wallet} tone="warning" />
        <StatCard label={t("contacts.withOpenBalance")} value={String(withBalance)} icon={Wallet} tone="primary" />
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("contacts.searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </Card>

      <Card>
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH>{t("contacts.company")}</TH>
              <TH>{t("contacts.contact")}</TH>
              <TH>{t("contacts.location")}</TH>
              <TH className="text-right">{balanceLabel}</TH>
            </TR>
          </THead>
          <TBody>
            {filtered.map((c) => (
              <TR key={c.id}>
                <TD className="font-medium">{c.company}</TD>
                <TD>
                  <div>{c.name}</div>
                  <div className="flex flex-col gap-0.5 text-xs text-muted-foreground sm:flex-row sm:gap-3">
                    <span className="flex items-center gap-1">
                      <Mail className="size-3" /> {c.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="size-3" /> {c.phone}
                    </span>
                  </div>
                </TD>
                <TD className="text-muted-foreground">{c.city}</TD>
                <TD className="text-right font-medium tabular-nums">
                  {c.balance > 0 ? (
                    <span className="text-warning-foreground dark:text-warning">{formatCurrency(c.balance)}</span>
                  ) : (
                    <span className="text-muted-foreground">{formatCurrency(0)}</span>
                  )}
                </TD>
              </TR>
            ))}
            {filtered.length === 0 && (
              <TR className="hover:bg-transparent">
                <TD colSpan={4} className="py-10 text-center text-muted-foreground">
                  {t("contacts.none")}
                </TD>
              </TR>
            )}
          </TBody>
        </Table>
      </Card>

      {addOpen && <AddContactModal type={type} onClose={() => setAddOpen(false)} onCreate={createContact} />}
    </>
  )
}

function AddContactModal({
  type,
  onClose,
  onCreate,
}: {
  type: "customer" | "vendor"
  onClose: () => void
  onCreate: ReturnType<typeof useStore>["createContact"]
}) {
  const [form, setForm] = useState({ company: "", name: "", email: "", phone: "", city: "" })
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))
  const valid = form.company && form.name

  const submit = () => {
    if (!valid) return
    onCreate({ type, ...form } as Omit<Contact, "id" | "balance"> & { type: "customer" | "vendor" })
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`New ${type}`}
      description={`Add a ${type} to your directory.`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!valid}>
            Create {type}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Company</Label>
          <Input value={form.company} onChange={set("company")} placeholder="Acme Inc." />
        </div>
        <div>
          <Label>Contact name</Label>
          <Input value={form.name} onChange={set("name")} placeholder="Jane Doe" />
        </div>
        <div>
          <Label>City</Label>
          <Input value={form.city} onChange={set("city")} placeholder="Austin" />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={set("email")} placeholder="jane@acme.com" />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={form.phone} onChange={set("phone")} placeholder="+1 555 000 0000" />
        </div>
      </div>
    </Modal>
  )
}
