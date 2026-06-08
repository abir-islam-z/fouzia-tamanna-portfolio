import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-20 w-full rounded-md border border-input bg-background/60 px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground/60 placeholder:font-mono focus-visible:outline-none focus-visible:border-primary/60 focus-visible:bg-background focus-visible:shadow-[0_0_0_1px_color-mix(in_oklch,var(--primary)_50%,transparent),0_0_16px_-4px_var(--primary)] disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
