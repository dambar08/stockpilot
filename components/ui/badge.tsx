import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

type Tone = "neutral" | "primary" | "success" | "warning" | "destructive" | "info"

const toneClasses: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-accent text-accent-foreground",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning-foreground dark:text-warning",
  destructive: "bg-destructive/12 text-destructive",
  info: "bg-chart-2/15 text-chart-2",
}

export function Badge({
  tone = "neutral",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  )
}
