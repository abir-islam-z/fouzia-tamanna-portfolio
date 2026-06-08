import { Slot } from "@radix-ui/react-slot"
import type { VariantProps } from "class-variance-authority"
import { cva } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Cyberpunk button system.
 *
 * - All buttons use the chamfered clip-path (the design system's signature).
 * - Monospace, uppercase, wide tracking — every variant.
 * - Neon glows on hover, not on rest.
 * - 150ms transitions for that "snap" feel.
 */
const buttonVariants = cva(
    [
        "group/button relative inline-flex shrink-0 items-center justify-center gap-2 select-none whitespace-nowrap",
        "font-mono uppercase tracking-widest",
        "transition-all duration-150 ease-out outline-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "active:translate-y-px",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:drop-shadow-[0_0_4px_currentColor]",
    ].join(" "),
    {
        variants: {
            variant: {
                default: cn(
                    "border-2 border-primary bg-transparent text-primary",
                    "hover:bg-primary hover:text-primary-foreground hover:neon-glow",
                    "hover:[clip-path:polygon(0_6px,6px_0,calc(100%_-_6px)_0,100%_6px,100%_calc(100%_-_6px),calc(100%_-_6px)_100%,6px_100%,0_calc(100%_-_6px))]",
                    "[clip-path:polygon(0_6px,6px_0,calc(100%_-_6px)_0,100%_6px,100%_calc(100%_-_6px),calc(100%_-_6px)_100%,6px_100%,0_calc(100%_-_6px))]"
                ),
                glitch: cn(
                    "border-2 border-primary bg-primary text-primary-foreground",
                    "hover:brightness-110 hover:neon-glow",
                    "[clip-path:polygon(0_6px,6px_0,calc(100%_-_6px)_0,100%_6px,100%_calc(100%_-_6px),calc(100%_-_6px)_100%,6px_100%,0_calc(100%_-_6px))]"
                ),
                secondary: cn(
                    "border-2 bg-transparent text-[var(--accent-secondary)]",
                    "border-[var(--accent-secondary)] hover:bg-[var(--accent-secondary)] hover:text-primary-foreground hover:neon-glow-magenta",
                    "[clip-path:polygon(0_6px,6px_0,calc(100%_-_6px)_0,100%_6px,100%_calc(100%_-_6px),calc(100%_-_6px)_100%,6px_100%,0_calc(100%_-_6px))]"
                ),
                outline: cn(
                    "border border-border bg-transparent text-foreground",
                    "hover:border-primary hover:text-primary hover:neon-glow-sm"
                ),
                ghost: cn(
                    "text-muted-foreground bg-transparent",
                    "hover:bg-primary/10 hover:text-primary"
                ),
                destructive: cn(
                    "border-2 bg-transparent text-destructive border-destructive",
                    "hover:bg-destructive hover:text-primary-foreground hover:neon-glow-coral",
                    "[clip-path:polygon(0_6px,6px_0,calc(100%_-_6px)_0,100%_6px,100%_calc(100%_-_6px),calc(100%_-_6px)_100%,6px_100%,0_calc(100%_-_6px))]"
                ),
                bracket: cn(
                    "border border-primary/40 bg-transparent text-primary",
                    "hover:border-primary hover:bg-primary/10 hover:neon-glow-sm",
                    "font-mono uppercase tracking-[0.2em]"
                ),
                glow: cn(
                    "border-2 border-primary bg-primary/90 text-primary-foreground",
                    "hover:bg-primary hover:neon-glow",
                    "[clip-path:polygon(0_6px,6px_0,calc(100%_-_6px)_0,100%_6px,100%_calc(100%_-_6px),calc(100%_-_6px)_100%,6px_100%,0_calc(100%_-_6px))]"
                ),
                link: "text-primary underline-offset-4 hover:underline font-bold",
            },
            size: {
                default: "h-10 px-5 text-xs",
                xs: "h-7 px-3 text-[10px]",
                sm: "h-8 px-4 text-[11px]",
                lg: "h-12 px-7 text-sm",
                xl: "h-14 px-9 text-base",
                icon: "size-10",
                "icon-xs": "size-7",
                "icon-sm": "size-8",
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
