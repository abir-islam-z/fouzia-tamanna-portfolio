import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Cyberpunk textarea. Matches the Input system but allows multi-line input.
 * Uses a ">_" prefix to indicate multi-line command entry.
 *
 * admin variant: clean, standard textarea for dashboard forms.
 */
const textareaVariants = cva(
  [
    "flex min-h-24 w-full border border-border text-sm outline-none",
    "resize-none transition-all duration-200",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ].join(" "),
  {
    variants: {
      variant: {
        default: cn(
          "bg-input py-3 pr-3 pl-10",
          "font-mono text-primary",
          "placeholder:font-mono placeholder:text-muted-foreground/60",
          "focus-visible:neon-glow-sm focus-visible:border-primary",
          "[clip-path:polygon(0_6px,6px_0,calc(100%_-_6px)_0,100%_6px,100%_calc(100%_-_6px),calc(100%_-_6px)_100%,6px_100%,0_calc(100%_-_6px))]"
        ),
        admin: cn(
          "rounded-lg bg-background py-2 pr-3 pl-3",
          "font-sans text-foreground",
          "placeholder:font-sans placeholder:text-muted-foreground/60",
          "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20"
        ),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea"> & VariantProps<typeof textareaVariants>
>(({ className, variant, ...props }, ref) => {
  const isDefault = !variant || variant === "default"
  return (
    <div className="relative">
      {isDefault && (
        <span
          aria-hidden
          className="text-glow-sm pointer-events-none absolute top-3 left-3 font-mono text-sm text-primary"
        >
          {">_"}
        </span>
      )}
      <textarea
        className={cn(textareaVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    </div>
  )
})
Textarea.displayName = "Textarea"

export { Textarea, textareaVariants }
