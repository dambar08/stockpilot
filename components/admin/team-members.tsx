"use client"

import { StatCard } from "@/components/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input, Label, Select } from "@/components/ui/field"
import { Modal } from "@/components/ui/modal"
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table"
import { useAdmin } from "@/lib/admin"
import { useAuth } from "@/lib/auth"
import { useI18n } from "@/lib/i18n/context"
import { ROLES, ROLE_PERMISSIONS, type Permission } from "@/lib/permissions"
import type { Role } from "@/lib/types"
import { Check, ShieldCheck, UserPlus, Users } from "lucide-react"
import { useState } from "react"

const PERMISSIONS: Permission[] = [
  "manageInventory",
  "manageSales",
  "managePurchases",
  "manageContacts",
  "viewReports",
  "manageSettings",
]

const PERMISSION_LABELS: Record<Permission, string> = {
  manageInventory: "Manage inventory",
  manageSales: "Manage sales",
  managePurchases: "Manage purchases",
  manageContacts: "Manage contacts",
  viewReports: "View reports",
  manageSettings: "Manage settings",
}

export function TeamMembers() {
  const { t } = useI18n()
  const { user } = useAuth()
  const { members, addMember, updateMemberRole, toggleMemberActive } = useAdmin()
  const [inviteOpen, setInviteOpen] = useState(false)

  const activeCount = members.filter((m) => m.active).length
  const adminCount = members.filter((m) => m.role === "admin").length

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={t("admin.users.count", { count: members.length })} value={String(members.length)} icon={Users} />
        <StatCard label={t("admin.users.active", { count: activeCount })} value={String(activeCount)} icon={ShieldCheck} tone="success" />
        <StatCard label={t("admin.users.admins", { count: adminCount })} value={String(adminCount)} icon={ShieldCheck} tone="primary" />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>{t("admin.users.title")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("admin.users.subtitle")}</p>
          </div>
          <Button onClick={() => setInviteOpen(true)}>
            <UserPlus /> {t("admin.users.invite")}
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH>{t("admin.users.member")}</TH>
                <TH>{t("common.role")}</TH>
                <TH>{t("common.status")}</TH>
                <TH className="text-right">{t("common.actions")}</TH>
              </TR>
            </THead>
            <TBody>
              {members.map((m) => (
                <TR key={m.id}>
                  <TD>
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 font-medium">
                          {m.name}
                          {m.id === user?.id && <Badge tone="info">{t("admin.users.you")}</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground">{m.email}</div>
                      </div>
                    </div>
                  </TD>
                  <TD>
                    <Select
                      aria-label={t("common.role")}
                      value={m.role}
                      onChange={(e) => updateMemberRole(m.id, e.target.value as Role)}
                      className="max-w-44"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {t(`role.${r}`)}
                        </option>
                      ))}
                    </Select>
                  </TD>
                  <TD>
                    <Badge tone={m.active ? "success" : "neutral"}>
                      {m.active ? t("common.active") : t("common.inactive")}
                    </Badge>
                  </TD>
                  <TD className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleMemberActive(m.id)}
                      disabled={m.id === user?.id}
                    >
                      {m.active ? t("common.inactive") : t("common.active")}
                    </Button>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.perm.title")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("admin.perm.subtitle")}</p>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH>{t("admin.perm.role")}</TH>
                {PERMISSIONS.map((p) => (
                  <TH key={p} className="text-center">
                    {PERMISSION_LABELS[p]}
                  </TH>
                ))}
              </TR>
            </THead>
            <TBody>
              {ROLES.map((r) => (
                <TR key={r}>
                  <TD className="font-medium">{t(`role.${r}`)}</TD>
                  {PERMISSIONS.map((p) => (
                    <TD key={p} className="text-center">
                      {ROLE_PERMISSIONS[r].includes(p) ? (
                        <Check className="mx-auto size-4 text-success" aria-label="allowed" />
                      ) : (
                        <span className="text-muted-foreground" aria-hidden>
                          &mdash;
                        </span>
                      )}
                    </TD>
                  ))}
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>

      {inviteOpen && <InviteModal onClose={() => setInviteOpen(false)} onInvite={addMember} />}
    </div>
  )
}

function InviteModal({
  onClose,
  onInvite,
}: {
  onClose: () => void
  onInvite: ReturnType<typeof useAdmin>["addMember"]
}) {
  const { t } = useI18n()
  const [form, setForm] = useState<{ name: string; email: string; role: Role }>({
    name: "",
    email: "",
    role: "staff",
  })
  const valid = form.name.trim() && form.email.trim()

  const submit = () => {
    if (!valid) return
    onInvite({ name: form.name.trim(), email: form.email.trim(), role: form.role })
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={t("invite.title")}
      description={t("invite.subtitle")}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={submit} disabled={!valid}>
            {t("invite.send")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <Label>{t("common.name")}</Label>
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Jane Doe" />
        </div>
        <div>
          <Label>{t("common.email")}</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="jane@company.com"
          />
        </div>
        <div>
          <Label>{t("common.role")}</Label>
          <Select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {t(`role.${r}`)}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </Modal>
  )
}
