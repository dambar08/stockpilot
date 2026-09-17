import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  )
}

export function THead({ className, ...props }: ComponentProps<"thead">) {
  return <thead className={cn("[&_th]:text-muted-foreground", className)} {...props} />
}

export function TBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody className={cn("divide-y divide-border", className)} {...props} />
}

export function TR({ className, ...props }: ComponentProps<"tr">) {
  return <tr className={cn("transition-colors hover:bg-muted/50", className)} {...props} />
}

export function TH({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      className={cn(
        "border-b border-border px-4 py-3 text-left text-xs font-medium tracking-wide uppercase",
        className,
      )}
      {...props}
    />
  )
}

export function TD({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("px-4 py-3 align-middle", className)} {...props} />
}
