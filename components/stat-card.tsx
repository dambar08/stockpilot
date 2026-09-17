import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import type { ComponentType } from "react"

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  hint,
  tone = "primary",
}: {
  label: string
  value: string
  icon: ComponentType<{ className?: string }>
  trend?: { value: string; up: boolean }
  hint?: string
  tone?: "primary" | "success" | "warning" | "destructive"
}) {
  const toneBg: Record<string, string> = {
    primary: "bg-accent text-accent-foreground",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground dark:text-warning",
    destructive: "bg-destructive/12 text-destructive",
  }
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-2xl font-semibold tracking-tight tabular-nums">{value}</span>
        </div>
        <div className={cn("flex size-10 items-center justify-center rounded-lg", toneBg[tone])}>
          <Icon className="size-5" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs">
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium",
              trend.up ? "text-success" : "text-destructive",
            )}
          >
            {trend.up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
            {trend.value}
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </Card>
  )
}
