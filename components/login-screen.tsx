"use client"

import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/field"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useAuth } from "@/lib/auth"
import { useI18n } from "@/lib/i18n/context"
import { Boxes, ChevronRight } from "lucide-react"
import { useState } from "react"

export function LoginScreen() {
  const { accounts, signIn } = useAuth()
  const { t } = useI18n()
  const [selected, setSelected] = useState(accounts[0]?.id ?? "")

  const activeAccount = accounts.find((a) => a.id === selected)

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-xl md:grid-cols-2">
        <div className="flex flex-col justify-between gap-8 bg-primary p-8 text-primary-foreground">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary-foreground/15">
              <Boxes className="size-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">{t("app.name")}</span>
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-balance">{t("app.tagline")}</h1>
            <p className="text-sm text-primary-foreground/80 text-pretty">{t("app.blurb")}</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-primary-foreground/80">
            <div>
              <div className="text-xl font-semibold text-primary-foreground">3</div>
              {t("login.warehouses")}
            </div>
            <div>
              <div className="text-xl font-semibold text-primary-foreground">12</div>
              {t("login.skus")}
            </div>
            <div>
              <div className="text-xl font-semibold text-primary-foreground">{t("login.live")}</div>
              {t("login.ledger")}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 p-8">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold tracking-tight">{t("login.title")}</h2>
              <p className="text-sm text-muted-foreground">{t("login.subtitle")}</p>
            </div>
            <LanguageSwitcher />
          </div>

          <div className="flex flex-col gap-2">
            <Label>{t("login.account")}</Label>
            <div className="flex flex-col gap-2">
              {accounts.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => setSelected(account.id)}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors ${
                    selected === account.id
                      ? "border-primary bg-accent"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{account.name}</span>
                    <span className="text-xs text-muted-foreground">{t(`role.${account.role}`)}</span>
                  </div>
                  {selected === account.id && <ChevronRight className="size-4 text-primary" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <Label>{t("common.email")}</Label>
              <Input value={activeAccount?.email ?? ""} readOnly />
            </div>
            <div>
              <Label>{t("common.password")}</Label>
              <Input type="password" value="demo-password" readOnly />
            </div>
          </div>

          <Button size="lg" className="w-full" onClick={() => selected && signIn(selected)}>
            {t("login.signInAs", { name: activeAccount?.name.split(" ")[0] ?? "" })}
          </Button>
          <p className="text-center text-xs text-muted-foreground text-pretty">{t("login.rbac")}</p>
        </div>
      </div>
    </div>
  )
}
