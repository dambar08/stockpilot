"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/table"
import { useI18n } from "@/lib/i18n/context"
import { KeyRound, RefreshCw } from "lucide-react"
import { useState } from "react"

interface Endpoint {
  method: "GET" | "POST"
  path: string
  desc: string
}

const ENDPOINTS: Endpoint[] = [
  { method: "GET", path: "/api/health", desc: "Service health check" },
  { method: "GET", path: "/api/stats", desc: "Dashboard metrics and KPIs" },
  { method: "GET", path: "/api/items?search=&category=&status=&page=1", desc: "List items (filter + paginate)" },
  { method: "POST", path: "/api/items", desc: "Create a new item" },
  { method: "GET", path: "/api/warehouses", desc: "Warehouses with stock value" },
  { method: "GET", path: "/api/contacts?type=customer", desc: "Customers and vendors" },
  { method: "GET", path: "/api/sales-orders?status=", desc: "Sales orders with totals" },
  { method: "GET", path: "/api/purchase-orders?status=", desc: "Purchase orders with totals" },
  { method: "GET", path: "/api/invoices?status=", desc: "Invoices with balances" },
  { method: "GET", path: "/api/payments?direction=", desc: "Payments received and made" },
]

function generateKey(): string {
  const rand = () => Math.random().toString(36).slice(2, 10)
  return `sk_live_${rand()}${rand()}`
}

export function ApiAccess() {
  const { t } = useI18n()
  const [apiKey, setApiKey] = useState(generateKey)

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex-row items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <KeyRound className="size-5" />
          </div>
          <div>
            <CardTitle>{t("admin.api.keyTitle")}</CardTitle>
            <p className="text-sm text-muted-foreground">{t("admin.api.keyHint")}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <code className="flex-1 truncate rounded-lg border border-border bg-muted px-3 py-2 font-mono text-sm">
              {apiKey}
            </code>
            <Button variant="outline" onClick={() => setApiKey(generateKey())}>
              <RefreshCw /> {t("admin.api.regenerate")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("admin.api.title")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("admin.api.subtitle")}</p>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH>{t("admin.api.method")}</TH>
                <TH>{t("admin.api.endpoint")}</TH>
                <TH>{t("admin.api.desc")}</TH>
                <TH className="text-right">{t("common.actions")}</TH>
              </TR>
            </THead>
            <TBody>
              {ENDPOINTS.map((e) => (
                <TR key={`${e.method}-${e.path}`}>
                  <TD>
                    <Badge tone={e.method === "GET" ? "info" : "success"}>{e.method}</Badge>
                  </TD>
                  <TD className="font-mono text-xs">{e.path}</TD>
                  <TD className="text-muted-foreground">{e.desc}</TD>
                  <TD className="text-right">
                    {e.method === "GET" ? (
                      <a
                        href={e.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {t("admin.api.try")}
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">&mdash;</span>
                    )}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
