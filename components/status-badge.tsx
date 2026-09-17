import { Badge } from "@/components/ui/badge"
import { titleCase } from "@/lib/format"

type Tone = "neutral" | "primary" | "success" | "warning" | "destructive" | "info"

const STATUS_TONES: Record<string, Tone> = {
  // sales order
  draft: "neutral",
  confirmed: "info",
  packed: "primary",
  shipped: "info",
  delivered: "success",
  cancelled: "destructive",
  // purchase order
  issued: "info",
  partially_received: "warning",
  received: "success",
  billed: "success",
  // invoice
  sent: "info",
  partially_paid: "warning",
  paid: "success",
  overdue: "destructive",
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONES[status] ?? "neutral"}>{titleCase(status)}</Badge>
}
