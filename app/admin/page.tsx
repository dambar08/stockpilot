"use client"

import { ApiAccess } from "@/components/admin/api-access"
import { OrgSettingsForm } from "@/components/admin/org-settings"
import { TeamMembers } from "@/components/admin/team-members"
import { PageHeader } from "@/components/page-header"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth"
import { useI18n } from "@/lib/i18n/context"
import type { TranslationKey } from "@/lib/i18n/translations"
import { cn } from "@/lib/utils"
import { KeyRound, Settings2, Users } from "lucide-react"
import { useState, type ComponentType } from "react"

type TabId = "users" | "settings" | "api"

const TABS: { id: TabId; labelKey: TranslationKey; icon: ComponentType<{ className?: string }> }[] = [
  { id: "users", labelKey: "admin.tab.users", icon: Users },
  { id: "settings", labelKey: "admin.tab.settings", icon: Settings2 },
  { id: "api", labelKey: "admin.tab.api", icon: KeyRound },
]

export default function AdminPage() {
  const { can } = useAuth()
  const { t } = useI18n()
  const [tab, setTab] = useState<TabId>("users")

  if (!can("manageSettings")) {
    return (
      <>
        <PageHeader title={t("page.admin.title")} description={t("page.admin.desc")} />
        <Card className="p-10 text-center text-sm text-muted-foreground">
          {t("role.admin")} &middot; 403
        </Card>
      </>
    )
  }

  return (
    <>
      <PageHeader title={t("page.admin.title")} description={t("page.admin.desc")} />

      <div className="flex flex-wrap gap-1 border-b border-border">
        {TABS.map((tabItem) => {
          const Icon = tabItem.icon
          const active = tab === tabItem.id
          return (
            <button
              key={tabItem.id}
              type="button"
              onClick={() => setTab(tabItem.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors -mb-px",
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-4" />
              {t(tabItem.labelKey)}
            </button>
          )
        })}
      </div>

      {tab === "users" && <TeamMembers />}
      {tab === "settings" && <OrgSettingsForm />}
      {tab === "api" && <ApiAccess />}
    </>
  )
}
