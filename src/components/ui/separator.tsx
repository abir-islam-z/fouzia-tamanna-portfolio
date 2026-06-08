"use client"

import * as React from "react"
import { Separator as SeparatorPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Cyberpunk separator. Hairline neon gradient line — never a plain grey divider.
 */
function Separator({
    className,
    orientation = "horizontal",
    decorative = true,
    ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
    return (
        <SeparatorPrimitive.Root
            data-slot="separator"
            decorative={decorative}
            orientation={orientation}
            className={cn(
                "shrink-0",
                orientation === "horizontal"
                    ? "h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                    : "w-px self-stretch bg-gradient-to-b from-transparent via-primary/40 to-transparent",
                className
            )}
            {...props}
        />
    )
}

export { Separator }
