import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Cyberpunk input.
 *
 * - ">" terminal prefix on the left.
 * - Monospace, accent-colored text.
 * - Chamfered clip-path on the border.
 * - Neon glow on focus.
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
    ({ className, type, ...props }, ref) => {
        return (
            <div className="relative">
                <span
                    aria-hidden
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-primary text-glow-sm"
                >
                    {">"}
                </span>
                <input
                    type={type}
                    className={cn(
                        "flex h-10 w-full bg-input pl-8 pr-3 py-2",
                        "border border-border text-sm font-mono text-primary",
                        "placeholder:text-muted-foreground/60 placeholder:font-mono",
                        "transition-all duration-200 outline-none",
                        "focus-visible:border-primary focus-visible:neon-glow-sm",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "[clip-path:polygon(0_6px,6px_0,calc(100%_-_6px)_0,100%_6px,100%_calc(100%_-_6px),calc(100%_-_6px)_100%,6px_100%,0_calc(100%_-_6px))]",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
            </div>
        )
    }
)
Input.displayName = "Input"

export { Input }
