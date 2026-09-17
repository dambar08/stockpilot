"use client"

import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/language-switcher"
import { LoginScreen } from "@/components/login-screen"
import { useAuth, type Permission } from "@/lib/auth"
import { useI18n } from "@/lib/i18n/context"
import type { TranslationKey } from "@/lib/i18n/translations"
import { cn } from "@/lib/utils"
import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  Boxes,
  ClipboardList,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  Warehouse,
  X,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, type ComponentType, type ReactNode } from "react"

interface NavItem {
  labelKey: TranslationKey
  href: string
  icon: ComponentType<{ className?: string }>
  permission?: Permission
}

interface NavSection {
  titleKey: TranslationKey
  items: NavItem[]
}

const NAV: NavSection[] = [
  {
    titleKey: "section.overview",
    items: [{ labelKey: "nav.dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    titleKey: "section.inventory",
    items: [
      { labelKey: "nav.items", href: "/items", icon: Package },
      { labelKey: "nav.warehouses", href: "/warehouses", icon: Warehouse, permission: "manageInventory" },
      { labelKey: "nav.movements", href: "/inventory", icon: ArrowLeftRight, permission: "manageInventory" },
    ],
  },
  {
    titleKey: "section.sales",
    items: [
      { labelKey: "nav.customers", href: "/customers", icon: Users, permission: "manageSales" },
      { labelKey: "nav.salesOrders", href: "/sales-orders", icon: ShoppingCart, permission: "manageSales" },
      { labelKey: "nav.invoices", href: "/invoices", icon: FileText, permission: "manageSales" },
      { labelKey: "nav.payments", href: "/payments", icon: CreditCard, permission: "manageSales" },
    ],
  },
  {
    titleKey: "section.purchases",
    items: [
      { labelKey: "nav.vendors", href: "/vendors", icon: Truck, permission: "managePurchases" },
      { labelKey: "nav.purchaseOrders", href: "/purchase-orders", icon: ClipboardList, permission: "managePurchases" },
    ],
  },
  {
    titleKey: "section.insights",
    items: [{ labelKey: "nav.reports", href: "/reports", icon: BarChart3, permission: "viewReports" }],
  },
  {
    titleKey: "section.administration",
    items: [{ labelKey: "nav.admin", href: "/admin", icon: Settings, permission: "manageSettings" }],
  },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { can } = useAuth()
  const { t } = useI18n()

  return (
    <nav className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
      {NAV.map((section) => {
        const visible = section.items.filter((item) => !item.permission || can(item.permission))
        if (visible.length === 0) return null
        return (
          <div key={section.titleKey} className="flex flex-col gap-1">
            <p className="px-3 pb-1 text-[0.68rem] font-semibold tracking-wider text-muted-foreground uppercase">
              {t(section.titleKey)}
            </p>
            {visible.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {t(item.labelKey)}
                </Link>
              )
            })}
          </div>
        )
      })}
    </nav>
  )
}

function Brand() {
  return (
    <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
      <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Boxes className="size-5" />
      </div>
      <span className="text-base font-semibold tracking-tight">Stockpilot</span>
    </div>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth()
  const { t } = useI18n()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!user) return <LoginScreen />

  return (
    <div className="flex min-h-svh bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <Brand />
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-hidden />
          <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-sidebar-border bg-sidebar animate-in slide-in-from-left">
            <div className="flex items-center justify-between border-b border-sidebar-border pr-3">
              <Brand />
              <Button variant="ghost" size="icon-sm" onClick={() => setMobileOpen(false)} aria-label={t("common.closeMenu")}>
                <X />
              </Button>
            </div>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label={t("common.openMenu")}>
            <Menu />
          </Button>
          <div className="hidden text-sm text-muted-foreground sm:block">
            {t("topbar.welcome")} <span className="font-medium text-foreground">{user.name.split(" ")[0]}</span>
          </div>
          <div className="flex flex-1 items-center justify-end gap-2">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" aria-label={t("common.notifications")}>
              <Bell />
            </Button>
            <div className="flex items-center gap-2 rounded-lg border border-border py-1 pr-1 pl-3">
              <div className="hidden flex-col items-end sm:flex">
                <span className="text-xs font-medium leading-tight">{user.name}</span>
                <span className="text-[0.68rem] text-muted-foreground leading-tight">{t(`role.${user.role}`)}</span>
              </div>
              <div className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                {user.name.charAt(0)}
              </div>
              <Button variant="ghost" size="icon-sm" onClick={signOut} aria-label={t("common.signOut")}>
                <LogOut />
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  )
}
