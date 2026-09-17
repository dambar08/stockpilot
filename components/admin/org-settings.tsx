"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input, Label, Select } from "@/components/ui/field"
import { useAdmin, type OrgSettings } from "@/lib/admin"
import { useI18n } from "@/lib/i18n/context"
import { LOCALES, type Locale } from "@/lib/i18n/translations"
import { Check } from "lucide-react"
import { useState } from "react"

const CURRENCIES = ["USD", "EUR", "GBP", "TWD", "JPY", "CNY"]
const TIMEZONES = ["America/Chicago", "America/New_York", "America/Los_Angeles", "Europe/London", "Asia/Taipei", "Asia/Tokyo"]

export function OrgSettingsForm() {
  const { t, setLocale } = useI18n()
  const { settings, updateSettings } = useAdmin()
  const [form, setForm] = useState<OrgSettings>(settings)
  const [saved, setSaved] = useState(false)

  const set = <K extends keyof OrgSettings>(key: K, value: OrgSettings[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    setSaved(false)
  }

  const save = () => {
    updateSettings(form)
    setLocale(form.defaultLocale)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{t("admin.settings.title")}</CardTitle>
        <p className="text-sm text-muted-foreground">{t("admin.settings.subtitle")}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <Label>{t("admin.settings.orgName")}</Label>
          <Input value={form.orgName} onChange={(e) => set("orgName", e.target.value)} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>{t("admin.settings.currency")}</Label>
            <Select value={form.currency} onChange={(e) => set("currency", e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>{t("admin.settings.timezone")}</Label>
            <Select value={form.timezone} onChange={(e) => set("timezone", e.target.value)}>
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label>{t("admin.settings.defaultLang")}</Label>
          <Select value={form.defaultLocale} onChange={(e) => set("defaultLocale", e.target.value as Locale)}>
            {LOCALES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <div className="text-sm font-medium">{t("admin.settings.lowStock")}</div>
            <div className="text-xs text-muted-foreground">{t("admin.settings.lowStockHint")}</div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.lowStockAlerts}
            aria-label={t("admin.settings.lowStock")}
            onClick={() => set("lowStockAlerts", !form.lowStockAlerts)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              form.lowStockAlerts ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-background shadow transition-transform ${
                form.lowStockAlerts ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={save}>{t("common.saveChanges")}</Button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-success">
              <Check className="size-4" /> {t("admin.settings.saved")}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
