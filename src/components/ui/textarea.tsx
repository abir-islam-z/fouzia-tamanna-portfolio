import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Cyberpunk textarea. Matches the Input system but allows multi-line input.
 * Uses a ">_" prefix to indicate multi-line command entry.
 */
const Textarea = React.forwardRef<
    HTMLTextAreaElement,
    React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
    return (
        <div className="relative">
            <span
                aria-hidden
                className="pointer-events-none absolute left-3 top-3 font-mono text-sm text-primary text-glow-sm"
            >
                {">_"}
            </span>
            <textarea
                className={cn(
                    "flex min-h-24 w-full bg-input pl-10 pr-3 py-3",
                    "border border-border text-sm font-mono text-primary",
                    "placeholder:text-muted-foreground/60 placeholder:font-mono",
                    "transition-all duration-200 outline-none resize-none",
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
})
Textarea.displayName = "Textarea"

export { Textarea }
