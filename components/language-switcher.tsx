"use client"

import { useI18n } from "@/lib/i18n/context"
import { LOCALES } from "@/lib/i18n/translations"
import { cn } from "@/lib/utils"

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()

  return (
    <div
      className="flex items-center rounded-lg border border-border p-0.5"
      role="group"
      aria-label={t("lang.label")}
    >
      {LOCALES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLocale(l.code)}
          aria-pressed={locale === l.code}
          title={l.label}
          className={cn(
            "rounded-md px-2 py-1 text-xs font-medium transition-colors",
            locale === l.code
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l.short}
        </button>
      ))}
    </div>
  )
}
