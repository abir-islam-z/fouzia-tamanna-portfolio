import { Slot } from "@radix-ui/react-slot"
import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-semibold tracking-tight whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 relative overflow-hidden",
  {
    variants: {
      variant: {
        // Primary: Phosphor green with glow on hover
        default:
          "bg-primary text-primary-foreground shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary)_50%,transparent)] hover:shadow-[0_0_28px_-2px_var(--primary)] hover:bg-primary/90 border border-primary/30",
        // Outline: Hairline border, terminal look
        outline:
          "border border-border bg-transparent text-foreground hover:bg-foreground/5 hover:border-primary/40 hover:text-primary",
        // Secondary: Subtle, less prominent
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/70 border border-border/60",
        // Ghost: bare, no background until hover
        ghost:
          "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
        // Destructive: SOC alert
        destructive:
          "bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/25",
        // Bracket: Terminal-style with corner accents
        bracket:
          "bg-transparent text-foreground border border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-primary font-mono uppercase tracking-widest text-xs",
        // Glow: Pre-glowing primary (for hero CTAs)
        glow:
          "bg-primary text-primary-foreground border border-primary/40 shadow-[0_0_24px_-2px_var(--primary)] hover:shadow-[0_0_36px_2px_var(--primary)] hover:bg-primary/90",
        // Link: underlined text
        link: "text-primary underline-offset-4 hover:underline font-medium",
      },
      size: {
        default: "h-10 px-4 text-sm",
        xs: "h-7 rounded text-xs px-2.5",
        sm: "h-8 rounded text-sm px-3",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-base",
        icon: "size-10",
        "icon-xs": "size-7 rounded text-xs",
        "icon-sm": "size-8 rounded",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        data-slot="button"
        data-variant={variant}
        data-size={size}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
