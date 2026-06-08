import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-primary/30 bg-primary/10 text-primary shadow-[inset_0_-1px_0_color-mix(in_oklch,var(--primary)_30%,transparent)]",
        secondary:
          "border-border bg-secondary text-secondary-foreground",
        destructive:
          "border-destructive/30 bg-destructive/10 text-destructive",
        outline:
          "border-border text-foreground/80 bg-transparent",
        // SOC severity variants
        critical: "border-rose-500/30 bg-rose-500/10 text-rose-400",
        high: "border-orange-500/30 bg-orange-500/10 text-orange-400",
        medium: "border-amber-500/30 bg-amber-500/10 text-amber-400",
        low: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
        info: "border-violet-500/30 bg-violet-500/10 text-violet-400",
        ok: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
        ghost: "border-transparent bg-foreground/5 text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
