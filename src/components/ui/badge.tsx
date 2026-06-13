import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Cyberpunk badge system.
 *
 * - Share Tech Mono, uppercase, wide tracking.
 * - All variants use the chamfered clip-path.
 * - Neon-friendly severity variants for log/status displays.
 */
const badgeVariants = cva(
  cn(
    "inline-flex items-center gap-1.5 border px-2.5 py-1",
    "font-label text-[10px] tracking-[0.18em] uppercase",
    "transition-all duration-150",
    "focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background focus:outline-none",
    "[clip-path:polygon(0_4px,4px_0,calc(100%_-_4px)_0,100%_4px,100%_calc(100%_-_4px),calc(100%_-_4px)_100%,4px_100%,0_calc(100%_-_4px))]"
  ),
  {
    variants: {
      variant: {
        default: "border-primary/60 bg-primary/10 text-primary",
        solid: "border-primary bg-primary text-primary-foreground",
        secondary: "border-border bg-secondary text-secondary-foreground",
        destructive: "border-destructive/60 bg-destructive/10 text-destructive",
        outline: "border-border bg-transparent text-foreground/80",
        // Severity variants
        critical: "border-rose-500/60 bg-rose-500/10 text-rose-400",
        high: "border-orange-500/60 bg-orange-500/10 text-orange-400",
        medium: "border-amber-500/60 bg-amber-500/10 text-amber-400",
        low: "border-cyan-500/60 bg-cyan-500/10 text-cyan-400",
        info: "border-violet-500/60 bg-violet-500/10 text-violet-400",
        ok: "border-emerald-500/60 bg-emerald-500/10 text-emerald-400",
        ghost: "border-transparent bg-foreground/5 text-muted-foreground",
        admin: cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1",
          "font-sans text-xs tracking-normal normal-case",
          "border border-border bg-secondary text-secondary-foreground"
        ),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
