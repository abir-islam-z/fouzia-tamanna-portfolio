import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Cyberpunk card system.
 *
 * Three variants:
 * - default: chamfered corners, hover glow
 * - terminal: traffic-light header, used for blog/FAQ cards
 * - holographic: glassmorphic with corner accents
 */
const cardVariants = cva(
    "relative transition-all duration-300",
    {
        variants: {
            variant: {
                default: cn(
                    "bg-card text-card-foreground border border-border",
                    "hover:border-primary hover:-translate-y-px hover:neon-glow",
                    "[clip-path:polygon(0_12px,12px_0,calc(100%_-_12px)_0,100%_12px,100%_calc(100%_-_12px),calc(100%_-_12px)_100%,12px_100%,0_calc(100%_-_12px))]"
                ),
                terminal: cn(
                    "bg-background text-foreground border border-border",
                    "hover:border-primary hover:-translate-y-px hover:neon-glow-sm",
                    "[clip-path:polygon(0_12px,12px_0,calc(100%_-_12px)_0,100%_12px,100%_calc(100%_-_12px),calc(100%_-_12px)_100%,12px_100%,0_calc(100%_-_12px))]",
                    "pt-11"
                ),
                holographic: cn(
                    "bg-muted/30 text-foreground border border-primary/30 backdrop-blur-md",
                    "hover:border-primary hover:neon-glow",
                    "[clip-path:polygon(0_12px,12px_0,calc(100%_-_12px)_0,100%_12px,100%_calc(100%_-_12px),calc(100%_-_12px)_100%,12px_100%,0_calc(100%_-_12px))]"
                ),
                flat: "bg-card text-card-foreground border border-border",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>
>(({ className, variant, ...props }, ref) => (
    <div
        ref={ref}
        data-slot="card"
        data-variant={variant}
        className={cn(cardVariants({ variant }), className)}
        {...props}
    />
))
Card.displayName = "Card"

/**
 * TerminalHeader — the traffic-light dot bar for variant="terminal" cards.
 * Place as the first child of a terminal card.
 */
function TerminalHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn(
                "absolute inset-x-0 top-0 z-10 flex h-9 items-center gap-2 border-b border-border bg-muted/60 px-4",
                className
            )}
            {...props}
        >
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] shadow-[0_0_6px_#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e] shadow-[0_0_6px_#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840] shadow-[0_0_6px_#28c840]" />
        </div>
    )
}

const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn(
            "font-display text-lg font-bold uppercase tracking-wide leading-none",
            className
        )}
        {...props}
    />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground font-mono", className)}
        {...props}
    />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
    />
))
CardFooter.displayName = "CardFooter"

export {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    TerminalHeader,
    cardVariants,
}
