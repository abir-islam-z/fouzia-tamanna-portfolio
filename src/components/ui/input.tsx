import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Cyberpunk input.
 *
 * - ">" terminal prefix on the left.
 * - Monospace, accent-colored text.
 * - Chamfered clip-path on the border.
 * - Neon glow on focus.
 *
 * admin variant: clean, standard input for dashboard forms.
 */
const inputVariants = cva(
  [
    "flex h-10 w-full border border-border text-sm outline-none",
    "transition-all duration-200",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ].join(" "),
  {
    variants: {
      variant: {
        default: cn(
          "bg-input py-2 pr-3 pl-8",
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

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & VariantProps<typeof inputVariants>
>(({ className, type, variant, ...props }, ref) => {
  const isDefault = !variant || variant === "default"
  return (
    <div className="relative">
      {isDefault && (
        <span
          aria-hidden
          className="text-glow-sm pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 font-mono text-sm text-primary"
        >
          {">"}
        </span>
      )}
      <input
        type={type}
        className={cn(inputVariants({ variant }), className)}
        ref={ref}
        {...props}
      />
    </div>
  )
})
Input.displayName = "Input"

export { Input, inputVariants }
